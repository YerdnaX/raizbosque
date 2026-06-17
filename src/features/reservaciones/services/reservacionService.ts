import { apiClient } from '../../../services/apiClient';
import type { Reservacion } from '../types/reservacion';

export type DatosReservacion = {
    idUsuario: number;
    fecha: string;       // "YYYY-MM-DD"
    hora: string;        // "HH:MM"
    cantidadPersonas: number;
    comentarios?: string;
};

export async function obtenerReservaciones(idUsuario: number): Promise<Reservacion[]> {
    const respuesta = await apiClient.get<{ success: boolean; reservaciones: Reservacion[] }>(
        `/reservaciones/${idUsuario}`,
    );
    return respuesta.data.reservaciones;
}

export async function obtenerDisponibilidad(fecha: string): Promise<Record<string, number>> {
    const respuesta = await apiClient.get<{ success: boolean; disponibilidad: Record<string, number> }>(
        `/reservaciones/disponibilidad/${fecha}`,
    );
    return respuesta.data.disponibilidad;
}

export async function crearReservacion(datos: DatosReservacion): Promise<{ idReservacion: number }> {
    const respuesta = await apiClient.post<{ success: boolean; idReservacion: number }>(
        '/reservaciones',
        datos,
    );
    return respuesta.data;
}

export async function cancelarReservacion(idReservacion: number): Promise<void> {
    await apiClient.put(`/reservaciones/${idReservacion}/cancelar`);
}
