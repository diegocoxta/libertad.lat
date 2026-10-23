import type { LocalizedType } from '~/lib/country-content';

// A table cell is plain text, a list of entries or empty.
export type ArticleCellType = LocalizedType | LocalizedType[] | null;

export type ArticleBlockType =
  | { type: 'heading'; text: LocalizedType }
  | { type: 'paragraph'; text: LocalizedType }
  | { type: 'list'; ordered?: boolean; items: LocalizedType[] }
  | { type: 'table'; head: LocalizedType[]; rows: ArticleCellType[][] };

export type ArticleType = {
  title: LocalizedType;
  blocks: ArticleBlockType[];
};
