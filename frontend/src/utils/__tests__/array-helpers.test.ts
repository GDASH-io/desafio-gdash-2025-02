import { describe, it, expect } from 'vitest';
import { ensureArray, extractArrayFromPaginated } from '../array-helpers';

describe('array-helpers', () => {
  describe('ensureArray', () => {
    it('should return array when value is already an array', () => {
      const input = [1, 2, 3];
      const result = ensureArray<number>(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should extract array from paginated object', () => {
      const input = { data: [1, 2, 3], page: 1 };
      const result = ensureArray<number>(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should return empty array for invalid input', () => {
      expect(ensureArray<number>(null)).toEqual([]);
      expect(ensureArray<number>(undefined)).toEqual([]);
      expect(ensureArray<number>('not an array')).toEqual([]);
      expect(ensureArray<number>(123)).toEqual([]);
    });
  });

  describe('extractArrayFromPaginated', () => {
    it('should extract array and pagination from paginated object', () => {
      const input = { data: [1, 2, 3], page: 1, total: 3 };
      const result = extractArrayFromPaginated<number>(input);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.pagination).toEqual(input);
    });

    it('should handle direct array input', () => {
      const input = [1, 2, 3];
      const result = extractArrayFromPaginated<number>(input);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.pagination).toBeNull();
    });

    it('should return empty array for invalid input', () => {
      const result = extractArrayFromPaginated<number>(null);
      expect(result.data).toEqual([]);
      expect(result.pagination).toBeNull();
    });
  });
});

