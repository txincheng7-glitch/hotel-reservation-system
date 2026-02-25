import { View, Text, Image } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom, useRouter } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { queryHotels } from '../../api/hotel'
import type { HotelListItem } from '../../api/types'
import { resolveTagIdsByNames, resolveTagNames } from '../../api/tags'
import TopBar from '../../components/TopBar'
import { useTags } from '../../hooks/useTags'
import { useUserRoleGuard } from '../../hooks/useUserRoleGuard'
import { calcNights, formatMonthDayRange } from '../../utils/date'
import { normalizeQueryParams, stringifyQuery } from '../../utils/query'
import { routes } from '../../routes'
import './index.less'

type ListQuery = {
  city?: string
  keyword?: string
  checkIn?: string
  checkOut?: string
  tags?: string
  star?: string
  priceMin?: string
  priceMax?: string
}

type SortKey = 'rating_desc' | 'price_asc' | 'price_desc'

export default function ListPage() {
  const router = useRouter()
  const query = useMemo<ListQuery>(
    () => normalizeQueryParams((router.params ?? {}) as Record<string, any>),
    [router.params]
  )

  useUserRoleGuard(`/pages/list/index?${stringifyQuery(query as Record<string, any>)}`)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [hotels, setHotels] = useState<HotelListItem[]>([])
  const [loading, setLoading] = useState(false)
	const loadingRef = useRef(false)

	// 如果后端未按筛选条件过滤（如 city/tags），前端兜底过滤并禁用继续翻页，避免 total 不匹配导致无限加载
  const [localCityFilter, setLocalCityFilter] = useState(false)
  const localCityFilterRef = useRef(false)
  useEffect(() => {
    localCityFilterRef.current = localCityFilter
  }, [localCityFilter])

  const [sortKey, setSortKey] = useState<SortKey>('rating_desc')
  const [detailTag, setDetailTag] = useState('')

  const { tags } = useTags()

  const sanitizeHotels = useCallback((list: HotelListItem[]) => {
    const score = (h: HotelListItem) => {
      let s = 0
      if (String(h.image ?? '').trim().length > 0) s += 10
      if (typeof h.price === 'number' && h.price > 0) s += 8
      if (typeof h.rating === 'number' && h.rating > 0) s += 2
      if (typeof h.reviewCount === 'number' && h.reviewCount > 0) s += 1
      return s
    }

    const keyOf = (h: HotelListItem) => {
      const name = String(h.name ?? '').trim()
      const address = String(h.address ?? '').trim()
      if (name && address) return `${name}__${address}`
      // 回退：至少保证同 id 不重复
      return `id__${String(h.id)}`
    }

    const byKey = new Map<string, HotelListItem>()
    for (const h of list) {
      if (!h || typeof h.id !== 'number' || !Number.isFinite(h.id) || h.id <= 0) continue
      const isReallyEmpty =
        String(h.name ?? '').trim().length === 0 &&
        String(h.address ?? '').trim().length === 0 &&
        String(h.image ?? '').trim().length === 0 &&
        (!h.price || h.price <= 0)
      if (isReallyEmpty) continue

      const key = keyOf(h)
      const prev = byKey.get(key)
      if (!prev) {
        byKey.set(key, h)
        continue
      }

      const pick = score(h) > score(prev) ? h : prev
      const other = pick === h ? prev : h
      byKey.set(key, {
        ...pick,
        name: String(pick.name || other.name || ''),
        address: String(pick.address || other.address || ''),
        image: String(pick.image || other.image || ''),
        price: (pick.price && pick.price > 0 ? pick.price : other.price) ?? 0,
        rating: (pick.rating && pick.rating > 0 ? pick.rating : other.rating) ?? 0,
        reviewCount: (pick.reviewCount && pick.reviewCount > 0 ? pick.reviewCount : other.reviewCount) ?? 0,
        star: (pick.star && pick.star > 0 ? pick.star : other.star) ?? 0,
        tags: (pick.tags?.length ? pick.tags : other.tags) ?? []
      })
    }

    return Array.from(byKey.values())
  }, [])

  const applySort = useCallback(
    (list: HotelListItem[]) => {
      const copied = [...list]
      const ratingOf = (h: HotelListItem) => (typeof h.rating === 'number' && Number.isFinite(h.rating) ? h.rating : 0)
      const priceOf = (h: HotelListItem) => (typeof h.price === 'number' && Number.isFinite(h.price) ? h.price : 0)

      if (sortKey === 'rating_desc') {
        copied.sort((a, b) => ratingOf(b) - ratingOf(a) || priceOf(a) - priceOf(b))
        return copied
      }
      if (sortKey === 'price_asc') {
        const key = (h: HotelListItem) => {
          const p = priceOf(h)
          return p > 0 ? p : Number.POSITIVE_INFINITY
        }
        copied.sort((a, b) => key(a) - key(b) || ratingOf(b) - ratingOf(a))
        return copied
      }
      if (sortKey === 'price_desc') {
        const key = (h: HotelListItem) => {
          const p = priceOf(h)
          return p > 0 ? p : Number.NEGATIVE_INFINITY
        }
        copied.sort((a, b) => key(b) - key(a) || ratingOf(b) - ratingOf(a))
        return copied
      }
      return copied
    },
    [sortKey]
  )

  const detailTags = ['可订', '免费兑早餐', '免费停车场', '亲子友好', '五星/豪华']

  const nights = useMemo(() => calcNights(query.checkIn || '', query.checkOut || ''), [query.checkIn, query.checkOut])
  const dateText = useMemo(
    () => formatMonthDayRange(query.checkIn || '', query.checkOut || ''),
    [query.checkIn, query.checkOut]
  )

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      if (loadingRef.current) return
			if (localCityFilterRef.current && nextPage > 1) return
			loadingRef.current = true
      setLoading(true)
      try {
        const starParam = detailTag === '五星/豪华' ? '5' : query.star
        const tagsParam = (() => {
          if (detailTag === '' || detailTag === '可订') return query.tags
          if (detailTag === '五星/豪华') return query.tags
          const names: string[] = []
          if (detailTag === '亲子友好') names.push('亲子')
          if (detailTag === '免费停车场') names.push('免费停车场')
          if (detailTag === '免费兑早餐') names.push('含早餐')

          if (names.length > 0) {
            const ids = resolveTagIdsByNames(names, tags)
            if (ids.length > 0) return ids.join(',')
          }
          return query.tags
        })()

        const resp = await queryHotels({
          city: query.city,
          keyword: query.keyword,
          checkIn: query.checkIn,
          checkOut: query.checkOut,
          tags: tagsParam,
          star: starParam,
          priceMin: query.priceMin ? Number(query.priceMin) : undefined,
          priceMax: query.priceMax ? Number(query.priceMax) : undefined,
          sort: sortKey,
          page: nextPage,
          pageSize
        })

        if (resp.code !== 200) {
          Taro.showToast({ title: resp.message ?? '加载失败', icon: 'none' })
          return
        }

      const selectedCity = (query.city ?? '').trim()
      const selectedKeyword = (query.keyword ?? '').trim()
      const matchCity = (hotel: HotelListItem, city: string) => {
        if (!city) return true
        const name = String((hotel as any)?.name ?? '')
        const address = String((hotel as any)?.address ?? '')
        return name.includes(city) || address.includes(city)
      }
			const matchKeyword = (hotel: HotelListItem, keyword: string) => {
				if (!keyword) return true
				const kw = keyword.toLowerCase()
				const name = String((hotel as any)?.name ?? '').toLowerCase()
				const address = String((hotel as any)?.address ?? '').toLowerCase()
				return name.includes(kw) || address.includes(kw)
			}

      let items = sanitizeHotels(resp.data.items)
      let nextTotal = resp.data.total
      let nextPageToSet = resp.data.page
      let shouldAppend = append
			let disablePaging = false
      const selectedStars = String(starParam ?? '')
        .split(',')
        .map((s) => Number(String(s).trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      const priceMin = query.priceMin ? Number(query.priceMin) : undefined
      const priceMax = query.priceMax ? Number(query.priceMax) : undefined

      if (selectedCity.length > 0) {
        const filtered = sanitizeHotels(items.filter((h) => matchCity(h, selectedCity)))
        const serverSeemsUnfiltered = filtered.length !== items.length
        if (serverSeemsUnfiltered) {
        disablePaging = true
          items = filtered
          nextTotal = filtered.length
          nextPageToSet = 1
          shouldAppend = false
        }
      }

      if (selectedKeyword.length > 0) {
        const filtered = sanitizeHotels(items.filter((h) => matchKeyword(h, selectedKeyword)))
        const serverSeemsUnfiltered = filtered.length !== items.length
        if (serverSeemsUnfiltered) {
          disablePaging = true
          items = filtered
          nextTotal = filtered.length
          nextPageToSet = 1
          shouldAppend = false
        }
      }

      if (selectedStars.length > 0) {
        const filtered = sanitizeHotels(items.filter((h) => selectedStars.includes(Number(h.star))))
        const serverSeemsUnfiltered = filtered.length !== items.length
        if (serverSeemsUnfiltered) {
          disablePaging = true
          items = filtered
          nextTotal = filtered.length
          nextPageToSet = 1
          shouldAppend = false
        }
      }

      if (typeof priceMin === 'number' || typeof priceMax === 'number') {
        const filtered = sanitizeHotels(
          items.filter((h) => {
            const p = Number(h.price)
            if (!Number.isFinite(p) || p <= 0) return false
            if (typeof priceMin === 'number' && p < priceMin) return false
            if (typeof priceMax === 'number' && p > priceMax) return false
            return true
          })
        )
        const serverSeemsUnfiltered = filtered.length !== items.length
        if (serverSeemsUnfiltered) {
          disablePaging = true
          items = filtered
          nextTotal = filtered.length
          nextPageToSet = 1
          shouldAppend = false
        }
      }

      // 标签筛选兜底：
      // 1) 如果后端没返回酒店 tags（全部为空数组），但用户选择了标签，则结果应为空。
      // 2) 如果后端返回了 tags，但未按 tags 参数过滤，则做本地过滤并禁用继续翻页，避免 total 不匹配。
      const selectedTagNames = resolveTagNames(tagsParam, tags)
      if (selectedTagNames.length > 0) {
        const hasAnyTagData = items.some((h) => Array.isArray(h.tags) && h.tags.length > 0)
        if (!hasAnyTagData) {
          disablePaging = true
          items = []
          nextTotal = 0
          nextPageToSet = 1
          shouldAppend = false
        } else {
          const filtered = sanitizeHotels(
            items.filter((h) => (h.tags ?? []).some((t) => selectedTagNames.includes(String(t))))
          )
          const serverSeemsUnfiltered = filtered.length !== items.length
          items = filtered
          if (serverSeemsUnfiltered) {
            disablePaging = true
            nextTotal = filtered.length
            nextPageToSet = 1
            shouldAppend = false
          }
        }
      }

      setLocalCityFilter(disablePaging)

        setPage(nextPageToSet)
        setTotal(nextTotal)
			setHotels((prev) => {
				const merged = shouldAppend ? prev.concat(items) : items
        return applySort(sanitizeHotels(merged))
			})
      } catch {
        Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      } finally {
			loadingRef.current = false
        setLoading(false)
      }
    },
    [
      detailTag,
		sanitizeHotels,
		applySort,
      tags,
      pageSize,
      query.checkIn,
      query.checkOut,
      query.city,
      query.keyword,
      query.priceMax,
      query.priceMin,
      query.star,
      query.tags,
      sortKey
    ]
  )

  useEffect(() => {
    void load(1, false)
  }, [load])

  usePullDownRefresh(() => {
    void load(1, false).finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  useReachBottom(() => {
		if (loadingRef.current) return
		if (localCityFilter) return
    if (hotels.length >= total) return
    void load(page + 1, true)
  })

  const toDetail = (hotelId: number) => {
    const backUrl = `/pages/list/index?${stringifyQuery(query as Record<string, any>)}`
    const qs = stringifyQuery({
      hotelId: String(hotelId),
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      back: backUrl
    })
    Taro.navigateTo({ url: `/pages/detail/index?${qs}` })
  }

  const toModifySearch = () => {
    const qs = stringifyQuery({
      city: query.city,
      keyword: query.keyword,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      tagId: (query.tags ?? '').split(',')[0] || undefined,
      starLabel: query.star === '5' ? '五星' : query.star === '4' ? '四星' : query.star === '3' ? '三星' : '',
      priceLabel: query.priceMin && query.priceMax ? `${query.priceMin}-${query.priceMax}` : query.priceMin ? `${query.priceMin}+` : ''
    })
    Taro.redirectTo({ url: `${routes.home}?${qs}` })
  }

  const changeSort = (type: '欢迎星' | '距离' | '价格' | '更多') => {
    if (type === '欢迎星') {
      setSortKey('rating_desc')
      Taro.showToast({ title: '已切换为欢迎星排序', icon: 'none' })
      return
    }
    if (type === '价格') {
      setSortKey('price_asc')
      Taro.showToast({ title: '已切换为价格低到高', icon: 'none' })
      return
    }
    if (type === '距离') {
      Taro.showToast({ title: '距离排序待实现', icon: 'none' })
      return
    }
    if (type === '更多') {
      Taro.showToast({ title: '更多筛选请返回首页设置', icon: 'none' })
    }
  }

  const pickDetailTag = (tag: string) => {
    setDetailTag((prev) => (prev === tag ? '' : tag))
  }

  return (
    <View className='hotel-list-page'>
      <TopBar title='酒店列表' fallbackUrl='/pages/index/index' />

      <View className='core-conditions'>
        <View className='core-conditions__left'>
          <Text className='core-conditions__city'>{query.city || '全部城市'}</Text>
          <Text className='core-conditions__date'>
            {query.checkIn && query.checkOut ? `${dateText} · ${nights}晚` : '选择入住/离店'}
          </Text>
        </View>
        <Text className='core-conditions__action' onClick={toModifySearch}>
          修改
        </Text>
      </View>

      <View className='top-filter'>
        <View
          className={sortKey === 'rating_desc' ? 'filter-item active' : 'filter-item'}
          onClick={() => changeSort('欢迎星')}
        >
          <Text className='filter-icon'>⭐</Text>
          <Text className='filter-text'>欢迎星排序</Text>
        </View>
        <View className='filter-item' onClick={() => changeSort('距离')}>
          <Text className='filter-icon'>📍</Text>
          <Text className='filter-text'>距离</Text>
        </View>
        <View
          className={sortKey === 'price_asc' ? 'filter-item active' : 'filter-item'}
          onClick={() => changeSort('价格')}
        >
          <Text className='filter-icon'>💰</Text>
          <Text className='filter-text'>价格低到高</Text>
        </View>
        <View className='filter-item' onClick={() => changeSort('更多')}>
          <Text className='filter-icon'>⚙️</Text>
          <Text className='filter-text'>更多筛选</Text>
        </View>
      </View>

      <View className='detail-filter'>
        {detailTags.map((t) => (
          <Text
            key={t}
            className={detailTag === t ? 'detail-tag active' : 'detail-tag'}
            onClick={() => pickDetailTag(t)}
          >
            {t}
          </Text>
        ))}
      </View>

      <View className='hotel-list'>
        {hotels.map((hotel) => (
          <View key={hotel.id} className='hotel-item' onClick={() => toDetail(hotel.id)}>
            <Image className='hotel-img' src={hotel.image} mode='aspectFill' />
            <View className='hotel-info'>
              <View className='hotel-top'>
                <Text className='hotel-name'>{hotel.name}</Text>
                <Text className='hotel-tag'>{hotel.tags[0] ?? '推荐'}</Text>
              </View>
              <View className='hotel-mid'>
                <Text className='score'>{hotel.rating}</Text>
                <Text className='info-text'>{hotel.reviewCount}评</Text>
                <Text className='info-text'>{hotel.address}</Text>
              </View>
              <View className='hotel-bottom'>
                <View className='hotel-price'>
                  <Text className='price-num'>¥{hotel.price}</Text>
                  <Text className='price-desc'>/晚起</Text>
                </View>
                <Text className='hotel-status'>可订</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {!loading && hotels.length === 0 && <View className='load-more'>暂无符合条件的酒店</View>}

		{loading && (
			<View className='load-more'>
				<View className='spinner' />
				<Text>加载中...</Text>
			</View>
		)}
    </View>
  )
}
