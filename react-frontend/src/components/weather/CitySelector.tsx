import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface City {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface CitySelectorProps {
  selectedCity: string | null;
  onCityChange: (city: string) => void;
}

export default function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar todas as cidades ao montar
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<City[]>(`${API_BASE_URL}/api/weather/cities`);
        setCities(response.data);
        setFilteredCities(response.data);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    // Buscar cidades quando o usuário digita
    if (searchQuery.trim()) {
      const searchCities = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get<City[]>(
            `${API_BASE_URL}/api/weather/cities?search=${encodeURIComponent(searchQuery)}`
          );
          setFilteredCities(response.data);
        } catch (error) {
          console.error('Erro ao buscar cidades:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      const timeoutId = setTimeout(searchCities, 300); // Debounce de 300ms para evitar muitas requisições
      return () => clearTimeout(timeoutId);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  useEffect(() => {
    // Fechar dropdown ao clicar fora do componente
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (cityName: string) => {
    onCityChange(cityName);
    setSearchQuery(cityName);
    setIsOpen(false);
  };

  const selectedCityData = cities.find(c => c.name === selectedCity);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
        <Input
          type="text"
          placeholder="Buscar cidade..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4 h-11 bg-[#0D1117] border-[#1F2937] text-[#E5E7EB] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0D1117] border border-[#1F2937] rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[#9CA3AF] text-sm">Carregando...</div>
          ) : filteredCities.length > 0 ? (
            <div className="py-1">
              {filteredCities.map((city) => (
                <button
                  key={`${city.name}-${city.country}`}
                  onClick={() => handleCitySelect(city.name)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#161B22] transition-colors flex items-center gap-3 ${
                    selectedCity === city.name ? 'bg-[#161B22] border-l-2 border-[#3B82F6]' : ''
                  }`}
                >
                  <MapPin className="h-4 w-4 text-[#9CA3AF] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#E5E7EB] truncate">{city.name}</div>
                    <div className="text-xs text-[#9CA3AF] truncate">{city.country}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-[#9CA3AF] text-sm">
              Nenhuma cidade encontrada
            </div>
          )}
        </div>
      )}

      {selectedCityData && !isOpen && (
        <div className="mt-2 flex items-center gap-2 text-sm text-[#9CA3AF]">
          <MapPin className="h-4 w-4" />
          <span>
            {selectedCityData.name}, {selectedCityData.country}
          </span>
        </div>
      )}
    </div>
  );
}

