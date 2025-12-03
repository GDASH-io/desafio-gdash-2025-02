import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  signedIn: boolean;
  setAuth: (token: string | null, signedIn?: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      signedIn: false,
      setAuth: (token, signedIn) =>
        set({ accessToken: token, signedIn: signedIn ?? true }),
      logout: () => set({ accessToken: null, signedIn: false }),
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
