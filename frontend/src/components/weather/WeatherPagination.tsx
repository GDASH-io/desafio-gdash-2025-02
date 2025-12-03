import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PaginatedWeatherLogs } from '../../services/api';

interface WeatherPaginationProps {
  pagination: PaginatedWeatherLogs | null;
  limit: number;
  goToPageInput: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onGoToPageInputChange: (value: string) => void;
  onGoToPage: () => void;
}

/**
 * Componente de paginação para logs climáticos
 */
export function WeatherPagination({
  pagination,
  limit,
  goToPageInput,
  loading,
  onPageChange,
  onLimitChange,
  onGoToPageInputChange,
  onGoToPage,
}: WeatherPaginationProps) {
  if (!pagination) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} registros
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="limit-select-pagination" className="text-sm">
              Itens por página:
            </Label>
            <select
              id="limit-select-pagination"
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage || loading}
              size="sm"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || loading}
              size="sm"
            >
              Próxima
            </Button>
            <div className="flex items-center gap-2 ml-4">
              <Label htmlFor="go-to-page-dashboard" className="text-sm whitespace-nowrap">
                Ir para:
              </Label>
              <Input
                id="go-to-page-dashboard"
                type="number"
                min="1"
                max={pagination.totalPages}
                value={goToPageInput}
                onChange={(e) => onGoToPageInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onGoToPage();
                  }
                }}
                placeholder="Página"
                className="w-20 h-8 text-sm"
                disabled={loading}
              />
              <Button
                variant="outline"
                onClick={onGoToPage}
                size="sm"
                className="h-8"
                disabled={loading}
              >
                Ir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

