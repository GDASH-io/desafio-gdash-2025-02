export class CreateWeatherDto {
    latitude: number;
    longitude: number;
    temperatura: number;
    umidade: number;
    chuva: number;
    eh_dia: boolean;
    timestamp: string;
}
