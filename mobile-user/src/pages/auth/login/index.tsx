import { View, Text, Input, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMemo, useState } from 'react'
import { login } from '../../../api/auth'
import { backOrHome, routes } from '../../../routes'
import './index.less'

type LoginQuery = {
  redirect?: string
}

export default function LoginPage() {
  const router = useRouter()
  const query = useMemo<LoginQuery>(() => router.params ?? {}, [router.params])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const safeDecodeRedirect = (raw?: string) => {
    if (typeof raw !== 'string') return ''
    const v = raw.trim()
    if (v.length === 0) return ''
    try {
      return decodeURIComponent(v)
    } catch {
      return v
    }
  }

  const onSubmit = async () => {
    if (loading) return
    if (username.trim().length === 0 || password.trim().length === 0) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const resp = await login({ username: username.trim(), password: password.trim() })
      if (resp.code !== 200) {
        Taro.showToast({ title: resp.message ?? '登录失败', icon: 'none' })
        return
      }

      const role = resp.data?.user?.role
      if (role !== 'user') {
        Taro.showToast({ title: '当前账号非用户身份，将进入个人中心', icon: 'none' })
        Taro.redirectTo({ url: routes.profile })
        return
      }

      Taro.showToast({ title: '登录成功', icon: 'none' })
      const redirect = safeDecodeRedirect(query.redirect)
      if (redirect) {
        backOrHome(redirect)
        return
      }
      // 无 redirect 时直接进入首页，并重置页面栈，避免“登录成功却回到上一个登录页”。
      Taro.reLaunch({ url: routes.home })
    } catch {
      Taro.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='auth-page'>
      <Text className='title'>欢迎使用易宿酒店预订平台</Text>

      <View className='form-row'>
        <Text className='label'>用户名</Text>
        <Input
          className='input'
          placeholder='请输入用户名'
          placeholderStyle='line-height: 78rpx;'
          value={username}
          onInput={(e) => setUsername(e.detail.value)}
        />
      </View>

      <View className='form-row'>
        <Text className='label'>密码</Text>
        <Input
          className='input'
          type='password'
          placeholder='请输入密码'
          placeholderStyle='line-height: 78rpx;'
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
        />
      </View>

      <Button className='primary-btn' type='primary' loading={loading} onClick={() => void onSubmit()}>
        登录
      </Button>

      <View className='link-row'>
        <Text className='link' onClick={() => Taro.navigateTo({ url: routes.auth.register })}>
          没有账号？去注册
        </Text>
      </View>
    </View>
  )
}
