import { formatToISO, isValidISODate, formatToBrazilian } from './date';

describe('Date Utils', () => {
  describe('formatToISO', () => {
    it('should format current date to ISO string', () => {
      const result = formatToISO();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should format a given date to ISO string', () => {
      const date = new Date('2025-01-24T10:00:00Z');
      const result = formatToISO(date);
      expect(result).toBe(date.toISOString());
    });

    it('should format date correctly with milliseconds', () => {
      const date = new Date('2025-01-24T10:00:00.123Z');
      const result = formatToISO(date);
      expect(result).toContain('2025-01-24T10:00:00.123Z');
    });
  });

  describe('isValidISODate', () => {
    it('should return true for valid ISO date string', () => {
      expect(isValidISODate('2025-01-24T10:00:00Z')).toBe(true);
      expect(isValidISODate('2025-01-24T10:00:00.123Z')).toBe(true);
      expect(isValidISODate('2025-01-24T10:00:00+00:00')).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(isValidISODate('invalid-date')).toBe(false);
      expect(isValidISODate('2025-01-24')).toBe(false);
      expect(isValidISODate('')).toBe(false);
    });

    it('should return false for date string without T separator', () => {
      expect(isValidISODate('2025-01-24 10:00:00')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidISODate(null as any)).toBe(false);
      expect(isValidISODate(undefined as any)).toBe(false);
      expect(isValidISODate(123 as any)).toBe(false);
    });
  });

  describe('formatToBrazilian', () => {
    it('should format ISO date to Brazilian format', () => {
      const result = formatToBrazilian('2025-01-24T10:00:00Z');
      expect(result).toContain('/');
      expect(result).toContain(',');
    });

    it('should return the original string if invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = formatToBrazilian(invalidDate);
      expect(result).toBe(invalidDate);
    });

    it('should handle dates with timezone', () => {
      const result = formatToBrazilian('2025-01-24T10:00:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different date formats', () => {
      const result1 = formatToBrazilian('2025-01-24T10:00:00+00:00');
      const result2 = formatToBrazilian('2025-01-24T10:00:00-03:00');
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });
});

