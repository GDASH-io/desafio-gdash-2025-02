import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { WeatherDocument } from './schemas/weather.schema';
import { PaginatedResponseDto } from '../utils/paginated-response.dto';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: jest.Mocked<WeatherService>;

  const mockWeatherDocument: WeatherDocument = {
    _id: '507f1f77bcf86cd799439011',
    temperature: 22.5,
    humidity: 50,
    wind_speed: 10.5,
    weather_description: 'sunny',
    rain_probability: 10,
    fetched_at: new Date('2025-01-01T00:00:00Z'),
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

  const mockCreateWeatherDto: CreateWeatherDto = {
    temperature: 22.5,
    humidity: 50,
    wind_speed: 10.5,
    weather_description: 'sunny',
    rain_probability: 10,
    fetched_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const mockWeatherService = {
      createWeather: jest.fn(),
      getWeather: jest.fn(),
      getWeatherPaginated: jest.fn(),
      deleteWeather: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: mockWeatherService,
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWeather', () => {
    it('should create a weather record successfully', async () => {
      weatherService.createWeather.mockResolvedValue(mockWeatherDocument);

      const result = await controller.createWeather(mockCreateWeatherDto);

      expect(weatherService.createWeather).toHaveBeenCalledWith(
        mockCreateWeatherDto,
      );
      expect(result).toEqual(mockWeatherDocument);
    });

    it('should throw BadRequestException when validation fails', async () => {
      const invalidWeatherDto = {
        temperature: 150, // invalid - should be between -100 and 100
        humidity: 50,
        wind_speed: 10.5,
        weather_description: 'sunny',
        rain_probability: 10,
        fetched_at: '2025-01-01T00:00:00Z',
      };

      await expect(() =>
        controller.createWeather(invalidWeatherDto as CreateWeatherDto),
      ).rejects.toThrow(BadRequestException);

      expect(weatherService.createWeather).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when temperature is out of range', async () => {
      const invalidWeatherDto = {
        temperature: -150, // invalid - below -100
        humidity: 50,
        wind_speed: 10.5,
        weather_description: 'sunny',
        rain_probability: 10,
        fetched_at: '2025-01-01T00:00:00Z',
      };

      await expect(() =>
        controller.createWeather(invalidWeatherDto as CreateWeatherDto),
      ).rejects.toThrow(BadRequestException);

      expect(weatherService.createWeather).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when humidity is out of range', async () => {
      const invalidWeatherDto = {
        temperature: 22.5,
        humidity: 150, // invalid - above 100
        wind_speed: 10.5,
        weather_description: 'sunny',
        rain_probability: 10,
        fetched_at: '2025-01-01T00:00:00Z',
      };

      await expect(() =>
        controller.createWeather(invalidWeatherDto as CreateWeatherDto),
      ).rejects.toThrow(BadRequestException);

      expect(weatherService.createWeather).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const invalidWeatherDto = {
        temperature: 22.5,
        // missing other required fields
      } as CreateWeatherDto;

      await expect(() =>
        controller.createWeather(invalidWeatherDto),
      ).rejects.toThrow(BadRequestException);

      expect(weatherService.createWeather).not.toHaveBeenCalled();
    });
  });

  describe('getWeather', () => {
    it('should return paginated weather records with default pagination', async () => {
      const mockPaginatedResponse: PaginatedResponseDto<WeatherDocument> = {
        data: [mockWeatherDocument, mockWeatherDocument2],
        page: 1,
        itemsPerPage: 10,
        totalPages: 1,
        totalItems: 2,
      };

      weatherService.getWeatherPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getWeather({}, {});

      expect(weatherService.getWeatherPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated weather records with custom pagination', async () => {
      const mockPaginatedResponse: PaginatedResponseDto<WeatherDocument> = {
        data: [mockWeatherDocument2],
        page: 2,
        itemsPerPage: 1,
        totalPages: 2,
        totalItems: 2,
      };

      weatherService.getWeatherPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getWeather(
        { page: 2, itemsPerPage: 1 },
        {},
      );

      expect(weatherService.getWeatherPaginated).toHaveBeenCalledWith(
        2,
        1,
        undefined,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated weather records with date filters', async () => {
      const mockPaginatedResponse: PaginatedResponseDto<WeatherDocument> = {
        data: [mockWeatherDocument],
        page: 1,
        itemsPerPage: 10,
        totalPages: 1,
        totalItems: 1,
      };

      weatherService.getWeatherPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getWeather(
        {},
        {
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-02T00:00:00Z',
        },
      );

      expect(weatherService.getWeatherPaginated).toHaveBeenCalledWith(1, 10, {
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-02T00:00:00Z',
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      await expect(() =>
        controller.getWeather({ page: 0 }, {}),
      ).rejects.toThrow(BadRequestException);
      await expect(() =>
        controller.getWeather({ page: 0 }, {}),
      ).rejects.toThrow('Page must be greater than 0');

      expect(weatherService.getWeatherPaginated).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when itemsPerPage is less than 1', async () => {
      await expect(() =>
        controller.getWeather({ itemsPerPage: 0 }, {}),
      ).rejects.toThrow(BadRequestException);
      await expect(() =>
        controller.getWeather({ itemsPerPage: 0 }, {}),
      ).rejects.toThrow('ItemsPerPage must be greater than 0');

      expect(weatherService.getWeatherPaginated).not.toHaveBeenCalled();
    });

    it('should handle empty filters correctly', async () => {
      const mockPaginatedResponse: PaginatedResponseDto<WeatherDocument> = {
        data: [],
        page: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
      };

      weatherService.getWeatherPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.getWeather({}, {});

      expect(weatherService.getWeatherPaginated).toHaveBeenCalledWith(
        1,
        10,
        undefined,
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('deleteWeather', () => {
    it('should delete a weather record successfully', async () => {
      const weatherId = '507f1f77bcf86cd799439011';
      weatherService.deleteWeather.mockResolvedValue(mockWeatherDocument);

      const result = await controller.deleteWeather(weatherId);

      expect(weatherService.deleteWeather).toHaveBeenCalledWith(weatherId);
      expect(result).toEqual({
        message: 'Weather record successfully deleted',
      });
    });

    it('should throw NotFoundException when weather record is not found', async () => {
      const weatherId = '507f1f77bcf86cd799439099';
      weatherService.deleteWeather.mockResolvedValue(null);

      await expect(() => controller.deleteWeather(weatherId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(() => controller.deleteWeather(weatherId)).rejects.toThrow(
        'Weather record not found',
      );

      expect(weatherService.deleteWeather).toHaveBeenCalledWith(weatherId);
    });
  });
});
