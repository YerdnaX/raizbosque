import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, ImageBackground, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import AtrasIcono from '@/assets/icons/atras.svg';
import { useDetallePlanta } from '../../features/vivero/hooks/useDetallePlanta';
import { urlImagen } from '../../utils/urlImagen';

const IMAGEN_TOPBAR = require('@/assets/images/login/topBar.png');

function Encabezado() {
    const insets = useSafeAreaInsets();
    return (
        <>
            <ImageBackground source={IMAGEN_TOPBAR} style={[estilos.encabezado, { paddingTop: insets.top }]} resizeMode="cover">
                <Pressable style={estilos.botonAtras} onPress={() => router.back()}>
                    <AtrasIcono width={56} height={56} fill="#000000" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>RAÍCES</Text>
                <Pressable style={estilos.botonEncabezado}>
                    <CarritoIcono width={30} height={30} fill="#1b3022" />
                </Pressable>
            </ImageBackground>
        </>
    );
}

export default function DetallePlanta() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { planta, estaCargando, error } = useDetallePlanta(Number(id));

    if (estaCargando) {
        return (
            <View style={estilos.contenedor}>
                <Encabezado />
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                    <Text style={estilos.cargandoTexto}>Cargando la info desde el API...</Text>
                </View>
            </View>
        );
    }

    if (error || !planta) {
        return (
            <View style={estilos.contenedor}>
                <Encabezado />
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error ?? 'Planta no encontrada.'}</Text>
                    <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
                        <Text style={estilos.botonVolverTexto}>Volver al Vivero</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const fichaItems = [
        { icono: 'sun.max.fill',   etiqueta: 'LUZ',         valor: planta.NivelLuz },
        { icono: 'drop.fill',      etiqueta: 'RIEGO',        valor: planta.FrecuenciaRiego },
        { icono: 'thermometer',    etiqueta: 'TEMPERATURA',  valor: planta.TemperaturaRecomendada },
    ].filter(item => item.valor);

    return (
        <View style={estilos.contenedor}>
            <Encabezado />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.scroll}>
                {/* Imagen principal */}
                <View style={estilos.imagenPrincipal}>
                    {urlImagen(planta.Imagen) ? (
                        <Image source={{ uri: urlImagen(planta.Imagen)! }} style={estilos.imagenReal} />
                    ) : null}
                </View>

                {/* Miniaturas */}
                <View style={estilos.miniaturas}>
                    {[0, 1, 2, 3].map(i => (
                        <View key={i} style={estilos.miniatura}>
                            {urlImagen(planta.Imagen) ? (
                                <Image source={{ uri: urlImagen(planta.Imagen)! }} style={estilos.imagenMiniatura} />
                            ) : null}
                        </View>
                    ))}
                </View>

                <View style={estilos.infoContenido}>
                    {/* Tags */}
                    <View style={estilos.tags}>
                        {planta.NombreCategoria ? (
                            <View style={estilos.tag}>
                                <Text style={estilos.tagTexto}>{planta.NombreCategoria}</Text>
                            </View>
                        ) : null}
                        {planta.NivelDificultad ? (
                            <View style={estilos.tag}>
                                <Text style={estilos.tagTexto}>{planta.NivelDificultad} Cuidado</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Nombre y precio */}
                    <Text style={estilos.nombre}>{planta.Nombre}</Text>
                    {planta.NombreCategoria ? (
                        <Text style={estilos.nombreCientifico}>{planta.NombreCategoria}</Text>
                    ) : null}
                    <Text style={estilos.precio}>₡{planta.Precio.toLocaleString('es-CR')}</Text>

                    <View style={estilos.separador} />

                    {/* Descripción */}
                    {planta.Descripcion ? (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>Descripción</Text>
                            <Text style={estilos.descripcion}>{planta.Descripcion}</Text>
                        </View>
                    ) : null}

                    {/* Ficha Técnica */}
                    {fichaItems.length > 0 ? (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>Ficha Técnica</Text>
                            <View style={estilos.fichaLista}>
                                {fichaItems.map(item => (
                                    <View key={item.etiqueta} style={estilos.fichaItem}>
                                        <SymbolView name={item.icono as any} size={24} tintColor="#526349" />
                                        <Text style={estilos.fichaEtiqueta}>{item.etiqueta}</Text>
                                        <Text style={estilos.fichaValor}>{item.valor}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            {/* Botones fijos abajo */}
            <View style={estilos.botonesAbajo}>
                <Pressable style={estilos.botonComprar}>
                    <Text style={estilos.botonComprarTexto}>COMPRAR</Text>
                </Pressable>
                <Pressable style={estilos.botonJardin}>
                    <SymbolView name="leaf.fill" size={16} tintColor="#1b3022" />
                    <Text style={estilos.botonJardinTexto}>AGREGAR A MI JARDÍN</Text>
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
        gap: 10,
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
    nombre: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1c1c18',
    },
    nombreCientifico: {
        fontSize: 14,
        color: '#737973',
        fontStyle: 'italic',
        marginTop: -4,
    },
    precio: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1c1c18',
    },
    separador: {
        height: 1,
        backgroundColor: '#e5e2dc',
        marginVertical: 6,
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
    fichaLista: {
        gap: 10,
    },
    fichaItem: {
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
    fichaEtiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737973',
        letterSpacing: 0.8,
        width: 100,
    },
    fichaValor: {
        flex: 1,
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
    botonComprar: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    botonComprarTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    botonJardin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 14,
        gap: 8,
    },
    botonJardinTexto: {
        color: '#1b3022',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
