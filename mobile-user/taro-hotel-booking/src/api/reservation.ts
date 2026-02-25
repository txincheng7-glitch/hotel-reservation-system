import Taro from '@tarojs/taro'
import { apiRequest } from './request'
import type {
  ApiResponse,
  CancelReservationResult,
  CreateReservationRequest,
  QueryReservationsParams,
  ReservationListItem,
  ReservationListResult,
  ReservationResult
} from './types'

function toNumber(v: unknown, fallback = 0): number {
	if (typeof v === 'number' && Number.isFinite(v)) return v
	if (typeof v === 'string' && v.trim().length > 0) {
		const n = Number(v)
		if (Number.isFinite(n)) return n
	}
	return fallback
}

function asArray<T>(v: unknown): T[] {
	return Array.isArray(v) ? (v as T[]) : []
}

function normalizeReservationItem(raw: any): ReservationListItem {
	return {
		id: String(raw?.id ?? ''),
		hotelName: String(raw?.hotelName ?? ''),
		roomType: String(raw?.roomType ?? ''),
		checkIn: String(raw?.checkIn ?? ''),
		checkOut: String(raw?.checkOut ?? ''),
		totalPrice: toNumber(raw?.totalPrice),
		status: (raw?.status as any) ?? 'confirmed',
		createdAt: String(raw?.createdAt ?? '')
	}
}

function normalizeReservationList(raw: any): ReservationListResult {
	// 支持两种常见形态：
	// 1) { total, items }
	// 2) items[]
	if (raw && typeof raw === 'object' && Array.isArray(raw.items)) {
		const items = asArray<any>(raw.items).map(normalizeReservationItem)
		return { total: toNumber(raw.total, items.length), items }
	}
	if (Array.isArray(raw)) {
		const items = asArray<any>(raw).map(normalizeReservationItem)
		return { total: items.length, items }
	}
	return { total: 0, items: [] }
}

function cleanParams<T extends Record<string, any>>(params: T | undefined): Partial<T> | undefined {
	if (!params) return undefined
	const next: Record<string, any> = {}
	Object.keys(params).forEach((k) => {
		const v = (params as any)[k]
		if (v === undefined || v === null || v === '') return
		next[k] = v
	})
	return next
}

export async function createReservation(
  body: CreateReservationRequest
): Promise<ApiResponse<ReservationResult>> {
	return apiRequest<ApiResponse<ReservationResult>>({
		url: '/reservations',
		method: 'POST',
		data: body,
		auth: true
	})
}

export async function queryReservations(
  params: QueryReservationsParams = {}
): Promise<ApiResponse<ReservationListResult>> {
	const doGet = (data?: QueryReservationsParams) =>
		apiRequest<ApiResponse<ReservationListResult>>({
			url: '/reservations',
			method: 'GET',
			data: cleanParams(data),
			auth: true
		})
	const doPost = (data?: QueryReservationsParams) =>
		apiRequest<ApiResponse<ReservationListResult>>({
			url: '/reservations',
			method: 'POST',
			data: cleanParams(data) as any,
			auth: true
		})

	let resp = await doGet(params)

	// 兼容：部分后端实现对分页/筛选参数处理有 bug（会直接 500）。
	// 为了保证“我的预订”可用，这里在 5xx 时降级重试一次：不带任何查询参数。
	const hasQuery =
		typeof params?.status === 'string' || typeof params?.page === 'number' || typeof params?.pageSize === 'number'
	if (hasQuery && (resp as any)?.code >= 500) {
		// 兼容后端 bug：GET 接口错误地从 req.body 读取参数导致 500。
		// 先用契约 GET，失败后降级改用 POST(body) 再重试一次。
		resp = await doPost(params)
		if ((resp as any)?.code >= 500) {
			resp = await doGet(undefined)
		}
	}

	const ok = resp && typeof resp === 'object' && (((resp as any).code === 200) || ((resp as any).code === 0))
	if (ok) {
		return {
			...(resp as any),
			data: normalizeReservationList((resp as any).data)
		} as ApiResponse<ReservationListResult>
	}
	return resp
}

export async function cancelReservation(
  reservationId: string
): Promise<ApiResponse<CancelReservationResult>> {
	return apiRequest<ApiResponse<CancelReservationResult>>({
		url: `/reservations/${encodeURIComponent(reservationId)}`,
		method: 'DELETE',
		auth: true
	})
}
