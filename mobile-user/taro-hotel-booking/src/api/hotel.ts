import { apiRequest } from './request'
import type {
	ApiResponse,
	HotelDetail,
	HotelListItem,
	HotelPriceCalendar,
	PagedResult,
	PriceCalendarDay
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

function normalizeHotelDetail(raw: any): HotelDetail {
	const images = asArray<any>(raw?.images).map((img) => ({
		id: toNumber(img?.id),
		url: String(img?.url ?? ''),
		type: (img?.type as any) ?? 'other'
	}))

	const facilities = asArray<any>(raw?.facilities).map((f) => ({
		id: toNumber(f?.id),
		name: String(f?.name ?? ''),
		icon: String(f?.icon ?? '')
	}))

	const rooms = asArray<any>(raw?.rooms).map((r) => ({
		id: toNumber(r?.id),
		type: String(r?.type ?? ''),
		area: toNumber(r?.area),
		bedType: String(r?.bedType ?? ''),
		maxOccupancy: toNumber(r?.maxOccupancy),
		price: toNumber(r?.price),
		available: toNumber(r?.available),
		images: asArray<string>(r?.images).map((x) => String(x)),
		amenities: asArray<string>(r?.amenities).map((x) => String(x))
	}))

	const promotions = asArray<any>(raw?.promotions).map((p) => ({
		id: toNumber(p?.id),
		title: String(p?.title ?? ''),
		description: String(p?.description ?? ''),
		discount: toNumber(p?.discount)
	}))

	return {
		id: toNumber(raw?.id),
		name: String(raw?.name ?? ''),
		address: String(raw?.address ?? ''),
		description: String(raw?.description ?? ''),
		star: toNumber(raw?.star),
		rating: toNumber(raw?.rating),
		openingDate: String(raw?.openingDate ?? ''),
		images,
		facilities,
		tags: asArray<string>(raw?.tags).map((x) => String(x)),
		rooms,
		promotions
	}
}

function normalizeHotelListItem(raw: any): HotelListItem {
	const id = toNumber(raw?.id ?? raw?.hotelId)
	const name = String(raw?.name ?? raw?.hotelName ?? '')
	const address = String(raw?.address ?? raw?.location ?? '')
	const image = String(raw?.image ?? raw?.coverImage ?? raw?.cover ?? '')
	const price = (() => {
		const direct = raw?.price ?? raw?.lowestPrice
		if (direct !== undefined) return toNumber(direct)
		const min = raw?.priceRange?.min
		return toNumber(min)
	})()
	const tags = (() => {
		if (Array.isArray(raw?.tags)) return asArray<string>(raw.tags).map((x) => String(x))
		if (Array.isArray(raw?.tagNames)) return asArray<string>(raw.tagNames).map((x) => String(x))
		return []
	})()

	return {
		id,
		name,
		address,
		star: toNumber(raw?.star),
		rating: toNumber(raw?.rating),
		reviewCount: toNumber(raw?.reviewCount ?? raw?.commentCount ?? raw?.comments),
		price,
		image,
		tags
	}
}

function normalizePagedHotels(raw: any): PagedResult<HotelListItem> {
	return {
		total: toNumber(raw?.total),
		page: toNumber(raw?.page, 1),
		pageSize: toNumber(raw?.pageSize, 10),
		items: asArray<any>(raw?.items).map(normalizeHotelListItem)
	}
}

export type QueryHotelsParams = {
	city?: string
	keyword?: string
	checkIn?: string
	checkOut?: string
	star?: string
	priceMin?: number
	priceMax?: number
	tags?: string
	sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'
	page?: number
	pageSize?: number
}

export async function queryHotels(params: QueryHotelsParams): Promise<ApiResponse<PagedResult<HotelListItem>>> {
	const resp = await apiRequest<ApiResponse<PagedResult<HotelListItem>>>( {
		url: '/hotels',
		method: 'GET',
		data: params
	})
	if (resp && typeof resp === 'object' && (resp as any).code === 200) {
		return {
			...(resp as any),
			data: normalizePagedHotels((resp as any).data)
		} as ApiResponse<PagedResult<HotelListItem>>
	}
	return resp
}

export async function getHotelDetail(
	hotelId: number,
	_params?: { checkIn?: string; checkOut?: string }
): Promise<ApiResponse<HotelDetail>> {
	const resp = await apiRequest<ApiResponse<HotelDetail>>({
		url: `/hotels/${hotelId}`,
		method: 'GET',
		data: _params
	})
	if (resp && typeof resp === 'object' && (resp as any).code === 200) {
		return {
			...(resp as any),
			data: normalizeHotelDetail((resp as any).data)
		} as ApiResponse<HotelDetail>
	}
	return resp
}

export async function getHotelPriceCalendar(
	hotelId: number,
	yearMonth?: string
): Promise<ApiResponse<HotelPriceCalendar>> {
	return apiRequest<ApiResponse<HotelPriceCalendar>>({
		url: `/hotels/${hotelId}/price-calendar`,
		method: 'GET',
		data: yearMonth ? { yearMonth } : undefined
	})
}

