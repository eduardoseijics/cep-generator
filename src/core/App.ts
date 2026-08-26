import { states } from '../data/states';
import { cepCatalog } from '../data/cepCatalog';
import { CepFormatter } from '../utils/CepFormatter';
import { CepService } from '../services/CepService';
import { StorageService } from '../services/StorageService';
import { DocumentService } from '../services/DocumentService';
import type { CardBrand, DocumentKind } from '../services/DocumentService';
import { Toast } from '../components/Toast';
import { StateSelector } from '../components/StateSelector';
import { HistoryList } from '../components/HistoryList';
import { CustomCepManager } from '../components/CustomCepManager';
import type { CustomCepElements } from '../components/CustomCepManager';
import type { HistoryEntry, State, StoredData, Theme } from '../types';

interface AppElements {
  stateSearch: HTMLInputElement;
  stateList: HTMLElement;
  selectedState: HTMLElement;
  stateBadge: HTMLElement;
  generatedCep: HTMLElement;
  generateButton: HTMLButtonElement;
  copyButton: HTMLButtonElement;
  formatToggle: HTMLInputElement;
  themeToggle: HTMLButtonElement;
  historyList: HTMLElement;
  clearHistory: HTMLButtonElement;
  toast: HTMLElement;
  customList: HTMLElement;
  customCount: HTMLElement;
  addCepButton: HTMLButtonElement;
  modal: HTMLElement;
  cepForm: HTMLFormElement;
  modalTitle: HTMLElement;
  editId: HTMLInputElement;
  customCep: HTMLInputElement;
  customLabel: HTMLInputElement;
  cepError: HTMLElement;
  mainTabs: HTMLElement;
  cepPanel: HTMLElement;
  documentsPanel: HTMLElement;
  cardsPanel: HTMLElement;
  documentTabs: HTMLElement;
  documentFormatToggle: HTMLInputElement;
  documentFormatHint: HTMLElement;
  documentLabel: HTMLElement;
  documentValue: HTMLOutputElement;
  documentCopyButton: HTMLButtonElement;
  generateDocumentButton: HTMLButtonElement;
  cardBrands: HTMLElement;
  cardLabel: HTMLElement;
  cardNumber: HTMLOutputElement;
  cardCopyButton: HTMLButtonElement;
  cardExpiryCopyButton: HTMLButtonElement;
  cardCvvCopyButton: HTMLButtonElement;
  generateCardButton: HTMLButtonElement;
  cardExpiry: HTMLElement;
  cardCvv: HTMLElement;
}

const DEFAULT_UF = 'SP';
const DEFAULT_CEP = '01310100';
const HISTORY_LIMIT = 4;

export class App {
  private readonly elements: AppElements;
  private readonly storage: StorageService;
  private readonly cepService: CepService;
  private readonly documentService: DocumentService;
  private readonly toast: Toast;
  private readonly stateSelector: StateSelector;
  private readonly historyList: HistoryList;
  private readonly customCepManager: CustomCepManager;
  private selectedState: State;
  private currentCep = DEFAULT_CEP;
  private history: HistoryEntry[] = [];
  private theme: Theme = 'light';
  private documentKind: DocumentKind = 'cpf';
  private cardBrand: CardBrand = 'visa';
  private documentValue = '';
  private cardValue = '';

  constructor(documentRoot: Document = document) {
    this.elements = this.getElements(documentRoot);
    this.storage = new StorageService();
    this.cepService = new CepService(states, cepCatalog);
    this.documentService = new DocumentService();
    this.toast = new Toast(this.elements.toast);
    this.selectedState = this.cepService.getState(DEFAULT_UF);

    this.stateSelector = new StateSelector({
      searchInput: this.elements.stateSearch,
      listElement: this.elements.stateList,
      states,
      onSelect: (uf) => this.selectState(uf)
    });
    this.historyList = new HistoryList({
      listElement: this.elements.historyList,
      clearButton: this.elements.clearHistory,
      onCopy: (cep, button) => this.copyCep(cep, button),
      onClear: () => this.clearHistory()
    });
    this.customCepManager = new CustomCepManager({
      elements: this.getCustomManagerElements(),
      cepService: this.cepService,
      formatCep: (cep) => this.formatCep(cep),
      onChange: () => this.persist(),
      onCopy: (cep, button) => this.copyCep(cep, button),
      showMessage: (message) => this.toast.show(message)
    });
    this.bindEvents();
  }

  async init(): Promise<void> {
    const saved = await this.storage.load();
    this.restoreState(saved);
    this.stateSelector.setSelected(this.selectedState.uf);
    this.customCepManager.setItems(saved.customCeps);
    this.renderAll();
    this.generateDocument();
    this.generateCard();
  }

  private formatCep(cep: string): string {
    return CepFormatter.format(cep, this.elements.formatToggle.checked);
  }

