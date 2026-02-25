export type ApiResponse<T> = {
  code: number
  message?: string
  data: T
}

export type PagedResult<T> = {
  total: number
  page: number
  pageSize: number
  items: T[]
}

export type HotelListItem = {
  id: number
  name: string
  address: string
  star: number
  rating: number
  reviewCount: number
  price: number
  image: string
  tags: string[]
}

export type HotelImage = {
  id: number
  url: string
  type: 'main' | 'room' | 'facility' | 'other'
}

export type HotelFacility = {
  id: number
  name: string
  icon: string
}

export type HotelRoom = {
  id: number
  type: string
  area: number
  bedType: string
  maxOccupancy: number
  price: number
  available: number
  images: string[]
  amenities: string[]
}

export type HotelPromotion = {
  id: number
  title: string
  description: string
  discount: number
}

export type HotelDetail = {
  id: number
  name: string
  address: string
  description: string
  star: number
  rating: number
  openingDate: string
  images: HotelImage[]
  facilities: HotelFacility[]
  tags: string[]
  rooms: HotelRoom[]
  promotions: HotelPromotion[]
}

export type PriceCalendarDay = {
  date: string
  lowestPrice: number
  available: boolean
}

export type HotelPriceCalendar = {
  hotelId: number
  yearMonth: string
  prices: PriceCalendarDay[]
}

export type Tag = {
  id: number
  name: string
  category: string
}

export type GuestInfo = {
  firstName: string
  lastName: string
  idType: string
  idNumber: string
  phone: string
}

export type CreateReservationRequest = {
  hotelId: number
  roomId: number
  checkIn: string
  checkOut: string
  guests: GuestInfo[]
  contactName: string
  contactPhone: string
  specialRequests?: string
}

export type ReservationResult = {
  reservationId: string
  totalPrice: number
  status: 'confirmed'
  createdAt: string
}

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed'

export type ReservationListItem = {
  id: string
  hotelName: string
  roomType: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: ReservationStatus
  createdAt: string
}

export type QueryReservationsParams = {
  status?: ReservationStatus
  page?: number
  pageSize?: number
}

export type ReservationListResult = {
  total: number
  items: ReservationListItem[]
}

export type CancelReservationResult = {
  id: string
  status: 'cancelled'
}

export type AuthRole = 'user' | 'merchant' | 'admin'

export type RegisterRequest = {
  username: string
  password: string
  email: string
  phone: string
  role?: AuthRole
}

export type RegisterResult = {
  id: number
  username: string
  email: string
  role: AuthRole
  createdAt: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type LoginUser = {
  id: number
  username: string
  role: AuthRole
}

export type LoginResult = {
  token: string
  expiresIn: number
  user: LoginUser
}

export type UserProfile = {
  id: number
  username: string
  email: string
  phone: string
  role: AuthRole
  createdAt: string
}
