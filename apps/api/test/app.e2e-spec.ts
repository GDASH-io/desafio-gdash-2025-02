import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AppModule } from '../src/app.module'
import { setupTestDatabase, teardownTestDatabase } from './setup'

describe('App (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    await setupTestDatabase()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await teardownTestDatabase()
  })

  // Auth Tests
  describe('Auth', () => {
    it('POST /api/auth/login - should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword' })

      expect(response.status).toBe(401)
    })

    it('POST /api/auth/login - should return 400 for missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com' })

      expect(response.status).toBe(400)
    })

    it('POST /api/auth/login - should login with seeded admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: '123456' })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe('admin@example.com')
    })

    it('POST /api/auth/refresh - should refresh token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: '123456' })

      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: loginResponse.body.refreshToken })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken')
    })

    it('GET /api/auth/me - should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/me')
      expect(response.status).toBe(401)
    })
  })

  // Users Tests - only unauthenticated scenarios
  describe('Users', () => {
    it('GET /api/users - should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/users')
      expect(response.status).toBe(401)
    })
  })

  // Weather Tests - public endpoint
  describe('Weather', () => {
    it('POST /api/weather/logs - should create a weather log (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weather/logs')
        .send({
          temperature: 25.5,
          humidity: 60,
          windSpeed: 10,
          condition: 'clear',
          rainProbability: 20,
          location: 'São Paulo, SP',
          latitude: -23.55,
          longitude: -46.63,
          collectedAt: new Date().toISOString(),
        })

      expect(response.status).toBe(201)
      expect(response.body.temperature).toBe(25.5)
    })

    it('POST /api/weather/logs - should return 400 for invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weather/logs')
        .send({ temperature: 25 }) // missing required fields

      expect(response.status).toBe(400)
    })

    it('GET /api/weather/logs - should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/weather/logs')
      expect(response.status).toBe(401)
    })
  })
})
