import { apiRequest } from './request'
import type { ApiResponse, Tag } from './types'

export async function getAllTags(): Promise<ApiResponse<Tag[]>> {
	return apiRequest<ApiResponse<Tag[]>>({
		url: '/tags',
		method: 'GET'
	})
}

export function resolveTagNames(input?: string, knownTags?: Tag[]): string[] {
  const raw = (input ?? '').trim()
  if (raw.length === 0) return []

  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const byId = new Map<number, string>()
  ;(knownTags ?? []).forEach((t) => byId.set(t.id, t.name))

  return list.map((token) => {
    const n = Number(token)
    if (Number.isFinite(n) && byId.has(n)) return byId.get(n) as string
    return token
  })
}

export function resolveTagIdsByNames(names: string[], knownTags?: Tag[]): number[] {
  const byName = new Map<string, number>()
  ;(knownTags ?? []).forEach((t) => byName.set(t.name, t.id))

  const ids: number[] = []
  for (const name of names) {
    const id = byName.get(name)
    if (typeof id === 'number') ids.push(id)
  }
  return Array.from(new Set(ids))
}
