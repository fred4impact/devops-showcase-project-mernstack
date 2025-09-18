'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { authApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    password: string
    phone?: string
    marketingConsent?: boolean
    role?: 'attendee' | 'organizer'
  }) => Promise<void>
  logout: () => void
  updateProfile: (data: any) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await authApi.getProfile()
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      toast.success('Welcome back!')
      router.push('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone?: string
    marketingConsent?: boolean
    role?: 'attendee' | 'organizer'
  }) => {
    try {
      const response = await authApi.register(data)
      const { user: userData, token } = response.data
      
      localStorage.setItem('token', token)
      setUser(userData)
      
      toast.success('Account created successfully!')
      router.push('/')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const updateProfile = async (data: any) => {
    try {
      const response = await authApi.updateProfile(data)
      setUser(response.data)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed')
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      toast.success('Password changed successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password change failed')
      throw error
    }
  }

  const updateUser = (user: User) => {
    setUser(user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
