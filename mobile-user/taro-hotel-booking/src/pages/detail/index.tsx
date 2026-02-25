import { View, Text, Button, Image, Swiper, SwiperItem, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getHotelDetail } from '../../api/hotel'
import { createReservation } from '../../api/reservation'
import type { HotelDetail } from '../../api/types'
import TopBar from '../../components/TopBar'
import { calcNights, formatMonthDayRange } from '../../utils/date'
import { normalizeQueryParams, safeDecodeURIComponent, stringifyQuery } from '../../utils/query'
import { navigateToLogin } from '../../routes'
import { useUserRoleGuard } from '../../hooks/useUserRoleGuard'
import './index.less'

type DetailQuery = {
  hotelId?: string
  checkIn?: string
  checkOut?: string
  back?: string
}

export default function DetailPage() {
  const router = useRouter()
  const query = useMemo<DetailQuery>(
    () => normalizeQueryParams((router.params ?? {}) as Record<string, any>),
    [router.params]
  )

  useUserRoleGuard(`/pages/detail/index?${stringifyQuery(query as Record<string, any>)}`)

  const [loading, setLoading] = useState(false)
  const [hotel, setHotel] = useState<HotelDetail | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)

  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingRoomId, setBookingRoomId] = useState<number | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [idType, setIdType] = useState('身份证')
  const [idNumber, setIdNumber] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  const nights = useMemo(() => calcNights(query.checkIn || '', query.checkOut || ''), [query.checkIn, query.checkOut])

  const dateText = useMemo(
    () => formatMonthDayRange(query.checkIn || '', query.checkOut || ''),
    [query.checkIn, query.checkOut]
  )

  const backUrl = useMemo(() => (query.back ? safeDecodeURIComponent(query.back) : '') || '/pages/list/index', [query.back])

  useEffect(() => {
    const id = Number(query.hotelId)
    if (!Number.isFinite(id) || id <= 0) {
      Taro.showToast({ title: '缺少酒店ID', icon: 'none' })
      return
    }

    setLoading(true)
    void getHotelDetail(id, { checkIn: query.checkIn, checkOut: query.checkOut })
      .then((resp) => {
        if (resp.code !== 200) {
          Taro.showToast({ title: resp.message ?? '加载失败', icon: 'none' })
          return
        }
        setHotel(resp.data)

        try {
          if (resp.data?.name) {
            Taro.setNavigationBarTitle({ title: resp.data.name })
          }
        } catch {
          // ignore
        }
      })
      .catch(() => {
        Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [query.checkIn, query.checkOut, query.hotelId])

  const openBooking = (roomId?: number) => {
    if (!hotel) return
		const rooms = Array.isArray((hotel as any)?.rooms) ? hotel.rooms : []
    const pickedRoomId = roomId ?? selectedRoomId ?? rooms[0]?.id
    if (!pickedRoomId) {
      Taro.showToast({ title: '暂无可预订房型', icon: 'none' })
      return
    }

    const checkIn = query.checkIn || ''
    const checkOut = query.checkOut || ''
    if (checkIn.length === 0 || checkOut.length === 0) {
      Taro.showToast({ title: '请先选择日期', icon: 'none' })
      return
    }

    setBookingRoomId(pickedRoomId)
    setBookingOpen(true)
  }

  const submitBooking = async () => {
    if (!hotel) return

		const rooms = Array.isArray((hotel as any)?.rooms) ? hotel.rooms : []
    const pickedRoomId = bookingRoomId ?? selectedRoomId ?? rooms[0]?.id
    if (!pickedRoomId) {
      Taro.showToast({ title: '请选择房型', icon: 'none' })
      return
    }

    const checkIn = query.checkIn || ''
    const checkOut = query.checkOut || ''
    if (checkIn.length === 0 || checkOut.length === 0) {
      Taro.showToast({ title: '请先选择日期', icon: 'none' })
      return
    }

    if (lastName.trim().length === 0 || firstName.trim().length === 0) {
      Taro.showToast({ title: '请填写入住人姓名', icon: 'none' })
      return
    }
    if (idNumber.trim().length === 0) {
      Taro.showToast({ title: '请填写证件号', icon: 'none' })
      return
    }
    if (guestPhone.trim().length === 0) {
      Taro.showToast({ title: '请填写入住人手机号', icon: 'none' })
      return
    }
    if (contactName.trim().length === 0) {
      Taro.showToast({ title: '请填写联系人', icon: 'none' })
      return
    }
    if (contactPhone.trim().length === 0) {
      Taro.showToast({ title: '请填写联系人手机号', icon: 'none' })
      return
    }

    let resp
    try {
      resp = await createReservation({
        hotelId: hotel.id,
        roomId: pickedRoomId,
        checkIn,
        checkOut,
        guests: [
          {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            idType: idType.trim() || '身份证',
            idNumber: idNumber.trim(),
            phone: guestPhone.trim()
          }
        ],
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        specialRequests: specialRequests.trim() || undefined
      })
    } catch {
      Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
      return
    }

    if (resp.code !== 201) {
      if (resp.code === 401) {
        const res = await Taro.showModal({
          title: '未登录',
          content: '登录后才能创建预订，是否前往登录？'
        })
        if (res.confirm) {
          void navigateToLogin('/pages/detail/index')
        }
        return
      }
      Taro.showToast({ title: resp.message ?? '预订失败', icon: 'none' })
      return
    }

    Taro.showToast({ title: `预订成功：${resp.data.reservationId}`, icon: 'none' })
    setBookingOpen(false)
  }

  const changeDatePerson = () => {
    Taro.showToast({ title: '日期/人数修改功能待实现', icon: 'none' })
  }

  if (loading && !hotel) {
    return (
      <View className='hotel-detail-page'>
        <TopBar title='酒店详情' fallbackUrl={backUrl} />
        <Text className='detail__loading'>加载中...</Text>
      </View>
    )
  }

  if (!hotel) {
    return (
      <View className='hotel-detail-page'>
        <TopBar title='酒店详情' fallbackUrl={backUrl} />
        <Text className='detail__empty'>未找到酒店信息</Text>
      </View>
    )
  }

  const images = Array.isArray((hotel as any)?.images) ? hotel.images : []
  const facilities = Array.isArray((hotel as any)?.facilities) ? hotel.facilities : []
  const rooms = Array.isArray((hotel as any)?.rooms) ? hotel.rooms : []

  const sortedRooms = [...rooms].sort((a, b) => a.price - b.price)
  const lowestRoom = sortedRooms[0]

  return (
    <View className='hotel-detail-page'>
      <TopBar title={hotel.name} fallbackUrl={backUrl} />
      <Swiper
        className='banner-swiper'
        circular
        autoplay
        indicatorDots
        indicatorColor='#fff'
        indicatorActiveColor='#1989fa'
      >
			{images.map((img) => (
				<SwiperItem key={img.id}>
					<Image className='swiper-img' src={img.url} mode='aspectFill' />
				</SwiperItem>
			))}
      </Swiper>

      <View className='hotel-base'>
        <Text className='hotel-name'>{hotel.name}</Text>
        <View className='hotel-desc'>
          <Text className='star'>{'★'.repeat(Math.max(0, hotel.star))}</Text>
          <Text className='desc-text'>{hotel.rating}分</Text>
          <Text className='desc-text'>{hotel.address}</Text>
        </View>
        <View className='hotel-facility'>
				{facilities.map((f) => (
            <Text key={f.id} className='facility-item'>
              {f.name}
            </Text>
          ))}
        </View>
      </View>

      <View className='date-room' onClick={changeDatePerson}>
        <View className='date-room-item'>
          <Text className='main-text'>{dateText}</Text>
          <Text className='sub-text'>共{nights}晚</Text>
        </View>
        <View className='date-room-item'>
          <Text className='main-text'>2成人 · 0儿童</Text>
          <Text className='sub-text'>1间房</Text>
        </View>
        <View className='date-room-item'>
          <Text className='main-text'>修改</Text>
          <Text className='sub-text'>→</Text>
        </View>
      </View>

      <View className='room-list'>
        {sortedRooms.map((room) => (
          <View
            key={room.id}
            className='room-item'
            onClick={() => setSelectedRoomId(room.id)}
          >
            <View className='room-info'>
              <Text className='room-name'>{room.type}</Text>
              <View className='room-spec'>
                <Text className='spec-text'>
                  {room.area}㎡ | {room.bedType}
                </Text>
                <Text className='spec-text'>可取消</Text>
              </View>
            </View>
            <View className='room-price'>
              <Text className='price-num'>¥{room.price}</Text>
              <Button
                className='book-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedRoomId(room.id)
				  openBooking(room.id)
                }}
              >
                预订
              </Button>
            </View>
          </View>
        ))}
      </View>

      {lowestRoom && (
        <View className='fixed-book'>
          <View className='fixed-price'>
            <Text className='price-num'>¥{lowestRoom.price}/晚起</Text>
            <Text className='price-desc'>已含税费 · 随时可退</Text>
          </View>
          <Button className='fixed-book-btn' onClick={() => openBooking(lowestRoom.id)}>
            立即预订
          </Button>
        </View>
      )}

    {bookingOpen && (
    <View className='popup-mask' onClick={() => setBookingOpen(false)}>
      <View className='booking-popup' onClick={(e) => e.stopPropagation()}>
        <View className='popup-title'>填写预订信息</View>

        <View className='form-row'>
          <Text className='form-label'>入住人</Text>
          <View className='form-inline'>
            <Input
              className='form-input'
              placeholder='姓'
              placeholderStyle='line-height: 72rpx;'
              value={lastName}
              onInput={(e) => setLastName(e.detail.value)}
            />
            <Input
              className='form-input'
              placeholder='名'
              placeholderStyle='line-height: 72rpx;'
              value={firstName}
              onInput={(e) => setFirstName(e.detail.value)}
            />
          </View>
        </View>

        <View className='form-row'>
          <Text className='form-label'>证件类型</Text>
          <Input
            className='form-input'
            placeholder='身份证'
            placeholderStyle='line-height: 72rpx;'
            value={idType}
            onInput={(e) => setIdType(e.detail.value)}
          />
        </View>

        <View className='form-row'>
          <Text className='form-label'>证件号</Text>
          <Input
            className='form-input'
            placeholder='请输入证件号'
            placeholderStyle='line-height: 72rpx;'
            value={idNumber}
            onInput={(e) => setIdNumber(e.detail.value)}
          />
        </View>

        <View className='form-row'>
          <Text className='form-label'>入住人手机</Text>
          <Input
            className='form-input'
            placeholder='请输入手机号'
            placeholderStyle='line-height: 72rpx;'
            value={guestPhone}
            onInput={(e) => setGuestPhone(e.detail.value)}
          />
        </View>

        <View className='form-row'>
          <Text className='form-label'>联系人</Text>
          <Input
            className='form-input'
            placeholder='联系人姓名'
            placeholderStyle='line-height: 72rpx;'
            value={contactName}
            onInput={(e) => setContactName(e.detail.value)}
          />
        </View>

        <View className='form-row'>
          <Text className='form-label'>联系手机</Text>
          <Input
            className='form-input'
            placeholder='联系人手机号'
            placeholderStyle='line-height: 72rpx;'
            value={contactPhone}
            onInput={(e) => setContactPhone(e.detail.value)}
          />
        </View>

        <View className='form-row'>
          <Text className='form-label'>备注</Text>
          <Textarea
            className='form-textarea'
            placeholder='特殊需求（可选）'
            value={specialRequests}
            onInput={(e) => setSpecialRequests(e.detail.value)}
            maxlength={120}
          />
        </View>

        <Button className='popup-confirm-btn' type='primary' onClick={() => void submitBooking()}>
          确认预订
        </Button>
      </View>
    </View>
    )}
    </View>
  )
}
