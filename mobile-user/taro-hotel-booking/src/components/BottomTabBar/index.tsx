import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { routes } from '../../routes'
import './index.less'

type TabKey = 'home' | 'reservations' | 'profile'

type Props = {
  active: TabKey
}

export default function BottomTabBar(props: Props) {
  const items: Array<{ key: TabKey; label: string; url: string }> = [
    { key: 'home', label: '首页', url: routes.home },
    { key: 'reservations', label: '我的预订', url: routes.reservations },
    { key: 'profile', label: '个人中心', url: routes.profile }
  ]

  const onGo = (key: TabKey, url: string) => {
    if (key === props.active) return
    Taro.reLaunch({ url })
  }

  return (
    <View className='bottom-tabbar'>
      <View className='bottom-tabbar__row'>
        {items.map((it) => (
          <View
            key={it.key}
            className={it.key === props.active ? 'bottom-tabbar__item active' : 'bottom-tabbar__item'}
            onClick={() => onGo(it.key, it.url)}
          >
            <Text className='bottom-tabbar__text'>{it.label}</Text>
          </View>
        ))}
      </View>
      <View className='bottom-tabbar__safe' />
    </View>
  )
}
