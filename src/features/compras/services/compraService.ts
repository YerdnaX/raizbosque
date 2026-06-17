import { apiClient } from '../../../services/apiClient';

export type DatosCompra = {
    idUsuario: number;
    metodoEntrega: 'Tienda' | 'Domicilio';
    direccionEntrega?: string;
};

export async function realizarCompra(datos: DatosCompra): Promise<{ idCompra: number }> {
    const respuesta = await apiClient.post<{ success: boolean; idCompra: number }>('/compras', datos);
    return respuesta.data;
}
