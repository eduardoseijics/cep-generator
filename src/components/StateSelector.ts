import { CepFormatter } from '../utils/CepFormatter';
import type { State } from '../types';

interface StateSelectorOptions {
  searchInput: HTMLInputElement;
  listElement: HTMLElement;
  states: State[];
  onSelect: (uf: string) => void;
}

export class StateSelector {
  private selectedUf = 'SP';

  constructor(private readonly options: StateSelectorOptions) {
    const { searchInput, listElement } = options;

    searchInput.addEventListener('input', () => this.render(searchInput.value));
    listElement.addEventListener('click', (event) => this.handleSelection(event));
  }

  setSelected(uf: string): void {
    this.selectedUf = uf;
    this.render();
  }

  render(query = ''): void {
    const term = CepFormatter.normalizeSearch(query.trim());
    const filtered = this.options.states.filter(({ name, uf }) =>
      CepFormatter.normalizeSearch(name).includes(term) || uf.toLowerCase().includes(term)
    );

    this.options.listElement.innerHTML = filtered.length
      ? filtered.map((state) => this.createStateTemplate(state)).join('')
      : '<p class="empty">Nenhum estado encontrado.</p>';
  }

  private handleSelection(event: Event): void {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-uf]');
    if (!button) return;

    const { uf } = button.dataset;
    if (!uf) return;

    this.selectedUf = uf;
    this.options.searchInput.value = '';
    this.render();
    this.options.onSelect(this.selectedUf);
  }

  private createStateTemplate(state: State): string {
    const isSelected = state.uf === this.selectedUf;
    return `
      <button class="state-option ${isSelected ? 'selected' : ''}" type="button" data-uf="${state.uf}" role="option" aria-selected="${isSelected}">
        <span class="uf-chip">${state.uf}</span><span>${state.name}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </button>`;
  }
}
