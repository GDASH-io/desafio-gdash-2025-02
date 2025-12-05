import { Module, Injectable, Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { Schema, Document, Model } from 'mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SetMetadata, CanActivate, ExecutionContext } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';
import { getLogger } from 'log4js';

const logger = getLogger();
logger.level = process.env.LOG_LEVEL || 'info';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.use(json({ limit: '50mb' }));

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
  logger.info(`API NestJS iniciada na porta ${port}`);
}

bootstrap();