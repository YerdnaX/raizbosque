import { apiClient } from '../../../services/apiClient';
import type { Ubicacion, ConfiguracionPais } from '../types/ubicacion';

export async function obtenerPaises(): Promise<Ubicacion[]> {
    const respuesta = await apiClient.get<Ubicacion[]>('/ubicaciones/paises');
    return respuesta.data;
}

export async function obtenerHijos(idUbicacion: number): Promise<Ubicacion[]> {
    const respuesta = await apiClient.get<Ubicacion[]>(`/ubicaciones/${idUbicacion}/hijos`);
    return respuesta.data;
}

export async function obtenerConfiguracionPais(idPais: number): Promise<ConfiguracionPais> {
    const respuesta = await apiClient.get<ConfiguracionPais>(`/ubicaciones/paises/${idPais}/configuracion`);
    return respuesta.data;
}
