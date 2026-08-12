import { useState, useEffect } from 'react';
import { obtenerPlantaPorId } from '../services/viveroService';
import { useIdioma } from '../../../context/IdiomaContext';
import type { Planta } from '../types/planta';

export function useDetallePlanta(id: number) {
    const { t } = useIdioma();
    const [planta, setPlanta] = useState<Planta | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerPlantaPorId(id)
            .then(setPlanta)
            .catch((err) => {
                console.error('[useDetallePlanta]', err.message, err.code);
                setError(t('errors.loadPlantDetail'));
            })
            .finally(() => setEstaCargando(false));
    }, [id, t]);

    return { planta, estaCargando, error };
}
