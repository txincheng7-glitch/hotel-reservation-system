import Taro from '@tarojs/taro'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type RequestOptions = {
  url: string
  method?: HttpMethod
  data?: Record<string, any>
  header?: Record<string, any>
  timeout?: number
	/** 是否需要 JWT 鉴权；true 时会自动附带 Authorization: Bearer <token> */
	auth?: boolean
}

// 注意：不要用 process.env[name] 动态读取环境变量。
// 在 H5 下这些变量通常由构建期注入（DefinePlugin），只有静态引用
// process.env.TARO_APP_XXX 才能被正确替换。
const API_BASE_URL_RAW = (process.env.TARO_APP_API_BASE_URL ?? '').trim()
const API_PREFIX_RAW = (process.env.TARO_APP_API_PREFIX ?? '/api').trim() || '/api'
const TARO_ENV = (process.env.TARO_ENV ?? '').trim()
const NODE_ENV = (process.env.NODE_ENV ?? '').trim()

function getApiBaseUrl(): string {
	// 例如：https://api.example.com 或 https://api.example.com/api
	// H5 开发态优先走 devServer 代理，避免跨域/CORS
	if (TARO_ENV === 'h5' && NODE_ENV === 'development') return ''
	return API_BASE_URL_RAW.replace(/\/+$/, '')
}

function getApiPrefix(): string {
	// 基础URL: /api
	const withSlash = API_PREFIX_RAW.startsWith('/') ? API_PREFIX_RAW : `/${API_PREFIX_RAW}`
	return withSlash.replace(/\/+$/, '')
}

function normalizeJoin(...parts: string[]): string {
	const joined = parts
		.filter((p) => typeof p === 'string' && p.length > 0)
		.map((p) => p.trim())
		.join('/')
	// Collapse duplicated slashes but keep protocol part (http://, https://)
	const collapsed = joined
		.replace(/^\/{2,}/, '/')
		.replace(/([^:])\/{2,}/g, '$1/')
	return collapsed
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const prefix = getApiPrefix()
  const isAbsolute = /^https?:\/\//i.test(options.url)
	const effectivePrefix = baseUrl.endsWith(prefix) ? '' : prefix

	const relativePath = (() => {
		if (isAbsolute) return ''
		const path = options.url.startsWith('/') ? options.url : `/${options.url}`
		// 避免重复拼接 /api
		if (effectivePrefix.length > 0 && (path === effectivePrefix || path.startsWith(`${effectivePrefix}/`))) {
			return path
		}
		return effectivePrefix.length > 0 ? normalizeJoin(effectivePrefix, path) : path
	})()

  const fullUrl = isAbsolute
    ? options.url
    : baseUrl.length > 0
			? normalizeJoin(baseUrl, relativePath)
			: relativePath

	const token = options.auth ? Taro.getStorageSync('token') : ''
	const authHeader =
		options.auth && typeof token === 'string' && token.trim().length > 0
			? { Authorization: `Bearer ${token.trim()}` }
			: {}

  const resp = await Taro.request({
    url: fullUrl,
    method: options.method ?? 'GET',
    data: options.data,
    header: {
			Accept: 'application/json',
			'Content-Type': 'application/json; charset=utf-8',
			...authHeader,
			...(options.header ?? {})
		},
    timeout: options.timeout ?? 15000
  })

	// api.md 约定：统一响应 { code, message, data }
	const data = (resp as any)?.data
	if (data && typeof data === 'object' && typeof (data as any).code === 'number' && 'data' in (data as any)) {
		return data as T
	}

	const statusCode = (resp as any)?.statusCode
	const status = typeof statusCode === 'number' ? statusCode : 500

	// 兼容：部分接口可能直接返回裸 data（对象/数组），这里在 2xx 时自动包装
	if (status >= 200 && status < 300) {
		return {
			code: status,
			message: 'success',
			data: data ?? null
		} as unknown as T
	}

	const serverMessage =
		data && typeof data === 'object' && typeof (data as any).message === 'string'
			? String((data as any).message)
			: typeof data === 'string'
				? data
				: ''

	return {
		code: status,
		message: serverMessage || `请求失败(${status})`,
		data: null
	} as unknown as T
}
