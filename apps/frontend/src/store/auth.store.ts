import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi, setTokens, clearTokens } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ENGINEER' | 'CLIENT' | 'ADMIN'
  avatarUrl?: string
  engineerProfile?: any
  clientProfile?: any
}

interface AuthState {
  user:          User | null
  accessToken:   string | null
  refreshToken:  string | null
  isLoading:     boolean
  isInitialized: boolean

  login:         (email: string, password: string) => Promise<void>
  register:      (data: RegisterData) => Promise<void>
  logout:        () => Promise<void>
  setUser:       (user: User) => void
  initialize:    () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'ENGINEER' | 'CLIENT'
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:          null,
      accessToken:   null,
      refreshToken:  null,
      isLoading:     false,
      isInitialized: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res: any = await authApi.login({ email, password })
          const { user, accessToken, refreshToken } = res.data
          setTokens(accessToken, refreshToken)
          set({ user, accessToken, refreshToken, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const res: any = await authApi.register(data)
          const { user, accessToken, refreshToken } = res.data
          setTokens(accessToken, refreshToken)
          set({ user, accessToken, refreshToken, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          await authApi.logout(refreshToken ?? undefined)
        } catch {}
        clearTokens()
        set({ user: null, accessToken: null, refreshToken: null })
      },

      setUser: (user) => set({ user }),

      initialize: async () => {
        const { accessToken } = get()
        if (!accessToken) {
          set({ isInitialized: true })
          return
        }
        try {
          const res: any = await authApi.me()
          set({ user: res.data, isInitialized: true })
        } catch {
          clearTokens()
          set({ user: null, accessToken: null, refreshToken: null, isInitialized: true })
        }
      },
    }),
    {
      name: 'injeniorw-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        user:         state.user,
      }),
    },
  ),
)

// Convenience selectors
export const useUser          = () => useAuthStore((s) => s.user)
export const useIsEngineer    = () => useAuthStore((s) => s.user?.role === 'ENGINEER')
export const useIsClient      = () => useAuthStore((s) => s.user?.role === 'CLIENT')
export const useIsAdmin       = () => useAuthStore((s) => s.user?.role === 'ADMIN')
export const useIsLoggedIn    = () => useAuthStore((s) => !!s.user)
