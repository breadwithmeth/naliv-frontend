import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  user_id: number
  name: string
  login: string
  log_timestamp: string
}

interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
    session_token: string
  }
  message: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  sendCode: (phoneNumber: string) => Promise<{ success: boolean; message: string }>
  verifyCode: (phoneNumber: string, code: string) => Promise<{ success: boolean; message: string; user?: User }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setToken(savedToken)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    
    setLoading(false)
  }, [])

  const sendCode = async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      })

      const data = await response.json()
      
      if (data.success) {
        return { success: true, message: 'Код отправлен на ваш номер телефона' }
      } else {
        return { success: false, message: data.message || 'Ошибка отправки кода' }
      }
    } catch (error) {
      console.error('Error sending code:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  const verifyCode = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          onetime_code: code 
        }),
      })

      const data: AuthResponse = await response.json()
      
      if (data.success) {
        // Сохраняем данные пользователя
        setUser(data.data.user)
        setToken(data.data.token)
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('session_token', data.data.session_token)
        
        return { 
          success: true, 
          message: 'Авторизация успешна',
          user: data.data.user 
        }
      } else {
        return { success: false, message: data.message || 'Неверный код' }
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      return { success: false, message: 'Ошибка соединения с сервером' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('session_token')
  }

  const isAuthenticated = !!user && !!token

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    sendCode,
    verifyCode,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
