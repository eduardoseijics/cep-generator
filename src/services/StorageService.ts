import type { StoredData, Theme } from '../types';
import { normalizeStoredData } from './StoredDataValidator';

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
  return (
    globalThis as typeof globalThis & { chrome?: { storage?: { local?: ChromeStorageArea } } }
  ).chrome?.storage?.local;
}

export class StorageService {
  async load(): Promise<StoredData> {
    const localData = this.loadLocalData();
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      try {
        const chromeData = normalizeStoredData(await chromeStorage.get(STORAGE_FIELDS));
        return {
          ...chromeData,
          ...localData,
          theme: this.loadThemeFallback() ?? localData.theme ?? chromeData.theme
        };
      } catch {
        /* O fallback local continua disponível. */
      }
    }
    return { ...localData, theme: this.loadThemeFallback() ?? localData.theme };
  }

  async save(data: StoredData): Promise<boolean> {
    const mergedData = { ...this.loadLocalData(), ...data };
    this.saveThemeFallback(mergedData.theme);
    const savedLocally = this.saveLocalData(mergedData);
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      try {
        await chromeStorage.set(mergedData);
        return true;
      } catch {
        /* Usa o resultado local abaixo. */
      }
    }
    return savedLocally;
  }

  private loadLocalData(): StoredData {
    try {
      return normalizeStoredData(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      return {};
    }
  }
  private saveLocalData(data: StoredData): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
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
      /* O armazenamento principal ainda é tentado. */
    }
  }
}
