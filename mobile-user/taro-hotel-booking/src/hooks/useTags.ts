import { useEffect, useMemo, useState } from 'react'
import { getAllTags } from '../api/tags'
import type { Tag } from '../api/types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    let active = true
    void getAllTags()
      .then((resp) => {
        if (!active) return
        if (resp.code !== 200 || !Array.isArray(resp.data)) return
        setTags(resp.data)
      })
      .catch(() => {
        // ignore network errors; caller will fall back to default tags UI
      })
    return () => {
      active = false
    }
  }, [])

  const byId = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags])
  const byName = useMemo(() => new Map(tags.map((t) => [t.name, t])), [tags])

  return { tags, byId, byName }
}
