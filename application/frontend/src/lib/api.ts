import axios, { AxiosResponse } from 'axios'
import { Event, TicketType, Cart, Order, Ticket, User, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
    marketingConsent?: boolean
    role?: 'attendee' | 'organizer'
  }) => api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getProfile: () => api.get<User>('/auth/me'),
  
  updateProfile: (data: { name?: string; phone?: string; marketingConsent?: boolean; profilePicture?: string }) =>
    api.put('/auth/me', data),
  
  uploadProfilePicture: (formData: FormData) =>
    api.post('/auth/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  upgradeToOrganizer: () => api.put('/users/me/upgrade-to-organizer'),
}

// Events API
export const eventsApi = {
  getEvents: (params?: {
    category?: string
    startDate?: string
    endDate?: string
    location?: string
    page?: number
    limit?: number
  }) => api.get<{ events: Event[]; pagination: any }>('/events', { params }),
  
  getEvent: (id: string) => api.get<Event>(`/events/${id}`),
  
  getEventBySlug: (slug: string) => api.get<Event>(`/events/slug/${slug}`),
  
  getMyEvents: (params?: { page?: number; limit?: number }) =>
    api.get<{ events: Event[]; pagination: any }>('/events/my-events', { params }),
  
  createEvent: (data: any) => api.post<Event>('/events', data),
  
  updateEvent: (id: string, data: any) => api.put<Event>(`/events/${id}`, data),
  
  publishEvent: (id: string) => api.put<Event>(`/events/${id}/publish`),
  
  deleteEvent: (id: string) => api.delete(`/events/${id}`),
  
  uploadEventImage: (id: string, formData: FormData) => 
    api.post(`/events/${id}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
}

// Ticket Types API
export const ticketTypesApi = {
  getTicketTypes: (eventId: string) =>
    api.get<TicketType[]>(`/ticket-types/event/${eventId}`),
  
  getTicketType: (id: string) => api.get<TicketType>(`/ticket-types/${id}`),
  
  getAvailability: (id: string) =>
    api.get<{ availableCapacity: number }>(`/ticket-types/${id}/availability`),
  
  getOnSaleStatus: (id: string) =>
    api.get<{ isOnSale: boolean }>(`/ticket-types/${id}/on-sale`),
  
  createTicketType: (eventId: string, data: any) =>
    api.post<TicketType>(`/ticket-types/event/${eventId}`, data),
  
  updateTicketType: (id: string, data: any) =>
    api.put<TicketType>(`/ticket-types/${id}`, data),
  
  deleteTicketType: (id: string) => api.delete(`/ticket-types/${id}`),
}

// Cart API
export const cartApi = {
  getCart: (sessionId: string) =>
    api.get<Cart>(`/cart?sessionId=${sessionId}`),
  
  addToCart: (sessionId: string, data: {
    ticketTypeId: string
    quantity: number
    seatId?: string
  }) => api.post<Cart>(`/cart/add?sessionId=${sessionId}`, data),
  
  updateCartItem: (
    sessionId: string,
    ticketTypeId: string,
    data: { quantity: number },
    seatId?: string
  ) => api.put<Cart>(
    `/cart/item/${ticketTypeId}?sessionId=${sessionId}${seatId ? `&seatId=${seatId}` : ''}`,
    data
  ),
  
  removeFromCart: (sessionId: string, ticketTypeId: string, seatId?: string) =>
    api.delete<Cart>(
      `/cart/item/${ticketTypeId}?sessionId=${sessionId}${seatId ? `&seatId=${seatId}` : ''}`
    ),
  
  clearCart: (sessionId: string) =>
    api.delete(`/cart/clear?sessionId=${sessionId}`),
  
  validateCart: (sessionId: string) =>
    api.get<{ isValid: boolean; errors: string[] }>(`/cart/validate?sessionId=${sessionId}`),
}

// Orders API
export const ordersApi = {
  createOrder: (data: any, sessionId?: string) =>
    api.post<Order>(`/orders${sessionId ? `?sessionId=${sessionId}` : ''}`, data),
  
  getOrder: (id: string) => api.get<Order>(`/orders/${id}`),
  
  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get<{ orders: Order[]; pagination: any }>('/orders/my-orders', { params }),
  
  getOrdersByEmail: (email: string, params?: { page?: number; limit?: number }) =>
    api.get<{ orders: Order[]; pagination: any }>(`/orders/by-email?email=${email}`, { params }),
  
  cancelOrder: (id: string) => api.put<Order>(`/orders/${id}/cancel`),
  
  getEventStats: (eventId: string) =>
    api.get(`/orders/stats/event/${eventId}`),
  
  getOverallStats: () => api.get('/orders/stats/overview'),
}

// Payments API
export const paymentsApi = {
  createPaymentIntent: (data: any) =>
    api.post<{
      clientSecret: string
      orderId: string
      paymentIntentId: string
    }>('/payments/create-payment-intent', data),
  
  createRefund: (data: { paymentIntentId: string; amount?: number }) =>
    api.post('/payments/refund', data),
}

// Tickets API
export const ticketsApi = {
  getTicketsByOrder: (orderId: string) =>
    api.get<Ticket[]>(`/tickets/order/${orderId}`),
  
  getMyTickets: () => api.get<Ticket[]>('/tickets/my-tickets'),
  
  validateTicket: (qrPayload: string) =>
    api.post<{ valid: boolean; ticket?: Ticket; message: string }>(
      '/tickets/validate',
      { qrPayload }
    ),
  
  markTicketAsUsed: (ticketId: string) =>
    api.post<Ticket>(`/tickets/${ticketId}/use`),
}

export default api
