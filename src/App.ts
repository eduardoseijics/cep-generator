import { states } from './states';
import { cepCatalog } from './cepCatalog';
import { CepFormatter } from './utils/CepFormatter';
import { CepService } from './services/CepService';
import { StorageService } from './services/StorageService';
import { Toast } from './components/Toast';
import { StateSelector } from './components/StateSelector';
import { HistoryList } from './components/HistoryList';
import { CustomCepManager } from './components/CustomCepManager';
import type { CustomCepElements } from './components/CustomCepManager';
import type { HistoryEntry, State, StoredData, Theme } from './types';

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
}

const DEFAULT_UF = 'SP';
const DEFAULT_CEP = '01310100';
const HISTORY_LIMIT = 4;

export class App {
  private readonly elements: AppElements;
  private readonly storage: StorageService;
  private readonly cepService: CepService;
  private readonly toast: Toast;
  private readonly stateSelector: StateSelector;
  private readonly historyList: HistoryList;
  private readonly customCepManager: CustomCepManager;
  private selectedState: State;
  private currentCep = DEFAULT_CEP;
  private history: HistoryEntry[] = [];
  private theme: Theme = 'light';

  constructor(documentRoot: Document = document) {
    this.elements = this.getElements(documentRoot);
    this.storage = new StorageService();
    this.cepService = new CepService(states, cepCatalog);
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

  private async persist(): Promise<void> {
    await this.storage.save({
      cepHistory: this.history,
      selectedUf: this.selectedState.uf,
      useFormat: this.elements.formatToggle.checked,
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
  }

  private restoreState(saved: StoredData): void {
    this.selectedState = this.cepService.findState(saved.selectedUf) || this.selectedState;
    this.history = Array.isArray(saved.cepHistory) ? saved.cepHistory.slice(0, HISTORY_LIMIT) : [];
    if (typeof saved.useFormat === 'boolean') this.elements.formatToggle.checked = saved.useFormat;
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
      cepError: required('#cepError')
    };
  }
}
