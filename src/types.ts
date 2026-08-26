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

export type Panel = 'cep' | 'documents' | 'cards';
export type DocumentKind = 'cpf' | 'cnpj';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

export interface SavedCard {
  brand: CardBrand;
  number: string;
  expiry: string;
  cvv: string;
}

export interface StoredData {
  cepHistory?: HistoryEntry[];
  selectedUf?: string;
  useFormat?: boolean;
  useDocumentFormat?: boolean;
  customCeps?: CustomCep[];
  theme?: Theme;
  activePanel?: Panel;
  selectedDocumentKind?: DocumentKind;
  documentDigits?: string;
  selectedCardBrand?: CardBrand;
  savedCard?: SavedCard;
}
export type CepCatalog = Record<string, string[]>;
export type Theme = 'light' | 'dark';
