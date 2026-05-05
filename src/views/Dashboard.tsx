import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUsers, FiScissors, FiCalendar, FiPlus, FiCheck } from 'react-icons/fi';
import { toast } from 'sonner';
import { useApi } from '../hooks/useApi';
import type { ServiceRecord } from '../types';
import { formatDate, getTimelineStatus } from '../utils/dates';
import RegistroModal from '../components/RegistroModal';

export default function Dashboard() {
    const api = useApi();
    const queryClient = useQueryClient();
    const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);

    // 1. NUEVA QUERY: Estadísticas Reales
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/dashboard/stats'); // Ajusta la ruta si le pusiste otro nombre
            return response.data;
        }
    });

    const { data: retoques, isLoading: isLoadingRetoques } = useQuery<ServiceRecord[]>({
        queryKey: ['upcoming-touchups'],
        queryFn: async () => (await api.get('/registros/retoques')).data
    });

    const { data: recientes, isLoading: isLoadingRecientes } = useQuery<ServiceRecord[]>({
        queryKey: ['recent-movements'],
        queryFn: async () => (await api.get('/registros/recientes')).data
    });

    const { mutate: completarRetoque } = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.put(`/registros/${id}`, { touchupStatus: 'completed' });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Retoque marcado como completado', {
                style: { background: '#FDFBF7', color: '#54A885', borderColor: '#54A885' }
            });
            // Invalidamos estadísticas y retoques
            queryClient.invalidateQueries({ queryKey: ['upcoming-touchups'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
        onError: () => toast.error('Error al actualizar el estado')
    });

    // Validamos si algo está cargando para mostrar toda la pantalla en modo Skeleton
    const isDashboardLoading = isLoadingStats || isLoadingRetoques || isLoadingRecientes;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cabecera */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xs font-semibold tracking-widest text-gray-400 mb-2 uppercase">
                        Panel Principal
                    </h2>
                    <h3 className="text-4xl font-serif text-maison-text">
                        Buen día, Maison ✿
                    </h3>
                </div>

                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm">
                        Directorio
                    </button>
                    <button
                        onClick={() => setIsRegistroModalOpen(true)}
                        className="bg-maison-primary hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                    >
                        <FiPlus /> Nueva Visita
                    </button>
                </div>
            </header>

            {/* ⭐️ BENTO GRID CON SKELETONS ⭐️ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {isDashboardLoading ? (
                    // Skeletons para las tarjetas superiores
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                            <div className="space-y-2 flex-1 mt-1">
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/4 mt-2"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Tarjetas Reales
                    <>
                        <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                            <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                                <FiUsers className="text-xl text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Total de Clientes</h4>
                                <span className="text-3xl font-serif">{stats?.totalClients || 0}</span>
                            </div>
                        </div>
                        <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                            <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                                <FiScissors className="text-xl text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Servicios Realizados</h4>
                                <span className="text-3xl font-serif">{stats?.servicesDone || 0}</span>
                            </div>
                        </div>
                        <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                            <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                                <FiCalendar className="text-xl text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Próximos Retoques</h4>
                                <span className="text-3xl font-serif">{stats?.upcomingTouchups || 0}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* COLUMNAS INFERIORES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ⭐️ LÍNEA DE TIEMPO CON SKELETONS ⭐️ */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h4 className="text-xl font-serif">Próximos retoques</h4>
                            <p className="text-sm text-gray-400 mt-1">Historial de retoques pendientes</p>
                        </div>
                    </div>

                    {isDashboardLoading ? (
                        // Skeletons de la línea de tiempo
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 animate-pulse ml-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    ) : retoques?.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No hay retoques pendientes.</p>
                    ) : (
                        <div className="relative pl-3 border-l-2 border-maison-border space-y-4 py-2 ml-2">
                            {retoques?.map((registro) => {
                                if (!registro.nextTouchupDate) return null;
                                const status = getTimelineStatus(registro.nextTouchupDate);
                                const initials = registro.client.firstName.charAt(0).toUpperCase();

                                return (
                                    <div key={registro._id} className="relative flex justify-between items-center bg-white border border-maison-border rounded-xl p-4 shadow-sm ml-6 hover:border-gray-300 transition-colors group">
                                        <div className={`absolute left-[-45px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${status.dotColor} ring-4 ring-white`}></div>
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
                                        <div className="text-right flex flex-col items-end">
                                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-1.5 ${status.pillClass}`}>
                                                {status.label}
                                            </span>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {formatDate(registro.nextTouchupDate)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => completarRetoque(registro._id)}
                                            title="Marcar retoque como realizado"
                                            className="absolute -right-3 -top-3 w-8 h-8 bg-maison-bg border border-maison-border rounded-full flex items-center justify-center text-gray-400 hover:text-maison-green hover:border-maison-green opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                                        >
                                            <FiCheck size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ⭐️ ÚLTIMOS MOVIMIENTOS CON SKELETONS ⭐️ */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <h4 className="text-xl font-serif">Últimos movimientos</h4>
                    <p className="text-sm text-gray-400 mt-1 mb-8">Servicios recientemente registrados</p>

                    {isDashboardLoading ? (
                        <div className="space-y-5 flex-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex justify-between items-center animate-pulse">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            ))}
                        </div>
                    ) : recientes?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay servicios recientes.</p>
                    ) : (
                        <ul className="space-y-6 pl-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {recientes?.map((registro) => (
                                <li key={registro._id} className="relative pl-5 group">
                                    <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-maison-text transition-colors"></span>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-maison-text text-sm">
                                                {registro.client.firstName} {registro.client.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{registro.service.name}</p>
                                        </div>
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

            <RegistroModal
                isOpen={isRegistroModalOpen}
                onClose={() => setIsRegistroModalOpen(false)}
            />
        </div>
    );
}