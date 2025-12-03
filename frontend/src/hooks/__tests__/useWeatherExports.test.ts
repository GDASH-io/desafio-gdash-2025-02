import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWeatherExports } from '../useWeatherExports';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  exportCsv: vi.fn(),
  exportXlsx: vi.fn(),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('../use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('useWeatherExports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL methods
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    
    // Create a simple mock anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    // Mock document methods
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockAnchor as any;
      }
      return originalCreateElement(tagName);
    });
    
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
  });

  describe('handleExportCsv', () => {
    it('should export CSV successfully', async () => {
      const mockBlob = new Blob(['csv content'], { type: 'text/csv' });
      vi.mocked(api.exportCsv).mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useWeatherExports());

      await act(async () => {
        await result.current.handleExportCsv();
      });

      await waitFor(() => {
        expect(result.current.exporting).toBeNull();
      });

      expect(api.exportCsv).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sucesso',
        description: 'Arquivo CSV exportado com sucesso!',
      });
    });

    it('should handle CSV export error', async () => {
      const error = new Error('Export failed');
      vi.mocked(api.exportCsv).mockRejectedValue(error);

      const { result } = renderHook(() => useWeatherExports());

      await act(async () => {
        await result.current.handleExportCsv();
      });

      await waitFor(() => {
        expect(result.current.exporting).toBeNull();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Export failed',
        variant: 'destructive',
      });
    });
  });

  describe('handleExportXlsx', () => {
    it('should export XLSX successfully', async () => {
      const mockBlob = new Blob(['xlsx content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(api.exportXlsx).mockResolvedValue(mockBlob);

      const { result } = renderHook(() => useWeatherExports());

      await act(async () => {
        await result.current.handleExportXlsx();
      });

      await waitFor(() => {
        expect(result.current.exporting).toBeNull();
      });

      expect(api.exportXlsx).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sucesso',
        description: 'Arquivo XLSX exportado com sucesso!',
      });
    });

    it('should handle XLSX export error', async () => {
      const error = new Error('Export failed');
      vi.mocked(api.exportXlsx).mockRejectedValue(error);

      const { result } = renderHook(() => useWeatherExports());

      await act(async () => {
        await result.current.handleExportXlsx();
      });

      await waitFor(() => {
        expect(result.current.exporting).toBeNull();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Export failed',
        variant: 'destructive',
      });
    });
  });
});
