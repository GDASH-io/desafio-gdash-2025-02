import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Weather, WeatherDocument } from "../Schema/weathers.schema";
import { Model } from "mongoose";
import { IWeatherEntity } from "../interfaces/IWeatherEntity";

@Injectable()
export class CreateWeatherRepositorie{
    constructor(
        @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
    ){}

    async excute(weather: IWeatherEntity): Promise<IWeatherEntity> {
        const createdWeather = new this.weatherModel(weather);
        await createdWeather.save();
        return createdWeather.toObject();
    }

    async findLatest(): Promise<IWeatherEntity | null> {
        return await this.weatherModel.findOne().sort({ _id: -1 }).exec();
    }

    async findLatestTemperature(): Promise<number | null>{
        const temp = await this.weatherModel.findOne({}, {tempture: 1}).sort({ _id: -1 }).exec();
        return temp?.tempture??null;
    }

    async findCityName(): Promise<string | null>{
        const name = await this.weatherModel.findOne({}, {cityName: 1}).sort({ _id: -1 }).exec();
        return name?.cityName??null;
    }

    async findAllTemp(): Promise<string | null>{
        const temp = await this.weatherModel.findOne({}, {allTemp: 1}).sort({ _id: -1 }).exec();
        return temp?.allTemp??null;
    }

    async findAll(): Promise<IWeatherEntity[]>{
        return await this.weatherModel.find().sort({ _id: -1 }).lean().exec();
    }
}