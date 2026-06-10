import { useState, useEffect } from 'react';
import { obtenerProductos } from '../services/productosService';
import type { Producto } from '../types/producto';

export function useProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        obtenerProductos()
            .then(setProductos)
            .catch((err) => {
                console.error('[useProductos]', err.message, err.code);
                setError('No se pudieron cargar los productos.');
            })
            .finally(() => setEstaCargando(false));
    }, []);

    return { productos, estaCargando, error };
}
