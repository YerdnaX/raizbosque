import { useEffect } from 'react';
import { BackHandler, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

const IMAGEN_TOPBAR = require('@/assets/images/login/topBar.png');

export default function CompraConfirmada() {
    const insets = useSafeAreaInsets();
    const { metodoEntrega, numeroOrden, trackingNumber } = useLocalSearchParams<{
        metodoEntrega?: string;
        numeroOrden?: string;
        trackingNumber?: string;
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
                <View style={estilos.iconoContenedor}>
                    <SymbolView name="checkmark.circle.fill" size={70} tintColor="#1b3022" />
                </View>

                <Text style={estilos.titulo}>Pedido registrado</Text>
                <Text style={estilos.descripcion}>
                    {esDomicilio
                        ? 'Tu compra fue registrada y sera enviada a la direccion indicada.'
                        : 'Tu compra fue registrada y estara lista para recoger en tienda.'}
                </Text>

                <View style={estilos.detalleCard}>
                    <Text style={estilos.detalleEtiqueta}>NUMERO DE ORDEN</Text>
                    <Text style={estilos.numeroOrden}>{numeroOrden ?? '-'}</Text>
                </View>

                {esDomicilio ? (
                    <View style={estilos.detalleCard}>
                        <Text style={estilos.detalleEtiqueta}>TRACKING</Text>
                        <Text style={estilos.trackingTexto}>
                            {tieneTracking ? trackingNumber : 'No se pudo generar el tracking en este momento.'}
                        </Text>
                    </View>
                ) : null}
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
        justifyContent: 'center',
        padding: 24,
        gap: 16,
    },
    iconoContenedor: {
        alignItems: 'center',
        marginBottom: 6,
    },
    titulo: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
    },
    descripcion: {
        fontSize: 14,
        color: '#526349',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 8,
    },
    detalleCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e5e2dc',
    },
    detalleEtiqueta: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737973',
    },
    numeroOrden: {
        marginTop: 4,
        fontSize: 22,
        color: '#1b3022',
        fontWeight: '700',
    },
    trackingTexto: {
        marginTop: 4,
        fontSize: 17,
        color: '#1b3022',
        fontWeight: '700',
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
