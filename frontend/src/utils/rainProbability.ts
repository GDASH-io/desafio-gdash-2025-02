interface RainProbability {
  percentage: number;
  description: string;
}

export const getRainProbability = (weatherCode: number): RainProbability => {
  const rainMap: Record<number, RainProbability> = {
    0: { percentage: 0, description: "céu limpo" },
    1: { percentage: 0, description: "parcialmente nublado" },
    2: { percentage: 0, description: "nublado" },
    3: { percentage: 10, description: "nuvens quebradas/encoberto" },
    51: { percentage: 20, description: "chuvisco leve" },
    53: { percentage: 30, description: "chuvisco moderado" },
    55: { percentage: 40, description: "chuvisco intenso" },
    61: { percentage: 50, description: "chuva fraca" },
    63: { percentage: 70, description: "chuva moderada" },
    65: { percentage: 90, description: "chuva forte" },
    80: { percentage: 50, description: "pancadas fracas" },
    81: { percentage: 70, description: "pancadas moderadas" },
    82: { percentage: 90, description: "pancadas fortes" },
    95: { percentage: 80, description: "tempestade" },
    96: { percentage: 90, description: "tempestade com granizo" },
    99: { percentage: 100, description: "tempestade intensa com granizo" },
  };

  return rainMap[weatherCode];
};
