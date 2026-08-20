import type { HistoryEntry } from '../types';

interface HistoryListOptions {
  listElement: HTMLElement;
  clearButton: HTMLButtonElement;
  onCopy: (cep: string, button: HTMLElement) => void;
  onClear: () => void;
}

export class HistoryList {
  constructor(private readonly options: HistoryListOptions) {
    options.listElement.addEventListener('click', (event) => {
      const item = (event.target as Element).closest<HTMLElement>('[data-cep]');
      if (item?.dataset.cep) options.onCopy(item.dataset.cep, item);
    });
    options.clearButton.addEventListener('click', options.onClear);
  }

  render(history: HistoryEntry[], formatCep: (cep: string) => string): void {
    this.options.listElement.innerHTML = history.length
      ? history.map((item) => this.createItemTemplate(item, formatCep)).join('')
      : '<p class="history-empty">Seus últimos CEPs aparecerão aqui.</p>';
    this.options.clearButton.hidden = history.length === 0;
  }

  private createItemTemplate(item: HistoryEntry, formatCep: (cep: string) => string): string {
    const cep = formatCep(item.cep);
    return `
      <button class="history-item" type="button" data-cep="${item.cep}" title="Copiar ${cep}">
        <span class="mini-badge">${item.uf}</span>
        <span><strong>${cep}</strong><small>${item.name}</small></span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>`;
  }
}
