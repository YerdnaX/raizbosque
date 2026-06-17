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

export type PlatoDelDia = {
    IdProducto: number;
    Nombre: string;
    Descripcion: string | null;
    Precio: number;
    Imagen: string | null;
    NombreCategoria: string;
    Stock: number;
};

export async function obtenerPlantaDelMes(): Promise<PlantaDelMes> {
    const respuesta = await apiClient.get<{ success: boolean; planta: PlantaDelMes }>('/productos/planta-del-mes');
    return respuesta.data.planta;
}

export async function obtenerPlatoDelDia(): Promise<PlatoDelDia> {
    const respuesta = await apiClient.get<{ success: boolean; plato: PlatoDelDia }>('/productos/plato-del-dia');
    return respuesta.data.plato;
}
