import Taro from '@tarojs/taro'
import { useEffect } from 'react'
import { isLoggedIn } from '../api/auth'
import type { AuthRole, LoginUser } from '../api/types'
import { redirectToLogin, routes } from '../routes'

const USER_KEY = 'auth_user'

function getStoredUser(): LoginUser | null {
  const raw = Taro.getStorageSync(USER_KEY)
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed !== 'object') return null
    const u = parsed as Partial<LoginUser>
    if (typeof u.id !== 'number' || typeof u.username !== 'string') return null
    if (u.role !== 'user' && u.role !== 'merchant' && u.role !== 'admin') return null
    return u as LoginUser
  } catch {
    return null
  }
}

function getRole(): AuthRole | null {
  return getStoredUser()?.role ?? null
}

/**
 * 用户端页面守卫：必须已登录且 role===user。
 * - 未登录：跳转登录页，并携带 redirect。
 * - 非 user：提示并跳转个人中心。
 */
export function useUserRoleGuard(redirectPath: string) {
  useEffect(() => {
    if (!isLoggedIn()) {
      void redirectToLogin(redirectPath)
      return
    }

    const role = getRole()
    if (role !== 'user') {
      Taro.showToast({ title: '当前账号非用户身份，无法进入用户端', icon: 'none' })
      void Taro.redirectTo({ url: routes.profile })
    }
  }, [redirectPath])
}
