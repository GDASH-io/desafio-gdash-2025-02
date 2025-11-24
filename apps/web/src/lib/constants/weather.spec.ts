import { describe, expect, it } from 'vitest'

import { conditionMap } from './weather'

describe('conditionMap', () => {
  it('should have clear condition', () => {
    expect(conditionMap.clear).toEqual({
      label: 'Céu limpo',
      color: 'bg-yellow-100 text-yellow-800',
    })
  })

  it('should have rain conditions', () => {
    expect(conditionMap.light_rain.label).toBe('Chuva leve')
    expect(conditionMap.moderate_rain.label).toBe('Chuva moderada')
    expect(conditionMap.heavy_rain.label).toBe('Chuva forte')
  })

  it('should have snow conditions', () => {
    expect(conditionMap.light_snow.label).toBe('Neve leve')
    expect(conditionMap.moderate_snow.label).toBe('Neve moderada')
    expect(conditionMap.heavy_snow.label).toBe('Neve forte')
  })

  it('should have thunderstorm conditions', () => {
    expect(conditionMap.thunderstorm.label).toBe('Tempestade')
    expect(conditionMap.thunderstorm_hail.label).toBe('Tempestade com granizo')
  })

  it('should have fog condition', () => {
    expect(conditionMap.fog.label).toBe('Névoa')
  })

  it('should have all weather conditions defined', () => {
    expect(Object.keys(conditionMap).length).toBeGreaterThanOrEqual(19)
  })

  it('each condition should have label and color', () => {
    Object.values(conditionMap).forEach((condition) => {
      expect(condition).toHaveProperty('label')
      expect(condition).toHaveProperty('color')
      expect(typeof condition.label).toBe('string')
      expect(typeof condition.color).toBe('string')
    })
  })
})
