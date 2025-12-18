import { create } from 'zustand'
import api from '@/lib/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data // Assuming backend returns { token, user } or similar

      // Based on the cURL, the token is in the response. 
      // We need to verify the exact response structure. 
      // Usually it's { token: "..." } or { data: { token: "..." } }
      // For now assuming standard { token: "..." } based on typical JWT flows.
      // If the backend returns just the token string or a different structure, we might need to adjust.
      // Let's assume response.data contains the token directly or inside a property.

      // Common pattern: response.data = { token: "...", user: { ... } }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        set({
          isAuthenticated: true,
          token: response.data.token,
          user: response.data.user || { username: credentials.username, role: response.data.role }, // Fallback if user not in response
          isLoading: false
        })
      } else {
        // If the backend returns the token directly as a string (less common but possible)
        // or if the structure is different.
        // Let's stick to the assumption of an object for now.
        throw new Error("Invalid response from server")
      }

    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
        token: null
      })
      throw error // Re-throw so the component can handle it if needed
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
