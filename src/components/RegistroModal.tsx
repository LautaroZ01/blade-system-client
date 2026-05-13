import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiPlus, FiTrash2, FiBox } from "react-icons/fi";

import { useApi } from "../hooks/useApi";
import type { Product, Client, Service } from "../types";
import Modal from "./ui/Modal";

export interface RegistroFormData {
    client: string;
    service: string;
    serviceDate: string;
    notes?: string;
    nextTouchupDate?: string;
    productsUsed: { product: string; quantity: number }[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    preselectedClientId?: string;
}

export default function RegistroModal({ isOpen, onClose, preselectedClientId }: Props) {
    const api = useApi();
    const queryClient = useQueryClient();

    const { data: inventoryProducts } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => (await api.get('/productos')).data,
        enabled: isOpen
    });

    const { data: clients } = useQuery<Client[]>({
        queryKey: ['clients'],
        queryFn: async () => (await api.get('/clientes')).data,
        enabled: isOpen
    });

    const { data: services } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => (await api.get('/servicios')).data,
        enabled: isOpen
    });

    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');

    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<RegistroFormData>({
        defaultValues: {
            client: preselectedClientId || '',
            service: '',
            serviceDate: new Date().toISOString().split('T')[0],
            notes: '',
            nextTouchupDate: '',
            productsUsed: []
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "productsUsed" });

    const handleCloseModal = () => {
        setSelectedProductId('');
        setQuantityToAdd('');
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            reset({
                client: preselectedClientId || '',
                service: '',
                serviceDate: new Date().toISOString().split('T')[0],
                notes: '',
                nextTouchupDate: '',
                productsUsed: []
            });
        }
    }, [isOpen, preselectedClientId, reset]);

    const { mutate, isPending } = useMutation({
        mutationFn: async (payload: Partial<RegistroFormData>) => {
            const response = await api.post('/registros', payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Servicio registrado. Stock actualizado.', {
                style: { background: '#FDFBF7', color: '#54A885', borderColor: '#54A885' }
            });
            queryClient.invalidateQueries({ queryKey: ['recent-movements'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleCloseModal();
        },
        onError: (error: any) => {
            const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
            toast.error(errorMsg);
        }
    });

    const onSubmit = (data: RegistroFormData) => {
        const payload = { ...data };
        if (!payload.nextTouchupDate) delete payload.nextTouchupDate;
        mutate(payload);
    };

    const handleAddProduct = () => {
        if (!selectedProductId || !quantityToAdd) return;
        if (fields.some(f => f.product === selectedProductId)) {
            toast.error('Este insumo ya está en la lista. Eliminalo y agregalo con la cantidad total.');
            return;
        }
        append({ product: selectedProductId, quantity: Number(quantityToAdd) });
        setSelectedProductId('');
        setQuantityToAdd('');
    };

    const footer = (
        <>
            <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
                Cancelar
            </button>
            <button
                type="submit"
                form="registroForm"
                disabled={isPending}
                className="bg-maison-primary hover:bg-black disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
                {isPending ? 'Guardando...' : 'Guardar y Descontar Stock'}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Registrar Visita"
            subtitle="Asentá el servicio y consumos del cliente."
            maxWidth="max-w-3xl"
            containerClassName="flex flex-col max-h-[90vh]"
            footer={footer}
        >
            <form id="registroForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Sección 1: Datos del servicio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Cliente *</label>
                        <select
                            className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm ${errors.client ? 'border-maison-red' : 'border-maison-border'}`}
                            {...register('client', { required: 'Requerido' })}
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clients?.map(c => (
                                <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                            ))}
                        </select>
                        {errors.client && <span className="text-[10px] text-maison-red">{errors.client.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Servicio *</label>
                        <select
                            className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm ${errors.service ? 'border-maison-red' : 'border-maison-border'}`}
                            {...register('service', { required: 'Requerido' })}
                        >
                            <option value="">Seleccionar servicio...</option>
                            {services?.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.service && <span className="text-[10px] text-maison-red">{errors.service.message}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Fecha del Servicio *</label>
                        <input
                            type="date"
                            className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 ${errors.serviceDate ? 'border-maison-red' : 'border-maison-border'}`}
                            {...register('serviceDate', { required: 'Requerido' })}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200 -mt-2">
                        <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                            Próximo Retoque <span className="text-gray-400 font-normal normal-case">Opcional</span>
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                            {...register('nextTouchupDate')}
                        />
                    </div>
                </div>

                {/* Sección 2: Insumos */}
                <div className="border border-maison-border rounded-xl p-5 bg-white">
                    <h3 className="text-sm font-semibold text-maison-text mb-4 flex items-center gap-2">
                        <FiBox className="text-gray-400" /> Insumos Consumidos (Stock)
                    </h3>

                    <div className="flex gap-3 mb-4">
                        <select
                            className="flex-1 px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">Seleccionar insumo...</option>
                            {inventoryProducts?.map(prod => (
                                <option key={prod._id} value={prod._id} disabled={prod.stock === 0}>
                                    {prod.name} ({prod.brand}) - Stock: {prod.stock}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            min="1"
                            placeholder="Cant."
                            className="w-24 px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl text-sm"
                            value={quantityToAdd}
                            onChange={(e) => setQuantityToAdd(e.target.value ? Number(e.target.value) : '')}
                        />

                        <button
                            type="button"
                            onClick={handleAddProduct}
                            disabled={!selectedProductId || !quantityToAdd}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <FiPlus />
                        </button>
                    </div>

                    {fields.length > 0 ? (
                        <ul className="space-y-2">
                            {fields.map((field, index) => {
                                const productDetails = inventoryProducts?.find(p => p._id === field.product);
                                return (
                                    <li key={field.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">{productDetails?.name || 'Insumo'}</span>
                                            <span className="text-xs text-gray-500">{field.quantity} unidades/ml</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No se agregaron insumos a este servicio.
                        </p>
                    )}
                </div>

                {/* Sección 3: Notas */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold tracking-widest text-gray-500 uppercase flex justify-between">
                        Notas del Servicio <span className="text-gray-400 font-normal normal-case">Opcional</span>
                    </label>
                    <textarea
                        rows={2}
                        placeholder="Ej: Fórmula del color, observaciones del cabello..."
                        className="w-full px-4 py-2.5 bg-maison-bg border border-maison-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                        {...register('notes')}
                    />
                </div>

            </form>
        </Modal>
    );
}