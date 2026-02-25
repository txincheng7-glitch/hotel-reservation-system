import type { HotelDetail, HotelListItem } from './types'
import type { Tag } from './types'

type MockHotelListItem = HotelListItem & { city: string; facilities: string[] }

export const hotels: MockHotelListItem[] = [
	{
		id: 1,
		name: '上海外滩华尔道夫酒店',
		city: '上海',
		address: '黄浦区中山东一路2号',
		star: 5,
		rating: 4.8,
		reviewCount: 1234,
		price: 1800,
		image: 'https://picsum.photos/seed/hotel-1/600/400',
		tags: ['江景', '奢华', '亲子'],
		facilities: ['免费WiFi', '停车场', '泳池']
	},
	{
		id: 2,
		name: '北京国贸大酒店',
		city: '北京',
		address: '朝阳区建国门外大街1号',
		star: 5,
		rating: 4.7,
		reviewCount: 980,
		price: 1600,
		image: 'https://picsum.photos/seed/hotel-2/600/400',
		tags: ['商务', '地标'],
		facilities: ['免费WiFi', '健身房', '早餐']
	},
	{
		id: 3,
		name: '杭州西湖精品酒店',
		city: '杭州',
		address: '西湖区湖滨路88号',
		star: 4,
		rating: 4.6,
		reviewCount: 560,
		price: 880,
		image: 'https://picsum.photos/seed/hotel-3/600/400',
		tags: ['景区', '亲子'],
		facilities: ['免费WiFi', '停车场']
	}
]

export const hotelDetails: Record<number, HotelDetail> = {
	1: {
		id: 1,
		name: '上海外滩华尔道夫酒店',
		address: '黄浦区中山东一路2号',
		description: '坐落于外滩核心区，步行可达多处地标景点。',
		star: 5,
		rating: 4.8,
		openingDate: '2010-01',
		images: [
			{ id: 101, url: 'https://picsum.photos/seed/hotel-1-main/750/500', type: 'main' },
			{ id: 102, url: 'https://picsum.photos/seed/hotel-1-room/750/500', type: 'room' },
			{ id: 103, url: 'https://picsum.photos/seed/hotel-1-facility/750/500', type: 'facility' }
		],
		facilities: [
			{ id: 1, name: '免费WiFi', icon: 'wifi' },
			{ id: 2, name: '停车场', icon: 'parking' },
			{ id: 3, name: '泳池', icon: 'pool' }
		],
		tags: ['江景', '奢华', '亲子'],
		rooms: [
			{
				id: 201,
				type: '豪华大床房',
				area: 45,
				bedType: '大床 (1.8米)',
				maxOccupancy: 2,
				price: 1800,
				available: 5,
				images: ['https://picsum.photos/seed/hotel-1-room-201/600/400'],
				amenities: ['浴缸', '迷你吧']
			},
			{
				id: 202,
				type: '行政套房',
				area: 80,
				bedType: '特大床 (2米)',
				maxOccupancy: 3,
				price: 3500,
				available: 2,
				images: ['https://picsum.photos/seed/hotel-1-room-202/600/400'],
				amenities: ['浴缸', '客厅', '咖啡机']
			}
		],
		promotions: [
			{
				id: 301,
				title: '早鸟优惠',
				description: '提前7天预订享8折',
				discount: 0.8
			}
		]
	},
	2: {
		id: 2,
		name: '北京国贸大酒店',
		address: '朝阳区建国门外大街1号',
		description: '位于国贸商圈，出行便捷，适合商务出差。',
		star: 5,
		rating: 4.7,
		openingDate: '2008-09',
		images: [
			{ id: 201, url: 'https://picsum.photos/seed/hotel-2-main/750/500', type: 'main' },
			{ id: 202, url: 'https://picsum.photos/seed/hotel-2-room/750/500', type: 'room' }
		],
		facilities: [
			{ id: 1, name: '免费WiFi', icon: 'wifi' },
			{ id: 4, name: '健身房', icon: 'gym' },
			{ id: 5, name: '早餐', icon: 'breakfast' }
		],
		tags: ['商务', '地标'],
		rooms: [
			{
				id: 211,
				type: '高级大床房',
				area: 40,
				bedType: '大床 (1.8米)',
				maxOccupancy: 2,
				price: 1600,
				available: 8,
				images: ['https://picsum.photos/seed/hotel-2-room-211/600/400'],
				amenities: ['书桌', '咖啡机']
			}
		],
		promotions: []
	},
	3: {
		id: 3,
		name: '杭州西湖精品酒店',
		address: '西湖区湖滨路88号',
		description: '步行可达西湖，适合周末度假与亲子出游。',
		star: 4,
		rating: 4.6,
		openingDate: '2016-05',
		images: [
			{ id: 301, url: 'https://picsum.photos/seed/hotel-3-main/750/500', type: 'main' },
			{ id: 302, url: 'https://picsum.photos/seed/hotel-3-room/750/500', type: 'room' }
		],
		facilities: [
			{ id: 1, name: '免费WiFi', icon: 'wifi' },
			{ id: 2, name: '停车场', icon: 'parking' }
		],
		tags: ['景区', '亲子'],
		rooms: [
			{
				id: 311,
				type: '景观双床房',
				area: 35,
				bedType: '双床 (1.2米)',
				maxOccupancy: 2,
				price: 880,
				available: 11,
				images: ['https://picsum.photos/seed/hotel-3-room-311/600/400'],
				amenities: ['茶具', '浴缸']
			}
		],
		promotions: []
	}
}

export const tags: Tag[] = [
	{ id: 1, name: '亲子', category: 'theme' },
	{ id: 2, name: '商务', category: 'theme' },
	{ id: 3, name: '奢华', category: 'theme' },
	{ id: 4, name: '江景', category: 'view' },
	{ id: 5, name: '免费停车场', category: 'facility' },
	{ id: 6, name: '含早餐', category: 'facility' }
]

