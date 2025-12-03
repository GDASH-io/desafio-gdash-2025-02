import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CityAutocomplete } from './CityAutocomplete';

interface WeatherFiltersProps {
  cityFilter: string;
  startDate: string;
  endDate: string;
  loading: boolean;
  availableCities: string[];
  onCityFilterChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Componente de filtros para logs climáticos
 */
export function WeatherFilters({
  cityFilter,
  startDate,
  endDate,
  loading,
  availableCities,
  onCityFilterChange,
  onStartDateChange,
  onEndDateChange,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters,
}: WeatherFiltersProps) {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtros</h3>
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="city-filter">Filtrar por Cidade</Label>
          <CityAutocomplete
            value={cityFilter}
            onChange={onCityFilterChange}
            availableCities={availableCities}
            placeholder="Digite ou selecione uma cidade..."
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="start-date">Data Inicial</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="end-date">Data Final</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onApplyFilters} disabled={loading} size="sm">
            Aplicar Filtros
          </Button>
          {hasActiveFilters && (
            <Button onClick={onClearFilters} variant="outline" disabled={loading} size="sm">
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

