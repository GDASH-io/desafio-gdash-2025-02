import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import { Model } from 'mongoose';

describe('WeatherService', () => {
  let service: WeatherService;
  let weatherModel: jest.Mocked<Model<WeatherDocument>>;

  const mockWeatherDocument: WeatherDocument = {
    _id: '507f1f77bcf86cd799439011',
    temperature: 22.5,
    humidity: 50,
    wind_speed: 10.5,
    weather_description: 'sunny',
    rain_probability: 10,
    fetched_at: new Date('2025-01-01T00:00:00Z'),
    save: jest.fn(),
  } as unknown as WeatherDocument;

  const mockWeatherDocument2: WeatherDocument = {
    _id: '507f1f77bcf86cd799439012',
    temperature: 18.0,
    humidity: 65,
    wind_speed: 15.2,
    weather_description: 'cloudy',
    rain_probability: 30,
    fetched_at: new Date('2025-01-02T00:00:00Z'),
  } as unknown as WeatherDocument;

  beforeEach(async () => {
    const mockModel: any = jest.fn().mockImplementation((data) => {
      return {
        ...data,
        save: jest.fn().mockResolvedValue({ ...mockWeatherDocument, ...data }),
      };
    });

    mockModel.find = jest.fn();
    mockModel.findByIdAndDelete = jest.fn();
    mockModel.countDocuments = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(Weather.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    weatherModel = module.get(getModelToken(Weather.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWeather', () => {
    it('should create a weather record successfully', async () => {
      const weatherData = {
        temperature: 22.5,
        humidity: 50,
        wind_speed: 10.5,
        weather_description: 'sunny',
        rain_probability: 10,
        fetched_at: '2025-01-01T00:00:00Z',
      };

      const mockInstance = {
        ...mockWeatherDocument,
        save: jest.fn().mockResolvedValue(mockWeatherDocument),
      };

      (weatherModel as any).mockReturnValue(mockInstance);

      const result = await service.createWeather(weatherData);

      expect(weatherModel).toHaveBeenCalledWith({
        ...weatherData,
        fetched_at: new Date(weatherData.fetched_at),
      });
      expect(mockInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockWeatherDocument);
    });

    it('should handle Date object for fetched_at', async () => {
      const weatherData = {
        temperature: 22.5,
        humidity: 50,
        wind_speed: 10.5,
        weather_description: 'sunny',
        rain_probability: 10,
        fetched_at: new Date('2025-01-01T00:00:00Z'),
      };

      const mockInstance = {
        ...mockWeatherDocument,
        save: jest.fn().mockResolvedValue(mockWeatherDocument),
      };

      (weatherModel as any).mockReturnValue(mockInstance);

      const result = await service.createWeather(weatherData);

      expect(weatherModel).toHaveBeenCalledWith({
        ...weatherData,
        fetched_at: expect.any(Date),
      });
      expect(mockInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockWeatherDocument);
    });
  });

  describe('getWeatherPaginated', () => {
    it('should return paginated weather records without filters', async () => {
      const mockWeatherList = [mockWeatherDocument, mockWeatherDocument2];
      const mockQuery = {
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockWeatherList),
            }),
          }),
        }),
      };

      weatherModel.find = jest.fn().mockReturnValue(mockQuery as any);
      weatherModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await service.getWeatherPaginated(1, 10);

      expect(weatherModel.find).toHaveBeenCalledWith({});
      expect(result).toEqual({
        data: mockWeatherList,
        page: 1,
        itemsPerPage: 10,
        totalPages: 1,
        totalItems: 2,
      });
    });

    it('should return paginated weather records with date filters', async () => {
      const mockWeatherList = [mockWeatherDocument];
      const filters = {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-02T00:00:00Z',
      };

      const mockQuery = {
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockWeatherList),
            }),
          }),
        }),
      };

      weatherModel.find = jest.fn().mockReturnValue(mockQuery as any);
      weatherModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      } as any);

      const result = await service.getWeatherPaginated(1, 10, filters);

      expect(weatherModel.find).toHaveBeenCalledWith({
        fetched_at: {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        },
      });
      expect(result).toEqual({
        data: mockWeatherList,
        page: 1,
        itemsPerPage: 10,
        totalPages: 1,
        totalItems: 1,
      });
    });

    it('should handle pagination correctly', async () => {
      const mockWeatherList = [mockWeatherDocument2];
      const mockQuery = {
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockWeatherList),
            }),
          }),
        }),
      };

      weatherModel.find = jest.fn().mockReturnValue(mockQuery as any);
      weatherModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      } as any);

      const result = await service.getWeatherPaginated(2, 1);

      expect(result).toEqual({
        data: mockWeatherList,
        page: 2,
        itemsPerPage: 1,
        totalPages: 2,
        totalItems: 2,
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ fetched_at: -1 });
    });

    it('should use default values when page and itemsPerPage are not provided', async () => {
      const mockWeatherList = [mockWeatherDocument];
      const mockQuery = {
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockWeatherList),
            }),
          }),
        }),
      };

      weatherModel.find = jest.fn().mockReturnValue(mockQuery as any);
      weatherModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      } as any);

      const result = await service.getWeatherPaginated();

      expect(result.page).toBe(1);
      expect(result.itemsPerPage).toBe(10);
    });
  });

  describe('deleteWeather', () => {
    it('should delete a weather record successfully', async () => {
      const weatherId = '507f1f77bcf86cd799439011';

      weatherModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWeatherDocument),
      } as any);

      const result = await service.deleteWeather(weatherId);

      expect(weatherModel.findByIdAndDelete).toHaveBeenCalledWith(weatherId);
      expect(result).toEqual(mockWeatherDocument);
    });

    it('should return null when weather record is not found', async () => {
      const weatherId = '507f1f77bcf86cd799439099';

      weatherModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.deleteWeather(weatherId);

      expect(weatherModel.findByIdAndDelete).toHaveBeenCalledWith(weatherId);
      expect(result).toBeNull();
    });
  });
});
