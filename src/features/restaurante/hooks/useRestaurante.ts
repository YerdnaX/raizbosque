import { useState, useEffect } from 'react';
import { obtenerItemsRestaurante } from '../services/restauranteService';
import type { ItemRestaurante } from '../types/itemRestaurante';

export function useRestaurante() {
    const [items, setItems] = useState<ItemRestaurante[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerItemsRestaurante()
            .then(setItems)
            .catch((err) => {
                console.error('[useRestaurante]', err.message, err.code);
                setError('No se pudo cargar el menú.');
            })
            .finally(() => setEstaCargando(false));
    }, []);

    return { items, estaCargando, error };
}
