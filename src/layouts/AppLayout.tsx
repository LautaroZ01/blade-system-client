import { useAuth, UserButton } from "@clerk/react";
import { Navigate, Outlet } from "react-router";

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
                    {/* Aquí irán luego los links a Inicio y Clientes */}
                    <div className="p-3 bg-maison-bg rounded-lg font-medium border border-maison-border">
                        Inicio
                    </div>
                    <div className="p-3 text-gray-500 hover:text-maison-text hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        Clientes
                    </div>
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