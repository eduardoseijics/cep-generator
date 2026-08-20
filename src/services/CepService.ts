import type { CepCatalog, CustomCep, State } from '../types';

export type CustomCepValidation =
  | { error: string; state?: never }
  | { state: State; error?: never };

export class CepService {
  constructor(private readonly states: State[], private readonly catalog: CepCatalog) {}

  findState(uf?: string): State | undefined {
    return this.states.find((state) => state.uf === uf);
  }

  getState(uf: string): State {
    const state = this.findState(uf);
    if (!state) throw new Error(`UF não encontrada: ${uf}`);
    return state;
  }

  detectState(cep: string): State | undefined {
    const numericCep = Number(cep);

    // Roraima's 693xx range separates the two postal ranges assigned to Amazonas.
    if (numericCep >= 69400000 && numericCep <= 69899999) {
      return this.getState('AM');
    }

    return this.states.find(({ min, max }) => numericCep >= min && numericCep <= max);
  }

  generate(uf: string, customCeps: CustomCep[] = [], currentCep = ''): string {
    const customForState = customCeps.filter((item) => item.uf === uf).map((item) => item.cep);
    const available = [...(this.catalog[uf] ?? []), ...customForState];
    const alternatives = available.filter((cep) => cep !== currentCep);

    if (available.length === 0) {
      throw new Error(`Nenhum CEP disponível para ${uf}`);
    }

    return this.randomItem(alternatives.length ? alternatives : available);
  }

  validateCustom(cep: string, items: CustomCep[], editingId = ''): CustomCepValidation {
    if (cep.length !== 8) return { error: 'Digite um CEP com 8 números.' };
    if (items.some((item) => item.cep === cep && item.id !== editingId)) {
      return { error: 'Este CEP já está na sua lista.' };
    }

    const state = this.detectState(cep);
    if (!state) return { error: 'Este CEP não pertence a uma faixa postal brasileira.' };
    return { state };
  }

  private randomItem(items: string[]): string {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const randomValue = random.at(0) ?? 0;
    const selectedItem = items[randomValue % items.length];

    if (!selectedItem) throw new Error('Não foi possível selecionar um CEP.');
    return selectedItem;
  }
}
