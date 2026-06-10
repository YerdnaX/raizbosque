import { useState, useEffect } from 'react';
import { obtenerPlantaDelMes, type PlantaDelMes } from '../services/inicioService';

export function useInicio() {
    const [plantaDelMes, setPlantaDelMes] = useState<PlantaDelMes | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerPlantaDelMes()
            .then(setPlantaDelMes)
            .catch((err) => {
                console.error('[useInicio]', err.message, err.code);
                setError('No se pudo cargar la planta del mes.');
            })
            .finally(() => setEstaCargando(false));
    }, []);

    return { plantaDelMes, estaCargando, error };
}
