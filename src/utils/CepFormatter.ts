export class CepFormatter {
  static format(value: string, useMask = true): string {
    const digits = String(value).replace(/\D/g, '').slice(0, 8).padStart(8, '0');
    return useMask ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  static normalizeSearch(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
