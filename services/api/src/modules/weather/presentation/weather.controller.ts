import { CreateWeatherLogDto, InsightsFiltersDto, ListWeatherLogDto } from "@/common/dto/weather-log.dto";
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Query,
    Res,
    UseGuards
} from "@nestjs/common";
import { CreateWeatherLogUseCase } from "../application/use-cases/create-weather-log.use-case";
import { ExportWeatherDataUseCase } from "../application/use-cases/export-weather-data.use-case";
import { Public } from "@/common/decorators/public.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guards";
import { Response } from "express";
import { 
    ApiBearerAuth, 
    ApiOperation, 
    ApiProduces, 
    ApiQuery, 
    ApiResponse, 
    ApiTags 
} from "@nestjs/swagger";
import { GenerateInsightsUseCase } from "../application/use-cases/generate-insights.use-case";
import { ListWeatherLogsUseCase } from "../application/use-cases/list-weather-logs.use-case";

@ApiTags('weather')
@Controller('api/v1/weather')
export class WeatherController {
    private readonly logger = new Logger(WeatherController.name);

    constructor(
        private readonly createWeatherLogUseCase: CreateWeatherLogUseCase,
        private readonly listWeatherLogUseCase: ListWeatherLogsUseCase,
        private readonly generateInsightsUseCase: GenerateInsightsUseCase,
        private readonly exportWeatherDataUseCase: ExportWeatherDataUseCase,
    ) { }

    @Public()
    @Get('health')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Health check do módulo weather' })
    @ApiResponse({ status: 200, description: 'Serviço funcionando' })
    healthCheck() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @Public()
    @Post('logs')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Criar log climático',
        description: 'Endpoint usado pelo Go Worker para salvar dados climáticos',
    })
    @ApiResponse({ status: 201, description: 'Log salvo com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    async createWeatherLog(@Body() createWeatherLogDto: CreateWeatherLogDto) {
        this.logger.log('='.repeat(60));
        this.logger.log('📦 Received weather data from Go Worker:');
        this.logger.log(`📍 Location: ${createWeatherLogDto.location.city}`);
        this.logger.log(
            `🌡️  Temperature: ${createWeatherLogDto.temperature}°C`,
        );
        this.logger.log(`💧 Humidity: ${createWeatherLogDto.humidity}%`);
        this.logger.log(`💨 Wind Speed: ${createWeatherLogDto.windSpeed} km/h`);
        this.logger.log(`⏰ Timestamp: ${createWeatherLogDto.timestamp}`);
        this.logger.log('='.repeat(60));
        this.logger.debug('Full payload:', JSON.stringify(createWeatherLogDto, null, 2));

        const weatherLog = await this.createWeatherLogUseCase.execute(createWeatherLogDto)

        // Retornar resposta de sucesso
        return {
            success: true,
            message: 'Weather log received successfully',
            data: {
                weatherLog
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('logs')
    @ApiOperation({ summary: 'Listar logs climáticos' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({ name: 'city', required: false, type: String })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['timestamp', 'temperature', 'humidity'] })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({ status: 200, description: 'Lista de logs paginada' })
    async listWeatherLogs(@Query() filters: ListWeatherLogDto) {
        return this.listWeatherLogUseCase.execute(filters);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('insights')
    @ApiOperation({
        summary: 'Gerar insights de IA',
        description: 'Analisa dados climáticos e gera insights usando IA (Gemini)',
    })
    @ApiQuery({ name: 'city', required: false, type: String })
    @ApiQuery({ name: 'period', required: false, enum: ['24h', '7d', '30d'] })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Insights gerados com sucesso' })
    @ApiResponse({ status: 404, description: 'Nenhum dado encontrado' })
    async getInsights(@Query() filters: InsightsFiltersDto) {
        return this.generateInsightsUseCase.execute(filters)
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('export/csv')
    @ApiOperation({ summary: 'Exportar dados em CSV' })
    @ApiProduces('text/csv')
    @ApiResponse({ status: 200, description: 'Arquivo CSV gerado' })
    async exportCSV(@Query() filters: ListWeatherLogDto, @Res() res: Response) {
        const csv = await this.exportWeatherDataUseCase.executeCSV(filters);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.csv');
        res.send(csv);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('export/xlsx')
    @ApiOperation({ summary: 'Exportar dados em Excel' })
    @ApiProduces('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    @ApiResponse({ status: 200, description: 'Arquivo Excel gerado' })
    async exportXLSX(@Query() filters: ListWeatherLogDto, @Res() res: Response) {
        const xlsx = await this.exportWeatherDataUseCase.executeXLSX(filters);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', 'attachment; filename=weather-data.xlsx'),
            res.send(xlsx);
    }

}