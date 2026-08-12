import { useEffect, useRef } from 'react';
import { guardarBorrador } from '../utils/borradores';

/**
 * Guarda `datos` como borrador local cada vez que cambian, con un pequeño
 * debounce para no escribir en cada pulsación. `activo` controla cuándo debe
 * guardar (por ejemplo, solo si hay usuario o solo tras hidratar un borrador
 * previo, para no sobreescribirlo con el estado inicial vacío).
 */
export function useGuardadoAutomatico<T>(clave: string | null, datos: T, activo: boolean, esperaMs = 600) {
    const datosJson = JSON.stringify(datos);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!activo || !clave) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            guardarBorrador(clave, JSON.parse(datosJson));
        }, esperaMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clave, activo, datosJson, esperaMs]);
}
