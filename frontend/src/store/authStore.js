import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            company: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (authData) => set({
                user: authData.user,
                company: authData.company,
                accessToken: authData.tokens.accessToken,
                refreshToken: authData.tokens.refreshToken,
                isAuthenticated: true,
            }),

            logout: () => set({
                user: null,
                company: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            }),

            updateAccessToken: (token) => set({ accessToken: token }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
