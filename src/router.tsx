import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from 'sonner'
import Login from "./views/Login";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./views/Dashboard";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login/*" element={<Login />} />

                {/* Rutas Privadas (Protegidas por AppLayout) */}
                <Route element={<AppLayout />}>
                    {/* El dashboard principal usará el Outlet de AppLayout */}
                    <Route path="/" element={<Dashboard />} />
                    {/* Aquí agregaremos luego <Route path="/clientes" element={<ClientesView />} /> */}
                </Route>
            </Routes>
            <Toaster position="top-right" richColors />
        </BrowserRouter>
    )
}