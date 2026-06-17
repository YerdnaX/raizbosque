import { apiClient } from '../../../services/apiClient';
import type { Usuario } from '../types/usuario';

export async function login(correo: string, contrasena: string): Promise<Usuario> {
    const respuesta = await apiClient.post<{ success: boolean; usuario: Usuario }>('/auth/login', {
        correo,
        contrasena,
    });
    return respuesta.data.usuario;
}

export async function registro(datos: {
    nombre: string;
    apellidos: string;
    correo: string;
    contrasena: string;
    telefono?: string;
    direccion?: string;
}): Promise<void> {
    await apiClient.post('/auth/registro', datos);
}

export async function actualizarPerfil(
    idUsuario: number,
    datos: { nombre: string; apellidos: string; telefono: string; direccion: string },
): Promise<void> {
    await apiClient.put(`/usuarios/${idUsuario}`, datos);
}

export async function cambiarContrasena(
    idUsuario: number,
    contrasenaActual: string,
    contrasenaNueva: string,
): Promise<void> {
    await apiClient.put(`/usuarios/${idUsuario}/cambiar-contrasena`, {
        contrasenaActual,
        contrasenaNueva,
    });
}
