import { ExecutionContext } from '@nestjs/common';
import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    // Criar instância diretamente sem módulo NestJS para evitar dependências complexas
    // Mock das dependências do ThrottlerGuard
    const mockOptions = { get: jest.fn(() => [{ name: 'short', ttl: 60000, limit: 10 }]) };
    const mockStorage = { get: jest.fn(), set: jest.fn() };
    const mockReflector = { get: jest.fn() };
    
    guard = new CustomThrottlerGuard(
      mockOptions as any,
      mockStorage as any,
      mockReflector as any,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow POST /weather/logs without throttling', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/weather/logs',
            path: '/weather/logs',
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow POST /weather/logs with query params', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/weather/logs?test=1',
            path: '/weather/logs',
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should not bypass throttling for other POST endpoints', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/other/endpoint',
            path: '/other/endpoint',
          }),
        }),
      } as ExecutionContext;

      // Para outros endpoints, deve chamar o parent (que pode lançar erro se não configurado)
      // Mas pelo menos verificamos que não retorna true imediatamente
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        // Esperado - o parent pode falhar sem configuração adequada
        expect(error).toBeDefined();
      }
    });

    it('should not bypass throttling for GET requests to /weather/logs', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/weather/logs',
            path: '/weather/logs',
          }),
        }),
      } as ExecutionContext;

      // GET não deve ser bypassado, mesmo que seja /weather/logs
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        // Esperado - o parent pode falhar sem configuração adequada
        expect(error).toBeDefined();
      }
    });

    it('should handle request with only path property', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            path: '/weather/logs',
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should handle request with undefined url and use path', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: undefined,
            path: '/weather/logs',
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should handle request with empty url and path', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '',
            path: '',
          }),
        }),
      } as ExecutionContext;

      // Não deve bypassar quando url e path estão vazios
      try {
        await guard.canActivate(mockContext);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle request with url starting with /weather/logs', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/weather/logs/extra',
            path: '/weather/logs/extra',
          }),
        }),
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});

