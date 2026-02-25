export type QueryValue = string | number | boolean | null | undefined

export function safeDecodeURIComponent(input: string): string {
  let out = input
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(out)
      if (decoded === out) break
      out = decoded
    } catch {
      break
    }
  }
  return out
}

export function normalizeQueryParams<T extends Record<string, any>>(params: T): T {
  const out: Record<string, any> = { ...params }
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      out[key] = safeDecodeURIComponent(value)
    }
  }
  return out as T
}

export function stringifyQuery(params: Record<string, QueryValue>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
}
