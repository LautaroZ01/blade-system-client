import axios from 'axios';

// ⭐️ Le enseñamos a TypeScript la estructura exacta de Clerk en el objeto window
declare global {
    interface Window {
        Clerk?: {
            session?: {
                getToken: () => Promise<string | null>;
            };
        };
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// ─── Interceptors ───────────────────────────────────────────────────────────

// Request: Inyecta el Bearer token leyendo Clerk directamente del navegador
api.interceptors.request.use(
    async (config) => {
        // Ahora TypeScript sabe perfectamente qué es window.Clerk y qué métodos tiene
        const clerk = window.Clerk;

        // Si Clerk ya inicializó y hay una sesión activa, sacamos el token
        if (clerk?.session) {
            const token = await clerk.session.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response: Manejo global de errores
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