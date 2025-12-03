import { UserRepository } from '@/domain/aplication/repository/user-repository';
import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './prisma/repository/prisma-user-repository';
import { PrismaService } from './prisma/prisma.service';
import { ClimateRepository } from '@/domain/aplication/repository/climate-repository';
import { PrismaClimateRepository } from './prisma/repository/prisma-climate-repository';

@Module({
  providers: [
    PrismaService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: ClimateRepository, useClass: PrismaClimateRepository },
  ],
  exports: [PrismaService, UserRepository, ClimateRepository],
})
export class DatabaseModule {}
