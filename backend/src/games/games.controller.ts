import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('games')
@Controller('games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar jogos com paginação e filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  @ApiQuery({ name: 'platform', required: false, type: String, description: 'Filtrar por plataforma: PS5, Xbox, Switch, PC' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de jogos retornada com sucesso' })
  async getGames(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('platform') platform?: string,
    @Query('search') search?: string,
  ) {
    // Mapear nome da plataforma para ID
    const platformIds: Record<string, number> = {
      'PS5': 187,
      'Xbox': 186,
      'Switch': 7,
      'PC': 4,
    };
    
    const platformId = platform ? platformIds[platform] : undefined;
    
    return this.gamesService.getGames(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      platformId,
      search,
    );
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Listar plataformas disponíveis para filtro' })
  @ApiResponse({ status: 200, description: 'Lista de plataformas retornada com sucesso' })
  async getPlatforms() {
    return this.gamesService.getAvailablePlatforms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um jogo' })
  @ApiResponse({ status: 200, description: 'Detalhes do jogo retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Jogo não encontrado' })
  async getGameById(@Param('id') id: string) {
    return this.gamesService.getGameById(Number(id));
  }
}

