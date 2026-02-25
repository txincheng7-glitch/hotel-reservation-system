import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { backOrHome } from '../../routes'
import './index.less'

export type TopBarProps = {
  title?: string
  /** 当无法 navigateBack 时，fallback 重定向目标（默认回首页） */
  fallbackUrl?: string
}

export default function TopBar(props: TopBarProps) {
  const { title, fallbackUrl } = props

  // 小程序端默认自带导航栏返回按钮；此组件主要用于 H5/移动端 WebView。
  if (process.env.TARO_ENV !== 'h5') return null

  const onBack = () => {
		const pages = Taro.getCurrentPages?.() ?? []
		// 注意：H5 下当页面栈只有 1 层（例如通过 reLaunch 进入）时，navigateBack 可能会静默 no-op，且不一定触发 fail。
		// 所以这里先判断栈深度：有可退就退；否则走 fallback/home。
		if (pages.length > 1) {
			Taro.navigateBack({
				delta: 1,
				fail: () => backOrHome(fallbackUrl)
			})
			return
		}
		backOrHome(fallbackUrl)
  }

  return (
    <View className='top-bar'>
      <View className='top-bar__left' onClick={onBack}>
        <Text className='top-bar__back'>&lt;</Text>
      </View>
      <View className='top-bar__title'>
        <Text>{title ?? ''}</Text>
      </View>
      <View className='top-bar__right' />
    </View>
  )
}
