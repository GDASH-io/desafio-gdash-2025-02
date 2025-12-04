import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Export = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [limit, setLimit] = useState(100);

  const handleExport = async (format) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = format === 'csv' ? 'export.csv' : 'export.xlsx';
      const url = `${API_URL}/api/weather/${endpoint}?limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `weather_data_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage({
        type: 'success',
        text: `Arquivo ${format.toUpperCase()} baixado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao exportar dados. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center space-x-3">
            <Download className="h-8 w-8 text-blue-600" />
            <span>Exportar Dados</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Baixe os dados climáticos coletados em diferentes formatos
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configurações de Exportação</CardTitle>
            <CardDescription>Escolha quantos registros deseja exportar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Número de registros:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>Últimos 50 registros</option>
                <option value={100}>Últimos 100 registros</option>
                <option value={500}>Últimos 500 registros</option>
                <option value={1000}>Últimos 1000 registros</option>
                <option value={5000}>Últimos 5000 registros</option>
                <option value={10000}>Todos os registros</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Arquivos maiores podem levar mais tempo para gerar
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Export */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-12 w-12 text-green-600" />
                <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
                  CSV
                </span>
              </div>
              <CardTitle className="mt-4">Exportar CSV</CardTitle>
              <CardDescription>
                Formato compatível com Excel, Google Sheets e outras ferramentas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Compatível com planilhas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Fácil de importar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Cabeçalhos em português</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Arquivo leve (texto)</span>
                </li>
              </ul>
              <Button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                {loading ? 'Gerando...' : 'Baixar CSV'}
              </Button>
            </CardContent>
          </Card>

          {/* XLSX Export */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                  XLSX
                </span>
              </div>
              <CardTitle className="mt-4">Exportar XLSX</CardTitle>
              <CardDescription>Formato Excel com formatação profissional e cores</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Formatação profissional</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Cores e bordas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Auto-filtro habilitado</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-blue-500">✓</span>
                  <span>Nativo do Excel</span>
                </li>
              </ul>
              <Button
                onClick={() => handleExport('xlsx')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {loading ? 'Gerando...' : 'Baixar XLSX'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Informações sobre os Arquivos</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                • Os arquivos contêm todos os dados coletados: temperatura, umidade, vento,
                precipitação e condição
              </li>
              <li>
                • As datas estão no formato ISO 8601 para facilitar a importação em outras
                ferramentas
              </li>
              <li>• Os dados são exportados em ordem cronológica (mais recentes primeiro)</li>
              <li>• Arquivos CSV usam vírgula como delimitador e ponto decimal</li>
              <li>• Arquivos XLSX incluem cabeçalho azul com bordas e auto-filtro ativado</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Export;
