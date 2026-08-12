import { View, Text, Pressable, FlatList, StyleSheet, ActivityIndicator, ImageBackground, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import { useVivero } from '../../features/vivero/hooks/useVivero';
import { urlImagen } from '../../utils/urlImagen';
import { useCarrito } from '../../context/CarritoContext';
import { useIdioma } from '../../context/IdiomaContext';
import { BusquedaFiltrosCatalogo } from '../../features/catalogo/components/BusquedaFiltrosCatalogo';
import { useBusquedaCatalogo } from '../../features/catalogo/hooks/useBusquedaCatalogo';

export default function Vivero() {
    const insets = useSafeAreaInsets();
    const { plantas, estaCargando, error } = useVivero();
    const { agregarAlCarrito, totalItems } = useCarrito();
    const { t } = useIdioma();
    const catalogo = useBusquedaCatalogo(plantas);

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonEncabezado} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1b3022" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>{t('shop.nursery.headerTitle')}</Text>
                <Pressable style={estilos.botonEncabezado} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.push('/carrito')}>
                    <View>
                        <CarritoIcono width={30} height={30} fill="#1b3022" />
                        {totalItems > 0 && (
                            <View style={estilos.badge}>
                                <Text style={estilos.badgeTexto}>{totalItems > 9 ? '9+' : totalItems}</Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </ImageBackground>

            {estaCargando ? (
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                </View>
            ) : error ? (
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={catalogo.resultados}
                    keyExtractor={planta => planta.IdProducto.toString()}
                    numColumns={2}
                    contentContainerStyle={estilos.lista}
                    columnWrapperStyle={estilos.fila}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <BusquedaFiltrosCatalogo
                            placeholder={t('shop.nursery.searchPlaceholder')}
                            busqueda={catalogo.busqueda}
                            onCambiarBusqueda={catalogo.setBusqueda}
                            categoriaActiva={catalogo.categoriaActiva}
                            onCambiarCategoria={catalogo.setCategoriaActiva}
                            soloDisponibles={catalogo.soloDisponibles}
                            onCambiarDisponibles={catalogo.setSoloDisponibles}
                            onMostrarTodos={catalogo.mostrarTodos}
                            categorias={catalogo.categorias}
                            sugerencias={catalogo.sugerencias}
                        />
                    }
                    ListEmptyComponent={
                        <View style={estilos.vacioContenedor}>
                            <Text style={estilos.vacio}>
                                {catalogo.busqueda.trim()
                                    ? t('shop.noResults', { query: catalogo.busqueda.trim() })
                                    : t('shop.noFilteredResults')}
                            </Text>
                            <Text style={estilos.vacioAyuda}>{t('shop.noResultsHint')}</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            style={estilos.tarjeta}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                            onPress={() => router.push(`/planta/${item.IdProducto}`)}
                        >
                            <View style={estilos.imagenPlaceholder}>
                                {urlImagen(item.Imagen) ? (
                                    <Image source={{ uri: urlImagen(item.Imagen)! }} style={estilos.imagen} />
                                ) : null}
                            </View>
                            <Text style={estilos.nombrePlanta} numberOfLines={2}>{item.Nombre}</Text>
                            {item.FrecuenciaRiego && (
                                <View style={estilos.riegoFila}>
                                    <SymbolView name="drop.fill" size={13} tintColor="#526349" />
                                    <Text style={estilos.riegoTexto}>{item.FrecuenciaRiego}</Text>
                                </View>
                            )}
                            <View style={estilos.precioFila}>
                                <Text style={estilos.precio}>₡{item.Precio.toLocaleString('es-CR')}</Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        estilos.botonAgregar,
                                        pressed && estilos.botonAgregarPresionado,
                                    ]}
                                    android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                    onPress={() => agregarAlCarrito(item.IdProducto, item.Precio)}
                                >
                                    <Text style={estilos.botonAgregarTexto}>+</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    )}
                />
            )}
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
    botonEncabezado: {
        padding: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 1,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    lista: {
        paddingBottom: 16,
    },
    fila: {
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 12,
    },
    tarjeta: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
    },
    imagenPlaceholder: {
        backgroundColor: '#e5e2dc',
        borderRadius: 8,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    nombrePlanta: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c18',
        marginBottom: 4,
    },
    riegoFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    riegoTexto: {
        fontSize: 12,
        color: '#526349',
    },
    precioFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    precio: {
        fontSize: 16,
        fontWeight: '700',
        color: '#526349',
    },
    botonAgregar: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#c3c8c1',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonAgregarPresionado: {
        opacity: 0.5,
        transform: [{ scale: 0.90 }],
    },
    botonAgregarTexto: {
        fontSize: 18,
        color: '#1c1c18',
        lineHeight: 22,
    },
    vacio: {
        textAlign: 'center',
        color: '#1c1c18',
        fontSize: 15,
        fontWeight: '600',
    },
    vacioContenedor: { marginTop: 40, paddingHorizontal: 24, gap: 6 },
    vacioAyuda: { textAlign: 'center', color: '#737973', fontSize: 13 },
    imagen: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#1b3022',
        borderRadius: 999,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    badgeTexto: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
});
