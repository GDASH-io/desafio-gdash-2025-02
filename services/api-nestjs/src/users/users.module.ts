import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersSeedService } from './users-seed.service';
import { User, UsersSchema } from '../schema/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UsersSchema
            },
        ]),
    ],
    providers: [UsersService, UsersSeedService],
    controllers: [UsersController],
})
export class UsersModule { }
