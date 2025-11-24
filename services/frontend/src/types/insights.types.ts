export type InsightContext = 'general' | 'alerts' | 'recommendations' | 'trends';

export interface GenerateInsightRequest {
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  context?: InsightContext;
  customPrompt?: string;
}

export interface GenerateInsightResponse {
  insights: string;
  context: InsightContext;
  dataCount: number;
  dateRange: {
    start?: string;
    end?: string;
  };
  location: {
    city?: string;
    state?: string;
  };
  generatedAt: string;
}
