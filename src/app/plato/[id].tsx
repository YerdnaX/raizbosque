import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, ImageBackground, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import AtrasIcono from '@/assets/icons/atras.svg';
import { useDetalleRestaurante } from '../../features/restaurante/hooks/useDetalleRestaurante';
import { urlImagen } from '../../utils/urlImagen';

const IMAGEN_TOPBAR = require('@/assets/images/login/topBar.png');

function Encabezado() {
    const insets = useSafeAreaInsets();
    return (
        <>
            <ImageBackground source={IMAGEN_TOPBAR} style={[estilos.encabezado, { paddingTop: insets.top }]} resizeMode="cover">
                <Pressable style={estilos.botonAtras} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>RAÍCES</Text>
                <Pressable style={estilos.botonEncabezado}>
                    <CarritoIcono width={30} height={30} fill="#1b3022" />
                </Pressable>
            </ImageBackground>
        </>
    );
}

export default function DetallePlato() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { item, estaCargando, error } = useDetalleRestaurante(Number(id));

    if (estaCargando) {
        return (
            <View style={estilos.contenedor}>
                <Encabezado />
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                    <Text style={estilos.cargandoTexto}>Cargando :D</Text>
                </View>
            </View>
        );
    }

    if (error || !item) {
        return (
            <View style={estilos.contenedor}>
                <Encabezado />
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error ?? 'Producto no encontrado.'}</Text>
                    <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
                        <Text style={estilos.botonVolverTexto}>Volver al Menú</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={estilos.contenedor}>
            <Encabezado />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scroll}>
                {/* Imagen principal */}
                <View style={estilos.imagenPrincipal}>
                    {urlImagen(item.Imagen) ? (
                        <Image source={{ uri: urlImagen(item.Imagen)! }} style={estilos.imagenReal} />
                    ) : null}
                </View>

                {/* Miniaturas */}
                <View style={estilos.miniaturas}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={estilos.miniatura}>
                            {urlImagen(item.Imagen) ? (
                                <Image source={{ uri: urlImagen(item.Imagen)! }} style={estilos.imagenMiniatura} />
                            ) : null}
                        </View>
                    ))}
                </View>

                <View style={estilos.infoContenido}>
                    {/* Tag de categoría */}
                    <View style={estilos.tags}>
                        <View style={estilos.tag}>
                            <Text style={estilos.tagTexto}>{item.NombreCategoria}</Text>
                        </View>
                        {item.Stock <= 5 && (
                            <View style={[estilos.tag, estilos.tagAgotando]}>
                                <Text style={[estilos.tagTexto, estilos.tagAgotandoTexto]}>
                                    Pocas unidades
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Nombre y precio */}
                    <Text style={estilos.nombre}>{item.Nombre}</Text>
                    <Text style={estilos.precio}>₡{item.Precio.toLocaleString('es-CR')}</Text>

                    <View style={estilos.separador} />

                    {/* Descripción */}
                    {item.Descripcion ? (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>Descripción</Text>
                            <Text style={estilos.descripcion}>{item.Descripcion}</Text>
                        </View>
                    ) : null}

                    {/* Info adicional */}
                    <View style={estilos.seccion}>
                        <Text style={estilos.seccionTitulo}>Información</Text>
                        <View style={estilos.infoItems}>
                            <View style={estilos.infoItem}>
                                <SymbolView name="fork.knife" size={22} tintColor="#526349" />
                                <View style={estilos.infoTexto}>
                                    <Text style={estilos.infoEtiqueta}>CATEGORÍA</Text>
                                    <Text style={estilos.infoValor}>{item.NombreCategoria}</Text>
                                </View>
                            </View>
                            <View style={estilos.infoItem}>
                                <SymbolView name="bag.fill" size={22} tintColor="#526349" />
                                <View style={estilos.infoTexto}>
                                    <Text style={estilos.infoEtiqueta}>DISPONIBILIDAD</Text>
                                    <Text style={estilos.infoValor}>
                                        {item.Stock > 0 ? `${item.Stock} disponibles` : 'Sin stock'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Botones fijos abajo */}
            <View style={estilos.botonesAbajo}>
                <Pressable style={estilos.botonAgregar}>
                    <SymbolView name="cart.fill.badge.plus" size={18} tintColor="#ffffff" />
                    <Text style={estilos.botonAgregarTexto}>AGREGAR AL CARRITO</Text>
                </Pressable>
            </View>
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
    botonAtras: {
        padding: 4,
    },
    fondoAtras: {
        backgroundColor: '#1c1c18',
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
        color: '#1b3022',
        letterSpacing: 1,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 24,
    },
    cargandoTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
    },
    errorTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
    },
    botonVolver: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    botonVolverTexto: {
        color: '#1b3022',
        fontWeight: '600',
        fontSize: 14,
    },
    scroll: {
        paddingBottom: 24,
    },
    imagenPrincipal: {
        width: '100%',
        height: 260,
        backgroundColor: '#e5e2dc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenReal: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    miniaturas: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    miniatura: {
        flex: 1,
        height: 72,
        backgroundColor: '#e5e2dc',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagenMiniatura: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    infoContenido: {
        paddingHorizontal: 20,
        gap: 12,
    },
    tags: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    tag: {
        borderWidth: 1,
        borderColor: '#8da082',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    tagTexto: {
        fontSize: 13,
        color: '#526349',
        fontWeight: '500',
    },
    tagAgotando: {
        borderColor: '#e07000',
    },
    tagAgotandoTexto: {
        color: '#e07000',
    },
    nombre: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1c1c18',
    },
    precio: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1c1c18',
    },
    separador: {
        height: 1,
        backgroundColor: '#e5e2dc',
        marginVertical: 2,
    },
    seccion: {
        gap: 10,
    },
    seccionTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
    },
    descripcion: {
        fontSize: 14,
        color: '#434843',
        lineHeight: 22,
    },
    infoItems: {
        gap: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    infoTexto: {
        flex: 1,
        gap: 2,
    },
    infoEtiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737973',
        letterSpacing: 0.8,
    },
    infoValor: {
        fontSize: 14,
        color: '#1c1c18',
        fontWeight: '500',
    },
    botonesAbajo: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 10,
    },
    botonAgregar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        gap: 10,
    },
    botonAgregarTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    botonPersonalizar: {
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 14,
    },
    botonPersonalizarTexto: {
        color: '#1b3022',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
