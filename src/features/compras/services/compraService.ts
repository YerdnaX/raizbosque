import { apiClient } from '../../../services/apiClient';
import type { Compra } from '../types/compra';

export type DatosCompra = {
    idUsuario: number;
    metodoEntrega: 'Tienda' | 'Domicilio';
    codigoCupon?: string;
    metodoPago: MetodoPagoCompra;
    direccionEntrega?: string;
    ubicacion?: {
        idsSeleccionados: number[];
        direccionExacta: string;
    };
};

export type MetodoPagoCompra =
    | {
        tarjeta: {
            tarjeta: {
                identificador: string;
                cvv: string;
                fechaVencimiento: string;
            };
            propietario: {
                nombre: string;
            };
        };
        sinpe?: never;
    }
    | {
        sinpe: {
            telefono: string;
        };
        tarjeta?: never;
    };

export type CuponAplicado = {
    codigo: string;
    descripcion: string;
    tipoDescuento: string;
    valorDescuento: number;
    montoDescuento: number;
};

export type ResumenCompra = {
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    cupon: CuponAplicado | null;
};

export type ResultadoCompra = {
    idCompra: number;
    numeroOrden: number;
    trackingNumber: string | null;
    direccionEntrega: string | null;
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    cupon: CuponAplicado | null;
};

export type TipoCambioVenta = {
    fecha: string;
    valor: number;
};

export async function obtenerResumenCompra(idUsuario: number, codigoCupon?: string): Promise<ResumenCompra> {
    const respuesta = await apiClient.post<{ success: boolean } & ResumenCompra>('/compras/resumen', {
        idUsuario,
        codigoCupon,
    });
    return respuesta.data;
}

export async function realizarCompra(datos: DatosCompra): Promise<ResultadoCompra> {
    const respuesta = await apiClient.post<{ success: boolean } & ResultadoCompra>('/compras', datos);
    return respuesta.data;
}

export async function obtenerHistorial(idUsuario: number): Promise<Compra[]> {
    const respuesta = await apiClient.get<{ success: boolean; compras: Compra[] }>(`/compras/${idUsuario}`);
    return respuesta.data.compras;
}

export async function obtenerTipoCambioVenta(): Promise<TipoCambioVenta> {
    const respuesta = await fetch('https://api.hacienda.go.cr/indicadores/tc');
    if (!respuesta.ok) {
        throw new Error('No se pudo consultar el tipo de cambio');
    }

    const datos = await respuesta.json();
    const venta = datos?.dolar?.venta;

    if (!venta?.fecha || typeof venta.valor !== 'number') {
        throw new Error('Respuesta de tipo de cambio no valida');
    }

    return {
        fecha: venta.fecha,
        valor: venta.valor,
    };
}