  private async copyCep(
    cep = this.currentCep,
    sourceButton: HTMLElement = this.elements.copyButton
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.formatCep(cep));
      sourceButton.classList.add('copied');
      this.toast.show('CEP copiado!');
      setTimeout(() => sourceButton.classList.remove('copied'), 1500);
    } catch {
      this.toast.show('Não foi possível copiar');
    }
  }

  private async copyValue(value: string, button: HTMLElement, successMessage: string): Promise<void> {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add('copied');
      this.toast.show(successMessage);
      setTimeout(() => button.classList.remove('copied'), 1500);
    } catch {
      this.toast.show('Não foi possível copiar');
    }
  }

  private async persist(): Promise<void> {
    await this.storage.save({
      cepHistory: this.history,
      selectedUf: this.selectedState.uf,
      useFormat: this.elements.formatToggle.checked,
      useDocumentFormat: this.elements.documentFormatToggle.checked,
      customCeps: this.customCepManager.getItems(),
      theme: this.theme
    });
  }

  private bindEvents(): void {
    this.elements.generateButton.addEventListener('click', () => this.generateCep());
    this.elements.copyButton.addEventListener('click', () => this.copyCep());
    this.elements.formatToggle.addEventListener('change', () => {
      this.renderAll();
      this.persist();
    });
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    this.elements.mainTabs.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-panel]');
      if (button) this.selectPanel(button.dataset.panel as 'cep' | 'documents' | 'cards');
    });
    this.elements.documentTabs.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-document]');
      if (!button) return;
      this.documentKind = button.dataset.document as DocumentKind;
      this.generateDocument();
    });
    this.elements.documentFormatToggle.addEventListener('change', () => {
      this.generateDocument();
      this.persist();
    });
    this.elements.cardBrands.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-brand]');
      if (!button) return;
      this.cardBrand = button.dataset.brand as CardBrand;
      this.generateCard();
    });
    this.elements.generateDocumentButton.addEventListener('click', () => this.generateDocument());
    this.elements.documentCopyButton.addEventListener('click', () => this.copyValue(this.documentValue, this.elements.documentCopyButton, 'Resultado copiado!'));
    this.elements.generateCardButton.addEventListener('click', () => this.generateCard());
    this.elements.cardCopyButton.addEventListener('click', () => this.copyValue(this.cardValue, this.elements.cardCopyButton, 'Cartão copiado!'));
    this.elements.cardExpiryCopyButton.addEventListener('click', () => this.copyValue(this.elements.cardExpiry.textContent || '', this.elements.cardExpiryCopyButton, 'Validade copiada!'));
    this.elements.cardCvvCopyButton.addEventListener('click', () => this.copyValue(this.elements.cardCvv.textContent || '', this.elements.cardCvvCopyButton, 'CVV copiado!'));
  }

  private restoreState(saved: StoredData): void {
    this.selectedState = this.cepService.findState(saved.selectedUf) || this.selectedState;
    this.history = Array.isArray(saved.cepHistory) ? saved.cepHistory.slice(0, HISTORY_LIMIT) : [];
    if (typeof saved.useFormat === 'boolean') this.elements.formatToggle.checked = saved.useFormat;
    if (typeof saved.useDocumentFormat === 'boolean') this.elements.documentFormatToggle.checked = saved.useDocumentFormat;
    if (this.history[0]?.uf === this.selectedState.uf) this.currentCep = this.history[0].cep;
    this.applyTheme(saved.theme === 'dark' ? 'dark' : 'light');
  }

  private selectState(uf: string): void {
    this.selectedState = this.cepService.getState(uf);
    this.generateCep();
  }

  private generateCep(): void {
    this.currentCep = this.cepService.generate(this.selectedState.uf, this.customCepManager.getItems(), this.currentCep);
    this.history = [
      { cep: this.currentCep, uf: this.selectedState.uf, name: this.selectedState.name },
      ...this.history.filter((item) => item.cep !== this.currentCep)
    ].slice(0, HISTORY_LIMIT);
    this.renderResult();
    this.renderHistory();
    this.persist();
    this.animateGeneratedCep();
  }

  private clearHistory(): void {
    this.history = [];
    this.renderHistory();
    this.persist();
  }

  private renderAll(): void {
    this.renderResult();
    this.renderHistory();
    this.customCepManager.render();
  }

  private generateDocument(): void {
    this.documentValue = this.documentKind === 'cpf'
      ? this.documentService.generateCpf(this.elements.documentFormatToggle.checked)
      : this.documentService.generateCnpj(this.elements.documentFormatToggle.checked);
    this.elements.documentLabel.textContent = `${this.documentKind.toUpperCase()} GERADO`;
    this.renderDocument();
  }

  private renderDocument(): void {
    this.elements.documentValue.textContent = this.documentValue || '—';
    this.elements.generateDocumentButton.textContent = `Gerar ${this.documentKind.toUpperCase()}`;
    this.elements.documentFormatHint.textContent = this.documentKind === 'cpf'
      ? 'Exibir como 000.000.000-00'
      : 'Exibir como 00.000.000/0000-00';
    this.elements.documentTabs.querySelectorAll<HTMLButtonElement>('[data-document]').forEach((button) => {
      button.classList.toggle('active', button.dataset.document === this.documentKind);
    });
  }

  private generateCard(): void {
    const card = this.documentService.generateCard(this.cardBrand);
    this.cardValue = card.number;
    this.elements.cardLabel.textContent = `${this.cardBrand === 'mastercard' ? 'MASTERCARD' : this.cardBrand.toUpperCase()} · CARTÃO DE TESTE`;
    this.elements.cardNumber.textContent = card.number;
    this.elements.cardExpiry.textContent = card.expiry;
    this.elements.cardCvv.textContent = card.cvv;
    this.elements.cardBrands.querySelectorAll<HTMLButtonElement>('[data-brand]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.brand === this.cardBrand);
    });
  }

  private selectPanel(panel: 'cep' | 'documents' | 'cards'): void {
    this.elements.cepPanel.hidden = panel !== 'cep';
    this.elements.documentsPanel.hidden = panel !== 'documents';
    this.elements.cardsPanel.hidden = panel !== 'cards';
    this.elements.mainTabs.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach((button) => {
      button.classList.toggle('active', button.dataset.panel === panel);
    });
  }

  private renderResult(): void {
    this.elements.selectedState.textContent = `${this.selectedState.name} · ${this.selectedState.uf}`;
    this.elements.stateBadge.textContent = this.selectedState.uf;
    this.elements.generatedCep.textContent = this.formatCep(this.currentCep);
  }

  private renderHistory(): void {
    this.historyList.render(this.history, (cep) => this.formatCep(cep));
  }

  private animateGeneratedCep(): void {
    this.elements.generatedCep.animate(
      [{ opacity: 0.25, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220 }
    );
  }

  private toggleTheme(): void {
    this.applyTheme(this.theme === 'light' ? 'dark' : 'light');
    this.persist();
  }

  private applyTheme(theme: Theme): void {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    this.elements.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    this.elements.themeToggle.title = theme === 'dark' ? 'Tema claro' : 'Tema escuro';
  }

  private getCustomManagerElements(): CustomCepElements {
    return {
      list: this.elements.customList,
      count: this.elements.customCount,
      addButton: this.elements.addCepButton,
      modal: this.elements.modal,
      form: this.elements.cepForm,
      modalTitle: this.elements.modalTitle,
      editId: this.elements.editId,
      cepInput: this.elements.customCep,
      labelInput: this.elements.customLabel,
      error: this.elements.cepError
    };
  }

  private getElements(root: Document): AppElements {
    const required = <T extends HTMLElement>(selector: string): T => {
      const element = root.querySelector(selector);
      if (!element) throw new Error(`Elemento obrigatório não encontrado: ${selector}`);
      return element as T;
    };
    return {
      stateSearch: required<HTMLInputElement>('#stateSearch'),
      stateList: required('#stateList'),
      selectedState: required('#selectedState'),
      stateBadge: required('#stateBadge'),
      generatedCep: required('#generatedCep'),
      generateButton: required<HTMLButtonElement>('#generateButton'),
      copyButton: required<HTMLButtonElement>('#copyButton'),
      formatToggle: required<HTMLInputElement>('#formatToggle'),
      themeToggle: required<HTMLButtonElement>('#themeToggle'),
      historyList: required('#historyList'),
      clearHistory: required<HTMLButtonElement>('#clearHistory'),
      toast: required('#toast'),
      customList: required('#customList'),
      customCount: required('#customCount'),
      addCepButton: required<HTMLButtonElement>('#addCepButton'),
      modal: required('#modal'),
      cepForm: required<HTMLFormElement>('#cepForm'),
      modalTitle: required('#modalTitle'),
      editId: required<HTMLInputElement>('#editId'),
      customCep: required<HTMLInputElement>('#customCep'),
      customLabel: required<HTMLInputElement>('#customLabel'),
      cepError: required('#cepError'),
      mainTabs: required('#mainTabs'),
      cepPanel: required('#cepPanel'),
      documentsPanel: required('#documentsPanel'),
      cardsPanel: required('#cardsPanel'),
      documentTabs: required('.document-tabs'),
      documentFormatToggle: required<HTMLInputElement>('#documentFormatToggle'),
      documentFormatHint: required('#documentFormatHint'),
      documentLabel: required('#documentLabel'),
      documentValue: required<HTMLOutputElement>('#documentValue'),
      documentCopyButton: required<HTMLButtonElement>('#documentCopyButton'),
      generateDocumentButton: required<HTMLButtonElement>('#generateDocumentButton'),
      cardBrands: required('#cardBrands'),
      cardLabel: required('#cardLabel'),
      cardNumber: required<HTMLOutputElement>('#cardNumber'),
      cardCopyButton: required<HTMLButtonElement>('#cardCopyButton'),
      cardExpiryCopyButton: required<HTMLButtonElement>('#cardExpiryCopyButton'),
      cardCvvCopyButton: required<HTMLButtonElement>('#cardCvvCopyButton'),
      generateCardButton: required<HTMLButtonElement>('#generateCardButton'),
      cardExpiry: required('#cardExpiry'),
      cardCvv: required('#cardCvv')
    };
  }
}
