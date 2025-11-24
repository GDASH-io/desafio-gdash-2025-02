// scripts/seed-mongodb.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../src/app.module'
import { WeatherService } from '../../src/weather/weather.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const weatherService = app.get(WeatherService)

  const cities = [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Porto Alegre',
    'Salvador',
  ]

  this.logger.log('🌱 Inserindo dados de teste...')

  for (let i = 0; i < 50; i++) {
    const randomCity = cities[Math.floor(Math.random() * cities.length)]
    const temperature = Math.random() * 40 - 5 // -5°C to 35°C
    const humidity = Math.random() * 100
    const windSpeed = Math.random() * 50

    const weatherData = {
      data: {
        temperature: parseFloat(temperature.toFixed(2)),
        humidity: parseFloat(humidity.toFixed(2)),
        windSpeed: parseFloat(windSpeed.toFixed(2)),
        description: 'Partly cloudy',
        pressure: 1013,
        visibility: 10,
      },
      location: {
        city: randomCity,
        country: 'Brazil',
        lat: -23.5 + Math.random() * 10,
        lon: -46.6 + Math.random() * 10,
      },
      source: 'test',
      timestamp: new Date().toISOString(),
      version: '1.0',
    }

    await weatherService.saveWeather(weatherData)
    console.log(`✅ Inserido registro ${i + 1} para ${randomCity}`)

    // Pequeno delay entre inserções
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('🎉 Dados de teste inseridos com sucesso!')

  // Testar as consultas
  console.log('=== Testando Dashboard ===')
  const metrics = await weatherService.getDashboardMetrics()
  console.log('Metrics:', metrics)

  console.log('=== Testando Analytics ===')
  const analytics = await weatherService.getAnalytics()
  console.log('Analytics:', analytics)

  await app.close()
}

bootstrap().catch(console.error)
