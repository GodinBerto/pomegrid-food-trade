import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface UserStore {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
  setUser: (user) => set({ user }),
}));
