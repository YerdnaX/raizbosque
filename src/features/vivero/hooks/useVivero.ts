import { useState, useEffect } from 'react';
import { obtenerPlantasVivero } from '../services/viveroService';
import { useIdioma } from '../../../context/IdiomaContext';
import type { Planta } from '../types/planta';

export function useVivero() {
    const { t } = useIdioma();
    const [plantas, setPlantas] = useState<Planta[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerPlantasVivero()
            .then(setPlantas)
            .catch((err) => {
                console.error('[useVivero]', err.message, err.code);
                setError(t('errors.loadPlants'));
            })
            .finally(() => {
                console.log('[useVivero] Carga de plantas finalizada. Total plantas:', plantas.length);
                setEstaCargando(false);
            });
    }, [t]);

    return { plantas, estaCargando, error };
}
