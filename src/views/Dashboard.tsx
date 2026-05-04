import { FiCalendar, FiScissors, FiUsers } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { FaArrowRight } from "react-icons/fa";
import { useApi } from "../hooks/useApi";
import type { ServiceRecord } from "../types";
import { formatDate, getTimelineStatus } from "../utils/dates";
import { Link } from "react-router";

export default function Dashboard() {
    const api = useApi();

    const { data: retoques, isLoading, isError } = useQuery<ServiceRecord[]>({
        queryKey: ['upcoming-touchups'],
        queryFn: async () => {
            const response = await api.get('/registros/retoques');
            return response.data;
        }
    });

    // Nueva query para los últimos movimientos
    const { data: recientes, isLoading: isLoadingRecientes } = useQuery<ServiceRecord[]>({
        queryKey: ['recent-movements'],
        queryFn: async () => {
            const response = await api.get('/registros/recientes');
            return response.data;
        }
    });

    const mockStats = {
        totalClients: 5,
        servicesDone: 7,
        upcomingTouchups: 7
    };

    if (isLoading) return <div className="p-4 text-gray-500">Cargando próximos retoques...</div>;
    if (isError) return <div className="p-4 text-maison-red">Error al cargar los datos.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cabecera... (Se mantiene igual) */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xs font-semibold tracking-widest text-gray-400 mb-2 uppercase">
                        Panel Principal
                    </h2>
                    <h3 className="text-4xl font-serif text-maison-text">
                        Buen día, Maison ✿
                    </h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        Aquí está el resumen de tu estudio hoy.
                    </p>
                </div>
                <Link
                    to="/clientes"
                    className="bg-maison-primary hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm">
                    Ver clientes <FaArrowRight />
                </Link>
            </header>

            {/* Bento Grid Superior... (Se mantiene igual) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* ... (Tus 3 tarjetas de stats) ... */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiUsers className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Total de Clientes</h4>
                        <span className="text-3xl font-serif">{mockStats.totalClients}</span>
                    </div>
                </div>
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiScissors className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Servicios Realizados</h4>
                        <span className="text-3xl font-serif">{mockStats.servicesDone}</span>
                    </div>
                </div>
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiCalendar className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Próximos Retoques</h4>
                        <span className="text-3xl font-serif">{mockStats.upcomingTouchups}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ⭐️ COLUMNA IZQUIERDA: LÍNEA DE TIEMPO VISUAL ⭐️ */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6 shadow-sm">

                    {/* Título y Leyenda de Colores */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h4 className="text-xl font-serif">Próximos retoques</h4>
                            <p className="text-sm text-gray-400 mt-1">Historial de retoques pendientes</p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-maison-red"></span> Hoy / Atrasado</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-maison-orange"></span> 1-7 Días</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-maison-green"></span> +1 Sem</span>
                        </div>
                    </div>

                    {retoques?.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No hay retoques pendientes.</p>
                    ) : (
                        /* Contenedor de la línea vertical */
                        <div className="relative pl-3 border-l-2 border-maison-border space-y-4 py-2 ml-2">

                            {retoques?.map((registro) => {
                                if (!registro.nextTouchupDate) return null;

                                const status = getTimelineStatus(registro.nextTouchupDate);
                                // Extraemos la inicial del cliente para el Avatar
                                const initials = registro.client.firstName.charAt(0).toUpperCase();

                                return (
                                    <div key={registro._id} className="relative flex justify-between items-center bg-white border border-maison-border rounded-xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] ml-6 hover:border-gray-300 transition-colors">

                                        {/* El Punto de Color en la Línea */}
                                        {/* ring-4 ring-white hace un espacio blanco alrededor del punto para "cortar" la línea vertical */}
                                        <div className={`absolute left-[-45px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${status.dotColor} ring-4 ring-white`}></div>

                                        {/* Lado Izquierdo: Avatar, Nombre y Servicio */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-maison-bg border border-maison-border flex items-center justify-center font-serif text-lg text-maison-text shadow-sm">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-maison-text">
                                                    {registro.client.firstName} {registro.client.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">{registro.service.name}</p>
                                            </div>
                                        </div>

                                        {/* Lado Derecho: Píldora de estado y Fecha exacta */}
                                        <div className="text-right flex flex-col items-end">
                                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-1.5 ${status.pillClass}`}>
                                                {status.label}
                                            </span>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {formatDate(registro.nextTouchupDate)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Últimos Movimientos */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <h4 className="text-xl font-serif">Últimos movimientos</h4>
                    <p className="text-sm text-gray-400 mt-1 mb-8">Servicios recientemente registrados</p>

                    {isLoadingRecientes ? (
                        <p className="text-gray-500 text-sm">Cargando movimientos...</p>
                    ) : recientes?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay servicios recientes.</p>
                    ) : (
                        <ul className="space-y-6 pl-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {recientes?.map((registro) => (
                                <li key={registro._id} className="relative pl-5 group">
                                    {/* Pequeño punto gris minimalista */}
                                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-maison-text transition-colors"></span>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-maison-text text-sm">
                                                {registro.client.firstName} {registro.client.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{registro.service.name}</p>
                                        </div>
                                        {/* Fecha formateada */}
                                        <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                                            {formatDate(registro.createdAt)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}