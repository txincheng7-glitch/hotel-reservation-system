export type Role = 'merchant' | 'admin'

export interface User {
  id: string
  username: string
  password: string
  role: Role
}

export type HotelStatus = 'draft' | 'pending' | 'published' | 'offline'

export interface Hotel {
  id: string
  nameZh: string
  nameEn?: string
  address: string
  star: number
  rooms: string[]
  price: number
  openDate: string
  nearby?: string
  discounts?: string
  status: HotelStatus
  merchantId: string
  approvedBy?: string
}
