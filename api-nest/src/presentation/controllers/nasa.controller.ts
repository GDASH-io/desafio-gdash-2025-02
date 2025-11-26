import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { NasaService, NasaImageryResponse } from '../../modules/nasa/nasa.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';

@Controller('nasa')
@UseGuards(JwtAuthGuard)
export class NasaController {
  constructor(private readonly nasaService: NasaService) {}

  @Get()
  async getImagery(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<NasaImageryResponse> {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 1;

      // Validar parâmetros
      if (isNaN(pageNum) || pageNum < 1) {
        throw new HttpException('Página inválida. Deve ser um número maior que 0.', HttpStatus.BAD_REQUEST);
      }
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 365) {
        throw new HttpException('Limit inválido. Deve ser um número entre 1 e 365.', HttpStatus.BAD_REQUEST);
      }

      return await this.nasaService.getImagery(pageNum, limitNum);
    } catch (error) {
      // Se já for HttpException, re-lançar
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Outros erros
      console.error('Erro no controller NASA:', error);
      throw new HttpException(
        'Erro ao buscar imagens da NASA. Tente novamente mais tarde.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

