// --- FUNCIONES AUXILIARES DE TIEMPO Y FORMATO ---

// 1. Formateador de fechas al estilo "23 de abr de 2026"
export const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(dateString));
};

// 2. Calculadora de estado visual para la línea de tiempo
export const getTimelineStatus = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reseteamos horas para comparar solo días
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: `Atrasado ${Math.abs(diffDays)}d`,
            dotColor: 'bg-maison-red',
            pillClass: 'bg-red-50 text-maison-red border border-red-100',
        };
    }
    if (diffDays === 0) {
        return {
            label: 'Hoy',
            dotColor: 'bg-maison-red',
            pillClass: 'bg-red-50 text-maison-red border border-red-100',
        };
    }
    if (diffDays === 1) {
        return {
            label: 'Mañana',
            dotColor: 'bg-maison-orange',
            pillClass: 'bg-orange-50 text-maison-orange border border-orange-100',
        };
    }
    if (diffDays <= 7) {
        return {
            label: `En ${diffDays} días`,
            dotColor: 'bg-maison-orange',
            pillClass: 'bg-orange-50 text-maison-orange border border-orange-100',
        };
    }
    if (diffDays <= 21) {
        return {
            label: `En ${diffDays} días`,
            dotColor: 'bg-maison-green',
            pillClass: 'bg-green-50 text-maison-green border border-green-100',
        };
    }

    // Fallback para fechas muy lejanas (+ de 3 semanas) en tono neutro
    return {
        label: `En ${diffDays} días`,
        dotColor: 'bg-gray-400',
        pillClass: 'bg-gray-50 text-gray-500 border border-gray-200',
    };
};