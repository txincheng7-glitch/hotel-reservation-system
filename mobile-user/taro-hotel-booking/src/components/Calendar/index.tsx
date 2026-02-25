import { View, Text, Picker } from '@tarojs/components'
import './index.less'

export type CalendarValue = {
  checkIn: string
  checkOut: string
}

export type CalendarProps = CalendarValue & {
  onChange: (value: CalendarValue) => void
}

export default function Calendar(props: CalendarProps) {
  const { checkIn, checkOut, onChange } = props

  return (
    <View className='calendar'>
      <View className='calendar__row'>
        <Text className='calendar__label'>入住</Text>
        <Picker
          mode='date'
          value={checkIn}
          onChange={(e) => onChange({ checkIn: e.detail.value, checkOut })}
        >
          <View className='calendar__value'>
            <Text>{checkIn}</Text>
          </View>
        </Picker>
      </View>
      <View className='calendar__row'>
        <Text className='calendar__label'>离店</Text>
        <Picker
          mode='date'
          value={checkOut}
          onChange={(e) => onChange({ checkIn, checkOut: e.detail.value })}
        >
          <View className='calendar__value'>
            <Text>{checkOut}</Text>
          </View>
        </Picker>
      </View>
    </View>
  )
}
