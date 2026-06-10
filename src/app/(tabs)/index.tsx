import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import RestauranteIcono from '@/assets/icons/bottomBar/restaurante.svg';
import ViveroIcono from '@/assets/icons/bottomBar/vivero.svg';
import JardinIcono from '@/assets/icons/bottomBar/mi-jardin.svg';
import PerfilIcono from '@/assets/icons/bottomBar/perfil.svg';

const PLANTA_DEL_MES = {
    nombre: 'Monstera Deliciosa',
    descripcion: 'Ideal para interiores con luz indirecta. Sus hojas únicas dan vida a cualquier espacio.',
    riego: 'Alto',
    precio: 35.00,
};

const SECCIONES = [
    { titulo: 'Restaurante', ruta: '/(tabs)/restaurante', Icono: RestauranteIcono },
    { titulo: 'Vivero',      ruta: '/(tabs)/vivero',      Icono: ViveroIcono      },
    { titulo: 'Mi Jardín',   ruta: '/(tabs)/jardin',      Icono: JardinIcono      },
    { titulo: 'Mi Perfil',   ruta: '/(tabs)/perfil',      Icono: PerfilIcono      },
];

const itemsCarrito = 3;

export default function Inicio() {
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;

    return (
        <SafeAreaView style={estilos.contenedor} edges={['top']}>
            <View style={estilos.encabezado}>
                <Pressable style={estilos.botonEncabezado}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1c1c18" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>RAÍCES</Text>
                <Pressable style={estilos.botonCarrito}>
                    <CarritoIcono width={30} height={30} fill="#1c1c18" />
                    {itemsCarrito > 0 && (
                        <View style={estilos.badge}>
                            <Text style={estilos.badgeTexto}>{itemsCarrito}</Text>
                        </View>
                    )}
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.saludoSeccion}>
                    <Text style={[estilos.saludoTitulo, esHorizontal && { fontSize: 20 }]}>¡Bienvenido!</Text>
                    <Text style={estilos.saludoSubtitulo}>Descubre lo que Raíces tiene para vos hoy.</Text>
                </View>

                <View style={estilos.seccion}>
                    <Text style={estilos.seccionTitulo}>🌿 Planta del Mes</Text>
                    <View style={estilos.tarjetaPlanta}>
                        <View style={[estilos.imagenDestacada, esHorizontal && { height: 110 }]}>
                            <SymbolView name="photo" size={esHorizontal ? 32 : 48} tintColor="#b0b0a8" />
                        </View>
                        <View style={estilos.infoPlanta}>
                            <Text style={estilos.nombrePlanta}>{PLANTA_DEL_MES.nombre}</Text>
                            <Text style={estilos.descripcionPlanta}>{PLANTA_DEL_MES.descripcion}</Text>
                            <View style={estilos.riegoFila}>
                                <SymbolView name="drop.fill" size={13} tintColor="#526349" />
                                <Text style={estilos.riegoTexto}>Riego {PLANTA_DEL_MES.riego}</Text>
                            </View>
                            <View style={estilos.precioFila}>
                                <Text style={estilos.precio}>${PLANTA_DEL_MES.precio.toFixed(2)}</Text>
                                <Pressable
                                    style={estilos.botonVerMas}
                                    onPress={() => router.navigate('/(tabs)/vivero')}
                                >
                                    <Text style={estilos.botonVerMasTexto}>Ver en Vivero</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={estilos.seccion}>
                    <Text style={estilos.seccionTitulo}>Explorar</Text>
                    <View style={estilos.cuadricula}>
                        {SECCIONES.map((seccion) => (
                            <Pressable
                                key={seccion.titulo}
                                style={[estilos.celdaCuadricula, esHorizontal && { width: '23%', aspectRatio: 1.2 }]}
                                onPress={() => router.navigate(seccion.ruta as any)}
                            >
                                <seccion.Icono width="100%" height="100%" fill="#1b3022" />
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
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
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e2dc',
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
    botonCarrito: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ba1a1a',
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
        lineHeight: 12,
    },
    scroll: {
        padding: 20,
        gap: 24,
    },
    saludoSeccion: {
        gap: 4,
    },
    saludoTitulo: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1c1c18',
    },
    saludoSubtitulo: {
        fontSize: 14,
        color: '#737973',
    },
    seccion: {
        gap: 12,
    },
    seccionTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
    },
    tarjetaPlanta: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    imagenDestacada: {
        backgroundColor: '#e5e2dc',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoPlanta: {
        padding: 16,
        gap: 8,
    },
    nombrePlanta: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
    },
    descripcionPlanta: {
        fontSize: 13,
        color: '#737973',
        lineHeight: 18,
    },
    riegoFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    riegoTexto: {
        fontSize: 13,
        color: '#526349',
    },
    precioFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    precio: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1c1c18',
    },
    botonVerMas: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    botonVerMasTexto: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    cuadricula: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    celdaCuadricula: {
        width: '47.5%',
        aspectRatio: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        padding: 35,
    },
    iconoFondo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    etiquetaCelda: {
        backgroundColor: 'rgba(255, 255, 255, 0.88)',
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    tituloSeccion: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1c18',
    },
    subtituloSeccion: {
        fontSize: 11,
        color: '#737973',
        textAlign: 'center',
    },
});
