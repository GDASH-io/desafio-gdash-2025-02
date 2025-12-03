import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  availableCities: string[];
  placeholder?: string;
}

/**
 * Componente de autocomplete para seleção de cidade
 * Permite digitar e filtrar a lista de cidades disponíveis
 */
export function CityAutocomplete({
  value,
  onChange,
  availableCities,
  placeholder = 'Digite ou selecione uma cidade...',
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>(availableCities);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Atualizar inputValue quando value mudar externamente
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filtrar cidades baseado no input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredCities(availableCities);
    } else {
      const filtered = availableCities.filter((city) =>
        city.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [inputValue, availableCities]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleCitySelect = (city: string) => {
    setInputValue(city);
    onChange(city);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="mt-1"
      />
      {isOpen && filteredCities.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      )}
      {isOpen && filteredCities.length === 0 && inputValue.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500"
        >
          Nenhuma cidade encontrada
        </div>
      )}
    </div>
  );
}

