/**
 * Lista de todas as capitais brasileiras
 */
export const BRAZILIAN_CAPITALS = [
  'Aracaju',
  'Belém',
  'Belo Horizonte',
  'Boa Vista',
  'Brasília',
  'Campo Grande',
  'Cuiabá',
  'Curitiba',
  'Florianópolis',
  'Fortaleza',
  'Goiânia',
  'João Pessoa',
  'Macapá',
  'Maceió',
  'Manaus',
  'Natal',
  'Palmas',
  'Porto Alegre',
  'Porto Velho',
  'Recife',
  'Rio Branco',
  'Rio de Janeiro',
  'Salvador',
  'São Luís',
  'São Paulo',
  'Teresina',
  'Vitória',
] as const;

export type BrazilianCapital = typeof BRAZILIAN_CAPITALS[number];

/**
 * Coordenadas das capitais brasileiras (latitude, longitude)
 * Para uso com APIs de clima
 */
export const CAPITAL_COORDINATES: Record<BrazilianCapital, { lat: number; lon: number }> = {
  'Aracaju': { lat: -10.9091, lon: -37.0677 },
  'Belém': { lat: -1.4558, lon: -48.5044 },
  'Belo Horizonte': { lat: -19.9167, lon: -43.9345 },
  'Boa Vista': { lat: 2.8197, lon: -60.6714 },
  'Brasília': { lat: -15.7942, lon: -47.8822 },
  'Campo Grande': { lat: -20.4428, lon: -54.6464 },
  'Cuiabá': { lat: -15.6014, lon: -56.0979 },
  'Curitiba': { lat: -25.4284, lon: -49.2733 },
  'Florianópolis': { lat: -27.5954, lon: -48.5480 },
  'Fortaleza': { lat: -3.7172, lon: -38.5433 },
  'Goiânia': { lat: -16.6864, lon: -49.2643 },
  'João Pessoa': { lat: -7.1150, lon: -34.8631 },
  'Macapá': { lat: 0.0349, lon: -51.0694 },
  'Maceió': { lat: -9.5713, lon: -36.7820 },
  'Manaus': { lat: -3.1190, lon: -60.0217 },
  'Natal': { lat: -5.7945, lon: -35.2110 },
  'Palmas': { lat: -10.1844, lon: -48.3336 },
  'Porto Alegre': { lat: -30.0346, lon: -51.2177 },
  'Porto Velho': { lat: -8.7619, lon: -63.9039 },
  'Recife': { lat: -8.0476, lon: -34.8770 },
  'Rio Branco': { lat: -9.9747, lon: -67.8100 },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'Salvador': { lat: -12.9714, lon: -38.5014 },
  'São Luís': { lat: -2.5387, lon: -44.2825 },
  'São Paulo': { lat: -23.5505, lon: -46.6333 },
  'Teresina': { lat: -5.0892, lon: -42.8019 },
  'Vitória': { lat: -20.3155, lon: -40.3128 },
};

/**
 * Capital padrão (Rio de Janeiro)
 */
export const DEFAULT_CAPITAL: BrazilianCapital = 'Rio de Janeiro';

