import { describe, it, expect } from 'vitest';
import { formatDate, formatDateShort, formatDateOnly } from '../date-formatters';

describe('date-formatters', () => {
  describe('formatDate', () => {
    it('should format ISO timestamp to Brazilian locale', () => {
      const timestamp = '2025-01-24T10:30:00Z';
      const result = formatDate(timestamp);
      
      // Should contain date and time in Brazilian format
      expect(result).toContain('24');
      expect(result).toContain('01');
      expect(result).toContain('2025');
    });

    it('should return "Invalid Date" for invalid date string', () => {
      const invalidTimestamp = 'invalid-date';
      const result = formatDate(invalidTimestamp);
      
      // new Date('invalid') doesn't throw, it returns Invalid Date
      expect(result).toBe('Invalid Date');
    });

    it('should return "Invalid Date" for empty string', () => {
      const result = formatDate('');
      // Empty string creates Invalid Date
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateShort', () => {
    it('should format timestamp to short time format (HH:MM)', () => {
      const timestamp = '2025-01-24T10:30:00Z';
      const result = formatDateShort(timestamp);
      
      // Should be in HH:MM format
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should return "Invalid Date" for invalid date string', () => {
      const invalidTimestamp = 'invalid-date';
      const result = formatDateShort(invalidTimestamp);
      
      // new Date('invalid') doesn't throw, it returns Invalid Date
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateOnly', () => {
    it('should format timestamp to date only (DD/MM/YYYY)', () => {
      const timestamp = '2025-01-24T10:30:00Z';
      const result = formatDateOnly(timestamp);
      
      // Should be in DD/MM/YYYY format
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toContain('24');
      expect(result).toContain('01');
      expect(result).toContain('2025');
    });

    it('should return "Invalid Date" for invalid date string', () => {
      const invalidTimestamp = 'invalid-date';
      const result = formatDateOnly(invalidTimestamp);
      
      // new Date('invalid') doesn't throw, it returns Invalid Date
      expect(result).toBe('Invalid Date');
    });
  });
});

