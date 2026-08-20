export interface State {
  uf: string;
  name: string;
  min: number;
  max: number;
}

export interface CustomCep {
  id: string;
  cep: string;
  uf: string;
  label: string;
}

export interface HistoryEntry {
  cep: string;
  uf: string;
  name: string;
}
export interface StoredData {
  cepHistory?: HistoryEntry[];
  selectedUf?: string;
  useFormat?: boolean;
  customCeps?: CustomCep[];
  theme?: Theme;
}
export type CepCatalog = Record<string, string[]>;
export type Theme = 'light' | 'dark';
