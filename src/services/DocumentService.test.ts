import { describe, expect, it } from 'vitest';
import { DocumentService } from './DocumentService';
import type { CardBrand } from './DocumentService';

const service = new DocumentService();

function cpfIsValid(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  const calculate = (base: string) => {
    const sum = [...base].reduce(
      (total, digit, index) => total + Number(digit) * (base.length + 1 - index),
      0
    );
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return (
    calculate(digits.slice(0, 9)) === Number(digits[9]) &&
    calculate(digits.slice(0, 10)) === Number(digits[10])
  );
}

function cnpjIsValid(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  const calculate = (base: string) => {
    let weight = base.length === 12 ? 5 : 6;
    const sum = [...base].reduce((total, digit) => {
      const next = total + Number(digit) * weight;
      weight = weight === 2 ? 9 : weight - 1;
      return next;
    }, 0);
    const result = 11 - (sum % 11);
    return result >= 10 ? 0 : result;
  };
  return (
    calculate(digits.slice(0, 12)) === Number(digits[12]) &&
    calculate(digits.slice(0, 13)) === Number(digits[13])
  );
}

function luhnIsValid(value: string): boolean {
  let sum = 0;
  let double = false;
  for (const digitCharacter of [...value].reverse()) {
    let digit = Number(digitCharacter);
    if (double) digit = digit > 4 ? digit * 2 - 9 : digit * 2;
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

describe('DocumentService', () => {
  it('gera CPF válido com e sem máscara', () => {
    expect(cpfIsValid(service.generateCpf(true))).toBe(true);
    expect(service.generateCpf(false)).toMatch(/^\d{11}$/);
  });

  it('não gera CPF com todos os dígitos iguais', () => {
    Array.from({ length: 100 }, () => service.generateCpf(false)).forEach((cpf) => {
      expect(new Set(cpf).size).toBeGreaterThan(1);
    });
  });

  it('gera CNPJ válido com e sem máscara', () => {
    expect(cnpjIsValid(service.generateCnpj(true))).toBe(true);
    expect(service.generateCnpj(false)).toMatch(/^\d{14}$/);
  });

  it.each<CardBrand>(['visa', 'mastercard', 'amex', 'discover'])(
    'gera cartão %s com Luhn válido',
    (brand) => {
      const card = service.generateCard(brand);
      expect(luhnIsValid(card.number)).toBe(true);
      expect(card.number).toHaveLength(brand === 'amex' ? 15 : 16);
      expect(card.cvv).toMatch(brand === 'amex' ? /^\d{4}$/ : /^\d{3}$/);
      expect(card.expiry).toMatch(/^\d{2}\/\d{4}$/);
    }
  );
});
