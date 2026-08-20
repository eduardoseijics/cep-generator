# CEP by State

A TypeScript browser extension for generating and copying real Brazilian postal codes grouped by state. It includes an offline catalog with seven CEPs per state, light and dark themes, recent history, and locally stored custom CEPs with automatic state detection.

## Features

- 189 built-in CEPs covering all 26 states and the Federal District
- Offline generation without external API requests
- Automatic state detection for custom CEPs
- Create, edit, copy, and delete custom CEPs
- Recent CEP history
- Formatted and unformatted output
- Persistent light and dark themes

## Development

```bash
npm install
npm run dev
```

Run the strict TypeScript check without generating files:

```bash
npm run typecheck
```

## Project structure

- `src/components`: UI components and their interactions
- `src/services`: persistence and CEP business rules
- `src/utils`: data formatting and normalization
- `src/styles`: component, base, and theme styles
- `src/App.ts`: application state and orchestration
- `src/types.ts`: shared TypeScript contracts

## Build and install

```bash
npm run build
```

After building:

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose this project's `dist` directory.

## Data and privacy

The built-in catalog was retrieved from ViaCEP and works offline. Custom CEPs, history, format preferences, and theme preferences are stored only in the browser's local extension storage.

---

## Português (Brasil)

Extensão de navegador em TypeScript para gerar e copiar CEPs reais separados por estado. Possui um catálogo offline com sete CEPs por UF, temas claro e escuro, histórico recente e cadastro de CEPs personalizados com identificação automática do estado.

### Funcionalidades

- 189 CEPs incluídos, cobrindo os 26 estados e o Distrito Federal
- Geração offline, sem consultas externas durante o uso
- Identificação automática da UF de CEPs personalizados
- Cadastro, edição, cópia e exclusão de CEPs personalizados
- Histórico de CEPs recentes
- Exibição com ou sem formatação
- Preferência persistente de tema claro ou escuro

### Desenvolvimento

```bash
npm install
npm run dev
```

Para verificar os tipos:

```bash
npm run typecheck
```

### Gerar e instalar a extensão

```bash
npm run build
```

Depois do build:

1. Abra `chrome://extensions` no Chrome ou `edge://extensions` no Edge.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta `dist` deste projeto.

### Dados e privacidade

O catálogo padrão foi consultado no ViaCEP e funciona offline. CEPs personalizados, histórico, preferência de formatação e tema ficam salvos somente no armazenamento local da extensão.
