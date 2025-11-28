import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { User, UsersSchema } from 'src/schema/user.schema';
import { UsersService } from './users.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UsersSchema
            },
        ]),
    ],
    providers: [UsersService],
    controllers: [UsersController],
})
export class UsersModule { }
