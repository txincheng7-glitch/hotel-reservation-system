import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { clearAuth, getProfile, isLoggedIn } from '../../api/auth'
import type { UserProfile } from '../../api/types'
import { redirectToLogin, routes } from '../../routes'
import TopBar from '../../components/TopBar'
import BottomTabBar from '../../components/BottomTabBar'
import './index.less'

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!isLoggedIn()) {
      void redirectToLogin(routes.profile)
      return
    }

    setLoading(true)
    try {
      const resp = await getProfile()
      if (resp.code !== 200) {
        if (resp.code === 401) {
          void redirectToLogin(routes.profile)
          return
        }
        Taro.showToast({ title: resp.message ?? '加载失败', icon: 'none' })
        return
      }
      setProfile(resp.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onLogout = async () => {
    const res = await Taro.showModal({ title: '退出登录', content: '确定要退出登录吗？' })
    if (!res.confirm) return
    clearAuth()
    Taro.redirectTo({ url: routes.home })
  }

  return (
    <View className='profile-page'>
      <TopBar title='个人中心' fallbackUrl='/pages/index/index' />
      <Text className='title'>个人中心</Text>

      {profile && (
        <View className='card'>
          <View className='row'>
            <Text className='label'>用户名</Text>
            <Text className='value'>{profile.username}</Text>
          </View>
          <View className='row'>
            <Text className='label'>角色</Text>
            <Text className='value'>{profile.role}</Text>
          </View>
          <View className='row'>
            <Text className='label'>邮箱</Text>
            <Text className='value'>{profile.email}</Text>
          </View>
          <View className='row'>
            <Text className='label'>手机号</Text>
            <Text className='value'>{profile.phone}</Text>
          </View>
          <View className='row'>
            <Text className='label'>创建时间</Text>
            <Text className='value'>{profile.createdAt}</Text>
          </View>
        </View>
      )}

      {!profile && !loading && (
        <View className='card'>
          <Text className='label'>暂无用户信息</Text>
        </View>
      )}

      {profile?.role === 'user' && (
        <Button className='primary-btn' type='primary' onClick={() => Taro.navigateTo({ url: routes.reservations })}>
          我的预订
        </Button>
      )}
      <Button className='danger-btn' onClick={() => void onLogout()}>
        退出登录
      </Button>

      <Text className='link' onClick={() => void load()}>
        重新加载
      </Text>

      <BottomTabBar active='profile' />
    </View>
  )
}
