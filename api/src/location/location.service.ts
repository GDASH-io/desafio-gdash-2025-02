import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LocationData } from './interfaces/location-data.interface';

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;        // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // Para casos de CEP inválido
}

@Injectable()
export class LocationService {
  async getLocationByCep(cep: string): Promise<LocationData> {
    try {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '');
      
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await axios.get<CepResponse>(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        city: response.data.localidade,
        state: response.data.uf,
        country: 'Brasil',
        countryCode: 'BR',
      };
    } catch (error: any) {
      throw new Error(`Erro ao buscar CEP: ${error.message}`);
    }
  }

  async getLocationByIP(ip: string | undefined): Promise<LocationData> {
    try {
      // Se não for fornecido IP, usa o serviço para detectar automaticamente
      const url = ip 
        ? `http://ip-api.com/json/${ip}?lang=pt-BR` 
        : 'http://ip-api.com/json/?lang=pt-BR';
      
      const response = await axios.get(url);
      
      if (response.data.status !== 'success') {
        throw new Error('Não foi possível detectar a localização');
      }

      return {
        city: response.data.city,
        state: response.data.regionName,
        country: response.data.country,
        countryCode: response.data.countryCode,
      };
    } catch (error: any) {
      throw new Error(`Erro ao detectar localização: ${error.message}`);
    }
  }

  async getLocationByCity(cityName: string): Promise<LocationData> {
    try {
      console.log('🔍 LocationService.getLocationByCity chamado com:', cityName);
      const apiKey = process.env.OPENWEATHER_API_KEY;
      console.log('🗝️ API Key disponível:', apiKey ? 'SIM' : 'NÃO');
      
      if (!apiKey) {
        throw new Error('API Key do OpenWeatherMap não configurada');
      }
      
      const normalizedCity = cityName.toLowerCase().trim();
      console.log('🏙️ Cidade normalizada:', normalizedCity);
      
      // Mapa de cidades conhecidas para fallback
      const knownCities: { [key: string]: LocationData } = {
        'tokyo': { city: 'Tokyo', state: 'Tokyo', country: 'Japão', countryCode: 'JP' },
        'tóquio': { city: 'Tokyo', state: 'Tokyo', country: 'Japão', countryCode: 'JP' },
        'new york': { city: 'New York', state: 'NY', country: 'Estados Unidos', countryCode: 'US' },
        'nova york': { city: 'New York', state: 'NY', country: 'Estados Unidos', countryCode: 'US' },
        'london': { city: 'London', state: 'England', country: 'Reino Unido', countryCode: 'GB' },
        'londres': { city: 'London', state: 'England', country: 'Reino Unido', countryCode: 'GB' },
        'paris': { city: 'Paris', state: 'Île-de-France', country: 'França', countryCode: 'FR' },
        'madrid': { city: 'Madrid', state: 'Madrid', country: 'Espanha', countryCode: 'ES' },
        'berlin': { city: 'Berlin', state: 'Berlin', country: 'Alemanha', countryCode: 'DE' },
        'berlim': { city: 'Berlin', state: 'Berlin', country: 'Alemanha', countryCode: 'DE' },
        'rome': { city: 'Rome', state: 'Lazio', country: 'Itália', countryCode: 'IT' },
        'roma': { city: 'Rome', state: 'Lazio', country: 'Itália', countryCode: 'IT' },
      };
      
      // Verificar se é uma cidade conhecida primeiro
      if (knownCities[normalizedCity]) {
        console.log('✅ Cidade encontrada no mapeamento conhecido:', knownCities[normalizedCity]);
        return knownCities[normalizedCity];
      }
      
      // Primeiro: tentar busca global (sem filtro de país)
      let url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=10&appid=${apiKey}`;
      console.log('🌐 URL da busca global OpenWeatherMap:', url.replace(apiKey || '', '[API_KEY]'));
      
      let response = await axios.get(url);
      console.log('📡 Resposta da API (global):', response.data.length, 'resultados encontrados');

      if (response.data.length > 0) {
        // Ordenar resultados por prioridade (Brasil primeiro, depois outros países)
        const sortedResults = response.data.sort((a: any, b: any) => {
          // Brasil tem prioridade máxima
          if (a.country === 'BR' && b.country !== 'BR') return -1;
          if (b.country === 'BR' && a.country !== 'BR') return 1;
          
          // Países populares em segundo lugar
          const popularCountries = ['US', 'GB', 'FR', 'DE', 'IT', 'ES', 'AR', 'MX', 'JP', 'CA', 'AU'];
          const aPopular = popularCountries.includes(a.country);
          const bPopular = popularCountries.includes(b.country);
          
          if (aPopular && !bPopular) return -1;
          if (bPopular && !aPopular) return 1;
          
          return 0;
        });

        const result = sortedResults[0];
        console.log('✅ Melhor resultado selecionado:', result);

        // Mapear códigos de país para nomes em português
        const countryNames: { [key: string]: string } = {
          'BR': 'Brasil',
          'US': 'Estados Unidos',
          'GB': 'Reino Unido',
          'FR': 'França',
          'DE': 'Alemanha',
          'IT': 'Itália',
          'ES': 'Espanha',
          'PT': 'Portugal',
          'AR': 'Argentina',
          'CL': 'Chile',
          'CO': 'Colômbia',
          'MX': 'México',
          'CA': 'Canadá',
          'AU': 'Austrália',
          'JP': 'Japão',
          'CN': 'China',
          'IN': 'Índia',
          'RU': 'Rússia',
        };

        // Mapear estados brasileiros por código
        const brazilianStates: { [key: string]: string } = {
          'Acre': 'AC',
          'Alagoas': 'AL',
          'Amapá': 'AP',
          'Amazonas': 'AM',
          'Bahia': 'BA',
          'Ceará': 'CE',
          'Distrito Federal': 'DF',
          'Espírito Santo': 'ES',
          'Goiás': 'GO',
          'Maranhão': 'MA',
          'Mato Grosso': 'MT',
          'Mato Grosso do Sul': 'MS',
          'Minas Gerais': 'MG',
          'Pará': 'PA',
          'Paraíba': 'PB',
          'Paraná': 'PR',
          'Pernambuco': 'PE',
          'Piauí': 'PI',
          'Rio de Janeiro': 'RJ',
          'Rio Grande do Norte': 'RN',
          'Rio Grande do Sul': 'RS',
          'Rondônia': 'RO',
          'Roraima': 'RR',
          'Santa Catarina': 'SC',
          'São Paulo': 'SP',
          'Sergipe': 'SE',
          'Tocantins': 'TO',
        };

        let stateCode = result.state;
        
        // Se for Brasil e temos o nome completo do estado, converter para sigla
        if (result.country === 'BR' && result.state) {
          const foundStateCode = brazilianStates[result.state];
          if (foundStateCode) {
            stateCode = foundStateCode;
          }
        }

        const locationData = {
          city: result.name,
          state: stateCode || result.state || 'N/A',
          country: countryNames[result.country] || result.country,
          countryCode: result.country,
        };
        
        console.log('📍 Dados de localização preparados:', locationData);
        return locationData;
      }

      // Se não encontrou nada, tentar busca específica no Brasil
      console.log('🇧🇷 Tentando busca específica no Brasil...');
      url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)},BR&limit=5&appid=${apiKey}`;
      response = await axios.get(url);
      
      if (response.data.length === 0) {
        console.error('❌ Nenhum resultado encontrado para:', cityName);
        // Retornar dados padrão em vez de erro
        return {
          city: cityName,
          state: 'N/A',
          country: 'Não identificado',
          countryCode: 'N/A',
        };
      }

      const result = response.data[0];
      console.log('✅ Resultado Brasil encontrado:', result);
      
      const locationData = {
        city: result.name,
        state: result.state || 'N/A',
        country: 'Brasil',
        countryCode: 'BR',
      };
      console.log('📍 Dados de localização preparados:', locationData);
      return locationData;
    } catch (error: any) {
      console.error('❌ Erro em getLocationByCity:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        cityName
      });
      
      // Em caso de erro da API, retornar dados padrão em vez de lançar exceção
      if (error.response?.status === 401) {
        console.warn('⚠️ API Key inválida, retornando dados padrão');
      } else if (error.response?.status >= 500) {
        console.warn('⚠️ Erro do servidor da API, retornando dados padrão');
      }
      
      return {
        city: cityName,
        state: 'N/A',
        country: 'Não identificado',
        countryCode: 'N/A',
      };
    }
  }

  async getCitiesCoordinates(city: string, countryCode: string): Promise<{ lat: number; lon: number }> {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city},${countryCode}&limit=1&appid=${apiKey}`
      );

      if (response.data.length === 0) {
        throw new Error('Cidade não encontrada');
      }

      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    } catch (error: any) {
      throw new Error(`Erro ao buscar coordenadas: ${error.message}`);
    }
  }
}