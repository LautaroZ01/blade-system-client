import axios from 'axios';
import { useAuth } from '@clerk/react';

export const useApi = () => {
    const { getToken } = useAuth();

    // 1. Creamos la instancia base de Axios
    const api = axios.create({
        // Usamos la variable de entorno que creamos ayer
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
    });

    // 2. Interceptor de Petición (Request)
    api.interceptors.request.use(
        async (config) => {
            // Obtenemos el token de Clerk de forma asíncrona
            const token = await getToken();

            // Si hay token, lo inyectamos en el header de Authorization
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 3. (Opcional pero recomendado) Interceptor de Respuesta (Response)
    // Para manejar errores globales, como cuando el token expira
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            // Si el backend nos devuelve un 401, podríamos forzar un logout o mostrar un toast
            if (error.response?.status === 401) {
                console.error("No autorizado o token expirado");
            }
            return Promise.reject(error);
        }
    );

    return api;
};