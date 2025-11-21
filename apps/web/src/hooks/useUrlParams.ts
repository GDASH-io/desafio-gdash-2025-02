export const getUrlParams = () => new URLSearchParams(window.location.search)

export const getUrlParam = (key: string) => {
  const val = getUrlParams().get(key)
  return val ? Number(val) : null
}

export const updateUrl = (params: Record<string, number | undefined>) => {
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    } else {
      url.searchParams.delete(key)
    }
  })
  window.history.replaceState({}, '', url.toString())
}
