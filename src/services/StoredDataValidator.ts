import type { CardBrand, CustomCep, HistoryEntry, SavedCard, StoredData, Theme } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}
function isCardBrand(value: unknown): value is CardBrand {
  return ['visa', 'mastercard', 'amex', 'discover'].includes(value as CardBrand);
}
function isHistoryEntry(value: unknown): value is HistoryEntry {
  return (
    isRecord(value) &&
    typeof value.cep === 'string' &&
    /^\d{8}$/.test(value.cep) &&
    typeof value.uf === 'string' &&
    typeof value.name === 'string'
  );
}
function isCustomCep(value: unknown): value is CustomCep {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.cep === 'string' &&
    /^\d{8}$/.test(value.cep) &&
    typeof value.uf === 'string' &&
    typeof value.label === 'string'
  );
}
function isSavedCard(value: unknown): value is SavedCard {
  return (
    isRecord(value) &&
    isCardBrand(value.brand) &&
    typeof value.number === 'string' &&
    /^\d{15,16}$/.test(value.number) &&
    typeof value.expiry === 'string' &&
    /^(0[1-9]|1[0-2])\/\d{4}$/.test(value.expiry) &&
    typeof value.cvv === 'string' &&
    new RegExp(`^\\d{${value.brand === 'amex' ? 4 : 3}}$`).test(value.cvv)
  );
}

export function normalizeStoredData(value: unknown): StoredData {
  if (!isRecord(value)) return {};
  return {
    cepHistory: Array.isArray(value.cepHistory)
      ? value.cepHistory.filter(isHistoryEntry)
      : undefined,
    selectedUf: typeof value.selectedUf === 'string' ? value.selectedUf : undefined,
    useFormat: typeof value.useFormat === 'boolean' ? value.useFormat : undefined,
    useDocumentFormat:
      typeof value.useDocumentFormat === 'boolean' ? value.useDocumentFormat : undefined,
    customCeps: Array.isArray(value.customCeps) ? value.customCeps.filter(isCustomCep) : undefined,
    theme: isTheme(value.theme) ? value.theme : undefined,
    activePanel:
      value.activePanel === 'cep' ||
      value.activePanel === 'documents' ||
      value.activePanel === 'cards'
        ? value.activePanel
        : undefined,
    selectedDocumentKind:
      value.selectedDocumentKind === 'cpf' || value.selectedDocumentKind === 'cnpj'
        ? value.selectedDocumentKind
        : undefined,
    documentDigits: typeof value.documentDigits === 'string' ? value.documentDigits : undefined,
    selectedCardBrand: isCardBrand(value.selectedCardBrand) ? value.selectedCardBrand : undefined,
    savedCard: isSavedCard(value.savedCard) ? value.savedCard : undefined
  };
}
