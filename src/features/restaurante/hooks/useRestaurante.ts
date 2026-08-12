import { useState, useEffect } from 'react';
import { obtenerItemsRestaurante } from '../services/restauranteService';
import { useIdioma } from '../../../context/IdiomaContext';
import type { ItemRestaurante } from '../types/itemRestaurante';

export function useRestaurante() {
    const { t } = useIdioma();
    const [items, setItems] = useState<ItemRestaurante[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerItemsRestaurante()
            .then(setItems)
            .catch((err) => {
                console.error('[useRestaurante]', err.message, err.code);
                setError(t('errors.loadMenu'));
            })
            .finally(() => setEstaCargando(false));
    }, [t]);

    return { items, estaCargando, error };
}
