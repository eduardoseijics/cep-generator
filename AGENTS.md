# Diretrizes de desenvolvimento

Estas regras se aplicam a contribuições humanas e automatizadas.

## Estrutura Vue

- Mantenha `App.vue` como composição da aplicação: layout raiz, navegação global e estado realmente compartilhado.
- Cada gerador deve ter seu próprio componente de painel em `src/components/` e concentrar ali seu estado, ações e persistência específica.
- Extraia elementos reutilizáveis (por exemplo, cabeçalho, cópia, modal ou seletor) antes de duplicar template, animação ou lógica.
- Prefira `script setup` com TypeScript e `defineProps`/`defineEmits` tipados.

## Organização e modularização

- Mantenha funções pequenas, coesas e com uma única responsabilidade.
- Como referência, funções com mais de 20–30 linhas devem ser avaliadas para extração, mas o tamanho sozinho não justifica uma refatoração.
- Evite funções com muitos níveis de indentação. Prefira retornos antecipados para reduzir aninhamentos.
- Separe regras de negócio, acesso a dados, persistência e apresentação.
- Componentes Vue devem coordenar a interface; regras reutilizáveis ou complexas devem ficar em services, composables ou funções utilitárias.
- Extraia componentes apenas quando houver uma responsabilidade visual clara, reutilização ou ganho real de legibilidade e testabilidade.
- Prefira composição a herança.
- Prefira funções puras para transformação e validação de dados.
- Evite classes quando não houver estado, identidade ou comportamento que justifique orientação a objetos.
- Aplique os princípios SOLID de forma pragmática, sem criar interfaces, camadas ou abstrações para implementações únicas sem necessidade concreta.
- Não aplique limites de linhas ou regras de Object Calisthenics de maneira rígida.
- Não mova código para outro arquivo apenas para reduzir o tamanho do arquivo original.

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
- Mantenha estilos específicos em blocos `<style scoped>` no próprio componente. Reserve `src/styles/` para fundação, temas e estilos realmente compartilhados.

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
