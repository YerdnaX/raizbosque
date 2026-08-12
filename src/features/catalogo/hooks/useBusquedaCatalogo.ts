import { useMemo, useState } from 'react';

export type ElementoCatalogo = {
    IdProducto: number;
    Nombre: string;
    NombreCategoria: string;
    Stock: number;
};

function normalizar(texto: string): string {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase()
        .trim();
}

export function useBusquedaCatalogo<T extends ElementoCatalogo>(elementos: T[]) {
    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
    const [soloDisponibles, setSoloDisponibles] = useState(false);

    const categorias = useMemo(
        () => Array.from(new Set(elementos.map(item => item.NombreCategoria))).filter(Boolean),
        [elementos],
    );

    const consultaNormalizada = normalizar(busqueda);

    const resultados = useMemo(() => elementos.filter(item => {
        const textoBuscable = normalizar(`${item.Nombre} ${item.NombreCategoria}`);
        const coincideBusqueda = consultaNormalizada === '' || textoBuscable.includes(consultaNormalizada);
        const coincideCategoria = categoriaActiva === null || item.NombreCategoria === categoriaActiva;
        const coincideDisponibilidad = !soloDisponibles || item.Stock > 0;
        return coincideBusqueda && coincideCategoria && coincideDisponibilidad;
    }), [elementos, consultaNormalizada, categoriaActiva, soloDisponibles]);

    const sugerencias = useMemo(() => {
        if (!consultaNormalizada) return [];
        return resultados.slice(0, 5);
    }, [consultaNormalizada, resultados]);

    function mostrarTodos() {
        setCategoriaActiva(null);
        setSoloDisponibles(false);
    }

    return {
        busqueda,
        setBusqueda,
        categoriaActiva,
        setCategoriaActiva,
        soloDisponibles,
        setSoloDisponibles,
        categorias,
        resultados,
        sugerencias,
        mostrarTodos,
    };
}
