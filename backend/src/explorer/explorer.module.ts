import { Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
    controllers: [ExplorerController],
    providers: [ExplorerService],
    exports: []
})
export class ExplorerModule {}
