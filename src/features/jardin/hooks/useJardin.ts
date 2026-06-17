import { useState, useEffect, useCallback } from 'react';
import { obtenerJardin, eliminarDelJardin } from '../services/jardinService';
import type { PlantaJardin } from '../types/plantaJardin';

export function useJardin(idUsuario: number | null) {
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
            .catch(() => setError('No se pudo cargar tu jardín.'))
            .finally(() => setEstaCargando(false));
    }, [idUsuario]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    function eliminar(idJardin: number) {
        eliminarDelJardin(idJardin)
            .then(cargar)
            .catch(() => setError('No se pudo eliminar la planta.'));
    }

    return { plantas, estaCargando, error, recargar: cargar, eliminar };
}
