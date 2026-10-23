import type { CountryCode } from '~/lib/countries';

export type QuoteType = {
  id: string;
  author: string;
  country: CountryCode;
  hasSource?: boolean;
};

export const QUOTES: QuoteType[] = [
  { id: 'allende', author: 'Salvador Allende', country: 'CL' },
  { id: 'garciaMarquez', author: 'Gabriel García Márquez', country: 'CO', hasSource: true },
  { id: 'sanMartin', author: 'José de San Martín', country: 'AR' },
  { id: 'bolivar', author: 'Simón Bolívar', country: 'VE' },
  { id: 'marti', author: 'José Martí', country: 'CU', hasSource: true },
  { id: 'galeano', author: 'Eduardo Galeano', country: 'UY', hasSource: true },
  { id: 'freire', author: 'Paulo Freire', country: 'BR' },
  { id: 'sandino', author: 'Augusto César Sandino', country: 'NI' },
  { id: 'ribeiro', author: 'Darcy Ribeiro', country: 'BR' },
];

export function getRandomQuote(): QuoteType {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
