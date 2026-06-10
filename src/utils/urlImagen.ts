export function urlImagen(valor: string | null | undefined): string | null {
    if (!valor) return null;
    if (valor.startsWith('http://') || valor.startsWith('https://')) return valor;
    return null;
}
