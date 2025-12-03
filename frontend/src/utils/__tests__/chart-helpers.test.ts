import { describe, it, expect } from 'vitest';
import { prepareChartData, defaultChartOptions } from '../chart-helpers';
import { WeatherLog } from '../../services/api';

describe('chart-helpers', () => {
  describe('prepareChartData', () => {
    it('should prepare chart data from array of logs', () => {
      const logs: WeatherLog[] = [
        { _id: '1', timestamp: '2025-01-24T10:00:00Z', temperature: 25, humidity: 70 },
        { _id: '2', timestamp: '2025-01-24T11:00:00Z', temperature: 26, humidity: 75 },
      ];

      const result = prepareChartData(logs);

      expect(result).not.toBeNull();
      expect(result?.labels).toHaveLength(2);
      expect(result?.datasets).toHaveLength(2);
      expect(result?.datasets[0].label).toBe('Temperatura (°C)');
      expect(result?.datasets[1].label).toBe('Umidade (%)');
      expect(result?.datasets[0].data).toEqual([26, 25]);
      expect(result?.datasets[1].data).toEqual([75, 70]);
    });

    it('should return null for empty array', () => {
      const result = prepareChartData([]);
      expect(result).toBeNull();
    });

    it('should handle paginated object with data array', () => {
      const paginated = {
        data: [
          { _id: '1', timestamp: '2025-01-24T10:00:00Z', temperature: 25, humidity: 70 },
        ],
        page: 1,
        limit: 10,
        total: 1,
      };

      const result = prepareChartData(paginated);

      expect(result).not.toBeNull();
      expect(result?.labels).toHaveLength(1);
    });

    it('should limit to 50 most recent records', () => {
      const logs: WeatherLog[] = Array.from({ length: 60 }, (_, i) => ({
        _id: String(i),
        timestamp: `2025-01-24T${String(i).padStart(2, '0')}:00:00Z`,
        temperature: 20 + i,
        humidity: 50 + i,
      }));

      const result = prepareChartData(logs);

      expect(result).not.toBeNull();
      expect(result?.labels).toHaveLength(50);
      expect(result?.datasets[0].data).toHaveLength(50);
    });

    it('should reverse order for chronological display', () => {
      const logs: WeatherLog[] = [
        { _id: '1', timestamp: '2025-01-24T10:00:00Z', temperature: 25, humidity: 70 },
        { _id: '2', timestamp: '2025-01-24T11:00:00Z', temperature: 26, humidity: 75 },
        { _id: '3', timestamp: '2025-01-24T12:00:00Z', temperature: 27, humidity: 80 },
      ];

      const result = prepareChartData(logs);

      expect(result).not.toBeNull();
      // Should be reversed (most recent first in original, oldest first in chart)
      expect(result?.datasets[0].data[0]).toBe(27);
      expect(result?.datasets[0].data[2]).toBe(25);
    });

    it('should return null for invalid input', () => {
      expect(prepareChartData(null)).toBeNull();
      expect(prepareChartData(undefined)).toBeNull();
      expect(prepareChartData('invalid')).toBeNull();
    });

    it('should handle logs with city field', () => {
      const logs: WeatherLog[] = [
        {
          _id: '1',
          timestamp: '2025-01-24T10:00:00Z',
          temperature: 25,
          humidity: 70,
          city: 'São Paulo',
        },
      ];

      const result = prepareChartData(logs);

      expect(result).not.toBeNull();
      expect(result?.datasets[0].data).toEqual([25]);
    });
  });

  describe('defaultChartOptions', () => {
    it('should have correct structure', () => {
      expect(defaultChartOptions).toHaveProperty('responsive', true);
      expect(defaultChartOptions).toHaveProperty('maintainAspectRatio', false);
      expect(defaultChartOptions).toHaveProperty('plugins');
      expect(defaultChartOptions).toHaveProperty('scales');
      expect(defaultChartOptions.scales).toHaveProperty('y');
      expect(defaultChartOptions.scales).toHaveProperty('y1');
    });

    it('should have correct axis configurations', () => {
      expect(defaultChartOptions.scales.y.title.text).toBe('Temperatura (°C)');
      expect(defaultChartOptions.scales.y1.title.text).toBe('Umidade (%)');
      expect(defaultChartOptions.scales.y.position).toBe('left');
      expect(defaultChartOptions.scales.y1.position).toBe('right');
    });
  });
});

