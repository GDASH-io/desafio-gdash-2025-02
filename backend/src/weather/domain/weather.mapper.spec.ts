import { WeatherMapper } from './weather.mapper';
import { WeatherEntity } from './weather.entity';

describe('WeatherMapper', () => {
  describe('toResponse', () => {
    it('should convert timestamp to Unix format', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const entity = new WeatherEntity('Test City', 25, 60, 10, 'Clear', date, '123');
      
      const response = WeatherMapper.toResponse(entity);

      expect(response.timestamp).toBe(Math.floor(date.getTime() / 1000));
    });

    it('should preserve all weather data', () => {
      const entity = new WeatherEntity('São Paulo', 25.5, 60, 10.2, 'Partly Cloudy', new Date(), '123');
      
      const response = WeatherMapper.toResponse(entity);

      expect(response.city).toBe('São Paulo');
      expect(response.temperature).toBe(25.5);
      expect(response.humidity).toBe(60);
      expect(response.windSpeed).toBe(10.2);
      expect(response.condition).toBe('Partly Cloudy');
      expect(response.id).toBe('123');
    });

    it('should handle entity without id', () => {
      const entity = new WeatherEntity('Test', 20, 50, 5, 'Clear', new Date());
      
      const response = WeatherMapper.toResponse(entity);

      expect(response).toHaveProperty('city');
      expect(response.id).toBeUndefined();
    });
  });

  describe('toResponseList', () => {
    it('should convert array of entities', () => {
      const entities = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', new Date(), '1'),
        new WeatherEntity('City2', 25, 60, 10, 'Cloudy', new Date(), '2'),
      ];
      
      const responses = WeatherMapper.toResponseList(entities);

      expect(responses).toHaveLength(2);
      expect(responses[0].city).toBe('City1');
      expect(responses[1].city).toBe('City2');
    });

    it('should handle empty array', () => {
      const responses = WeatherMapper.toResponseList([]);

      expect(responses).toEqual([]);
    });

    it('should convert timestamps for all entities', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');
      const entities = [
        new WeatherEntity('City1', 20, 50, 5, 'Clear', date1, '1'),
        new WeatherEntity('City2', 25, 60, 10, 'Cloudy', date2, '2'),
      ];
      
      const responses = WeatherMapper.toResponseList(entities);

      expect(responses[0].timestamp).toBe(Math.floor(date1.getTime() / 1000));
      expect(responses[1].timestamp).toBe(Math.floor(date2.getTime() / 1000));
    });
  });
});
