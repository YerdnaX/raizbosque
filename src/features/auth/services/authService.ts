import { apiClient } from '../../../services/apiClient';
import type { Usuario } from '../types/usuario';

export async function login(correo: string, contrasena: string): Promise<Usuario> {
    const respuesta = await apiClient.post<{ success: boolean; usuario: Usuario }>('/auth/login', {
        correo,
        contrasena,
    });
    return respuesta.data.usuario;
}

export async function registro(
    nombreCompleto: string,
    correo: string,
    contrasena: string,
    telefono?: string,
): Promise<void> {
    await apiClient.post('/auth/registro', {
        nombreCompleto,
        correo,
        contrasena,
        telefono,
    });
}
