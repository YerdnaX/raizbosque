import { apiClient } from '../../../services/apiClient';
import type { ItemRestaurante } from '../types/itemRestaurante';

export async function obtenerItemsRestaurante(): Promise<ItemRestaurante[]> {
    const respuesta = await apiClient.get<{ success: boolean; productos: ItemRestaurante[] }>('/productos/restaurante');
    return respuesta.data.productos;
}

export async function obtenerItemRestaurantePorId(id: number): Promise<ItemRestaurante> {
    const respuesta = await apiClient.get<{ success: boolean; producto: ItemRestaurante }>(`/productos/${id}`);
    return respuesta.data.producto;
}
