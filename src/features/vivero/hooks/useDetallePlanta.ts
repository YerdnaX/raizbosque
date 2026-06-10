import { useState, useEffect } from 'react';
import { obtenerPlantaPorId } from '../services/viveroService';
import type { Planta } from '../types/planta';

export function useDetallePlanta(id: number) {
    const [planta, setPlanta] = useState<Planta | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerPlantaPorId(id)
            .then(setPlanta)
            .catch((err) => {
                console.error('[useDetallePlanta]', err.message, err.code);
                setError('No se pudo cargar la información de la planta.');
            })
            .finally(() => setEstaCargando(false));
    }, [id]);

    return { planta, estaCargando, error };
}
