import { useState, useEffect } from 'react';
import { obtenerProductos } from '../services/productosService';
import { useIdioma } from '../../../context/IdiomaContext';
import type { Producto } from '../types/producto';

export function useProductos() {
    const { t } = useIdioma();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerProductos()
            .then(setProductos)
            .catch((err) => {
                console.error('[useProductos]', err.message, err.code);
                setError(t('errors.loadProducts'));
            })
            .finally(() => setEstaCargando(false));
    }, [t]);

    return { productos, estaCargando, error };
}
