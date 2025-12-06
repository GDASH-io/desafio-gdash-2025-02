import { left, right, Either } from './either';

describe('Either', () => {
  describe('left', () => {
    it('should create Left instance', () => {
      const error = new Error('Test error');
      const result = left(error);

      expect(result.isLeft()).toBe(true);
      expect(result.isRight()).toBe(false);
      expect(result.value).toBe(error);
    });

    it('should work with any type', () => {
      const result = left('string error');

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBe('string error');
    });
  });

  describe('right', () => {
    it('should create Right instance', () => {
      const value = { data: 'success' };
      const result = right(value);

      expect(result.isRight()).toBe(true);
      expect(result.isLeft()).toBe(false);
      expect(result.value).toEqual(value);
    });

    it('should work with primitives', () => {
      const result = right(42);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(42);
    });

    it('should work with null', () => {
      const result = right(null);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeNull();
    });
  });

  describe('Either type', () => {
    it('should be usable in type annotations', () => {
      const success: Either<Error, string> = right('success');
      const failure: Either<Error, string> = left(new Error('failure'));

      expect(success.isRight()).toBe(true);
      expect(failure.isLeft()).toBe(true);
    });

    it('should allow pattern matching', () => {
      const result: Either<Error, number> = right(42);

      if (result.isRight()) {
        expect(result.value).toBe(42);
      } else {
        fail('Should not reach here');
      }
    });

    it('should handle error cases', () => {
      const result: Either<Error, number> = left(new Error('Failed'));

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(Error);
        expect(result.value.message).toBe('Failed');
      } else {
        fail('Should not reach here');
      }
    });
  });
});
