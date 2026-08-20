const STORAGE_KEY = 'cepGenerator';
const STORAGE_FIELDS = ['cepHistory', 'selectedUf', 'useFormat', 'customCeps', 'theme'];

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
    const chromeStorage = getChromeStorage();
    if (chromeStorage) return chromeStorage.get(STORAGE_FIELDS);

    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  async save(data: StoredData): Promise<void> {
    const chromeStorage = getChromeStorage();
    if (chromeStorage) {
      await chromeStorage.set(data);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
import type { StoredData } from '../types';
