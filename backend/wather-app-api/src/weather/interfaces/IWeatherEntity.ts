export interface IWeatherEntity{
    
    cityName: string;
    tempture: number;
    rain: number;
    humidity: number;
    sun: number;
    allTemp: string;
    cloud: number;
    createdAt?: Date;
    updatedAt?: Date;

}