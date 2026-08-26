import type { StoredData, Theme } from '../types';

const STORAGE_KEY = 'cepGenerator';
const THEME_STORAGE_KEY = 'cepGeneratorTheme';
const STORAGE_FIELDS = [
  'cepHistory',
  'selectedUf',
  'useFormat',
  'useDocumentFormat',
  'customCeps',
  'theme',
  'activePanel',
  'selectedDocumentKind',
  'documentDigits',
  'selectedCardBrand',
  'savedCard'
];

interface ChromeStorageArea {
  get(keys: string[]): Promise<StoredData>;
  set(data: StoredData): Promise<void>;
}

function getChromeStorage(): ChromeStorageArea | undefined {
  const browserGlobal = globalThis as typeof globalThis & {
    chrome?: { storage?: { local?: ChromeStorageArea } };
  };
  return browserGlobal.chrome?.storage?.local;
}

export class StorageService {
  async load(): Promise<StoredData> {
    const localData = this.loadLocalData();
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      try {
        const data = await chromeStorage.get(STORAGE_FIELDS);
        // localStorage é atualizado em toda gravação e evita perda de dados caso
        // o popup seja fechado antes de o Chrome concluir sua própria escrita.
        return {
          ...data,
          ...localData,
          theme: this.loadThemeFallback() ?? localData.theme ?? data.theme
        };
      } catch {
        // A preferência de tema ainda pode ser recuperada pelo fallback abaixo.
      }
    }

    return { ...localData, theme: this.loadThemeFallback() ?? localData.theme };
  }

  async save(data: StoredData): Promise<void> {
    const mergedData = { ...this.loadLocalData(), ...data };
    this.saveThemeFallback(mergedData.theme);
    this.saveLocalData(mergedData);
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      try {
        await chromeStorage.set(mergedData);
      } catch {
        // A cópia local, feita acima, mantém os dados disponíveis.
      }
    }
  }

  private loadLocalData(): StoredData {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as StoredData;
    } catch {
      return {};
    }
  }

  private saveLocalData(data: StoredData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // O armazenamento da extensão continua sendo tentado abaixo.
    }
  }

  private loadThemeFallback(): Theme | undefined {
    try {
      const theme = localStorage.getItem(THEME_STORAGE_KEY);
      return theme === 'dark' || theme === 'light' ? theme : undefined;
    } catch {
      return undefined;
    }
  }

  private saveThemeFallback(theme: Theme | undefined): void {
    if (!theme) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Falhar no fallback não deve impedir o armazenamento principal.
    }
  }
}
