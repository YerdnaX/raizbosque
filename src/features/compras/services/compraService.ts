import { apiClient } from '../../../services/apiClient';
import type { Compra } from '../types/compra';

export type DatosCompra = {
    idUsuario: number;
    metodoEntrega: 'Tienda' | 'Domicilio';
    direccionEntrega?: string;
    ubicacion?: {
        idsSeleccionados: number[];
        direccionExacta: string;
    };
};

export type ResultadoCompra = {
    idCompra: number;
    numeroOrden: number;
    trackingNumber: string | null;
    direccionEntrega: string | null;
};

export async function realizarCompra(datos: DatosCompra): Promise<ResultadoCompra> {
    const respuesta = await apiClient.post<{ success: boolean } & ResultadoCompra>('/compras', datos);
    return respuesta.data;
}

export async function obtenerHistorial(idUsuario: number): Promise<Compra[]> {
    const respuesta = await apiClient.get<{ success: boolean; compras: Compra[] }>(`/compras/${idUsuario}`);
    return respuesta.data.compras;
}
