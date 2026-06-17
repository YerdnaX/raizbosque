import { apiClient } from '../../../services/apiClient';
import type { PlantaJardin } from '../types/plantaJardin';

export async function obtenerJardin(idUsuario: number): Promise<PlantaJardin[]> {
    const respuesta = await apiClient.get<{ success: boolean; plantas: PlantaJardin[] }>(`/jardin/${idUsuario}`);
    return respuesta.data.plantas;
}

export async function agregarAlJardin(idUsuario: number, idProducto: number): Promise<{ yaExiste: boolean }> {
    const respuesta = await apiClient.post<{ success: boolean; yaExiste: boolean }>(`/jardin/${idUsuario}/agregar`, { idProducto });
    return { yaExiste: respuesta.data.yaExiste };
}

export async function eliminarDelJardin(idJardin: number): Promise<void> {
    await apiClient.delete(`/jardin/${idJardin}`);
}
