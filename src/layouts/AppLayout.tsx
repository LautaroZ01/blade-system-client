import { useAuth, UserButton } from "@clerk/react";
import { Navigate, NavLink, Outlet } from "react-router";

export default function AppLayout() {
    const { isLoaded, userId } = useAuth();

    // Mientras Clerk verifica la sesión, mostramos un estado de carga
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-maison-bg text-maison-text">
                Cargando...
            </div>
        );
    }

    // Si terminó de cargar y no hay usuario, lo redirigimos al login
    if (!userId) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderizamos el panel de control
    return (
        <div className="flex min-h-screen bg-maison-bg text-maison-text font-sans">
            {/* Sidebar (Menú Lateral) */}
            <aside className="w-64 bg-maison-card border-r border-maison-border flex flex-col">
                <div className="p-6 border-b border-maison-border flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-serif font-bold tracking-wide">Maison</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Estudio · CRM</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => `block p-3 rounded-lg font-medium transition-colors ${isActive
                            ? 'bg-maison-bg text-maison-text border border-maison-border'
                            : 'text-gray-500 hover:text-maison-text hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/clientes"
                        className={({ isActive }) => `block p-3 rounded-lg font-medium transition-colors ${isActive
                            ? 'bg-maison-bg text-maison-text border border-maison-border'
                            : 'text-gray-500 hover:text-maison-text hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        Clientes
                    </NavLink>
                    <NavLink
                        to="/servicios"
                        className={({ isActive }) => `block p-3 rounded-lg font-medium transition-colors ${isActive
                            ? 'bg-maison-bg text-maison-text border border-maison-border'
                            : 'text-gray-500 hover:text-maison-text hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        Servicios
                    </NavLink>
                    <NavLink
                        to="/inventario"
                        className={({ isActive }) => `block p-3 rounded-lg font-medium transition-colors ${isActive
                            ? 'bg-maison-bg text-maison-text border border-maison-border'
                            : 'text-gray-500 hover:text-maison-text hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        <span className="font-medium">Inventario</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-maison-border flex items-center gap-3">
                    <UserButton />
                    <span className="text-sm font-medium">Mi Cuenta</span>
                </div>
            </aside>

            {/* Área de Contenido Principal donde se renderizarán las rutas hijas */}
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}