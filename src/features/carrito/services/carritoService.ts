import { apiClient } from '../../../services/apiClient';
import type { ItemCarrito } from '../types/carritoItem';

export async function obtenerCarrito(idUsuario: number): Promise<{ idCarrito: number | null; items: ItemCarrito[] }> {
    const respuesta = await apiClient.get<{ success: boolean; idCarrito: number | null; items: ItemCarrito[] }>(
        `/carrito/${idUsuario}`,
    );
    return respuesta.data;
}

export async function agregarItem(idUsuario: number, idProducto: number, precio: number): Promise<void> {
    await apiClient.post(`/carrito/${idUsuario}/agregar`, { idProducto, precio });
}

export async function actualizarCantidad(idDetalle: number, cantidad: number): Promise<void> {
    await apiClient.put(`/carrito/detalle/${idDetalle}`, { cantidad });
}

export async function eliminarItem(idDetalle: number): Promise<void> {
    await apiClient.delete(`/carrito/detalle/${idDetalle}`);
}
