import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationsService } from './locations.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateLocationDto) {
        return this.locationsService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Query() query: PaginationQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 5;
        const result = await this.locationsService.findPaged(page, limit);
        return {
            locations: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    @Get('active')
    findActive() {
        return this.locationsService.findActive();
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
        return this.locationsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.locationsService.remove(id);
    }
}
