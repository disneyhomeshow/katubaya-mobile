import { expect, it } from 'vitest';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

const keys = (o: object, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

it('pt-BR and en define the same keys', () => {
  expect(keys(en).sort()).toEqual(keys(ptBR).sort());
});
