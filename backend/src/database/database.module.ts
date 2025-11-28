import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URI!, {
      dbName: process.env.DATABASE_NAME,
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
