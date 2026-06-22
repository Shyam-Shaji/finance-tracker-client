import {create} from 'zustand';

type User = {
    id: string;
    avatarUrl?: string
    name: string;
    email: string;
    //add more
}

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: (user) => set({user, isAuthenticated: true, isLoading: false}),
    logout: () => set({user: null, isAuthenticated: false}),
    setLoading: (loading) => set({isLoading: loading}),
}));