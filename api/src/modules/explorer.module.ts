import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ExplorerController } from "../controllers/explorer.controller";
import { ExplorerService } from "../services/explorer.service";

@Module({
  imports: [HttpModule], // para fazer requisições HTTP
  controllers: [ExplorerController],
  providers: [ExplorerService],
})
export class ExplorerModule {}
