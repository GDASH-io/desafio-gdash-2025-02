export function getAverageValue(values:number[]) {
  return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
}