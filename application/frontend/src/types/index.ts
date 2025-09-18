export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'attendee' | 'organizer' | 'admin'
  marketingConsent: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Event {
  _id: string
  organizerId: {
    _id: string
    name: string
    email: string
  }
  title: string
  slug: string
  description: string
  category: string
  venue: {
    name: string
    address: string
    capacity: number
    timezone: string
  }
  startAt: string
  endAt: string
  status: 'draft' | 'published' | 'cancelled'
  images: string[]
  seatmap?: {
    type: 'reserved' | 'ga'
    svg?: string
    seats?: Seat[]
  }
  createdAt: string
  updatedAt: string
}

export interface Seat {
  seatId: string
  section: string
  row: string
  number: string
  priceModifier: number
  accessible: boolean
}

export interface TicketType {
  _id: string
  eventId: string
  name: string
  priceCents: number
  currency: string
  capacity: number
  salesStart: string
  salesEnd: string
  refundable: boolean
  soldCount: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  ticketTypeId: string
  quantity: number
  priceCents: number
  seatId?: string
  addedAt: string
}

export interface Cart {
  items: CartItem[]
  totalCents: number
  itemCount: number
  sessionId: string
}

export interface Order {
  _id: string
  userId?: string
  email: string
  items: OrderItem[]
  totalCents: number
  feesCents: number
  taxCents: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  paymentProvider: string
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  ticketTypeId: string
  seatId?: string
  priceCents: number
  qty: number
}

export interface Ticket {
  _id: string
  orderId: string
  eventId: string
  ticketTypeId: string
  seatId?: string
  ticketUUID: string
  qrPayload: string
  pdfUrl?: string
  status: 'issued' | 'used' | 'refunded'
  issuedAt: string
  usedAt?: string
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  status: number
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
