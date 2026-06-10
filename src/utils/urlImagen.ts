const BASE_SERVIDOR = (process.env.EXPO_PUBLIC_API_URL ?? 'https://raizbosquebackend.onrender.com/api')
    .replace(/\/api$/, '');

export function urlImagen(nombre: string | null | undefined): string | null {
    if (!nombre) return null;
    return `${BASE_SERVIDOR}/imagenes/${nombre}`;
}
