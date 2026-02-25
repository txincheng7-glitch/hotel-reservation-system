import Taro from '@tarojs/taro'

export const routes = {
  home: '/pages/index/index',
  list: '/pages/list/index',
  detail: '/pages/detail/index',
  reservations: '/pages/reservations/index',
  profile: '/pages/profile/index',
  auth: {
    login: '/pages/auth/login/index',
    register: '/pages/auth/register/index'
  }
} as const

export function toLoginUrl(redirect?: string): string {
  if (typeof redirect !== 'string' || redirect.trim().length === 0) return routes.auth.login
  return `${routes.auth.login}?redirect=${encodeURIComponent(redirect)}`
}

export function redirectToLogin(redirect?: string) {
  return Taro.redirectTo({ url: toLoginUrl(redirect) })
}

export function navigateToLogin(redirect?: string) {
  return Taro.navigateTo({ url: toLoginUrl(redirect) })
}

export function backOrHome(redirect?: string) {
  if (typeof redirect === 'string' && redirect.length > 0) {
    return Taro.redirectTo({ url: redirect })
  }
  const pages = Taro.getCurrentPages?.() ?? []
  if (pages.length > 1) return Taro.navigateBack()
  return Taro.redirectTo({ url: routes.home })
}
