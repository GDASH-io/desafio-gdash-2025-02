import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationDocument } from './schemas/location.schema';

@Injectable()
export class LocationsService {
    constructor(
        @InjectModel(Location.name)
        private readonly locationModel: Model<LocationDocument>,
    ) {}

    async create(dto: CreateLocationDto): Promise<Location> {
        const interval = dto.intervalMinutes !== undefined ? this.normalizeInterval(dto.intervalMinutes) : 60;
        const created = new this.locationModel({
            ...dto,
            active: dto.active ?? true,
            intervalMinutes: interval,
        });
        return created.save();
    }

    async findAll(): Promise<Location[]> {
        return this.locationModel.find().sort({ createdAt: -1 }).lean();
    }

    async findPaged(page = 1, limit = 10): Promise<{
        data: Location[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (Math.max(page, 1) - 1) * limit;
        const [data, total] = await Promise.all([
            this.locationModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.locationModel.countDocuments().exec(),
        ]);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return { data, total, page: Math.max(page, 1), limit, totalPages };
    }

    async findActive(): Promise<Location[]> {
        return this.locationModel.find({ active: true }).sort({ createdAt: -1 }).lean();
    }

    async update(id: string, dto: UpdateLocationDto): Promise<Location> {
        const data: Partial<Location> = { ...dto };
        if (dto.intervalMinutes !== undefined) {
            data.intervalMinutes = this.normalizeInterval(dto.intervalMinutes);
        }
        const updated = await this.locationModel.findByIdAndUpdate(id, data, { new: true }).lean();
        if (!updated) {
            throw new NotFoundException('Local nao encontrado');
        }
        return updated;
    }

    async remove(id: string): Promise<void> {
        await this.locationModel.findByIdAndDelete(id).exec();
    }

    private normalizeInterval(value: number): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 60;
        }
        return parsed;
    }
}
