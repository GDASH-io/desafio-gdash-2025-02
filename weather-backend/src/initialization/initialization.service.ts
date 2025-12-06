import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InitializationService implements OnModuleInit {
  constructor(private readonly userService: UsersService) {}

  async onModuleInit() {
    await this.createDefaultUser();
  }

  private async createDefaultUser() {
    try {
      await this.userService.createDefaultUser();
    } catch (error) {
      console.log('Default user already exists.', error);
    }
  }
}
