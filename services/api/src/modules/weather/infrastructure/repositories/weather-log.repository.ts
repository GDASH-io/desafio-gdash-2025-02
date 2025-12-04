import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { WeatherLog, WeatherLogDocument } from "../schemas/weather-log.schema";
import { Model } from "mongoose";
import { CreateWeatherLogDto, ListWeatherLogDto } from "@/common/dto/weather-log.dto";
import { filter } from "rxjs";

@Injectable()
export class WeatherLogRepository {
    constructor(
        @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>
    ) {}

    async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLogDocument> {
        const weatherLog = new this.weatherLogModel({
            ...createWeatherLogDto,
            timestamp: new Date(createWeatherLogDto.timestamp),
        });

        return weatherLog.save();
    }

    async findAll(filters: ListWeatherLogDto): Promise<{
        data: WeatherLogDocument[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 20, city, startDate, endDate, sortBy, sortOrder } = filters;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const [data, total] = await Promise.all([
            this.weatherLogModel
                .find(query)
                .sort({ [sortBy || 'timestamp']: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.weatherLogModel.countDocuments(query).exec(),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string): Promise<WeatherLog | null> {
        return this.weatherLogModel.findById(id).exec()
    }

    async findRecent(filters: {
        city?: string;
        hours?: number;
        limit?: number;
    }): Promise<WeatherLogDocument[]> {
        const query: any = {};

        if (filters.city) {
            query['location.city'] = filters.city;
        }

        if (filters.hours) {
            const since = new Date();
            since.setHours(since.getHours() - filters.hours);
            query.timestamp = { $gte: since };
        }

        return this.weatherLogModel
            .find(query)
            .sort({ timestamp: -1 })
            .limit(filters.limit || 100)
            .exec();
    }

    async getStatistics(filters: {
        city?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        avgTemperature: number;
        minTemperature: number;
        maxTemperature: number;
        avgHumidity: number;
        avgWindSpeed: number;
        totalRecords: number;
    }> {
        const matchStage: any = {};

        if (filters.city) {
            matchStage['location.city'] = filters.city
        }

        if (filters.startDate || filters.endDate) {
            matchStage.timestamp = {};
            if (filters.startDate) {
                matchStage.timestamp.$gte = filters.startDate;
            }
            if (filters.endDate) {
                matchStage.timestamp.$lte = filters.endDate;
            }
        }

        const result = await this.weatherLogModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    avgTemperature: { $avg: '$temperature' },
                    minTemperature: { $min: '$temperature' },
                    maxTemperature: { $max: '$temperature' },
                    avgHumidity: { $avg: '$humidity' },
                    avgWindSpeed: { $avg: '$windSpeed' },
                    totalRecords: { $sum: 1 },
                },
            },
        ]);

        if (result.length === 0) {
            return {
                avgTemperature: 0,
                minTemperature: 0,
                maxTemperature: 0,
                avgHumidity: 0,
                avgWindSpeed: 0,
                totalRecords: 0,
            };
        }
        
        return result[0]
    }

    async delete(id: string): Promise<WeatherLogDocument | null> {
        return this.weatherLogModel.findByIdAndDelete(id).exec();
    }

    async count(filters?: { city?: string }): Promise<number> {
        const query: any = {};

        if (filters?.city) {
            query['location.city'] = filters.city;
        }

        return this.weatherLogModel.countDocuments(query).exec();
    }
}