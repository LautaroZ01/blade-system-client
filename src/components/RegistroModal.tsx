import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiX, FiPlus, FiTrash2, FiBox } from "react-icons/fi";

import { useApi } from "../hooks/useApi";
import type { Product, Client, Service } from "../types";

export interface RegistroFormData {
    client: string; // ⭐️ Corregido: Solo guardamos el ID (string)
    service: string; // ⭐️ Corregido: Solo guardamos el ID (string)
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

    // Queries
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

    // Estados locales para Insumos
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');

    // Configuración de React Hook Form
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "productsUsed"
    });

    // ⭐️ NUEVO: Manejador centralizado de cierre
    const handleCloseModal = () => {
        setSelectedProductId('');
        setQuantityToAdd('');
        onClose(); // Llama a la prop del componente padre
    };

    // Efecto para limpiar o rellenar el formulario al abrir
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

    // Mutación para guardar el registro
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
        if (!payload.nextTouchupDate) {
            delete payload.nextTouchupDate;
        }
        mutate(payload);
    };

    const handleAddProduct = () => {
        if (!selectedProductId || !quantityToAdd) return;

        const alreadyAdded = fields.some(field => field.product === selectedProductId);
        if (alreadyAdded) {
            toast.error('Este insumo ya está en la lista. Eliminalo y agregalo con la cantidad total.');
            return;
        }

        append({ product: selectedProductId, quantity: Number(quantityToAdd) });
        setSelectedProductId('');
        setQuantityToAdd('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-maison-card border border-maison-border rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-maison-border bg-maison-bg shrink-0">
                    <div>
                        <h2 className="text-2xl font-serif text-maison-text">Registrar Visita</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Asentá el servicio y consumos del cliente.</p>
                    </div>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                {/* Formulario */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="registroForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* --- SECCIÓN 1: DATOS DEL SERVICIO --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold tracking-widest text-gray-500 uppercase">Cliente *</label>
                                <select
                                    className={`w-full px-4 py-2.5 bg-maison-bg border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm ${errors.client ? 'border-maison-red' : 'border-maison-border'}`}
                                    {...register('client', { required: 'Requerido' })}
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clients?.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.firstName} {c.lastName}
                                        </option>
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
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
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

                        {/* --- SECCIÓN 2: INSUMOS CONSUMIDOS --- */}
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

                        {/* --- SECCIÓN 3: NOTAS --- */}
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
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-maison-border shrink-0 bg-gray-50/50 flex justify-end gap-3">
                    <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
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
                </div>
            </div>
        </div>
    );
}