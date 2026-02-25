import { View, Text, Image } from '@tarojs/components'
import type { HotelListItem } from '../../api/types'
import './index.less'

export type HotelCardProps = {
  hotel: HotelListItem
  onClick?: () => void
}

export default function HotelCard(props: HotelCardProps) {
  const { hotel, onClick } = props

  return (
    <View className='hotel-card' onClick={onClick}>
      <Image className='hotel-card__image' src={hotel.image} mode='aspectFill' />
      <View className='hotel-card__body'>
        <Text className='hotel-card__name'>{hotel.name}</Text>
        <Text className='hotel-card__address'>{hotel.address}</Text>
        <View className='hotel-card__meta'>
          <Text className='hotel-card__rating'>评分 {hotel.rating}</Text>
          <Text className='hotel-card__price'>¥{hotel.price}/晚</Text>
        </View>
        <View className='hotel-card__tags'>
          {hotel.tags.slice(0, 3).map((t) => (
            <Text key={t} className='hotel-card__tag'>
              {t}
            </Text>
          ))}
        </View>
      </View>
    </View>
  )
}
