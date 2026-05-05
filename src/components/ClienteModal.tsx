import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import type { Client } from "../types"; // Importamos la interfaz completa

export interface ClientFormData {
    firstName: string;
    lastName: string;
    phone?: string;
    medicalNotes?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // ⭐️ Nueva propiedad opcional
    clientToEdit?: Client | null;
}

export default function ClienteModal({ isOpen, onClose, clientToEdit }: Props) {
    const api = useApi();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            medicalNotes: ''
        }
    });

    // ⭐️ Efecto para rellenar el formulario cuando se abre en modo edición
    useEffect(() => {
        if (clientToEdit && isOpen) {
            reset({
                firstName: clientToEdit.firstName,
                lastName: clientToEdit.lastName,
                phone: clientToEdit.phone || '',
                medicalNotes: clientToEdit.medicalNotes || ''
            });
        } else if (isOpen) {
            // Si se abre y no hay cliente, limpiamos (modo creación)
            reset({ firstName: '', lastName: '', phone: '', medicalNotes: '' });
        }
    }, [clientToEdit, isOpen, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: ClientFormData) => {
            // ⭐️ Lógica dual: PUT si hay ID, POST si no hay
            if (clientToEdit) {
                const response = await api.put(`/clientes/${clientToEdit._id}`, data);
                return response.data;
            } else {
                const response = await api.post('/clientes', data);
                return response.data;
            }
        },
        onSuccess: () => {
            toast.success(clientToEdit ? 'Cliente actualizado exitosamente' : 'Cliente registrado exitosamente');
            // Refrescamos tanto la lista general como el perfil individual
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            if (clientToEdit) {
                queryClient.invalidateQueries({ queryKey: ['client', clientToEdit._id] });
            }
            onClose();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
            toast.error(errorMsg);
        }
    });

    const onSubmit = (data: ClientFormData) => mutate(data);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-maison-card border border-maison-border rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-maison-border bg-maison-bg">
                    <div>
                        {/* ⭐️ Cambiamos el título dinámicamente */}
                        <h2 className="text-2xl font-serif text-maison-text">
                            {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {clientToEdit ? 'Modificá los datos del perfil.' : 'Completá los datos del perfil.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* ... (Todo el resto de tus inputs queda exactamente igual) ... */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Nombre *</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.firstName ? 'border-maison-red' : 'border-maison-border'}`}
                                    {...register('firstName', { required: 'Requerido' })}
                                />
                                {errors.firstName && (
                                    <span className="flex items-center gap-1 text-xs text-maison-red mt-1 font-medium">
                                        <FiAlertCircle /> {errors.firstName.message}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Apellido *</label>
                                <input
                                    type="text"
                                    className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.lastName ? 'border-maison-red' : 'border-maison-border'}`}
                                    {...register('lastName', { required: 'Requerido' })}
                                />
                                {errors.lastName && (
                                    <span className="flex items-center gap-1 text-xs text-maison-red mt-1 font-medium">
                                        <FiAlertCircle /> {errors.lastName.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                                {...register('phone')}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                                Notas Médicas <span className="text-gray-400 font-normal normal-case">Opcional</span>
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                                {...register('medicalNotes')}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isPending} className="bg-maison-primary hover:bg-black disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                                {isPending ? 'Guardando...' : 'Guardar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}