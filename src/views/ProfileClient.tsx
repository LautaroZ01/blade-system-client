import { useParams, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiPhone, FiCalendar, FiClock, FiFileText, FiBox, FiAlertCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useApi } from '../hooks/useApi';
import type { Client, ServiceRecord } from '../types';
import { formatDate } from '../utils/dates';
import { useState } from 'react';
import { toast } from 'sonner';
import ClienteModal from '../components/ClienteModal';

export default function PerfilCliente() {
    const { id } = useParams();
    const navigate = useNavigate();
    const api = useApi();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const { data: cliente, isLoading: isLoadingClient } = useQuery<Client>({
        queryKey: ['client', id],
        queryFn: async () => {
            const response = await api.get(`/clientes/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    const { data: historial, isLoading: isLoadingHistory } = useQuery<ServiceRecord[]>({
        queryKey: ['client-history', id],
        queryFn: async () => {
            const response = await api.get(`/registros/cliente/${id}`);
            return response.data;
        },
        enabled: !!id
    });

    const queryClient = useQueryClient();

    const { mutate: deleteClient } = useMutation({
        mutationFn: async () => {
            await api.delete(`/clientes/${id}`);
        },
        onSuccess: () => {
            toast.success('Cliente eliminado');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            navigate('/clientes');
        },
        onError: () => {
            toast.error('Error al eliminar el cliente');
        }
    });

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este cliente y todo su historial?')) {
            deleteClient();
        }
    };

    if (isLoadingClient || isLoadingHistory) {
        return <div className="p-8 text-gray-500 text-center">Cargando perfil...</div>;
    }

    if (!cliente) {
        return <div className="p-8 text-maison-red text-center">Cliente no encontrado.</div>;
    }

    const initials = cliente.firstName.charAt(0).toUpperCase() + cliente.lastName.charAt(0).toUpperCase();

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Cabecera de navegación */}
            <button
                onClick={() => navigate('/clientes')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-maison-text transition-colors mb-6 cursor-pointer"
            >
                <FiArrowLeft /> Volver al directorio
            </button>

            {/* ⭐️ TARJETA PRINCIPAL DEL CLIENTE ⭐️ */}
            <div className="bg-maison-card border border-maison-border rounded-3xl p-8 shadow-sm mb-8 relative overflow-hidden">
                {/* Elemento decorativo de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-maison-bg rounded-full -translate-y-1/2 translate-x-1/3 opacity-50"></div>

                <div className="absolute top-6 right-6 flex gap-2 z-10">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-maison-primary hover:border-gray-300 rounded-lg transition-all shadow-sm cursor-pointer"
                        title="Editar cliente"
                    >
                        <FiEdit2 size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-maison-red hover:border-red-200 hover:bg-red-50 rounded-lg transition-all shadow-sm cursor-pointer"
                        title="Eliminar cliente"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>

                <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Avatar Gigante */}
                    <div className="w-28 h-28 shrink-0 rounded-full bg-white border-2 border-maison-border flex items-center justify-center font-serif text-4xl text-maison-text shadow-sm">
                        {initials}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-4xl font-serif text-maison-text mb-2">
                            {cliente.firstName} {cliente.lastName}
                        </h2>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                            <span className="flex items-center gap-1.5 bg-maison-bg px-3 py-1.5 rounded-lg border border-maison-border">
                                <FiPhone className="text-gray-400" />
                                {cliente.phone || 'Sin teléfono'}
                            </span>
                            <span className="flex items-center gap-1.5 bg-maison-bg px-3 py-1.5 rounded-lg border border-maison-border text-xs uppercase tracking-widest font-semibold">
                                Cliente desde {new Date(cliente.createdAt).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notas Médicas (Si existen) */}
                {cliente.medicalNotes && (
                    <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl relative">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-maison-orange mb-2 flex items-center gap-2">
                            <FiAlertCircle /> Notas Médicas Importantes
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {cliente.medicalNotes}
                        </p>
                    </div>
                )}
            </div>

            {/* ⭐️ HISTORIAL DE VISITAS (TIMELINE) ⭐️ */}
            <div>
                <h3 className="text-2xl font-serif text-maison-text mb-6 flex items-center gap-3">
                    <FiClock className="text-gray-400" /> Historial de Visitas
                </h3>

                <div className="bg-maison-card border border-maison-border rounded-3xl p-8 shadow-sm">
                    {historial?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Este cliente aún no tiene servicios registrados.</p>
                    ) : (
                        <div className="relative pl-4 border-l-2 border-maison-border space-y-8 py-2 ml-2">
                            {historial?.map((registro) => (
                                <div key={registro._id} className="relative ml-8">
                                    {/* Punto en la línea de tiempo */}
                                    <div className="absolute left-[-57px] top-1.5 w-4 h-4 rounded-full bg-maison-primary ring-4 ring-white"></div>

                                    {/* Contenido de la visita */}
                                    <div className="bg-white border border-maison-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                                            <div>
                                                <h4 className="text-lg font-medium text-maison-text">
                                                    {registro.service.name}
                                                </h4>
                                                <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase mt-1 flex items-center gap-1.5">
                                                    <FiCalendar /> {formatDate(registro.serviceDate)}
                                                </p>
                                            </div>

                                            {/* Estado del retoque */}
                                            {registro.touchupStatus === 'completed' && (
                                                <span className="bg-green-50 text-maison-green border border-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Retoque Listo
                                                </span>
                                            )}
                                        </div>

                                        {/* Detalles extra (Notas y Productos) */}
                                        {(registro.notes || registro.productsUsed) && (
                                            <div className="mt-4 pt-4 border-t border-maison-border space-y-3">
                                                {registro.notes && (
                                                    <div className="flex gap-2 text-sm text-gray-600">
                                                        <FiFileText className="text-gray-400 mt-0.5 shrink-0" />
                                                        <p>{registro.notes}</p>
                                                    </div>
                                                )}
                                                {registro.productsUsed && (
                                                    <div className="flex gap-2 text-sm text-gray-600">
                                                        <FiBox className="text-gray-400 mt-0.5 shrink-0" />
                                                        <p><span className="font-medium text-gray-700">Fórmula/Productos:</span> {registro.productsUsed}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ClienteModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                clientToEdit={cliente} // Le pasamos los datos del cliente actual
            />
        </div>
    );
}