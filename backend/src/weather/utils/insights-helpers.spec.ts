import {
  calculateStatistics,
  detectTemperatureTrend,
  calculateComfortScore,
  classifyDay,
  generateAlerts,
  WeatherStatistics,
} from './insights-helpers';
import { WeatherLog } from '../schemas/weather-log.schema';

describe('Insights Helpers', () => {
  describe('calculateStatistics', () => {
    it('should return zero statistics for empty array', () => {
      const result = calculateStatistics([]);
      expect(result).toEqual({
        averageTemperature: 0,
        averageHumidity: 0,
        maxTemperature: 0,
        minTemperature: 0,
        maxHumidity: 0,
        minHumidity: 0,
      });
    });

    it('should calculate statistics correctly', () => {
      const logs: WeatherLog[] = [
        { temperature: 20, humidity: 50, timestamp: '2025-01-01' } as WeatherLog,
        { temperature: 25, humidity: 60, timestamp: '2025-01-02' } as WeatherLog,
        { temperature: 30, humidity: 70, timestamp: '2025-01-03' } as WeatherLog,
      ];

      const result = calculateStatistics(logs);

      expect(result.averageTemperature).toBe(25);
      expect(result.averageHumidity).toBe(60);
      expect(result.maxTemperature).toBe(30);
      expect(result.minTemperature).toBe(20);
      expect(result.maxHumidity).toBe(70);
      expect(result.minHumidity).toBe(50);
    });
  });

  describe('detectTemperatureTrend', () => {
    it('should return "estável" for less than 20 temperatures', () => {
      const temperatures = [20, 21, 22, 23, 24];
      expect(detectTemperatureTrend(temperatures)).toBe('estável');
    });

    it('should return "subindo" when temperature is rising', () => {
      // Array ordenado por timestamp DESC (mais recentes primeiro)
      // Para detectar tendência de subida, os últimos 10 devem ser maiores que os anteriores 10
      const temperatures = Array.from({ length: 20 }, (_, i) => 30 - i * 0.5); // Descendo no array = subindo no tempo
      expect(detectTemperatureTrend(temperatures)).toBe('subindo');
    });

    it('should return "caindo" when temperature is falling', () => {
      // Array ordenado por timestamp DESC (mais recentes primeiro)
      // Para detectar tendência de queda, os últimos 10 devem ser menores que os anteriores 10
      const temperatures = Array.from({ length: 20 }, (_, i) => 20 + i * 0.5); // Subindo no array = caindo no tempo
      expect(detectTemperatureTrend(temperatures)).toBe('caindo');
    });

    it('should return "estável" when temperature is stable', () => {
      const temperatures = Array(20).fill(25);
      expect(detectTemperatureTrend(temperatures)).toBe('estável');
    });
  });

  describe('calculateComfortScore', () => {
    it('should return 100 for ideal conditions', () => {
      expect(calculateComfortScore(23, 55)).toBe(100);
    });

    it('should penalize low temperature', () => {
      const score = calculateComfortScore(15, 55);
      expect(score).toBeLessThan(100);
    });

    it('should penalize high temperature', () => {
      const score = calculateComfortScore(30, 55);
      expect(score).toBeLessThan(100);
    });

    it('should penalize low humidity', () => {
      const score = calculateComfortScore(23, 30);
      expect(score).toBeLessThan(100);
    });

    it('should penalize high humidity', () => {
      const score = calculateComfortScore(23, 80);
      expect(score).toBeLessThan(100);
    });

    it('should return minimum 0', () => {
      const score = calculateComfortScore(0, 0);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('should return maximum 100', () => {
      const score = calculateComfortScore(23, 55);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('classifyDay', () => {
    it('should return "frio" for low temperature', () => {
      expect(classifyDay(10, 50)).toBe('frio');
    });

    it('should return "quente" for high temperature', () => {
      expect(classifyDay(35, 50)).toBe('quente');
    });

    it('should return "úmido" for high humidity', () => {
      expect(classifyDay(25, 85)).toBe('úmido');
    });

    it('should return "agradável" for ideal conditions', () => {
      expect(classifyDay(23, 55)).toBe('agradável');
    });

    it('should return "agradável" for moderate conditions', () => {
      expect(classifyDay(18, 50)).toBe('agradável');
    });
  });

  describe('generateAlerts', () => {
    it('should return no alerts for normal conditions', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 23,
        averageHumidity: 55,
        maxTemperature: 25,
        minTemperature: 20,
        maxHumidity: 60,
        minHumidity: 50,
      };
      const alerts = generateAlerts(statistics, 'estável');
      expect(alerts).toEqual(['Nenhum alerta no momento']);
    });

    it('should alert for extreme heat', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 30,
        averageHumidity: 55,
        maxTemperature: 36,
        minTemperature: 25,
        maxHumidity: 60,
        minHumidity: 50,
      };
      const alerts = generateAlerts(statistics, 'estável');
      expect(alerts).toContain('Calor extremo detectado');
    });

    it('should alert for extreme cold', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 15,
        averageHumidity: 55,
        maxTemperature: 20,
        minTemperature: 8,
        maxHumidity: 60,
        minHumidity: 50,
      };
      const alerts = generateAlerts(statistics, 'estável');
      expect(alerts).toContain('Frio intenso detectado');
    });

    it('should alert for high humidity', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 23,
        averageHumidity: 90,
        maxTemperature: 25,
        minTemperature: 20,
        maxHumidity: 95,
        minHumidity: 85,
      };
      const alerts = generateAlerts(statistics, 'estável');
      expect(alerts).toContain('Alta umidade - chance de chuva');
    });

    it('should alert for rising temperature trend', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 27,
        averageHumidity: 55,
        maxTemperature: 30,
        minTemperature: 25,
        maxHumidity: 60,
        minHumidity: 50,
      };
      const alerts = generateAlerts(statistics, 'subindo');
      expect(alerts).toContain('Temperatura em tendência de alta');
    });

    it('should combine multiple alerts', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 30,
        averageHumidity: 90,
        maxTemperature: 36,
        minTemperature: 25,
        maxHumidity: 95,
        minHumidity: 85,
      };
      const alerts = generateAlerts(statistics, 'subindo');
      expect(alerts.length).toBeGreaterThan(1);
      expect(alerts).toContain('Calor extremo detectado');
      expect(alerts).toContain('Alta umidade - chance de chuva');
    });

    it('should not alert for falling temperature trend', () => {
      const statistics: WeatherStatistics = {
        averageTemperature: 15,
        averageHumidity: 55,
        maxTemperature: 20,
        minTemperature: 8,
        maxHumidity: 60,
        minHumidity: 50,
      };
      const alerts = generateAlerts(statistics, 'caindo');
      // Não há alerta específico para tendência de queda, apenas para subida
      // Mas pode haver alerta de frio se minTemperature < 10
      expect(alerts).toContain('Frio intenso detectado');
    });

    it('should handle detectTemperatureTrend with empty previous10 array', () => {
      // Teste para quando previous10.length === 0 (caso edge)
      // Mas na prática, se temperatures.length < 20, já retorna 'estável'
      const temperatures = Array(10).fill(25);
      const result = detectTemperatureTrend(temperatures);
      expect(result).toBe('estável');
    });

    it('should handle detectTemperatureTrend when avgLast10 equals avgPrevious10', () => {
      // Teste para quando as médias são iguais (deve retornar 'estável')
      const temperatures = Array(20).fill(25);
      const result = detectTemperatureTrend(temperatures);
      expect(result).toBe('estável');
    });
  });
});

