import { useState } from 'react';
import { BRAZILIAN_CAPITALS, BrazilianCapital } from '../../utils/brazilian-capitals';

interface CitySelectorProps {
  selectedCity: BrazilianCapital;
  onCityChange: (city: BrazilianCapital) => void;
}

/**
 * Componente para seleção de cidade
 * Exibe a cidade atual e permite alterar através de um modal/dropdown
 */
export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCitySelect = (city: BrazilianCapital) => {
    onCityChange(city);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Cidade atual:</span>
        <span className="text-sm font-semibold text-gray-800">{selectedCity}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Alterar Cidade
        </button>
      </div>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal/Dropdown */}
          <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-h-[400px] overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Selecione uma cidade</h3>
            <div className="grid grid-cols-1 gap-1">
              {BRAZILIAN_CAPITALS.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors ${
                    city === selectedCity
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

