# Diretrizes de desenvolvimento

Estas regras se aplicam a contribuições humanas e automatizadas.

## Estrutura Vue

- Mantenha `App.vue` como composição da aplicação: layout raiz, navegação global e estado realmente compartilhado.
- Cada gerador deve ter seu próprio componente de painel em `src/components/` e concentrar ali seu estado, ações e persistência específica.
- Extraia elementos reutilizáveis (por exemplo, cabeçalho, cópia, modal ou seletor) antes de duplicar template, animação ou lógica.
- Prefira `script setup` com TypeScript e `defineProps`/`defineEmits` tipados.

## Estilo de código

- Use Prettier como fonte de verdade: não formate manualmente contra o resultado de `npm run format`.
- Use 2 espaços para indentação, aspas simples no TypeScript e ponto e vírgula ao fim de instruções.
- Organize o `script setup` nesta ordem: imports, tipos, props/emits, estado, `computed`, funções, watchers e ciclo de vida.
- Dê nomes descritivos: verbos para ações (`generate`, `saveCustom`, `toggleTheme`) e substantivos para estado (`selectedUf`, `customCeps`).
- Mantenha funções pequenas e com uma responsabilidade; extraia utilitários quando uma regra for reutilizada.
- Use `const` por padrão; use `let` apenas quando a referência for realmente reatribuída.
- Não use `any`. Prefira tipos explícitos, tipos inferidos de refs e contratos compartilhados em `src/types.ts`.
- Em templates, mantenha componentes irmãos em linhas consecutivas. Use múltiplas linhas apenas para componentes com várias props/eventos ou conteúdo interno relevante.
- Prefira `v-model` para inputs locais; para componentes filhos, use props imutáveis e eventos `update:*` ou eventos de intenção.
- Evite `v-html`; só use para SVGs estáticos e controlados pelo próprio código do projeto.

## CSS

- Reutilize classes e variáveis visuais existentes antes de criar novas variações.
- Preserve os dois temas ao alterar cores e inclua o seletor `[data-theme='dark']` quando necessário.
- Estados interativos devem prever `hover`, `focus-visible`, `active` e, quando aplicável, `.copied`.
- Não use estilos inline; mantenha o estilo nos arquivos de `src/styles/`.

## Estado e armazenamento

- Use `StorageService` para dados persistentes. Ao adicionar novos campos, atualize `StoredData` e `STORAGE_FIELDS`.
- Não permita que uma gravação parcial elimine os dados de outro painel; use o merge provido pelo serviço.
- Guarde valores brutos e derive apresentações formatadas por `computed` (CPF/CNPJ é o exemplo principal).

## Interface

- Preserve as animações e os estados de interação existentes: hover, foco, cópia e tema claro/escuro.
- Para ações de cópia, use `CopyButton` quando o padrão for aplicável; não recrie ícones ou temporizadores manualmente.
- Toda alteração visual deve ter contraste suficiente nos dois temas.

## Qualidade

- Formate antes de concluir: `npm run format`.
- Valide alterações com `npm test` e `npm run build`.
- Inclua ou atualize testes quando mudar regras de geração, formatação, persistência ou fluxo de interface.
