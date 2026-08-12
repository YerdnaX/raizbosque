import { useState, useEffect, useCallback } from 'react';
import { obtenerJardin, eliminarDelJardin } from '../services/jardinService';
import { useIdioma } from '../../../context/IdiomaContext';
import type { PlantaJardin } from '../types/plantaJardin';

export function useJardin(idUsuario: number | null) {
    const { t } = useIdioma();
    const [plantas, setPlantas] = useState<PlantaJardin[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargar = useCallback(() => {
        if (!idUsuario) {
            setEstaCargando(false);
            return;
        }
        setEstaCargando(true);
        setError(null);
        obtenerJardin(idUsuario)
            .then(setPlantas)
            .catch(() => setError(t('errors.loadGarden')))
            .finally(() => setEstaCargando(false));
    }, [idUsuario, t]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    function eliminar(idJardin: number) {
        eliminarDelJardin(idJardin)
            .then(cargar)
            .catch(() => setError(t('errors.removeGardenPlant')));
    }

    return { plantas, estaCargando, error, recargar: cargar, eliminar };
}
