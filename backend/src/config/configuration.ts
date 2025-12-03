import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables, Environment } from './configuration.schema';

/**
 * Valida e retorna as variáveis de ambiente configuradas.
 * Falha na inicialização se variáveis críticas estiverem faltando.
 */
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');

    throw new Error(
      `❌ Configuração inválida. Variáveis de ambiente faltando ou inválidas:\n${missingVars}\n\n` +
        'Verifique o arquivo .env.example para ver as variáveis necessárias.'
    );
  }

  return validatedConfig;
}

/**
 * Retorna a configuração validada das variáveis de ambiente
 */
export function getConfig(): EnvironmentVariables {
  return validate({
    NODE_ENV: process.env.NODE_ENV || Environment.Development,
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    RABBITMQ_URL: process.env.RABBITMQ_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    OPENWEATHER_KEY: process.env.OPENWEATHER_KEY,
    RAWG_KEY: process.env.RAWG_KEY,
  });
}

