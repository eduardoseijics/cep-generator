import type { CardBrand } from '../types';

export type { CardBrand, DocumentKind } from '../types';

export interface GeneratedCard {
  brand: CardBrand;
  number: string;
  expiry: string;
  cvv: string;
}

/**
 * Geradores para dados de teste. A lógica de CPF, CNPJ e das bandeiras foi
 * portada da extensão extensao-gerar-cpf-cnpj e tipada para este projeto.
 */
export class DocumentService {
  generateCpf(formatted = true): string {
    const digits = Array.from({ length: 9 }, () => this.randomDigit());
    digits.push(this.cpfDigit(digits));
    digits.push(this.cpfDigit(digits));
    const value = digits.join('');
    return formatted ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : value;
  }

  generateCnpj(formatted = true): string {
    // Mantém a matriz 0001 utilizada pela implementação original.
    const digits = [...Array.from({ length: 8 }, () => this.randomDigit()), 0, 0, 0, 1];
    digits.push(this.cnpjDigit(digits));
    digits.push(this.cnpjDigit(digits));
    const value = digits.join('');
    return formatted
      ? value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      : value;
  }

  generateCard(brand: CardBrand): GeneratedCard {
    const prefixes: Record<CardBrand, number[]> = {
      visa: [4],
      mastercard: [5, 1 + Math.floor(Math.random() * 5)],
      amex: [3, Math.random() < 0.5 ? 4 : 7],
      discover: [6, 0, 1, 1]
    };
    const length: Record<CardBrand, number> = { visa: 16, mastercard: 16, amex: 15, discover: 16 };
    const digits = [...prefixes[brand]];
    while (digits.length < length[brand] - 1) digits.push(this.randomDigit());
    digits.push(this.luhnDigit(digits));

    return {
      brand,
      number: digits.join(''),
      expiry: this.expiry(),
      cvv: String(Math.floor(Math.random() * 900) + 100)
    };
  }

  private randomDigit(): number {
    return Math.floor(Math.random() * 10);
  }

  private cpfDigit(digits: number[]): number {
    const sum = digits
      .slice()
      .reverse()
      .reduce((total, digit, index) => total + digit * (index + 2), 0);
    const digit = 11 - (sum % 11);
    return digit >= 10 ? 0 : digit;
  }

  private cnpjDigit(digits: number[]): number {
    const weights =
      digits.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digit =
      11 - (digits.reduce((sum, value, index) => sum + value * weights[index]!, 0) % 11);
    return digit >= 10 ? 0 : digit;
  }

  private luhnDigit(digits: number[]): number {
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

  private expiry(): string {
    const now = new Date();
    const offset = Math.floor(Math.random() * 120) + 1;
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }
}
