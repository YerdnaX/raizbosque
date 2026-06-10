import { apiClient } from '../../../services/apiClient';

export type PlantaDelMes = {
    IdProducto: number;
    Nombre: string;
    Descripcion: string | null;
    Precio: number;
    Imagen: string | null;
    NombreCategoria: string;
    FrecuenciaRiego: string | null;
    NivelLuz: string | null;
    TamanoAproximado: string | null;
    NivelDificultad: string | null;
};

export async function obtenerPlantaDelMes(): Promise<PlantaDelMes> {
    const respuesta = await apiClient.get<{ success: boolean; planta: PlantaDelMes }>('/productos/planta-del-mes');
    return respuesta.data.planta;
}
