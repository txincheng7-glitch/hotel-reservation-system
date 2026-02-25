import Taro from '@tarojs/taro'
import { apiRequest } from './request'
import type { ApiResponse, LoginRequest, LoginResult, RegisterRequest, RegisterResult, UserProfile } from './types'

const TOKEN_KEY = 'token'
const USER_KEY = 'auth_user'

export function getToken(): string {
  const t = Taro.getStorageSync(TOKEN_KEY)
  return typeof t === 'string' ? t : ''
}

export function setToken(token: string) {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export function clearAuth() {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export function isLoggedIn(): boolean {
  return getToken().trim().length > 0
}

export async function register(body: RegisterRequest): Promise<ApiResponse<RegisterResult>> {
	return apiRequest<ApiResponse<RegisterResult>>({
		url: '/auth/register',
		method: 'POST',
		data: body
	})
}

export async function login(body: LoginRequest): Promise<ApiResponse<LoginResult>> {
	const resp = await apiRequest<ApiResponse<LoginResult>>({
		url: '/auth/login',
		method: 'POST',
		data: body
	})

	if (resp.code === 200 && resp.data?.token) {
		setToken(resp.data.token)
		Taro.setStorageSync(USER_KEY, resp.data.user)
	}

	return resp
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
	return apiRequest<ApiResponse<UserProfile>>({
		url: '/auth/profile',
		method: 'GET',
		auth: true
	})
}
