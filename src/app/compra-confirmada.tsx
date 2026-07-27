import { useEffect } from 'react';
import { BackHandler, Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import CajaIcono from '@/assets/icons/bottomBar/caja.svg';
import CamionIcono from '@/assets/icons/bottomBar/camion.svg';

const IMAGEN_TOPBAR = require('@/assets/images/login/topBar.png');

export default function CompraConfirmada() {
    const insets = useSafeAreaInsets();
    const { metodoEntrega, numeroOrden, trackingNumber, direccionEntrega } = useLocalSearchParams<{
        metodoEntrega?: string;
        numeroOrden?: string;
        trackingNumber?: string;
        direccionEntrega?: string;
    }>();

    const esDomicilio = metodoEntrega === 'Domicilio';
    const tieneTracking = esDomicilio && !!trackingNumber;

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, []);

    function volverInicio() {
        router.replace('/(tabs)');
    }

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={IMAGEN_TOPBAR}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Text style={estilos.encabezadoTitulo}>Compra confirmada</Text>
            </ImageBackground>

            <View style={estilos.contenido}>
                <View style={estilos.ticket}>
                    <View style={estilos.ticketSuperior}>
                        <View style={estilos.iconoMarco}>
                            <Image source={require('@/assets/images/iconosv2/registrocompletado.png')} style={estilos.icono} />
                        </View>
                        <Text style={estilos.titulo}>Pedido registrado</Text>
                        <Text style={estilos.descripcion}>
                            {esDomicilio
                                ? 'Tu compra fue registrada y sera enviada a la direccion indicada.'
                                : 'Tu compra fue registrada y estara lista para recoger en tienda.'}
                        </Text>
                    </View>

                    <View style={estilos.separador}>
                        <View style={[estilos.muesca, estilos.muescaIzquierda]} />
                        <View style={estilos.lineaPunteada} />
                        <View style={[estilos.muesca, estilos.muescaDerecha]} />
                    </View>

                    <View style={estilos.ticketDetalle}>
                        <View style={estilos.filaDetalle}>
                            <View style={estilos.detalleBloque}>
                                <Text style={estilos.detalleEtiqueta}>ORDEN</Text>
                                <Text style={estilos.numeroOrden}>#{numeroOrden ?? '-'}</Text>
                            </View>
                            <View style={estilos.estadoBadge}>
                                <Text style={estilos.estadoTexto}>Confirmada</Text>
                            </View>
                        </View>

                        <View style={estilos.filaInfo}>
                            {esDomicilio ? (
                                <CamionIcono width={24} height={24} color="#526349" />
                            ) : (
                                <SymbolView name="storefront.fill" size={22} tintColor="#526349" />
                            )}
                            <View style={estilos.infoTexto}>
                                <Text style={estilos.infoEtiqueta}>Metodo de entrega</Text>
                                <Text style={estilos.infoValor}>
                                    {esDomicilio ? 'Entrega a domicilio' : 'Recoger en tienda'}
                                </Text>
                                {esDomicilio ? (
                                    <>
                                        <Text style={estilos.infoEtiquetaSecundaria}>Direccion de entrega</Text>
                                        <Text style={estilos.direccionTexto}>{direccionEntrega || '-'}</Text>
                                    </>
                                ) : null}
                            </View>
                        </View>

                        {esDomicilio ? (
                            <>
                                <View style={estilos.trackingCard}>
                                    <View style={estilos.trackingEncabezado}>
                                        <CajaIcono width={22} height={22} color="#526349" />
                                        <Text style={estilos.infoEtiqueta}>Numero de seguimiento</Text>
                                    </View>
                                    <Text style={tieneTracking ? estilos.trackingTexto : estilos.trackingError}>
                                        {tieneTracking ? trackingNumber : 'No se pudo generar el tracking en este momento.'}
                                    </Text>
                                </View>
                            </>
                        ) : null}
                    </View>
                </View>
            </View>

            <View style={estilos.pie}>
                <Pressable
                    style={estilos.botonInicio}
                    android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                    onPress={volverInicio}
                >
                    <Text style={estilos.botonInicioTexto}>VOLVER AL INICIO</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#c8d4c0',
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1b3022',
        letterSpacing: 1,
    },
    contenido: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
    },
    ticket: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d8d5ce',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    ticketSuperior: {
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 18,
        gap: 10,
    },
    iconoMarco: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    icono: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    titulo: {
        fontSize: 23,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
    },
    descripcion: {
        fontSize: 14,
        color: '#526349',
        textAlign: 'center',
        lineHeight: 21,
    },
    separador: {
        height: 28,
        justifyContent: 'center',
    },
    lineaPunteada: {
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#c8d4c0',
        marginHorizontal: 28,
    },
    muesca: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f0eee8',
        top: 0,
    },
    muescaIzquierda: {
        left: -14,
    },
    muescaDerecha: {
        right: -14,
    },
    ticketDetalle: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 22,
        gap: 16,
    },
    filaDetalle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    detalleBloque: {
        flex: 1,
    },
    detalleEtiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737973',
    },
    numeroOrden: {
        marginTop: 4,
        fontSize: 24,
        color: '#1b3022',
        fontWeight: '700',
    },
    estadoBadge: {
        backgroundColor: '#e8f0e5',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#c8d4c0',
    },
    estadoTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: '#526349',
    },
    filaInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#f5f3ef',
        borderRadius: 8,
        padding: 12,
    },
    infoTexto: {
        flex: 1,
    },
    infoEtiqueta: {
        fontSize: 11,
        color: '#737973',
        fontWeight: '700',
    },
    infoValor: {
        marginTop: 2,
        fontSize: 14,
        color: '#1c1c18',
        fontWeight: '600',
    },
    infoEtiquetaSecundaria: {
        marginTop: 10,
        fontSize: 11,
        color: '#737973',
        fontWeight: '700',
    },
    trackingCard: {
        backgroundColor: '#e8f0e5',
        borderRadius: 8,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#c8d4c0',
    },
    trackingEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    direccionTexto: {
        marginTop: 3,
        fontSize: 14,
        color: '#1c1c18',
        fontWeight: '600',
        lineHeight: 20,
    },
    trackingTexto: {
        marginTop: 5,
        fontSize: 18,
        color: '#1b3022',
        fontWeight: '700',
    },
    trackingError: {
        marginTop: 5,
        fontSize: 14,
        color: '#526349',
        fontWeight: '600',
        lineHeight: 20,
    },
    pie: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingBottom: 24,
    },
    botonInicio: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonInicioTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
