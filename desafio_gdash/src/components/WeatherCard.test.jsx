import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from './WeatherCard';

describe('WeatherCard Component', () => {
  const mockWeatherData = {
    _id: '1',
    temperature: 25.5,
    humidity: 65,
    wind_speed: 15.3,
    precipitation: 0,
    weather_code: 0,
    createdAt: new Date('2024-01-15T10:00:00Z'),
  };

  it('should render weather data correctly', () => {
    render(<WeatherCard data={mockWeatherData} />);

    expect(screen.getByText(/25\.5/)).toBeInTheDocument(); // Temperature
    expect(screen.getByText(/65/)).toBeInTheDocument(); // Humidity
    expect(screen.getByText(/15\.3/)).toBeInTheDocument(); // Wind speed
  });

  it('should display temperature with degree symbol', () => {
    render(<WeatherCard data={mockWeatherData} />);

    const tempElement = screen.getByText(/25\.5°C/);
    expect(tempElement).toBeInTheDocument();
  });

  it('should display humidity with percentage', () => {
    render(<WeatherCard data={mockWeatherData} />);

    const humidityElement = screen.getByText(/65%/);
    expect(humidityElement).toBeInTheDocument();
  });

  it('should display wind speed in km/h', () => {
    render(<WeatherCard data={mockWeatherData} />);

    const windElement = screen.getByText(/15\.3 km\/h/);
    expect(windElement).toBeInTheDocument();
  });

  it('should render weather card with data', () => {
    render(<WeatherCard data={mockWeatherData} />);

    // Check if card renders
    expect(screen.getByText(/condições atuais/i)).toBeInTheDocument();
  });

  it('should display precipitation when present', () => {
    const dataWithRain = { ...mockWeatherData, precipitation: 5.2 };
    render(<WeatherCard data={dataWithRain} />);

    expect(screen.getByText(/5\.2 mm/)).toBeInTheDocument();
  });
});
