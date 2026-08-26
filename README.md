# CEP by State

A Vue 3 and TypeScript browser extension for generating and copying Brazilian test data. It includes CEPs grouped by state, CPF, CNPJ, and card numbers with expiry dates and CVVs.

## Features

- 189 built-in CEPs covering all 26 states and the Federal District
- Offline generation without external API requests
- Automatic state detection for custom CEPs
- Create, edit, copy, and delete custom CEPs
- Recent CEP history
- Formatted and unformatted output
- Persistent light and dark themes
- Valid CPF and CNPJ generation, with check digits
- Visa, Mastercard, American Express, and Discover test card generation with Luhn validation

## Development

See [development guidelines](AGENTS.md) for component boundaries, persistence, formatting, and validation expectations.

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
- `src/core`: application bootstrap and orchestration
- `src/data`: built-in states and CEP catalog
- `src/services`: persistence and CEP business rules
- `src/utils`: data formatting and normalization
- `src/styles`: component, base, and theme styles
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

Extensão de navegador em Vue 3 e TypeScript para gerar e copiar dados brasileiros de teste. Além de CEPs separados por estado, gera CPF, CNPJ e cartões com validade e CVV.

### Funcionalidades

- 189 CEPs incluídos, cobrindo os 26 estados e o Distrito Federal
- Geração offline, sem consultas externas durante o uso
- Identificação automática da UF de CEPs personalizados
- Cadastro, edição, cópia e exclusão de CEPs personalizados
- Histórico de CEPs recentes
- Exibição com ou sem formatação
- Preferência persistente de tema claro ou escuro
- Geração de CPF e CNPJ válidos, com dígitos verificadores
- Cartões de teste Visa, Mastercard, American Express e Discover, validados por Luhn

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
