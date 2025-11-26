import { Controller } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('IA')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
}
