import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { register } from '../../../api/auth'
import type { AuthRole } from '../../../api/types'
import { routes } from '../../../routes'
import './index.less'

const roles: { label: string; value: AuthRole }[] = [
  { label: '用户', value: 'user' },
  { label: '商家', value: 'merchant' },
  { label: '管理员', value: 'admin' }
]

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<AuthRole>('user')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (loading) return

    if (username.trim().length === 0 || password.trim().length === 0) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }
    if (email.trim().length === 0) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' })
      return
    }
    if (phone.trim().length === 0) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const resp = await register({
        username: username.trim(),
        password: password.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role
      })

      if (resp.code !== 200) {
        Taro.showToast({ title: resp.message ?? '注册失败', icon: 'none' })
        return
      }

      Taro.showToast({ title: resp.message ?? '注册成功', icon: 'none' })
      // 注册页通常是从登录页 navigateTo 进来的；这里返回上一页避免堆叠两个登录页。
      try {
        await Taro.navigateBack({ delta: 1 })
      } catch {
        Taro.redirectTo({ url: routes.auth.login })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='auth-page'>
      <Text className='title'>创建账号</Text>

      <View className='form-row'>
        <Text className='label'>用户名</Text>
        <Input className='input' placeholder='例如 merchant01' placeholderStyle='line-height: 78rpx;' value={username} onInput={(e) => setUsername(e.detail.value)} />
      </View>

      <View className='form-row'>
        <Text className='label'>密码</Text>
        <Input className='input' type='password' placeholder='请输入密码' placeholderStyle='line-height: 78rpx;' value={password} onInput={(e) => setPassword(e.detail.value)} />
      </View>

      <View className='form-row'>
        <Text className='label'>邮箱</Text>
        <Input className='input' placeholder='merchant@example.com' placeholderStyle='line-height: 78rpx;' value={email} onInput={(e) => setEmail(e.detail.value)} />
      </View>

      <View className='form-row'>
        <Text className='label'>手机号</Text>
        <Input className='input' placeholder='13800138000' placeholderStyle='line-height: 78rpx;' value={phone} onInput={(e) => setPhone(e.detail.value)} />
      </View>

      <View className='form-row'>
        <Text className='label'>角色</Text>
        <View className='role-row'>
          {roles.map((r) => (
            <Text
              key={r.value}
              className={role === r.value ? 'role-tag active' : 'role-tag'}
              onClick={() => setRole(r.value)}
            >
              {r.label}
            </Text>
          ))}
        </View>
      </View>

      <Button className='primary-btn' type='primary' loading={loading} onClick={() => void onSubmit()}>
        注册
      </Button>

      <View className='link-row'>
        <Text className='link' onClick={() => Taro.redirectTo({ url: routes.auth.login })}>
          已有账号？去登录
        </Text>
      </View>
    </View>
  )
}
