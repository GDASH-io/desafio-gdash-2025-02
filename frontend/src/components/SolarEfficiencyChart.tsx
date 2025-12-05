"use client"

import { Progress } from '@/components/ui/progress';

interface SolarEfficiencyChartProps {
  efficiency: number // 0–100
}

export function SolarEfficiencyChart({ efficiency }: SolarEfficiencyChartProps) {

  return (
    <Progress value={efficiency} />
  )
}
