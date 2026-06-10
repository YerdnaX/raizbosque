import { useState, useEffect } from 'react';
import { obtenerItemRestaurantePorId } from '../services/restauranteService';
import type { ItemRestaurante } from '../types/itemRestaurante';

export function useDetalleRestaurante(id: number) {
    const [item, setItem] = useState<ItemRestaurante | null>(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerItemRestaurantePorId(id)
            .then(setItem)
            .catch((err) => {
                console.error('[useDetalleRestaurante]', err.message, err.code);
                setError('No se pudo cargar la información del producto.');
            })
            .finally(() => setEstaCargando(false));
    }, [id]);

    return { item, estaCargando, error };
}
