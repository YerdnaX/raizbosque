export type PasoCheckout = 'entrega' | 'pago' | 'confirmacion';

export type MetodoEntrega = 'Tienda' | 'Domicilio';
export type MetodoPago = 'Tarjeta' | 'SINPE' | 'PayPal' | null;
export type MarcaTarjeta = 'Visa' | 'Mastercard' | null;

export type SeleccionUbicacion = {
    idsSeleccionados: number[];
    completo: boolean;
};

// Texto breve para mostrar en el resumen de Confirmación y poder
// editar cada decisión sin tener que reconstruirla ahí mismo.
export type ResumenPaso = {
    titulo: string;
    detalle: string;
};
