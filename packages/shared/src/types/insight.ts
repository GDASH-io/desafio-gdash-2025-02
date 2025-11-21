import { InsightSeverityEnum, InsightTypeEnum } from '../enums/insight'

export interface InsightType {
  id: string
  type: InsightTypeEnum
  title: string
  description: string
  severity: InsightSeverityEnum
  data?: Record<string, unknown>
  generatedAt: string
  createdAt: string
}
