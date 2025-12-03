import { Module } from '@nestjs/common';
import { CreateAccountController } from './controllers/user/create-account-controller';
import { DatabaseModule } from '../database/database.module';
import { CreateUserUseCase } from '@/domain/aplication/use-case/user/create-user-use-case';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthenticateController } from './controllers/user/authenticate-controller';
import { AuthenticateUserUseCase } from '@/domain/aplication/use-case/user/authenticate-use-case';
import { DeleteAccountController } from './controllers/user/delete-account-controller';
import { DeleteUserUseCase } from '@/domain/aplication/use-case/user/delete-user-use-case';
import { EditAccountController } from './controllers/user/edit-account-controller';
import { EditUserUseCase } from '@/domain/aplication/use-case/user/edit-user-use-case';
import { CreateClimateController } from './controllers/climate/create-climate-controller';
import { CreateClimateUseCase } from '@/domain/aplication/use-case/climate/create-climate-use-case';
import { DeleteClimateController } from './controllers/climate/delete-climate-controller';
import { DeleteClimateUseCase } from '@/domain/aplication/use-case/climate/delete-climate-use-case';
import { GetClimateController } from './controllers/climate/get-climate-controller';
import { GetClimateUseCase } from '@/domain/aplication/use-case/climate/get-climate-use-case';
import { ExportModule } from '../export/export.module';
import { ExportClimateController } from './controllers/climate/export-climate-controller';
import { ExportCSVUseCase } from '@/domain/aplication/use-case/climate/export-climate-csv-use-case';
import { ExportClimateXLSXController } from './controllers/climate/export-climate-xlsx-controller';
import { ExportXLSXUseCase } from '@/domain/aplication/use-case/climate/export-climate-xlsx-use-case';
import { GroqModule } from '../groqAI/groq.module';
import { ReportAIClimateController } from './controllers/climate/report-AI-controller';
import { ReportClimateUseCase } from '@/domain/aplication/use-case/climate/report-climate-use-case';
import { GetAccountController } from './controllers/user/get-account-controller';
import { GetUserUseCase } from '@/domain/aplication/use-case/user/get-user-use-case';

@Module({
  imports: [DatabaseModule, CryptographyModule, ExportModule, GroqModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    DeleteAccountController,
    EditAccountController,
    CreateClimateController,
    DeleteClimateController,
    GetClimateController,
    ExportClimateController,
    ExportClimateXLSXController,
    ReportAIClimateController,
    GetAccountController,
  ],
  providers: [
    CreateUserUseCase,
    AuthenticateUserUseCase,
    DeleteUserUseCase,
    EditUserUseCase,
    CreateClimateUseCase,
    DeleteClimateUseCase,
    GetClimateUseCase,
    ExportCSVUseCase,
    ExportXLSXUseCase,
    ReportClimateUseCase,
    GetUserUseCase,
  ],
})
export class HttpModule {}
