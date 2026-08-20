import './style.css';
import { App } from './App';

const app = new App();
app.init().catch((error: unknown) => {
  console.error('Falha ao iniciar a extensão:', error);
});
