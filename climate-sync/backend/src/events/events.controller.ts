import {
  Controller,
  Get,
  Sse,
  MessageEvent
} from '@nestjs/common';
import { interval, map } from 'rxjs';

@Controller('events')
export class EventsController {
  @Sse('stream')
  stream(): any {
    return interval(3000).pipe(
      map(() => ({
        data: { alive: true, timestamp: new Date().toISOString() }
      }))
    );
  }
}
