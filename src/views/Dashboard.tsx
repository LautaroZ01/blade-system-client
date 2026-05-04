import { useQuery } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';
import { type ServiceRecord } from '../types';
// Importamos los iconos de react-icons (usaremos los de Heroicons o Feather que son limpios)
import { FiUsers, FiScissors, FiCalendar } from 'react-icons/fi';
import { FaArrowRight } from 'react-icons/fa6';

export default function Dashboard() {
    const api = useApi();

    const { data: retoques, isLoading, isError } = useQuery<ServiceRecord[]>({
        queryKey: ['upcoming-touchups'],
        queryFn: async () => {
            const response = await api.get('/registros/retoques');
            return response.data;
        }
    });

    // TODO: A futuro, esto vendrá de un endpoint como /api/dashboard/stats
    const mockStats = {
        totalClients: 5,
        servicesDone: 7,
        upcomingTouchups: 7
    };

    if (isLoading) return <div className="p-4 text-gray-500">Cargando próximos retoques...</div>;
    if (isError) return <div className="p-4 text-maison-red">Error al cargar los datos.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cabecera del Dashboard */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xs font-semibold tracking-widest text-gray-400 mb-2 uppercase">
                        Panel Principal
                    </h2>
                    {/* El icono de la flor lo podemos simular con un emoji o SVG personalizado luego */}
                    <h3 className="text-4xl font-serif text-maison-text">
                        Buen día, Maison ✿
                    </h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        Aquí está el resumen de tu estudio hoy.
                    </p>
                </div>

                {/* Botón superior derecho "Ver clientes ->" */}
                <button className="bg-maison-primary hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer">
                    Ver clientes <FaArrowRight />
                </button>
            </header>

            {/* BENTO GRID: Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Tarjeta 1: Total de Clientes */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiUsers className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                            Total de Clientes
                        </h4>
                        <span className="text-3xl font-serif">{mockStats.totalClients}</span>
                    </div>
                </div>

                {/* Tarjeta 2: Servicios Realizados */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiScissors className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                            Servicios Realizados
                        </h4>
                        <span className="text-3xl font-serif">{mockStats.servicesDone}</span>
                    </div>
                </div>

                {/* Tarjeta 3: Próximos Retoques */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-maison-bg p-3 rounded-xl border border-maison-border">
                        <FiCalendar className="text-xl text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
                            Próximos Retoques
                        </h4>
                        <span className="text-3xl font-serif">{mockStats.upcomingTouchups}</span>
                    </div>
                </div>
            </div>

            {/* Grid inferior para las listas (Retoques y Últimos Movimientos) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Columna Izquierda: Lista de Próximos Retoques */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6">
                    <h4 className="text-xl font-serif mb-4">Próximos retoques</h4>

                    {retoques?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No hay retoques pendientes.</p>
                    ) : (
                        <ul className="space-y-4">
                            {retoques?.map((registro) => (
                                <li key={registro._id} className="flex justify-between items-center border border-maison-border rounded-xl p-4">
                                    <div>
                                        <p className="font-medium text-maison-text">
                                            {registro.client.firstName} {registro.client.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{registro.service.name}</p>
                                    </div>
                                    <span className="text-sm font-medium px-3 py-1 bg-maison-bg rounded-full border border-maison-border">
                                        {registro.nextTouchupDate ? new Date(registro.nextTouchupDate).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Columna Derecha: Placeholder para Últimos Movimientos */}
                <div className="bg-maison-card border border-maison-border rounded-2xl p-6">
                    <h4 className="text-xl font-serif mb-4">Últimos movimientos</h4>
                    <p className="text-sm text-gray-400">Servicios recientemente registrados...</p>
                    {/* Aquí irá la otra lista en el futuro */}
                </div>

            </div>
        </div>
    );
}