export class CreateWeatherDto {
    latitude: number;
    longitude: number;
    temperatura: number;
    umidade: number;
    chuva: number;
    eh_dia: boolean;
    timestamp: string;
    cidade: string;
    pais: string;
    temp_max: number;
    temp_min: number;
    velocidade_vento: number;
    condicao_ceu: number;
    probabilidade_chuva: number;
}
