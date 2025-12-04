import { Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { UserDocument } from "../../infrastructure/schemas/user.schema";

export interface ListUsersFilters {
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface ListUsersResponse {
    data: UserDocument[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

@Injectable()
export class ListUsersUseCase {
    private readonly logger = new Logger(ListUsersUseCase.name);

    constructor(private readonly userRepository: UserRepository) { }

    async execute(filters: ListUsersFilters): Promise<ListUsersResponse> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        this.logger.debug(
            `Listing users - Page: ${page}, Limit: ${limit}, IsActive: ${filters.isActive}`,
        );

        if (page < 1) {
            throw new Error('Page must be > 0');
        }

        if (limit < 1 || limit > 100) {
            throw new Error('Limit must be 1 >= limit <= 100');
        }

        const [data, total] = await Promise.all([
            this.userRepository.findAll({
                isActive: filters.isActive,
                skip,
                limit,
            }),
            this.userRepository.count({ isActive: filters.isActive }),
        ]);

        const totalPages = Math.ceil(total / limit);

        this.logger.log(
            `Listed ${data.length} users (Total: ${total}, Page: ${page}/${totalPages})`,
        );

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
}