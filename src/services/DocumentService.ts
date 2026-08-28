import type { CardBrand } from '../types';

export type { CardBrand, DocumentKind } from '../types';
export interface GeneratedCard {
  brand: CardBrand;
  number: string;
  expiry: string;
  cvv: string;
}

function randomDigit(): number {
  return Math.floor(Math.random() * 10);
}
function cpfDigit(digits: number[]): number {
  const sum = digits
    .slice()
    .reverse()
    .reduce((total, digit, index) => total + digit * (index + 2), 0);
  const digit = 11 - (sum % 11);
  return digit >= 10 ? 0 : digit;
}
function cnpjDigit(digits: number[]): number {
  const weights =
    digits.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digit = 11 - (digits.reduce((sum, value, index) => sum + value * weights[index]!, 0) % 11);
  return digit >= 10 ? 0 : digit;
}
function luhnDigit(digits: number[]): number {
  let sum = 0;
  let shouldDouble = true;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = digits[index]!;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
}
function expiry(): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + Math.floor(Math.random() * 120) + 1, 1);
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function generateCpf(formatted = true): string {
  let digits: number[];
  do {
    digits = Array.from({ length: 9 }, randomDigit);
  } while (digits.every((digit) => digit === digits[0]));
  digits.push(cpfDigit(digits));
  digits.push(cpfDigit(digits));
  const value = digits.join('');
  return formatted ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : value;
}
export function generateCnpj(formatted = true): string {
  const digits = [...Array.from({ length: 8 }, randomDigit), 0, 0, 0, 1];
  digits.push(cnpjDigit(digits));
  digits.push(cnpjDigit(digits));
  const value = digits.join('');
  return formatted ? value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : value;
}
export function generateCard(brand: CardBrand): GeneratedCard {
  const prefixes: Record<CardBrand, number[]> = {
    visa: [4],
    mastercard: [5, 1 + Math.floor(Math.random() * 5)],
    amex: [3, Math.random() < 0.5 ? 4 : 7],
    discover: [6, 0, 1, 1]
  };
  const length: Record<CardBrand, number> = { visa: 16, mastercard: 16, amex: 15, discover: 16 };
  const digits = [...prefixes[brand]];
  while (digits.length < length[brand] - 1) digits.push(randomDigit());
  digits.push(luhnDigit(digits));
  return {
    brand,
    number: digits.join(''),
    expiry: expiry(),
    cvv:
      brand === 'amex'
        ? String(Math.floor(Math.random() * 9000) + 1000)
        : String(Math.floor(Math.random() * 900) + 100)
  };
}

export const documentService = { generateCpf, generateCnpj, generateCard };
