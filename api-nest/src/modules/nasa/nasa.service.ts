import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface NasaImageryItem {
  date: string;
  lat: number;
  lon: number;
  imageUrl: string | null;
}

export interface NasaImageryResponse {
  page: number;
  limit: number;
  total: number;
  nextPage: number | null;
  prevPage: number | null;
  items: NasaImageryItem[];
}

@Injectable()
export class NasaService {
  private readonly apiKey = 'A6SYiCtg1ca7tOIEew92WwNe1FxeZgzRNAW6Yqyy';
  // NASA Worldview - API para imagens de satélite
  private readonly worldviewBaseUrl = 'https://wvs.earthdata.nasa.gov/api/v1/snapshot';
  // Coordenadas de Coronel Fabriciano, MG
  private readonly lat = -19.5194;
  private readonly lon = -42.6289;
  private readonly totalDays = 365; // Total de dias disponíveis (1 ano)

  constructor(private readonly httpService: HttpService) {}

  async getImagery(page: number = 1, limit: number = 1): Promise<NasaImageryResponse> {
    // Validar parâmetros
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, Math.min(limit, 365));

    // Calcular a data base (hoje) e subtrair os dias baseado na página
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const items: NasaImageryItem[] = [];
    
    // Para cada item na página, calcular a data
    for (let i = 0; i < validLimit; i++) {
      const dayOffset = (validPage - 1) * validLimit + i;
      
      // Se exceder o total de dias, parar
      if (dayOffset >= this.totalDays) {
        break;
      }

      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - dayOffset);
      
      const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      let imageUrl: string | null = null;
      
      try {
        // Usar NASA Worldview API para gerar snapshot de imagem de satélite
        // Formato: https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&...
        const bbox = `${this.lon - 0.1},${this.lat - 0.1},${this.lon + 0.1},${this.lat + 0.1}`;
        const worldviewUrl = `${this.worldviewBaseUrl}?REQUEST=GetSnapshot&TIME=${dateStr}&BBOX=${bbox}&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&WIDTH=512&HEIGHT=512&FORMAT=image/png`;
        
        // Simplificar: sempre retornar a URL do Worldview
        // O frontend tentará carregar a imagem e lidará com erros de carregamento
        // Isso evita múltiplas requisições HTTP desnecessárias
        imageUrl = worldviewUrl;
        
        // Opcional: fazer uma verificação rápida (mas não bloquear se falhar)
        try {
          await firstValueFrom(
            this.httpService.head(worldviewUrl, {
              timeout: 5000, // Timeout curto para não bloquear
              validateStatus: () => true, // Aceitar qualquer status
            })
          );
        } catch (verifyError: any) {
          // Ignorar erros de verificação - a URL ainda será retornada
          // O frontend tentará carregar e mostrará erro se necessário
        }
      } catch (error: any) {
        // Se houver erro crítico, logar mas ainda retornar uma URL
        const errorStatus = error?.response?.status;
        const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
        console.warn(`Aviso ao processar imagem da NASA para ${dateStr}:`, {
          status: errorStatus,
          message: errorMessage,
        });
        
        // Mesmo com erro, tentar retornar uma URL válida
        const bbox = `${this.lon - 0.1},${this.lat - 0.1},${this.lon + 0.1},${this.lat + 0.1}`;
        imageUrl = `${this.worldviewBaseUrl}?REQUEST=GetSnapshot&TIME=${dateStr}&BBOX=${bbox}&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&WIDTH=512&HEIGHT=512&FORMAT=image/png`;
      }

      items.push({
        date: dateStr,
        lat: this.lat,
        lon: this.lon,
        imageUrl,
      });
    }

    // Calcular paginação
    const total = this.totalDays;
    const totalPages = Math.ceil(total / validLimit);
    const nextPage = validPage < totalPages ? validPage + 1 : null;
    const prevPage = validPage > 1 ? validPage - 1 : null;

    return {
      page: validPage,
      limit: validLimit,
      total,
      nextPage,
      prevPage,
      items,
    };
  }
}

