import { apiClient } from '../../../services/apiClient';
import type { Planta } from '../types/planta';

export async function obtenerPlantasVivero(): Promise<Planta[]> {
    const respuesta = await apiClient.get<{ success: boolean; productos: Planta[] }>('/productos/vivero');
    return respuesta.data.productos;
}

export async function obtenerPlantaPorId(id: number): Promise<Planta> {
    const respuesta = await apiClient.get<{ success: boolean; producto: Planta }>(`/productos/${id}`);
    return respuesta.data.producto;
}
