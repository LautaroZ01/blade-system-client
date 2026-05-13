import axios from 'axios';

/**
 * Instancia centralizada de Axios.
 * Todas las funciones del API layer (`src/api/*`) la importan directamente,
 * eliminando la necesidad de recibir `api: AxiosInstance` como parámetro.
 *
 * La autenticación se inyecta dinámicamente via `setAuthTokenGetter()`,
 * que es invocado por el hook `useApi` en el contexto de React (Clerk).
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// ─── Auth Token Management ──────────────────────────────────────────────────

/** Función registrada por `useApi` que obtiene el JWT de Clerk */
let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Registra la función que provee el token de autenticación.
 * Llamada por `useApi()` cada vez que un componente la invoca,
 * asegurando que siempre tenga la referencia más reciente de Clerk.
 */
export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
    tokenGetter = getter;
};

// ─── Interceptors ───────────────────────────────────────────────────────────

// Request: Inyecta el Bearer token en cada petición
api.interceptors.request.use(
    async (config) => {
        if (tokenGetter) {
            const token = await tokenGetter();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response: Manejo global de errores de autenticación
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('No autorizado o token expirado');
        }
        return Promise.reject(error);
    }
);

export default api;
