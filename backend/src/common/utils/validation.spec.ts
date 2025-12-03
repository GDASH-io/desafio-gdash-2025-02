import {
  isValidNumber,
  isValidString,
  isValidEmail,
  sanitizeString,
} from './validation';

describe('Validation Utils', () => {
  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber(-123)).toBe(true);
      expect(isValidNumber(123.45)).toBe(true);
      expect(isValidNumber(-123.45)).toBe(true);
    });

    it('should return false for invalid numbers', () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
      expect(isValidNumber('123')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber({})).toBe(false);
    });
  });

  describe('isValidString', () => {
    it('should return true for non-empty strings', () => {
      expect(isValidString('hello')).toBe(true);
      expect(isValidString('  hello  ')).toBe(true);
      expect(isValidString('123')).toBe(true);
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(isValidString('')).toBe(false);
      expect(isValidString('   ')).toBe(false);
      expect(isValidString('\t\n')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidString(null)).toBe(false);
      expect(isValidString(undefined)).toBe(false);
      expect(isValidString(123)).toBe(false);
      expect(isValidString({})).toBe(false);
      expect(isValidString([])).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user_name@example-domain.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
      expect(isValidEmail('invalid @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('hello<script>test</script>world')).toBe('helloscripttest/scriptworld');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('JAVASCRIPT:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick="alert(1)"')).toBe('"alert(1)"');
      expect(sanitizeString('onerror="alert(1)"')).toBe('"alert(1)"');
      expect(sanitizeString('onload="alert(1)"')).toBe('"alert(1)"');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });

    it('should handle strings without dangerous content', () => {
      expect(sanitizeString('hello world')).toBe('hello world');
      expect(sanitizeString('test123')).toBe('test123');
    });

    it('should remove multiple dangerous patterns', () => {
      const input = '  <script>onclick="test"</script>javascript:alert(1)  ';
      const result = sanitizeString(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onclick=');
    });
  });
});

