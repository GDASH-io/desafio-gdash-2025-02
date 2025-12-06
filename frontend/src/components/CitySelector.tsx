import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface CitySelectorProps {
  onCitySelect: (city: City) => void;
}

export const CitySelector = ({ onCitySelect }: CitySelectorProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const searchCity = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error searching city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (city: City) => {
    onCitySelect(city);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100">Change City</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Select City</DialogTitle>
          <DialogDescription className="text-slate-400">
            Search for a city to monitor weather conditions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCity()}
              className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
            />
            <Button onClick={searchCity} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? '...' : 'Search'}
            </Button>
          </div>
          <div className="space-y-2">
            {results.map((city, index) => (
              <Button
                key={`${city.name}-${index}`}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 hover:bg-slate-800 text-slate-100"
                onClick={() => handleSelect(city)}
              >
                <div>
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-slate-400">
                    {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                  </div>
                </div>
              </Button>
            ))}
            {results.length === 0 && !loading && query && (
              <div className="text-center text-slate-500 text-sm">No results found</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
