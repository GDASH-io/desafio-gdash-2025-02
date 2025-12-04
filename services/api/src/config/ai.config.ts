import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  },
  enabled: process.env.AI_ENABLED !== 'false',
}));