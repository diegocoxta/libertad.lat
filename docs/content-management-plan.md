# Plano: gerenciar o conteúdo de países e quotes

## Contexto

Hoje o conteúdo está espalhado e difícil de manter:

- **Países:** 21 arquivos `content/countries/*.ts` (~7.600 linhas) em que cada texto é repetido nos 6 idiomas (es, pt, fr, gn, qu, ht). Nada valida o que falta ou está errado: tradução ausente, link quebrado, fonte duplicada, período mal formatado. Um campo esquecido só aparece como erro de tipo ou como texto vazio na página.
- **Quotes:** a estrutura está em `lib/quotes.ts` (id, autor, país, `hasSource`), mas os textos e as fontes ficam em 6 arquivos `lib/i18n/translations/*.json`, em chaves `quote.<id>.text` e `quote.<id>.source`. Para adicionar uma quote é preciso mexer em 7 arquivos.
- **Restrições:** o site é estático, sem API, cookies nem banco (`docs/hardening.md`), então CMS hospedado está descartado. Você edita `content/` à mão no IDE, e não posso regerar por cima sem comparar (memória: hand-edited-content-files). O texto em pt vem verbatim dos docs compartilhados, e gn, qu e ht são traduções a revisar.

**Objetivo:** uma fonte única, estruturada e validada para países e quotes, editável no IDE com segurança. Um comando mostra o que falta, e adicionar um país ou uma quote vira uma operação simples.

## Abordagem recomendada

JSON por entidade + schema Zod + CLI de conteúdo (`tsx`, já usado em `scripts/`). Sem backend e sem dependência pesada. O Zod 4.6.7 já está em `node_modules` (vem do eslint-config-next), mas vou adicioná-lo explicitamente às `dependencies`.

### 1. Schema (fonte única dos tipos)

`content/schema.ts` (novo), com Zod:

- `LocalizedSchema`: um objeto com as 6 chaves de `LOCALES` (`lib/i18n/locale.ts`), cada uma string não vazia.
- `EraSchema` (period, summary, happened, usActions[], impact?, sources[]), `CountryContentSchema` (Era + `latest?`), `GeneralSourcesSchema` e `QuoteSchema` (id, author, country, text, source?).
- Os tipos exportados (`CountryContentType`, `CountryEraType`, `GeneralSourcesType`, `LocalizedType`, `CountrySourceType`) passam a ser `z.infer<…>`. Mantenho o mesmo nome e re-exporto em `lib/country-content.ts`, para os componentes (`CountryHistory`, `CountryList`, etc.) não mudarem.

### 2. Dados em JSON

- `content/countries/<code>.json` (um por país) e `content/general-sources.json`.
- `content/quotes.json`: lista de `{ id, author, country, text: {6 idiomas}, source?: {6 idiomas} }`.
- `content/countries/index.ts` importa os JSONs e faz `CountryContentSchema.parse` ao carregar. Conteúdo inválido quebra o `next build` e aparece como erro claro no dev, em vez de aparecer como página quebrada em produção.
- `lib/quotes.ts` passa a ler `content/quotes.json`. O componente `components/quote.tsx` usa `quote.text[locale]` e `quote.source?.[locale]`, com o mesmo fallback para `es` de `getTranslations`. Removo as chaves `quote.*` dos 6 arquivos `lib/i18n/translations/*.json`.

### 3. Migração sem retipar nada

- Script descartável: importa cada `content/countries/*.ts` atual, grava o JSON e confere com `assert.deepStrictEqual` contra o objeto original. O mesmo vale para `general-sources` e para as quotes (juntando as chaves `quote.*` dos JSONs de tradução). O texto não é retipado nem reformatado, o que respeita a regra de conteúdo verbatim.
- Antes de começar: `git status` limpo em `content/` e `lib/i18n`. Peço a você para não editar esses arquivos durante a migração. Depois da verificação, apago os `.ts` antigos e o script descartável.

### 4. CLI de conteúdo: `scripts/content.tsx`

Scripts novos no `package.json`:

- `npm run content:check`: valida o schema e relata, por país e idioma: campos vazios, textos idênticos ao es em gn, qu e ht (provável "não traduzido"), URLs de fonte duplicadas, markdown de link malformado, período fora do padrão (`AAAA–AAAA`, `AAAA`, `AAAA–hoy`), quote sem fonte onde a fonte é esperada, e país em `COUNTRY_CODES` sem conteúdo. Sai com código ≠ 0 em erro de schema. Entra no `prebuild`, mas não no `predev`, para não bloquear o desenvolvimento.
- `npm run content:new-country -- XX`: cria `content/countries/xx.json` com o esqueleto vazio e lista o que falta fazer manualmente para um país novo (`lib/countries.ts`: `COUNTRY_CODES` e slug; `components/country-flag.tsx`; registro no `index.ts`).
- `npm run content:new-quote -- <id>`: acrescenta uma entrada vazia em `content/quotes.json`.

### 5. Documentação

`content/README.md` (curto): a estrutura, como editar, como rodar o `check`, e a nota de que gn, qu e ht são traduções de melhor esforço que precisam de revisão por falantes nativos.

## Fora do escopo (decisão sua depois)

**Interface web de edição.** O Keystatic seria a opção natural por cima desses JSONs, mas ele adiciona rotas `/keystatic` e uma API ao app. Isso entra em conflito com o site estático e com o CSP, então só faz sentido como ferramenta de dev, separada do build de produção. Proponho decidir depois que o JSON + schema estiver rodando. O schema Zod é o que descreveria os campos do formulário.

## Arquivos críticos

- Novos: `content/schema.ts`, `content/quotes.json`, `content/countries/*.json`, `content/general-sources.json`, `scripts/content.tsx`, `content/README.md`.
- Alterados: `content/countries/index.ts`, `lib/country-content.ts`, `lib/quotes.ts`, `components/quote.tsx`, `lib/i18n/translations/*.json` (remove `quote.*`), `package.json` (scripts e zod).
- Removidos no fim: `content/countries/*.ts` (exceto `index.ts`) e `content/general-sources.ts`.

## Verificação

1. Script de migração: `deepStrictEqual` passa para os 21 países, as fontes gerais e as 9 quotes nos 6 idiomas.
2. `npx tsc --noEmit` e `npm run lint` sem erros.
3. `npm run content:check` roda limpo ou com avisos esperados, e um JSON corrompido de propósito falha com mensagem útil.
4. `npm run build` passa (inclui `prebuild`). Comparo o HTML de algumas páginas (`/pt/brasil`, `/es/peru`, home com quote) antes e depois da migração: deve ser idêntico.
5. Visual: abro a home e uma página de país numa porta diferente da :3000 (o dev server da :3000 é seu), conferindo as quotes e o histórico.
6. `content:new-country` e `content:new-quote` testados num rascunho que descarto no fim.
