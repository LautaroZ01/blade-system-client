import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiAlertCircle } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import type { Client } from "../types";
import Modal from "./ui/Modal";

export interface ClientFormData {
    firstName: string;
    lastName: string;
    phone?: string;
    medicalNotes?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    clientToEdit?: Client | null;
}

export default function ClienteModal({ isOpen, onClose, clientToEdit }: Props) {
    const api = useApi();
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
        defaultValues: { firstName: '', lastName: '', phone: '', medicalNotes: '' }
    });

    useEffect(() => {
        if (clientToEdit && isOpen) {
            reset({
                firstName: clientToEdit.firstName,
                lastName: clientToEdit.lastName,
                phone: clientToEdit.phone || '',
                medicalNotes: clientToEdit.medicalNotes || ''
            });
        } else if (isOpen) {
            reset({ firstName: '', lastName: '', phone: '', medicalNotes: '' });
        }
    }, [clientToEdit, isOpen, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: ClientFormData) => {
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

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
                Cancelar
            </button>
            <button
                form="clienteForm"
                type="submit"
                disabled={isPending}
                className="bg-maison-primary hover:bg-black disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
                {isPending ? 'Guardando...' : 'Guardar Cliente'}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            subtitle={clientToEdit ? 'Modificá los datos del perfil.' : 'Completá los datos del perfil.'}
            maxWidth="max-w-lg"
            footer={footer}
        >
            <form id="clienteForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

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

            </form>
        </Modal>
    );
}