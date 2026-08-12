import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilidad genérica para guardar progreso temporal de formularios largos
// (checkout, registro) exclusivamente en el dispositivo. Nunca se envía al
// backend. Cada borrador expira solo para no acumular datos viejos.
const PREFIJO = 'borrador:';
const EXPIRACION_POR_DEFECTO_MS = 24 * 60 * 60 * 1000; // 24 horas

type RegistroBorrador<T> = {
    datos: T;
    guardadoEn: number;
};

export async function guardarBorrador<T>(clave: string, datos: T): Promise<void> {
    const registro: RegistroBorrador<T> = { datos, guardadoEn: Date.now() };
    try {
        await AsyncStorage.setItem(PREFIJO + clave, JSON.stringify(registro));
    } catch {
        // Si el guardado falla (almacenamiento lleno, etc.) simplemente no hay
        // borrador disponible después; no es crítico para el flujo principal.
    }
}

export async function cargarBorrador<T>(clave: string, expiracionMs: number = EXPIRACION_POR_DEFECTO_MS): Promise<T | null> {
    try {
        const guardado = await AsyncStorage.getItem(PREFIJO + clave);
        if (!guardado) return null;

        const registro: RegistroBorrador<T> = JSON.parse(guardado);
        if (Date.now() - registro.guardadoEn > expiracionMs) {
            await AsyncStorage.removeItem(PREFIJO + clave);
            return null;
        }
        return registro.datos;
    } catch {
        return null;
    }
}

export async function eliminarBorrador(clave: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(PREFIJO + clave);
    } catch {
        // Ignorar: no hay nada más que hacer si ni siquiera se puede borrar.
    }
}
