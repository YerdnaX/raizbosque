import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useUsuario } from './UsuarioContext';
import type { ItemCarrito } from '../features/carrito/types/carritoItem';
import {
    obtenerCarrito as obtenerCarritoService,
    agregarItem as agregarItemService,
    actualizarCantidad as actualizarCantidadService,
    eliminarItem as eliminarItemService,
} from '../features/carrito/services/carritoService';

type CarritoContextType = {
    items: ItemCarrito[];
    totalItems: number;
    total: number;
    estaCargando: boolean;
    agregarAlCarrito: (idProducto: number, precio: number) => Promise<void>;
    actualizarCantidad: (idDetalle: number, cantidad: number) => Promise<void>;
    eliminarDelCarrito: (idDetalle: number) => Promise<void>;
    limpiarCarrito: () => void;
};

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
    const { usuario } = useUsuario();
    const [items, setItems] = useState<ItemCarrito[]>([]);
    const [estaCargando, setEstaCargando] = useState(false);

    const totalItems = items.reduce((suma, item) => suma + item.Cantidad, 0);
    const total = items.reduce((suma, item) => suma + item.Subtotal, 0);

    useEffect(() => {
        if (usuario) {
            inicializarCarrito();
        } else {
            setItems([]);
        }
    }, [usuario]);

    async function inicializarCarrito() {
        if (!usuario) return;
        setEstaCargando(true);
        try {
            const data = await obtenerCarritoService(usuario.IdUsuario);
            setItems(data.items);
        } catch {
            // silently fail
        } finally {
            setEstaCargando(false);
        }
    }

    async function recargarCarrito() {
        if (!usuario) return;
        try {
            const data = await obtenerCarritoService(usuario.IdUsuario);
            setItems(data.items);
        } catch {
            // silently fail
        }
    }

    async function agregarAlCarrito(idProducto: number, precio: number) {
        if (!usuario) {
            Alert.alert('Inicia sesión', 'Debes iniciar sesión para agregar productos al carrito.');
            return;
        }
        try {
            await agregarItemService(usuario.IdUsuario, idProducto, precio);
            await recargarCarrito();
        } catch {
            Alert.alert('Error', 'No se pudo agregar al carrito. Intenta de nuevo.');
        }
    }

    async function actualizarCantidad(idDetalle: number, cantidad: number) {
        try {
            await actualizarCantidadService(idDetalle, cantidad);
            await recargarCarrito();
        } catch {
            Alert.alert('Error', 'No se pudo actualizar la cantidad.');
        }
    }

    function limpiarCarrito() {
        setItems([]);
    }

    async function eliminarDelCarrito(idDetalle: number) {
        try {
            await eliminarItemService(idDetalle);
            await recargarCarrito();
        } catch {
            Alert.alert('Error', 'No se pudo eliminar el artículo.');
        }
    }

    return (
        <CarritoContext.Provider value={{ items, totalItems, total, estaCargando, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito }}>
            {children}
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    return context;
}
