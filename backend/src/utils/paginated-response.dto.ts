export class PaginatedResponseDto<T> {
  data: T[];
  page: number;
  totalItems: number;
  totalPages: number;
  total: number;
}
