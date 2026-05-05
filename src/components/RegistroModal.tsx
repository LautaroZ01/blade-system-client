import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import type { Client, Service } from "../types";

export interface RegistroFormData {
    client: string;
    service: string;
    serviceDate: string;
    notes?: string;
    productsUsed?: string;
    nextTouchupDate?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    preselectedClientId?: string; // Por si lo abrimos desde el perfil de un cliente
}

export default function RegistroModal({ isOpen, onClose, preselectedClientId }: Props) {
    const api = useApi();
    const queryClient = useQueryClient();

    // Traemos Clientes y Servicios para llenar los Selects
    const { data: clientes } = useQuery<Client[]>({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/clientes')).data,
        enabled: isOpen // Solo busca si el modal está abierto
    });

    const { data: servicios } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => (await api.get('/servicios')).data,
        enabled: isOpen
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistroFormData>({
        defaultValues: {
            client: '',
            service: '',
            serviceDate: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
            notes: '',
            productsUsed: '',
            nextTouchupDate: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                client: preselectedClientId || '',
                service: '',
                serviceDate: new Date().toISOString().split('T')[0],
                notes: '',
                productsUsed: '',
                nextTouchupDate: ''
            });
        }
    }, [isOpen, preselectedClientId, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: RegistroFormData) => {
            // El backend calculará el nextTouchupDate automáticamente basado en el servicio
            const response = await api.post('/registros', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Visita registrada exitosamente');
            // ⭐️ Refrescamos TODAS las listas que dependen de esto
            queryClient.invalidateQueries({ queryKey: ['upcoming-touchups'] });
            queryClient.invalidateQueries({ queryKey: ['recent-movements'] });
            queryClient.invalidateQueries({ queryKey: ['client-history'] });
            onClose();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'Error al registrar la visita';
            toast.error(errorMsg);
        }
    });

    const onSubmit = (data: RegistroFormData) => {
        // Creamos una copia de los datos
        const payload = { ...data };

        // Si la fecha manual está vacía, la eliminamos del payload
        // Así el backend entra en el if (!finalNextTouchupDate) y hace el cálculo
        if (!payload.nextTouchupDate) {
            delete payload.nextTouchupDate;
        }

        mutate(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-maison-card border border-maison-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-maison-border bg-maison-bg">
                    <div>
                        <h2 className="text-2xl font-serif text-maison-text">Registrar Visita</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Asentá el servicio realizado en el estudio.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Selector de Cliente */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Cliente *</label>
                            <select
                                className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.client ? 'border-maison-red' : 'border-maison-border'}`}
                                {...register('client', { required: 'Debe seleccionar un cliente' })}
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clientes?.map(c => (
                                    <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                                ))}
                            </select>
                            {errors.client && <span className="text-xs text-maison-red font-medium flex items-center gap-1"><FiAlertCircle />{errors.client.message}</span>}
                        </div>

                        {/* Selector de Servicio */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Servicio *</label>
                            <select
                                className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.service ? 'border-maison-red' : 'border-maison-border'}`}
                                {...register('service', { required: 'Debe seleccionar un servicio' })}
                            >
                                <option value="">Seleccione un servicio...</option>
                                {servicios?.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} (Retoque: {s.defaultTouchupDays}d)</option>
                                ))}
                            </select>
                            {errors.service && <span className="text-xs text-maison-red font-medium flex items-center gap-1"><FiAlertCircle />{errors.service.message}</span>}
                        </div>

                        {/* Fecha del Servicio */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Fecha *</label>
                            <input
                                type="date"
                                className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.serviceDate ? 'border-maison-red' : 'border-maison-border'}`}
                                {...register('serviceDate', { required: 'Requerido' })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                                Próximo Retoque
                                <span className="text-gray-400 font-normal normal-case tracking-normal">Opcional</span>
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                                {...register('nextTouchupDate')}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Dejá este campo vacío para que el sistema lo calcule automáticamente según el servicio.
                            </p>
                        </div>

                        {/* Fórmulas / Productos */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                                Fórmula / Productos <span className="text-gray-400 font-normal normal-case">Opcional</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Wella Blondor + 20vol"
                                className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                                {...register('productsUsed')}
                            />
                        </div>

                        {/* Notas adicionales */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                                Notas adicionales <span className="text-gray-400 font-normal normal-case">Opcional</span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Observaciones del servicio..."
                                className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                                {...register('notes')}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isPending} className="bg-maison-primary hover:bg-black disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                                {isPending ? 'Guardando...' : 'Registrar Visita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}