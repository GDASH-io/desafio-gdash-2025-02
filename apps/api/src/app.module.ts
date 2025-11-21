import { Module, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from './auth/auth.module'
import { InsightsModule } from './insights/insights.module'
import { PokemonModule } from './pokemon/pokemon.module'
import { UsersModule } from './users/users.module'
import { UsersService } from './users/users.service'
import { WeatherModule } from './weather/weather.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/gdash-weather'),
    AuthModule,
    UsersModule,
    WeatherModule,
    InsightsModule,
    PokemonModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.seedAdminUser()
  }
}
