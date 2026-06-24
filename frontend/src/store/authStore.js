import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ access_token, user }) => set({ token: access_token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'studytube-session',
    },
  ),
)
