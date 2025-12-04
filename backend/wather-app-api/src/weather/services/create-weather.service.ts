import { Injectable } from "@nestjs/common";
import { CreateWeatherRepositorie } from "../repositories/create-weather.repositorie";
import { IWeatherEntity } from "../interfaces/IWeatherEntity";
import { GoogleGenAI } from "@google/genai";
import * as ExcelJS from "exceljs";

@Injectable()
export class CreateWeatherService{
    constructor(
        private readonly createWeatherRepository : CreateWeatherRepositorie,
    ){}
    
    private client = new GoogleGenAI({apiKey: process.env.GENAI_API_KEY})

    async execute(weather: IWeatherEntity): Promise<IWeatherEntity>{
        let newWeather = await this.createWeatherRepository.excute(weather);

        return newWeather;
    }

    async getLatest(): Promise<IWeatherEntity | null>{
        return this.createWeatherRepository.findLatest();
    }

    async getLatestTemperature(): Promise<number | null>{
        return this.createWeatherRepository.findLatestTemperature();
    }

    async getCityName(): Promise<string | null>{
        return this.createWeatherRepository.findCityName();
    }

    async getAllTemp(): Promise<string | null>{
        return this.createWeatherRepository.findAllTemp();
    }

    async generateInsights(){
        const weatherData = await this.createWeatherRepository.findLatest();
        const prompt = `
        Gere insights claros e simples sobre esses dados meteorológicos:
        ${JSON.stringify(weatherData)}

        Foque em:
        - Texto explicativo (“Alta chance de chuva nas próximas horas”)
        - Chance de chuva
        - Nuvens
        - Situação geral do clima
        - Pesquise sobre situação de tempo na região nos proximos 5 dias
        - Gráficos ou visualizações adicionais
        `;

        const completion = await this.client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return completion.text;
    }

    async exportXLSX(){
        const logs = await this.createWeatherRepository.findAll();

        const workBook = new ExcelJS.Workbook();
        const sheet = workBook.addWorksheet("Weather data");

        sheet.addRow([
            "Cidade",
            "Temperatura",
            "Chance de Chuva",
            "Umidade",
            "Pôr do sol",
            "Nuvens",
            "Temperaturas do Dia",
        ]);

        logs.forEach((item) => {
            const date = item.createdAt
            ? new Date(item.createdAt)
            : new Date();

            date.setHours(date.getHours() - 3)

            const formDate = 
                date.toLocaleDateString("pt-BR") +
                " " +
                date.toLocaleTimeString("pt-BR");

            const sunsetData = new Date(item.sun * 1000)
            sunsetData.setHours(date.getHours() - 3)

            const sunsetFormat = sunsetData.toLocaleTimeString("pt-BR")
            
            sheet.addRow([
                item.cityName,
                item.tempture,
                item.rain,
                item.humidity,
                sunsetFormat,
                item.cloud,
                formDate,
            ]);
        });

        const buffer = await workBook.xlsx.writeBuffer();
        return buffer;
    }

    async exportCSV(){
        const logs = await this.createWeatherRepository.findAll();

        let csv = "Cidade,Temperatura,Chance de Chuva,Umidade,Pôr do sol,Nuvens,Data da Medição\n";

        logs.forEach(item => {
            const date = item.createdAt
                ? new Date(item.createdAt)
                : new Date();

            date.setHours(date.getHours() - 3);

            const formDate =
                date.toLocaleDateString("pt-BR") +
                " " +
                date.toLocaleTimeString("pt-BR");

            const sunsetData = new Date(item.sun * 1000);
            sunsetData.setHours(date.getHours() - 3);

            const sunsetFormat = sunsetData.toLocaleTimeString("pt-BR");

            csv += `${item.cityName},${item.tempture},${item.rain},${item.humidity},${sunsetFormat},${item.cloud},${formDate}\n`;
        });

        return Buffer.from(csv, "utf-8");
    }
}