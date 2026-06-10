import { useState, useEffect } from 'react';
import { obtenerPlantasVivero } from '../services/viveroService';
import type { Planta } from '../types/planta';

export function useVivero() {
    const [plantas, setPlantas] = useState<Planta[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerPlantasVivero()
            .then(setPlantas)
            .catch((err) => {
                console.error('[useVivero]', err.message, err.code);
                setError('No se pudieron cargar las plantas.');
            })
            .finally(() => setEstaCargando(false));
    }, []);

    return { plantas, estaCargando, error };
}
