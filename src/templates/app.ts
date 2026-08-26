import { contentTemplate } from './content';
import { headerTemplate } from './header';
import { modalTemplate } from './modal';

export const appTemplate = `
  <main class="app">
    ${headerTemplate}
    ${contentTemplate}
    <footer>Dados gerados para testes; não use em cadastros ou transações reais.</footer>
    ${modalTemplate}
  </main>
`;
