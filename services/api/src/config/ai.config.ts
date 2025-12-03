import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
  },
  enabled: process.env.AI_ENABLED !== 'false',
}));