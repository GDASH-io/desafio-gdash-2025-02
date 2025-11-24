import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getUrlParam, getUrlParams, updateUrl } from './useUrlParams'

describe('useUrlParams', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // @ts-expect-error - mocking window.location
    delete window.location
    window.location = {
      ...originalLocation,
      search: '',
      href: 'http://localhost:3000',
    } as Location
    window.history.replaceState = vi.fn()
  })

  afterEach(() => {
    window.location = originalLocation
  })

  describe('getUrlParams', () => {
    it('should return URLSearchParams', () => {
      window.location.search = '?page=1&limit=10'
      const params = getUrlParams()
      expect(params.get('page')).toBe('1')
      expect(params.get('limit')).toBe('10')
    })
  })

  describe('getUrlParam', () => {
    it('should return number for existing param', () => {
      window.location.search = '?page=5'
      expect(getUrlParam('page')).toBe(5)
    })

    it('should return null for missing param', () => {
      window.location.search = ''
      expect(getUrlParam('page')).toBeNull()
    })
  })

  describe('updateUrl', () => {
    it('should update URL params', () => {
      updateUrl({ page: 2 })
      expect(window.history.replaceState).toHaveBeenCalled()
    })

    it('should delete undefined params', () => {
      window.location.href = 'http://localhost:3000?page=1'
      updateUrl({ page: undefined })
      expect(window.history.replaceState).toHaveBeenCalled()
    })
  })
})
