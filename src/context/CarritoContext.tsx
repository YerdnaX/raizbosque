import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { useUsuario } from './UsuarioContext';
import { useIdioma } from './IdiomaContext';
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
    agregarAlCarrito: (idProducto: number, precio: number) => Promise<boolean>;
    agregarVariosAlCarrito: (solicitudes: SolicitudCarrito[]) => Promise<ResultadoAgregarVarios>;
    actualizarCantidad: (idDetalle: number, cantidad: number) => Promise<void>;
    eliminarDelCarrito: (idDetalle: number) => Promise<void>;
    limpiarCarrito: () => void;
};

export type SolicitudCarrito = {
    idProducto: number;
    precio: number;
    cantidad: number;
};

export type ResultadoAgregarVarios = {
    unidadesAgregadas: number;
    productosFallidos: number[];
};

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
    const { usuario } = useUsuario();
    const { t } = useIdioma();
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

    async function agregarAlCarrito(idProducto: number, precio: number): Promise<boolean> {
        if (!usuario) {
            Alert.alert(t('cart.loginRequiredTitle'), t('cart.loginRequiredMessage'));
            return false;
        }
        try {
            await agregarItemService(usuario.IdUsuario, idProducto, precio);
            await recargarCarrito();
            return true;
        } catch {
            Alert.alert(t('common.error'), t('cart.errors.add'));
            return false;
        }
    }

    async function agregarVariosAlCarrito(solicitudes: SolicitudCarrito[]): Promise<ResultadoAgregarVarios> {
        if (!usuario) {
            Alert.alert(t('cart.loginRequiredTitle'), t('cart.loginRequiredMessage'));
            return { unidadesAgregadas: 0, productosFallidos: solicitudes.map(item => item.idProducto) };
        }

        let unidadesAgregadas = 0;
        const productosFallidos = new Set<number>();

        for (const solicitud of solicitudes) {
            for (let unidad = 0; unidad < solicitud.cantidad; unidad += 1) {
                try {
                    await agregarItemService(usuario.IdUsuario, solicitud.idProducto, solicitud.precio);
                    unidadesAgregadas += 1;
                } catch {
                    productosFallidos.add(solicitud.idProducto);
                    break;
                }
            }
        }

        if (unidadesAgregadas > 0) await recargarCarrito();
        return { unidadesAgregadas, productosFallidos: Array.from(productosFallidos) };
    }

    async function actualizarCantidad(idDetalle: number, cantidad: number) {
        try {
            await actualizarCantidadService(idDetalle, cantidad);
            await recargarCarrito();
        } catch {
            Alert.alert(t('common.error'), t('cart.errors.updateQuantity'));
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
            Alert.alert(t('common.error'), t('cart.errors.remove'));
        }
    }

    return (
        <CarritoContext.Provider value={{ items, totalItems, total, estaCargando, agregarAlCarrito, agregarVariosAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito }}>
            {children}
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    return context;
}
