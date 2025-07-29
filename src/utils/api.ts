/**
 * Утилита для работы с API URL
 * Получает базовый URL API из переменных окружения
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Получить базовый URL API
 */
export const getApiUrl = (): string => {
  return API_BASE_URL
}

/**
 * Создать полный URL для API endpoint
 * @param endpoint - путь к API endpoint (например, '/api/users')
 */
export const createApiUrl = (endpoint: string): string => {
  // Убираем лишние слеши
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${cleanEndpoint}`
}

/**
 * Создать URL для API endpoint с query параметрами
 * @param endpoint - путь к API endpoint
 * @param params - объект с query параметрами
 */
export const createApiUrlWithParams = (
  endpoint: string, 
  params: Record<string, string | number | boolean | undefined>
): string => {
  const baseUrl = createApiUrl(endpoint)
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
