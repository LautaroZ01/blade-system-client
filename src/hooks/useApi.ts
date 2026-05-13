import { useAuth } from '@clerk/react';
import api, { setAuthTokenGetter } from '../libs/axios';

/**
 * Hook que sincroniza el token de autenticación de Clerk
 * con la instancia centralizada de Axios (`libs/axios.ts`).
 *
 * Debe invocarse en al menos un componente padre (layout, vista, etc.)
 * para que las rutas protegidas del servidor funcionen correctamente.
 *
 * @returns La instancia de Axios configurada (por retrocompatibilidad).
 */
export const useApi = () => {
    const { getToken } = useAuth();

    // Registra/actualiza la referencia al token getter de Clerk
    // en cada render del componente que lo use.
    setAuthTokenGetter(getToken);

    return api;
};