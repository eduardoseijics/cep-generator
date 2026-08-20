import { CepFormatter } from '../utils/CepFormatter';
import type { CustomCep } from '../types';
import type { CepService } from '../services/CepService';

export interface CustomCepElements {
  list: HTMLElement;
  count: HTMLElement;
  addButton: HTMLButtonElement;
  modal: HTMLElement;
  form: HTMLFormElement;
  modalTitle: HTMLElement;
  editId: HTMLInputElement;
  cepInput: HTMLInputElement;
  labelInput: HTMLInputElement;
  error: HTMLElement;
}

interface CustomCepManagerOptions {
  elements: CustomCepElements;
  cepService: CepService;
  formatCep: (cep: string) => string;
  onChange: (items: CustomCep[]) => void;
  onCopy: (cep: string, button: HTMLElement) => void;
  showMessage: (message: string) => void;
}

export class CustomCepManager {
  private readonly elements: CustomCepElements;
  private readonly cepService: CepService;
  private readonly formatCep: (cep: string) => string;
  private readonly onChange: (items: CustomCep[]) => void;
  private readonly onCopy: (cep: string, button: HTMLElement) => void;
  private readonly showMessage: (message: string) => void;
  private items: CustomCep[] = [];

  constructor(options: CustomCepManagerOptions) {
    this.elements = options.elements;
    this.cepService = options.cepService;
    this.formatCep = options.formatCep;
    this.onChange = options.onChange;
    this.onCopy = options.onCopy;
    this.showMessage = options.showMessage;

    this.bindEvents();
  }

  setItems(items?: CustomCep[]): void {
    this.items = Array.isArray(items) ? items : [];
    this.render();
  }

  getItems(): CustomCep[] {
    return [...this.items];
  }

  render(): void {
    const { count, list } = this.elements;
    count.textContent = `${this.items.length} ${this.items.length === 1 ? 'salvo' : 'salvos'}`;
    list.innerHTML = this.items.length
      ? this.items.map((item) => this.createItemTemplate(item)).join('')
      : '<p class="custom-empty">Adicione CEPs que você usa com frequência.</p>';
  }

  open(item: CustomCep | null = null): void {
    const { modal, modalTitle, editId, cepInput, labelInput, error } = this.elements;
    modalTitle.textContent = item ? 'Editar CEP' : 'Adicionar CEP';
    editId.value = item?.id || '';
    cepInput.value = item ? this.formatCep(item.cep) : '';
    labelInput.value = item?.label || '';
    error.textContent = '';
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('open'));
    setTimeout(() => cepInput.focus(), 100);
  }

  close(): void {
    const { modal, form } = this.elements;
    modal.classList.remove('open');
    setTimeout(() => {
      modal.hidden = true;
      form.reset();
    }, 180);
  }

  private bindEvents(): void {
    const { addButton, form, modal, cepInput, list } = this.elements;
    addButton.addEventListener('click', () => this.open());
    form.addEventListener('submit', (event) => this.save(event));
    modal.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('[data-close-modal]')) this.close();
    });
    cepInput.addEventListener('input', () => this.maskCepInput());
    list.addEventListener('click', (event) => this.handleListAction(event));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) this.close();
    });
  }

  private maskCepInput(): void {
    const { cepInput, error } = this.elements;
    const digits = CepFormatter.digits(cepInput.value);
    cepInput.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    error.textContent = '';
  }

  private save(event: SubmitEvent): void {
    event.preventDefault();
    const { editId, cepInput, labelInput, error } = this.elements;
    const cep = CepFormatter.digits(cepInput.value);
    const editingId = editId.value;
    const validation = this.cepService.validateCustom(cep, this.items, editingId);

    if (validation.error || !validation.state) {
      error.textContent = validation.error ?? 'Não foi possível validar este CEP.';
      return;
    }

    const entry: CustomCep = {
      id: editingId || crypto.randomUUID(),
      cep,
      uf: validation.state.uf,
      label: labelInput.value.trim()
    };

    this.items = editingId
      ? this.items.map((item) => item.id === editingId ? entry : item)
      : [entry, ...this.items];

    this.render();
    this.onChange(this.getItems());
    this.close();
    this.showMessage(editingId ? 'CEP atualizado!' : 'CEP adicionado!');
  }

  private handleListAction(event: Event): void {
    const target = event.target as Element;
    const copyButton = target.closest<HTMLElement>('[data-copy]');
    const editButton = target.closest<HTMLElement>('[data-edit]');
    const deleteButton = target.closest<HTMLElement>('[data-delete]');

    if (copyButton?.dataset.copy) this.onCopy(copyButton.dataset.copy, copyButton);
    if (editButton) this.open(this.items.find((item) => item.id === editButton.dataset.edit) ?? null);
    if (deleteButton?.dataset.delete) this.remove(deleteButton.dataset.delete);
  }

  private remove(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.render();
    this.onChange(this.getItems());
    this.showMessage('CEP excluído');
  }

  private createItemTemplate(item: CustomCep): string {
    const stateName = this.cepService.findState(item.uf)?.name || item.uf;
    const label = CepFormatter.escapeHtml(item.label || stateName);
    return `
      <div class="custom-item">
        <span class="mini-badge">${item.uf}</span>
        <span class="custom-info"><strong>${this.formatCep(item.cep)}</strong><small>${label}</small></span>
        <button type="button" data-copy="${item.cep}" title="Copiar CEP" aria-label="Copiar CEP">
          <svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button type="button" data-edit="${item.id}" title="Editar CEP" aria-label="Editar CEP">
          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button type="button" data-delete="${item.id}" title="Excluir CEP" aria-label="Excluir CEP">
          <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg>
        </button>
      </div>`;
  }
}
