import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator, ImageBackground, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import AtrasIcono from '@/assets/icons/atras.svg';
import { useCarrito } from '../context/CarritoContext';
import { urlImagen } from '../utils/urlImagen';
import type { ItemCarrito } from '../features/carrito/types/carritoItem';

export default function Carrito() {
    const insets = useSafeAreaInsets();
    const { items, total, totalItems, estaCargando, actualizarCantidad, eliminarDelCarrito } = useCarrito();

    function manejarDecrementar(item: ItemCarrito) {
        if (item.Cantidad <= 1) {
            eliminarDelCarrito(item.IdDetalle);
        } else {
            actualizarCantidad(item.IdDetalle, item.Cantidad - 1);
        }
    }

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonAtras} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Mi Carrito</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            {estaCargando ? (
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                </View>
            ) : items.length === 0 ? (
                <View style={estilos.centrado}>
                    <SymbolView name="cart" size={56} tintColor="#c3c8c1" />
                    <Text style={estilos.vacioTitulo}>Carrito vacío</Text>
                    <Text style={estilos.vacioSubtitulo}>Agrega productos desde el vivero o restaurante.</Text>
                    <Pressable style={estilos.botonExplorar} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={() => router.back()}>
                        <Text style={estilos.botonExplorarTexto}>Explorar</Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={item => item.IdDetalle.toString()}
                        contentContainerStyle={estilos.lista}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TarjetaItem
                                item={item}
                                onIncrementar={() => actualizarCantidad(item.IdDetalle, item.Cantidad + 1)}
                                onDecrementar={() => manejarDecrementar(item)}
                                onEliminar={() => eliminarDelCarrito(item.IdDetalle)}
                            />
                        )}
                    />

                    <View style={estilos.pie}>
                        <View style={estilos.totalFila}>
                            <Text style={estilos.totalEtiqueta}>
                                Total ({totalItems} artículo{totalItems !== 1 ? 's' : ''})
                            </Text>
                            <Text style={estilos.totalValor}>
                                ₡{total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <Pressable style={estilos.botonFinalizar} android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }} onPress={() => router.push('/checkout')}>
                            <Text style={estilos.botonFinalizarTexto}>FINALIZAR COMPRA</Text>
                        </Pressable>
                    </View>
                </>
            )}
        </View>
    );
}

type TarjetaItemProps = {
    item: ItemCarrito;
    onIncrementar: () => void;
    onDecrementar: () => void;
    onEliminar: () => void;
};

function TarjetaItem({ item, onIncrementar, onDecrementar, onEliminar }: TarjetaItemProps) {
    const imageUrl = urlImagen(item.Imagen);
    return (
        <View style={estilos.tarjeta}>
            <View style={estilos.imagenContenedor}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={estilos.imagen} />
                ) : (
                    <View style={estilos.imagenPlaceholder} />
                )}
            </View>
            <View style={estilos.infoItem}>
                <Text style={estilos.nombreItem} numberOfLines={2}>{item.Nombre}</Text>
                <Text style={estilos.precioUnitario}>
                    ₡{item.PrecioUnitario.toLocaleString('es-CR')} c/u
                </Text>
                <View style={estilos.controlFila}>
                    <View style={estilos.controles}>
                        <Pressable
                            style={({ pressed }) => [estilos.botonControl, pressed && estilos.botonPresionado]}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                            onPress={onDecrementar}
                        >
                            <Text style={estilos.botonControlTexto}>−</Text>
                        </Pressable>
                        <Text style={estilos.cantidad}>{item.Cantidad}</Text>
                        <Pressable
                            style={({ pressed }) => [estilos.botonControl, pressed && estilos.botonPresionado]}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                            onPress={onIncrementar}
                        >
                            <Text style={estilos.botonControlTexto}>+</Text>
                        </Pressable>
                    </View>
                    <Text style={estilos.subtotal}>
                        ₡{item.Subtotal.toLocaleString('es-CR')}
                    </Text>
                </View>
            </View>
            <Pressable
                onPress={onEliminar}
                android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                style={({ pressed }) => [estilos.botonEliminar, pressed && estilos.botonPresionado]}
            >
                <SymbolView name="trash" size={18} tintColor="#ba1a1a" />
            </Pressable>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#f0eee8',
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#c8d4c0',
    },
    botonAtras: {
        padding: 4,
    },
    fondoAtras: {
        backgroundColor: '#6b7068',
        borderRadius: 999,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 1,
    },
    espaciador: {
        width: 52,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
    },
    vacioTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        marginTop: 8,
    },
    vacioSubtitulo: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
    },
    botonExplorar: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 32,
        overflow: 'hidden',
    },
    botonExplorarTexto: {
        color: '#1b3022',
        fontWeight: '600',
        fontSize: 14,
    },
    lista: {
        padding: 16,
        gap: 12,
    },
    tarjeta: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        gap: 12,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    imagenContenedor: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e5e2dc',
        overflow: 'hidden',
    },
    imagen: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagenPlaceholder: {
        flex: 1,
        backgroundColor: '#e5e2dc',
    },
    infoItem: {
        flex: 1,
        gap: 4,
    },
    nombreItem: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c18',
    },
    botonEliminar: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 6,
    },
    botonPresionado: {
        opacity: 0.5,
        transform: [{ scale: 0.88 }],
    },
    precioUnitario: {
        fontSize: 13,
        color: '#737973',
    },
    controlFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    controles: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#f0eee8',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    botonControl: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botonControlTexto: {
        fontSize: 20,
        color: '#1c1c18',
        lineHeight: 24,
    },
    cantidad: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1c18',
        minWidth: 20,
        textAlign: 'center',
    },
    subtotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#526349',
    },
    pie: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 24,
        gap: 14,
    },
    totalFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    totalEtiqueta: {
        fontSize: 14,
        color: '#737973',
        fontWeight: '500',
    },
    totalValor: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1c1c18',
    },
    botonFinalizar: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonFinalizarTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
