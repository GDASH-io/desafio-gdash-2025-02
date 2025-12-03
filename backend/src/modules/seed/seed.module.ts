import { Module, OnModuleInit } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SeedService],
})
export class SeedModule implements OnModuleInit {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seedDefaultUser();
  }
}

