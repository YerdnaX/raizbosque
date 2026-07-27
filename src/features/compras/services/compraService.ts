import { apiClient } from '../../../services/apiClient';
import type { Compra } from '../types/compra';

export type DatosCompra = {
    idUsuario: number;
    metodoEntrega: 'Tienda' | 'Domicilio';
    codigoCupon?: string;
    direccionEntrega?: string;
    ubicacion?: {
        idsSeleccionados: number[];
        direccionExacta: string;
    };
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
