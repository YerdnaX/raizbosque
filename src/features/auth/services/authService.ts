import { apiClient } from '../../../services/apiClient';
import type { Usuario } from '../types/usuario';

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginRespuesta =
    | { requires2FA: false; usuario: Usuario }
    | { requires2FA: true; userId: number };

export async function login(identificador: string, contrasena: string): Promise<LoginRespuesta> {
    const respuesta = await apiClient.post<{
        success?: boolean;
        requires2FA?: boolean;
        usuario?: Usuario;
        userId?: number;
    }>('/auth/login', { identificador, contrasena });

    if (respuesta.data.requires2FA) {
        return { requires2FA: true, userId: respuesta.data.userId! };
    }
    return { requires2FA: false, usuario: respuesta.data.usuario! };
}

// ─── Registro multi-paso ──────────────────────────────────────────────────────

export async function enviarCodigoRegistro(correo: string): Promise<void> {
    await apiClient.post('/auth/registro/enviar-codigo', { correo });
}

export async function verificarCodigoRegistro(correo: string, codigo: string): Promise<string> {
    const r = await apiClient.post<{ token: string }>('/auth/registro/verificar-codigo', { correo, codigo });
    return r.data.token;
}

export async function verificarNombreUsuario(nombreUsuario: string): Promise<{ disponible: boolean }> {
    const r = await apiClient.get<{ disponible: boolean }>('/auth/registro/verificar-usuario', {
        params: { nombreUsuario },
    });
    return r.data;
}

export async function getPreguntasSeguridad(): Promise<{ IdPregunta: number; TextoPregunta: string }[]> {
    const r = await apiClient.get<{ preguntas: { IdPregunta: number; TextoPregunta: string }[] }>('/auth/preguntas-seguridad');
    return r.data.preguntas;
}

export async function completarRegistro(datos: {
    correo: string;
    token: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    direccion?: string;
    nombreUsuario: string;
    contrasena: string;
    respuesta1: string;
    respuesta2: string;
    respuesta3: string;
}): Promise<void> {
    await apiClient.post('/auth/registro/completar', datos);
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

export async function enviarCodigoRecuperacion(correo: string): Promise<void> {
    await apiClient.post('/auth/recuperar-contrasena/enviar-codigo', { correo });
}

export async function verificarCodigoRecuperacion(correo: string, codigo: string): Promise<string> {
    const r = await apiClient.post<{ token: string }>('/auth/recuperar-contrasena/verificar-codigo', { correo, codigo });
    return r.data.token;
}

export async function obtenerPreguntasRecuperacion(correo: string): Promise<{ IdPregunta: number; TextoPregunta: string }[]> {
    const r = await apiClient.post<{ preguntas: { IdPregunta: number; TextoPregunta: string }[] }>(
        '/auth/recuperar-contrasena/preguntas',
        { correo },
    );
    return r.data.preguntas;
}

export async function verificarRespuestasSeguridad(correo: string, respuesta1: string, respuesta2: string): Promise<string> {
    const r = await apiClient.post<{ token: string }>('/auth/recuperar-contrasena/verificar-respuestas', {
        correo, respuesta1, respuesta2,
    });
    return r.data.token;
}

export async function establecerNuevaContrasena(correo: string, token: string, tipo: string, contrasenaNueva: string): Promise<void> {
    await apiClient.post('/auth/recuperar-contrasena/nueva-contrasena', { correo, token, tipo, contrasenaNueva });
}

export async function cambiarContrasenaVencida(correo: string, contrasenaActual: string, contrasenaNueva: string): Promise<void> {
    await apiClient.post('/auth/recuperar-contrasena/vencida', { correo, contrasenaActual, contrasenaNueva });
}

// ─── Recuperación de nombre de usuario ───────────────────────────────────────

export async function obtenerPreguntaRecuperacionUsuario(correo: string): Promise<{ IdPregunta: number; TextoPregunta: string }> {
    const r = await apiClient.post<{ pregunta: { IdPregunta: number; TextoPregunta: string } }>(
        '/auth/recuperar-usuario/pregunta',
        { correo },
    );
    return r.data.pregunta;
}

export async function verificarRespuestaRecuperacionUsuario(correo: string, respuesta: string): Promise<void> {
    await apiClient.post('/auth/recuperar-usuario/verificar-respuesta', { correo, respuesta });
}

// ─── Perfil ───────────────────────────────────────────────────────────────────

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
    await apiClient.put(`/usuarios/${idUsuario}/cambiar-contrasena`, { contrasenaActual, contrasenaNueva });
}

// ─── Verificación en dos pasos (2FA) ─────────────────────────────────────────

export async function verificarCodigo2FALogin(userId: number, code: string): Promise<Usuario> {
    const r = await apiClient.post<{ success: boolean; usuario: Usuario }>('/auth/2fa/verify-login', { userId, code });
    return r.data.usuario;
}

export async function iniciar2FA(idUsuario: number): Promise<{ qrImage: string }> {
    const r = await apiClient.post<{ success: boolean; qrImage: string }>('/auth/2fa/setup', { idUsuario });
    return r.data;
}

export async function activar2FA(idUsuario: number, code: string): Promise<void> {
    await apiClient.post('/auth/2fa/enable', { idUsuario, code });
}

export async function desactivar2FA(idUsuario: number, code: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { idUsuario, code });
}
