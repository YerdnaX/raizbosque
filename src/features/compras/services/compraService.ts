import { apiClient } from '../../../services/apiClient';
import type { Compra } from '../types/compra';

export type DatosCompra = {
    idUsuario: number;
    metodoEntrega: 'Tienda' | 'Domicilio';
    direccionEntrega?: string;
};

export async function realizarCompra(datos: DatosCompra): Promise<{ idCompra: number }> {
    const respuesta = await apiClient.post<{ success: boolean; idCompra: number }>('/compras', datos);
    return respuesta.data;
}

export async function obtenerHistorial(idUsuario: number): Promise<Compra[]> {
    const respuesta = await apiClient.get<{ success: boolean; compras: Compra[] }>(`/compras/${idUsuario}`);
    return respuesta.data.compras;
}
