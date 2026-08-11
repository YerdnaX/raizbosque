// Mensajes del ritual de bienvenida que se muestra justo después de un login exitoso.
// Viven en el frontend a propósito: no requieren backend ni base de datos.

export const MENSAJES_BIENVENIDA = [
    'Qué bueno tenerte de vuelta. RaízBosque está listo para vos.',
    'Un momento para respirar. Bienvenido de nuevo a RaízBosque.',
    'Todo listo. Sigamos cultivando algo bueno.',
    'Tu espacio en RaízBosque te estaba esperando.',
    'Volvamos a conectar con lo que crece.',
    'Bienvenido de vuelta. Hay algo nuevo por descubrir.',
    'Entraste a un espacio para crecer con calma.',
    'Respirá. Ya estás en RaízBosque.',
];

export function elegirMensajeBienvenida(): string {
    const indice = Math.floor(Math.random() * MENSAJES_BIENVENIDA.length);
    return MENSAJES_BIENVENIDA[indice];
}
