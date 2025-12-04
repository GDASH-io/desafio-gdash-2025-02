import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";

@Injectable()
export class AiService {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateInsights(logs: any[]) {
    try {
      const prompt = `
Você é um modelo especializado em gerar análises climáticas com base em logs do clima.

REGRAS IMPORTANTES:
- Responda SOMENTE em JSON.
- A estrutura DEVE ser exatamente:

{
  "summary": "string",
  "alerts": ["string"],
  "insights": ["string"],
  "forecast": "string"
}

- "alerts" e "insights" DEVEM ser arrays de STRINGS.
- NUNCA coloque objetos dentro desses arrays.
- NÃO retorne números soltos.
- Não invente estrutura extra além do JSON acima.
- Cada item dos arrays deve ser uma frase clara.

Aqui estão os logs para análise:
${JSON.stringify(logs, null, 2)}
`;

      const response = await this.client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: "Gere os insights climáticos baseados nos logs acima.",
          },
        ],
        temperature: 0.4,
      });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("Modelo não retornou resposta.");

      let parsed: any;

      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.error("ERRO AO PARSEAR IA:", raw);
        throw new Error("A IA retornou um JSON inválido.");
      }

      parsed.summary = String(parsed.summary ?? "");

      parsed.alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
      parsed.alerts = parsed.alerts.map((item: any) =>
        typeof item === "string" ? item : JSON.stringify(item)
      );

      parsed.insights = Array.isArray(parsed.insights) ? parsed.insights : [];
      parsed.insights = parsed.insights.map((item: any) =>
        typeof item === "string" ? item : JSON.stringify(item)
      );

      parsed.forecast = String(parsed.forecast ?? "");

      return parsed;
    } catch (error) {
      console.error("ERRO EM AiService:", error);

      return {
        summary: "Não foi possível gerar insights no momento.",
        alerts: [],
        insights: [],
        forecast: "Tente novamente mais tarde.",
      };
    }
  }
}
