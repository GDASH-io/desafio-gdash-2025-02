import {
  IsStrongPassword,
  validatePasswordStrength,
} from './password-validator';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

class TestDto {
  @IsStrongPassword()
  password: string;
}

describe('Password Validator', () => {
  describe('IsStrongPassword decorator', () => {
    it('should validate strong password', async () => {
      const dto = plainToClass(TestDto, { password: 'StrongP@ss123' });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject password without uppercase', async () => {
      const dto = plainToClass(TestDto, { password: 'strongp@ss123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toBeDefined();
    });

    it('should reject password without lowercase', async () => {
      const dto = plainToClass(TestDto, { password: 'STRONGP@SS123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject password without number', async () => {
      const dto = plainToClass(TestDto, { password: 'StrongP@ssword' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject password without special character', async () => {
      const dto = plainToClass(TestDto, { password: 'StrongPass123' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject password shorter than 8 characters', async () => {
      const dto = plainToClass(TestDto, { password: 'Str@12' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string values', async () => {
      const dto = plainToClass(TestDto, { password: 12345678 as any });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return isValid true for strong password', () => {
      const result = validatePasswordStrength('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for password without uppercase', () => {
      const result = validatePasswordStrength('strongp@ss123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra maiúscula');
    });

    it('should return errors for password without lowercase', () => {
      const result = validatePasswordStrength('STRONGP@SS123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos uma letra minúscula');
    });

    it('should return errors for password without number', () => {
      const result = validatePasswordStrength('StrongP@ssword');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um número');
    });

    it('should return errors for password without special character', () => {
      const result = validatePasswordStrength('StrongPass123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve conter pelo menos um caractere especial');
    });

    it('should return errors for password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Str@12');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('A senha deve ter pelo menos 8 caracteres');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should accept passwords with various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      specialChars.forEach((char) => {
        const password = `StrongP${char}ss123`;
        const result = validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
      });
    });
  });
});

