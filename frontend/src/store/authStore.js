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

            refreshUser: async () => {
                try {
                    // Dynamic import to avoid circular dependency if possible, or just assume api is available
                    const { getUserProfile } = await import('../lib/api');
                    const userData = await getUserProfile();
                    set({ user: userData.user, company: userData.company });
                } catch (error) {
                    console.error("Failed to refresh user:", error);
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
)
