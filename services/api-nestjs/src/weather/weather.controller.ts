import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CsvExportService } from '../exports/csv/csv-export.service';
import { XlsxExportService } from 'src/exports/xlsx/xlsx-export.service';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { StreamableFile } from '@nestjs/common';


@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly csvExportService: CsvExportService,
    private readonly xlsxExportService: XlsxExportService
  ) { }

  @Post('logs')
  @ApiOperation({ summary: 'Criar novo log de clima' })
  @ApiResponse({ status: 201, description: 'Log criado com sucesso' })
  async logWeatherData(@Body() logsWeather: logsWeatherDTO) {
    return await this.weatherService.logWeatherPost(logsWeather);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Buscar todos os logs de clima' })
  @ApiResponse({ status: 200, description: 'Lista de logs retornada' })
  async getAllLogs() {
    return await this.weatherService.logWeatherGet();
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Buscar log de clima por ID' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log encontrado' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async getLogById(@Param('id') id: string) {
    const log = await this.weatherService.logWeatherGetById(id);
    if (!log) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return log;
  }

  @Put('logs/:id')
  @ApiOperation({ summary: 'Atualizar log de clima' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async updateLog(
    @Param('id') id: string,
    @Body() updateData: Partial<logsWeatherDTO>,
  ) {
    const updatedLog = await this.weatherService.updateLogWeather(
      id,
      updateData,
    );
    if (!updatedLog) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return updatedLog;
  }

  @Delete('logs/:id')
  @ApiOperation({ summary: 'Deletar log de clima' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async deleteLog(@Param('id') id: string) {
    const deletedLog = await this.weatherService.deleteLogWeather(id);
    if (!deletedLog) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Log deletado com sucesso', data: deletedLog };
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Exportar logs de clima em CSV' })
  @ApiResponse({ status: 200, description: 'CSV gerado com sucesso' })
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="export.csv"')
  async exportLogsToCsv() {
    const headers_csv: (keyof logsWeatherDTO)[] = [
      "temperatura",
      "umidade",
      "vento",
      "condicao",
      "probabilidade_chuva",
      "data_coleta",
    ];
    const logs = await this.weatherService.logWeatherGet();
    const csv_generated = this.csvExportService.generateCsvStream(logs, headers_csv);
    return new StreamableFile(csv_generated);
  }


  @Get('export-xlsx')
  @ApiOperation({ summary: 'Exportar logs de clima em XLSX' })
  @ApiResponse({ status: 200, description: 'XLSX gerado com sucesso' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="export.xlsx"')
  async exportLogsToXlsx() {
    const headers_xlsx: (keyof logsWeatherDTO)[] = [
      "temperatura",
      "umidade",
      "vento",
      "condicao",
      "probabilidade_chuva",
      "data_coleta",
    ];
    const logs = await this.weatherService.logWeatherGet();
    const xlsx_generated = await this.xlsxExportService.generateXlsxBuffer(logs, headers_xlsx);
    return new StreamableFile(xlsx_generated);
  }

//  @Post('insights')
//  @ApiOperation({ summary: 'Gerar insights por meio de IA, a partir dos logs de clima' })
//  @ApiResponse({ status: 200, description: 'Insights gerados com sucesso' })
//  async generateWeatherInsights() {
//    return await this.weatherService.generateInsights(prompt.question);
//  }
}