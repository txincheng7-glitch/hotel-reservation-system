// 模拟后端接口，返回酒店示例数据，用于页面展示
type Hotel = {
  id: string
  ownerId?: string
  name_cn: string
  name_en?: string
  address: string
  star: number | string
  room_types: string[]
  price: number
  open_date: string
  extras?: string
  discounts?: string
  status?: 'draft' | 'pending' | 'published' | 'offline'
}

const sampleHotels: Hotel[] = [
  {
    id: 'h1',
    ownerId: 'm1',
    name_cn: '海悦大酒店',
    name_en: 'Haiyue Hotel',
    address: '南京市玄武区中山路100号',
    star: 5,
    room_types: ['大床房', '双床房', '套房'],
    price: 680,
    open_date: '2018-05-20',
    extras: '靠近博物馆/地铁站',
    discounts: '春节 8 折',
    status: 'published',
  },
  {
    id: 'h2',
    ownerId: 'm1',
    name_cn: '山水小居',
    name_en: 'Shanshui Inn',
    address: '苏州市观前街50号',
    star: 4,
    room_types: ['标准间', '家庭房'],
    price: 320,
    open_date: '2020-09-01',
    extras: '附近商场/公交枢纽',
    discounts: '周末立减50元',
    status: 'pending',
  },
  {
    id: 'h3',
    ownerId: 'm2',
    name_cn: '都市青年旅馆',
    name_en: 'Urban Youth Hostel',
    address: '成都市锦江区人民南路',
    star: 3,
    room_types: ['床位间', '双人间'],
    price: 120,
    open_date: '2022-03-15',
    extras: '周边美食多',
    discounts: '',
    status: 'draft',
  },
]

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

export const fetchMerchantHotels = async (merchantId: string) => {
  await delay(400)
  return sampleHotels.filter((h) => h.ownerId === merchantId)
}

export const fetchPendingHotels = async () => {
  await delay(400)
  return sampleHotels.filter((h) => h.status === 'pending')
}

export const fetchAllHotels = async () => {
  await delay(300)
  return sampleHotels
}

export default {
  fetchMerchantHotels,
  fetchPendingHotels,
  fetchAllHotels,
}
