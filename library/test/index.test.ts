// 💡 https://jestjs.io/docs/api
import { describe, expect, it } from '@jest/globals';
import { sum } from '../source';

describe('sum', () => {
  it('adds two numbers together', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});
