export class CepFormatter {
  static digits(value: string): string {
    return String(value).replace(/\D/g, '').slice(0, 8);
  }

  static format(value: string, useMask = true): string {
    const digits = this.digits(value).padStart(8, '0');
    return useMask ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  static escapeHtml(value: string): string {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
    return String(value).replace(/[&<>'"]/g, (character) => entities[character]!);
  }

  static normalizeSearch(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
