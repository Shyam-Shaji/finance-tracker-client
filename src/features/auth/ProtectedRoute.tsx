import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./authStore";
import { useEffect } from "react";
import api from "../../api/axios";

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading, login, logout, setLoading } = useAuthStore();

    //Verify token on mount(silent check)
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await api.get('/auth/me');
                login(response.data.data);
            } catch (error) {
                logout();
                setLoading(false);
            }
        };

        if (!isAuthenticated && isLoading) {
            verifyToken();
        }
    }, [isAuthenticated, isLoading, login, logout, setLoading]);

    if(isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};