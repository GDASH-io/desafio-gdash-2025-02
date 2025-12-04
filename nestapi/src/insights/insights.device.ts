import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class InsightsService {
  private readonly GROQ_API = process.env.GROQ_API_KEY;
  private readonly MODEL = 'llama-3.1-8b-instant';

  async generateInsight(prompt: string) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: this.MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.GROQ_API}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content =
        response.data?.choices?.[0]?.message?.content || 'No insight generated';

      return content;
    } catch (err) {
      console.error(err.response?.data || err.message);
      throw new HttpException(
        'Failed to generate insight',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
