import { View, Text, Input, Image, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import Calendar from '../../components/Calendar'
import BottomTabBar from '../../components/BottomTabBar'
import { useTags } from '../../hooks/useTags'
import { useUserRoleGuard } from '../../hooks/useUserRoleGuard'
import { calcNights, formatDateYYYYMMDD } from '../../utils/date'
import { normalizeQueryParams, stringifyQuery } from '../../utils/query'
import { routes } from '../../routes'
import './index.less'

export default function Index() {
  const router = useRouter()
  useUserRoleGuard(routes.home)

  const today = useMemo(() => new Date(), [])
  const tomorrow = useMemo(() => {
    const next = new Date()
    next.setDate(next.getDate() + 1)
    return next
  }, [])

  const [location, setLocation] = useState('上海')
  const [keyword, setKeyword] = useState('')

  const cityList = useMemo(
    () => ['上海', '北京', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京'],
    []
  )
  const [cityPickerOpen, setCityPickerOpen] = useState(false)

  const [dateShow, setDateShow] = useState(false)
  const [checkIn, setCheckIn] = useState(formatDateYYYYMMDD(today))
  const [checkOut, setCheckOut] = useState(formatDateYYYYMMDD(tomorrow))

  const { tags } = useTags()
  const [activeTagIds, setActiveTagIds] = useState<number[]>([])
  const [filterShow, setFilterShow] = useState(false)
  const [starFilter, setStarFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')

  // 支持从列表页“修改搜索设置”返回时带参数回填
  useEffect(() => {
    const p = normalizeQueryParams((router.params ?? {}) as Record<string, any>)
    if (typeof p.city === 'string' && p.city.trim()) setLocation(p.city)
    if (typeof p.keyword === 'string') setKeyword(p.keyword)
    if (typeof p.checkIn === 'string' && p.checkIn.trim()) setCheckIn(p.checkIn)
    if (typeof p.checkOut === 'string' && p.checkOut.trim()) setCheckOut(p.checkOut)
    if (typeof p.starLabel === 'string') setStarFilter(p.starLabel)
    if (typeof p.priceLabel === 'string') setPriceFilter(p.priceLabel)
    // 回填标签：兼容旧参数 tagId（单选）和新参数 tags（逗号分隔，可多选）
    if (typeof p.tags === 'string' && p.tags.trim()) {
      const ids = p.tags
        .split(',')
        .map((s) => Number(String(s).trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      setActiveTagIds(Array.from(new Set(ids)))
    } else if (typeof p.tagId === 'string' && p.tagId.trim()) {
      const n = Number(p.tagId)
      if (Number.isFinite(n) && n > 0) setActiveTagIds([n])
    }
  }, [router.params])

  const fallbackQuickTags = ['亲子', '奢华', '免费停车场', '含早餐', '商务']
  const starList = ['三星', '四星', '五星', '豪华']
  const priceList = ['0-300', '300-600', '600-1000', '1000+']

  const quickTags = useMemo(() => {
    if (tags.length === 0) return fallbackQuickTags
    return tags.slice(0, 5).map((t) => t.name)
  }, [tags])

  const activeTagNames = useMemo(() => {
    if (activeTagIds.length === 0) return [] as string[]
    const byId = new Map(tags.map((t) => [t.id, t.name]))
    return activeTagIds.map((id) => byId.get(id)).filter((x): x is string => typeof x === 'string' && x.length > 0)
  }, [activeTagIds, tags])

  const onTagClick = (tagName: string) => {
    const picked = tags.find((t) => t.name === tagName)
    if (!picked) {
      // 未加载到 tags 时不强制选择任何标签
      return
    }
		setActiveTagIds((prev) => {
			const has = prev.includes(picked.id)
			return has ? prev.filter((x) => x !== picked.id) : prev.concat(picked.id)
		})
  }

  const onFilterConfirm = () => {
    setFilterShow(false)
    Taro.showToast({
      title: `筛选：${starFilter || '无'} | ${priceFilter || '无'}`,
      icon: 'none'
    })
  }

  const changeLocation = () => {
    setCityPickerOpen(true)
  }

  const pickCity = (city: string) => {
    setLocation(city)
    setCityPickerOpen(false)
  }

  const locate = async () => {
    const env = Taro.getEnv()

    // Weapp: 先检查/申请授权；被拒绝后引导打开设置
    if (env === Taro.ENV_TYPE.WEAPP) {
      try {
        const setting = await Taro.getSetting()
        const hasAuth = Boolean((setting.authSetting as any)?.['scope.userLocation'])
        if (!hasAuth) {
          try {
            await Taro.authorize({ scope: 'scope.userLocation' })
          } catch {
            const res = await Taro.showModal({
              title: '需要定位权限',
              content: '请在设置中开启定位权限后重试',
              confirmText: '去设置'
            })
            if (res.confirm) {
              await Taro.openSetting()
            }
            return
          }
        }
      } catch {
        // ignore: 某些环境 getSetting/authorize 可能不可用，继续尝试 getLocation
      }
    }

    try {
      await Taro.getLocation({ type: 'wgs84' })
      // 未接入地理逆解析服务，这里仅表示已获取定位能力
      Taro.showToast({ title: '定位成功（暂不支持自动识别城市）', icon: 'none' })
    } catch (err: any) {
      if (env === Taro.ENV_TYPE.WEB) {
        const msg = String(err?.message || err?.errMsg || '')
        // H5 定位依赖浏览器权限；部分场景需要 HTTPS（localhost 例外）
        const hint =
          msg.includes('Only secure origins') || msg.includes('secure')
            ? '浏览器定位需要 HTTPS 环境（localhost 除外）'
            : '请在浏览器地址栏为本网站开启定位权限'
        Taro.showToast({ title: `定位失败：${hint}`, icon: 'none' })
        return
      }
      Taro.showToast({ title: '定位失败，请在设置中开启定位权限', icon: 'none' })
    }
  }

  const toAdHotel = () => {
    const qs = stringifyQuery({
      hotelId: '1',
      checkIn,
      checkOut,
      back: routes.home
    })
    Taro.navigateTo({ url: `/pages/detail/index?${qs}` })
  }

  const mapStarToParam = (star: string): string => {
    if (star === '三星') return '3'
    if (star === '四星') return '4'
    if (star === '五星') return '5'
    if (star === '豪华') return '5'
    return ''
  }

  const mapPriceToRange = (
    price: string
  ): { priceMin?: string; priceMax?: string } => {
    if (price === '0-300') return { priceMin: '0', priceMax: '300' }
    if (price === '300-600') return { priceMin: '300', priceMax: '600' }
    if (price === '600-1000') return { priceMin: '600', priceMax: '1000' }
    if (price === '1000+') return { priceMin: '1000' }
    return {}
  }

  const onSearch = () => {
    if (checkIn.length === 0 || checkOut.length === 0) {
      Taro.showToast({ title: '请选择入住和离店日期', icon: 'none' })
      return
    }

    const starParam = mapStarToParam(starFilter)
    const priceRange = mapPriceToRange(priceFilter)

    const qs = stringifyQuery({
      city: location,
      keyword: keyword.trim(),
      checkIn,
      checkOut,
      tags: activeTagIds.length > 0 ? activeTagIds.join(',') : undefined,
      star: starParam,
      priceMin: priceRange.priceMin,
      priceMax: priceRange.priceMax
    })

    Taro.navigateTo({
      url: `/pages/list/index?${qs}`
    })
  }

  return (
    <View className='hotel-search-page'>
      <View className='banner'>
        <Image
          className='banner-img'
          src='https://picsum.photos/seed/hotel-banner/750/200'
          mode='widthFix'
          onClick={(e) => {
            e.stopPropagation()
            toAdHotel()
          }}
        />
      </View>

      <View className='search-core'>
        <View className='search-input-row'>
          <View className='location' onClick={changeLocation}>
            <Text className='location-icon'>📍</Text>
            <Text className='location-text'>{location}</Text>
            <Text className='location-arrow'>↓</Text>
          </View>
          <Text className='location-locate' onClick={(e) => { e.stopPropagation(); void locate() }}>
            定位
          </Text>
          <Input
            className='search-input'
            placeholder='位置/品牌/酒店'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            placeholderStyle='color: #999; font-size: 26rpx; line-height: 72rpx;'
          />
        </View>

        <View className='date-select' onClick={() => setDateShow(true)}>
          <Text className='date-icon'>📅</Text>
          <Text className='date-text'>
            {checkIn && checkOut
              ? `${checkIn} - ${checkOut} 共${calcNights(checkIn, checkOut)}晚`
              : '选择入住/离店日期'}
          </Text>
          <Text className='date-arrow'>→</Text>
        </View>

        <View className='filter-tag-row'>
          <Button className='filter-btn' onClick={() => setFilterShow(true)}>
            筛选 ⚙️
          </Button>
          <View className='tag-list'>
            {quickTags.map((tag) => (
              <Text
                key={tag}
                className={activeTagNames.includes(tag) ? 'quick-tag active' : 'quick-tag'}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </Text>
            ))}
          </View>
        </View>

        <Button className='search-btn' onClick={onSearch} type='primary'>
          查询
        </Button>
      </View>

      {dateShow && (
        <View className='popup-mask' onClick={() => setDateShow(false)}>
          <View className='date-popup' onClick={(e) => e.stopPropagation()}>
            <View className='popup-title'>选择入住/离店日期</View>
            <Calendar
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(v) => {
                setCheckIn(v.checkIn)
                setCheckOut(v.checkOut)
              }}
            />
            <Button className='popup-confirm-btn' type='primary' onClick={() => setDateShow(false)}>
              确认
            </Button>
          </View>
        </View>
      )}

      {filterShow && (
        <View className='popup-mask' onClick={() => setFilterShow(false)}>
          <View className='filter-popup' onClick={(e) => e.stopPropagation()}>
            <View className='filter-title'>筛选条件</View>

            <View className='filter-item'>
              <View className='filter-label'>酒店星级</View>
              <View className='filter-list'>
                {starList.map((star) => (
                  <Text
                    key={star}
                    className={starFilter === star ? 'filter-tag active' : 'filter-tag'}
                    onClick={() => setStarFilter(starFilter === star ? '' : star)}
                  >
                    {star}
                  </Text>
                ))}
              </View>
            </View>

            <View className='filter-item'>
              <View className='filter-label'>价格区间</View>
              <View className='filter-list'>
                {priceList.map((price) => (
                  <Text
                    key={price}
                    className={priceFilter === price ? 'filter-tag active' : 'filter-tag'}
                    onClick={() => setPriceFilter(priceFilter === price ? '' : price)}
                  >
                    {price}
                  </Text>
                ))}
              </View>
            </View>

            <Button className='filter-confirm-btn' onClick={onFilterConfirm} type='primary'>
              确认筛选
            </Button>
          </View>
        </View>
      )}

      {cityPickerOpen && (
        <View className='popup-mask' onClick={() => setCityPickerOpen(false)}>
          <View className='city-popup' onClick={(e) => e.stopPropagation()}>
            <View className='popup-title'>选择城市</View>
            <View className='city-list'>
              {cityList.map((c) => (
                <Text
                  key={c}
                  className={c === location ? 'city-item active' : 'city-item'}
                  onClick={() => pickCity(c)}
                >
                  {c}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      <BottomTabBar active='home' />
    </View>
  )
}
