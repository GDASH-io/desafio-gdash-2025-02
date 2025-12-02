import { Module } from '@nestjs/common';
import { EventsController } from '../events/events.controller';

@Module({
  controllers: [EventsController],
})
export class EventsModule {}
