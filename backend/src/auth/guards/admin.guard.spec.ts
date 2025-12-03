import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access for admin user', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'admin', email: 'admin@example.com' },
          }),
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny access for non-admin user', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'user', email: 'user@example.com' },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access when user is not authenticated', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny access when user is undefined', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });
  });
});

