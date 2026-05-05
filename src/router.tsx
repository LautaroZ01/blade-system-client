import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from 'sonner'
import Login from "./views/Login";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./views/Dashboard";
import Clients from "./views/Clients";
import ProfileClient from "./views/ProfileClient";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login/*" element={<Login />} />

                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clientes" element={<Clients />} />
                    <Route path="/clientes/:id" element={<ProfileClient />} />
                </Route>

            </Routes>
            <Toaster position="top-right" richColors />
        </BrowserRouter>
    )
}