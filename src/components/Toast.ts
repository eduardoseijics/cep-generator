export class Toast {
  private timer?: ReturnType<typeof setTimeout>;

  constructor(private readonly element: HTMLElement) {
  }

  show(message: string, duration = 1700): void {
    this.element.textContent = message;
    this.element.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.element.classList.remove('show'), duration);
  }
}
