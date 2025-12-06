import { UserMapper } from './user.mapper';
import { UserEntity } from './user.entity';

describe('UserMapper', () => {
  describe('toResponse', () => {
    it('should remove password from user entity', () => {
      const user = new UserEntity('test@example.com', 'hashed_password', '123');
      
      const response = UserMapper.toResponse(user);

      expect(response).toHaveProperty('email', 'test@example.com');
      expect(response).toHaveProperty('id', '123');
      expect(response).not.toHaveProperty('password');
    });

    it('should preserve all other fields', () => {
      const user = new UserEntity('test@example.com', 'hashed_password', '123');
      user.createdAt = new Date('2023-01-01');
      
      const response = UserMapper.toResponse(user);

      expect(response.createdAt).toEqual(new Date('2023-01-01'));
    });

    it('should handle user without password', () => {
      const user = new UserEntity('test@example.com', undefined, '123');
      
      const response = UserMapper.toResponse(user);

      expect(response).toHaveProperty('email');
      expect(response).not.toHaveProperty('password');
    });
  });
});
