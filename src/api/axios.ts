import axios from "axios";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type' : 'application/json'
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Response Interceptor + Token Refresh + Retry
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if(error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry) {
            if(isRefreshing){
                return new Promise((resolve,reject) => {
                    failedQueue.push({resolve,reject});
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
                processQueue(null);
                return api(originalRequest);
            }catch(refreshError){
                processQueue(refreshError);
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }finally{
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default api;