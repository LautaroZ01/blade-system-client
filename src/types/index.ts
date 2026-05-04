// src/types/index.ts

// Interfaz para el Cliente poblado (reducido a los campos que devuelve el endpoint de retoques)
export interface ClientSlim {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

// Interfaz para el Servicio poblado
export interface ServiceSlim {
    _id: string;
    name: string;
}

// Interfaz principal para el Registro de Servicio (Historial/Retoque)
export interface ServiceRecord {
    _id: string;
    client: ClientSlim;
    service: ServiceSlim;
    serviceDate: string; // ISO string
    notes?: string;
    productsUsed?: string;
    nextTouchupDate?: string; // ISO string
    touchupStatus: 'pending' | 'completed' | 'cancelled';
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    __v?: number;
}

export interface Client {
    _id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    medicalNotes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}