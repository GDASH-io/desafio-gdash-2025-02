import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { InitializationService } from './initialization/initialization.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "secret123",
      signOptions: {expiresIn: '6h'}
    }),
    MongooseModule.forRoot(process.env.MONGO_URL||"mongodb://localhost:27017/gdash"),
    WeatherModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [InitializationService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
    .exclude("user/login", "user/signup", "/health")
    .forRoutes("*path")
  }
}
