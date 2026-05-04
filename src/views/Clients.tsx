import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiPlus, FiUser, FiPhone } from 'react-icons/fi';
import { useApi } from '../hooks/useApi';
import type { Client } from '../types';
import ClienteModal from '../components/ClienteModal';

export default function Clients() {
    const api = useApi();
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Traemos todos los clientes del backend (recuerda que tu backend ya los devuelve ordenados alfabéticamente)
    const { data: clientes, isLoading, isError } = useQuery<Client[]>({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await api.get('/clientes');
            return response.data;
        }
    });

    // Lógica de filtrado en tiempo real
    const filteredClientes = clientes?.filter(cliente => {
        const term = searchTerm.toLowerCase();
        const fullName = `${cliente.firstName} ${cliente.lastName}`.toLowerCase();
        const phone = cliente.phone || '';

        return fullName.includes(term) || phone.includes(term);
    });

    if (isLoading) return <div className="p-4 text-gray-500">Cargando directorio...</div>;
    if (isError) return <div className="p-4 text-maison-red">Error al cargar los clientes.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cabecera */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xs font-semibold tracking-widest text-gray-400 mb-2 uppercase">
                        Directorio
                    </h2>
                    <h3 className="text-4xl font-serif text-maison-text">
                        Clientes
                    </h3>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-maison-primary hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                    <FiPlus className="text-lg" /> Agregar Cliente
                </button>
            </header>

            {/* Barra de Búsqueda */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-maison-card border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all shadow-sm"
                />
            </div>

            {/* Lista de Clientes */}
            <div className="bg-maison-card border border-maison-border rounded-2xl overflow-hidden shadow-sm">
                {filteredClientes?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron clientes con "{searchTerm}".
                    </div>
                ) : (
                    <ul className="divide-y divide-maison-border">
                        {filteredClientes?.map((cliente) => {
                            const initials = cliente.firstName.charAt(0).toUpperCase() + cliente.lastName.charAt(0).toUpperCase();

                            return (
                                <li key={cliente._id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">

                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-maison-bg border border-maison-border flex items-center justify-center font-serif text-lg text-maison-text shadow-sm">
                                            {initials}
                                        </div>

                                        {/* Datos */}
                                        <div>
                                            <p className="font-medium text-maison-text text-lg">
                                                {cliente.firstName} {cliente.lastName}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                                {cliente.phone ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <FiPhone className="text-gray-400" /> {cliente.phone}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Sin teléfono registrado</span>
                                                )}

                                                {/* Indicador de Notas Médicas */}
                                                {cliente.medicalNotes && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-maison-orange border border-orange-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                                        Notas Médicas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de Acción */}
                                    <button className="opacity-0 group-hover:opacity-100 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer shadow-sm flex items-center gap-2">
                                        <FiUser /> Ver Perfil
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <ClienteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
