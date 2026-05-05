import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import type { Service } from "../types";

export interface ServiceFormData {
    name: string;
    defaultTouchupDays: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    serviceToEdit?: Service | null;
}

export default function ServicioModal({ isOpen, onClose, serviceToEdit }: Props) {
    const api = useApi();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ServiceFormData>({
        defaultValues: { name: '', defaultTouchupDays: 0 }
    });

    useEffect(() => {
        if (serviceToEdit && isOpen) {
            reset({
                name: serviceToEdit.name,
                defaultTouchupDays: serviceToEdit.defaultTouchupDays
            });
        } else if (isOpen) {
            reset({ name: '', defaultTouchupDays: 0 });
        }
    }, [serviceToEdit, isOpen, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: ServiceFormData) => {
            if (serviceToEdit) {
                const response = await api.put(`/servicios/${serviceToEdit._id}`, data);
                return response.data;
            } else {
                const response = await api.post('/servicios', data);
                return response.data;
            }
        },
        onSuccess: () => {
            toast.success(serviceToEdit ? 'Servicio actualizado' : 'Servicio creado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['services'] });
            onClose();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'Error al guardar el servicio';
            toast.error(errorMsg);
        }
    });

    const onSubmit = (data: ServiceFormData) => mutate(data);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-maison-card border border-maison-border rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-maison-border bg-maison-bg">
                    <div>
                        <h2 className="text-2xl font-serif text-maison-text">
                            {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Nombre del Servicio *</label>
                            <input
                                type="text"
                                placeholder="Ej. Coloración completa"
                                className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.name ? 'border-maison-red' : 'border-maison-border'}`}
                                {...register('name', { required: 'Requerido' })}
                            />
                            {errors.name && (
                                <span className="flex items-center gap-1 text-xs text-maison-red mt-1 font-medium">
                                    <FiAlertCircle /> {errors.name.message}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Días para retoque *</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Ej. 45"
                                className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                                {...register('defaultTouchupDays', {
                                    required: 'Requerido',
                                    valueAsNumber: true
                                })}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Poné 0 si este servicio no requiere retoque.
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isPending} className="bg-maison-primary hover:bg-black disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer">
                                {isPending ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}