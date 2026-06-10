import { apiClient } from '../../../services/apiClient';
import type { Producto } from '../types/producto';

export async function obtenerProductos(): Promise<Producto[]> {
    const respuesta = await apiClient.get<{ success: boolean; productos: Producto[] }>('/productos/vivero-productos');
    return respuesta.data.productos;
}
