import { View, Text, Button } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cancelReservation, queryReservations } from '../../api/reservation'
import type { ReservationListItem, ReservationStatus } from '../../api/types'
import { isLoggedIn } from '../../api/auth'
import { navigateToLogin, routes } from '../../routes'
import { useUserRoleGuard } from '../../hooks/useUserRoleGuard'
import TopBar from '../../components/TopBar'
import BottomTabBar from '../../components/BottomTabBar'
import './index.less'

type StatusTab = { label: string; value: ReservationStatus | '' }

export default function ReservationsPage() {
  useUserRoleGuard(routes.reservations)

  const tabs: StatusTab[] = useMemo(
    () => [
      { label: '全部', value: '' },
      { label: '已确认', value: 'confirmed' },
      { label: '已取消', value: 'cancelled' },
      { label: '已完成', value: 'completed' }
    ],
    []
  )

  const [status, setStatus] = useState<ReservationStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(false)
	const loadingRef = useRef(false)

  const [loggedIn, setLoggedIn] = useState(true)

  const statusText = (s: ReservationStatus) => {
    if (s === 'confirmed') return '已确认'
    if (s === 'cancelled') return '已取消'
    return '已完成'
  }

  const load = useCallback(
    async (nextPage: number, append: boolean, statusOverride?: ReservationStatus | '') => {
			if (loadingRef.current) return
			loadingRef.current = true
			setLoading(true)
      try {
			const effectiveStatus = typeof statusOverride === 'string' ? statusOverride : status
        const resp = await queryReservations({
          status: effectiveStatus || undefined,
          page: nextPage,
          pageSize
        })

			const ok = resp.code === 200 || resp.code === 0
        if (!ok) {
				const msg = resp.message ?? '加载失败'
				Taro.showToast({ title: `${msg}(${resp.code})`, icon: 'none' })
          return
        }

			const serverItems = resp.data.items
			const filteredItems = effectiveStatus
				? serverItems.filter((r) => r.status === effectiveStatus)
				: serverItems

			// 兜底：如果后端没有按 status 过滤（返回混合状态），就以前端过滤结果为准，避免四个 tab 都显示同样数据。
			const backendDidNotFilter = Boolean(effectiveStatus) && filteredItems.length !== serverItems.length

        setPage(nextPage)
        setTotal(backendDidNotFilter ? filteredItems.length : resp.data.total)
        setItems((prev) => {
				if (backendDidNotFilter) return filteredItems
				return append ? prev.concat(filteredItems) : filteredItems
			})
      } catch {
        Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      } finally {
			loadingRef.current = false
        setLoading(false)
      }
    },
		[pageSize, status]
  )

  useEffect(() => {
    const ok = isLoggedIn()
    setLoggedIn(ok)
    if (!ok) return
    void load(1, false)
  }, [load])

  usePullDownRefresh(() => {
    const ok = isLoggedIn()
    setLoggedIn(ok)
    if (!ok) {
      Taro.stopPullDownRefresh()
      return
    }
    void load(1, false).finally(() => Taro.stopPullDownRefresh())
  })

  useReachBottom(() => {
    if (!loggedIn) return
    if (loadingRef.current) return
    if (items.length >= total) return
    void load(page + 1, true)
  })

  const onCancel = async (id: string) => {
    const res = await Taro.showModal({
      title: '取消预订',
      content: '确定要取消该预订吗？'
    })
    if (!res.confirm) return

    const resp = await cancelReservation(id)
    if (resp.code !== 200 && resp.code !== 204) {
      Taro.showToast({ title: resp.message ?? '取消失败', icon: 'none' })
      return
    }

    Taro.showToast({ title: '已取消', icon: 'none' })
    void load(1, false)
  }

  return (
    <View className='reservation-page'>
      <TopBar title='我的预订' fallbackUrl='/pages/profile/index' />
      {!loggedIn && (
        <View className='load-more'>
          <Text>登录后才能查看预订</Text>
          <Button
            className='cancel-btn'
            onClick={() => void navigateToLogin(routes.reservations)}
          >
            去登录
          </Button>
        </View>
      )}

      {loggedIn && (
      <View className='status-tabs'>
        {tabs.map((t) => (
          <View
            key={t.label}
            className={status === t.value ? 'tab active' : 'tab'}
            onClick={() => {
						const nextStatus = t.value
              setStatus(nextStatus)
              void load(1, false, nextStatus)
            }}
          >
            <Text>{t.label}</Text>
          </View>
        ))}
      </View>
      )}

      {loggedIn && items.map((r) => (
        <View key={r.id} className='card'>
          <View className='row'>
            <Text className='title'>{r.hotelName}</Text>
            <Text className='status'>{statusText(r.status)}</Text>
          </View>
          <View className='meta'>
            <Text>{r.roomType}</Text>
          </View>
          <View className='meta'>
            <Text>
              {r.checkIn} 至 {r.checkOut}
            </Text>
          </View>
          <View className='price'>
            <Text>¥{r.totalPrice}</Text>
          </View>

          {r.status === 'confirmed' && (
            <View className='actions'>
              <Button className='cancel-btn' onClick={() => void onCancel(r.id)}>
                取消预订
              </Button>
            </View>
          )}
        </View>
      ))}

      {loggedIn && !loading && items.length === 0 && <View className='load-more'>暂无预订记录</View>}
      {loggedIn && (
        <View className='load-more'>
          {loading ? <Text>加载中...</Text> : items.length >= total && items.length > 0 ? <Text>已加载全部</Text> : <Text>上滑加载更多...</Text>}
        </View>
      )}

      <BottomTabBar active='reservations' />
    </View>
  )
}
