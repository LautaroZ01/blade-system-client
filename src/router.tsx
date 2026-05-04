import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from 'sonner'
import Login from "./views/Login";
import AppLayout from "./layouts/AppLayout";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login/*" element={<Login />} />

                {/* Rutas Privadas (Protegidas por AppLayout) */}
                <Route element={<AppLayout />}>
                    {/* El dashboard principal usará el Outlet de AppLayout */}
                    <Route path="/" element={
                        <div>
                            <h2 className="text-sm font-semibold tracking-wider text-gray-500 mb-2 uppercase">Panel Principal</h2>
                            <h3 className="text-4xl font-serif mb-2">Buen día</h3>
                            <p className="text-gray-500">Aquí está el resumen de tu estudio hoy.</p>
                        </div>
                    } />
                    {/* Aquí agregaremos luego <Route path="/clientes" element={<ClientesView />} /> */}
                </Route>
            </Routes>
            <Toaster position="top-right" richColors />
        </BrowserRouter>
    )
}