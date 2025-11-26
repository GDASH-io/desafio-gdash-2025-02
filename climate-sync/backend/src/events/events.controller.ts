import {
  Controller,
  Sse,
  UseGuards
} from '@nestjs/common';
import { interval, map } from 'rxjs';
import { SseAuthGuard } from '../auth/sse-auth.guard';

@Controller('events')
//@UseGuards(SseAuthGuard)
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
