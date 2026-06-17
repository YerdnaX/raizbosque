import { View, Text, Pressable, FlatList, Image, StyleSheet, ActivityIndicator, ImageBackground, Alert } from "react-native";
import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import { useJardin } from '../../features/jardin/hooks/useJardin';
import { useUsuario } from '../../context/UsuarioContext';
import { useCarrito } from '../../context/CarritoContext';
import { urlImagen } from '../../utils/urlImagen';
import type { PlantaJardin } from '../../features/jardin/types/plantaJardin';

function formatearProximoRiego(dias: number | null): string {
    if (dias === null) return '—';
    if (dias <= 0) return 'Hoy';
    if (dias === 1) return 'Mañana';
    return `${dias} días`;
}

export default function Jardin() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { totalItems } = useCarrito();
    const { plantas, estaCargando, error, eliminar, recargar } = useJardin(usuario?.IdUsuario ?? null);

    useFocusEffect(
        useCallback(() => {
            recargar();
        }, [recargar])
    );

    function confirmarEliminar(idJardin: number, nombre: string) {
        Alert.alert(
            'Eliminar planta',
            `¿Quitar "${nombre}" de tu jardín?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(idJardin) },
            ]
        );
    }

    function renderTarjeta({ item }: { item: PlantaJardin }) {
        const esRevisar = item.EstadoPlanta && item.EstadoPlanta !== 'Saludable';

        return (
            <Pressable
                style={estilos.tarjeta}
                onLongPress={() => confirmarEliminar(item.IdJardin, item.Nombre)}
            >
                <View style={estilos.imagenContenedor}>
                    {urlImagen(item.Imagen) ? (
                        <Image source={{ uri: urlImagen(item.Imagen)! }} style={estilos.imagen} />
                    ) : (
                        <View style={estilos.imagenPlaceholder} />
                    )}
                </View>

                <Text style={estilos.nombrePlanta} numberOfLines={2}>{item.Nombre}</Text>

                {item.NombrePersonalizado ? (
                    <Text style={estilos.nombrePersonalizado}>"{item.NombrePersonalizado}"</Text>
                ) : null}

                <View style={estilos.separador} />

                <View style={estilos.chipsRow}>
                    <View style={estilos.chip}>
                        <SymbolView name="drop.fill" size={13} tintColor="#526349" />
                        <Text style={estilos.chipTexto}>{formatearProximoRiego(item.DiasParaRiego)}</Text>
                    </View>

                    {esRevisar ? (
                        <View style={[estilos.chip, estilos.chipRevisar]}>
                            <SymbolView name="exclamationmark.triangle" size={13} tintColor="#b45309" />
                            <Text style={[estilos.chipTexto, estilos.chipRevisarTexto]}>Revisar</Text>
                        </View>
                    ) : (
                        <View style={[estilos.chip, estilos.chipBuena]}>
                            <SymbolView name="heart.fill" size={13} tintColor="#526349" />
                            <Text style={estilos.chipTexto}>Buena</Text>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    }

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonEncabezado}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1b3022" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>RAÍCES</Text>
                <Pressable style={estilos.botonEncabezado} onPress={() => router.push('/carrito')}>
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
                    data={plantas}
                    keyExtractor={item => item.IdJardin.toString()}
                    numColumns={2}
                    contentContainerStyle={estilos.lista}
                    columnWrapperStyle={estilos.fila}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={estilos.cabecera}>
                            <View style={estilos.cabeceraFila}>
                                <View>
                                    <Text style={estilos.titulo}>Mi Jardín</Text>
                                    <Text style={estilos.subtitulo}>Tus plantas actuales.</Text>
                                </View>
                                <Pressable style={estilos.botonAgregar} onPress={() => router.push('/vivero')}>
                                    <Text style={estilos.botonAgregarTexto}>+ AGREGAR</Text>
                                </Pressable>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={estilos.vacio}>
                            <Text style={estilos.vacioTexto}>Tu jardín está vacío.</Text>
                            <Text style={estilos.vacioSubtexto}>Agrega plantas desde el Vivero.</Text>
                        </View>
                    }
                    renderItem={renderTarjeta}
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
        color: '#1b3022',
        letterSpacing: 1,
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
    cabecera: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    cabeceraFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titulo: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1c1c18',
    },
    subtitulo: {
        fontSize: 13,
        color: '#737973',
        marginTop: 2,
    },
    botonAgregar: {
        borderWidth: 1.5,
        borderColor: '#1b3022',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    botonAgregarTexto: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1b3022',
        letterSpacing: 0.5,
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
    },
    imagenContenedor: {
        borderRadius: 8,
        height: 140,
        marginBottom: 10,
        overflow: 'hidden',
        backgroundColor: '#e5e2dc',
    },
    imagen: {
        width: '100%',
        height: '100%',
    },
    imagenPlaceholder: {
        flex: 1,
        backgroundColor: '#e5e2dc',
    },
    nombrePlanta: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1c18',
    },
    nombrePersonalizado: {
        fontSize: 12,
        color: '#737973',
        marginTop: 2,
    },
    separador: {
        height: 1,
        backgroundColor: '#e5e2dc',
        marginVertical: 8,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#ffffff',
    },
    chipTexto: {
        fontSize: 12,
        color: '#434843',
        fontWeight: '500',
    },
    chipBuena: {
        borderColor: '#8da082',
    },
    chipRevisar: {
        borderColor: '#d97706',
        backgroundColor: '#fffbeb',
    },
    chipRevisarTexto: {
        color: '#b45309',
    },
    vacio: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 8,
    },
    vacioTexto: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1c1c18',
    },
    vacioSubtexto: {
        fontSize: 13,
        color: '#737973',
    },
});
