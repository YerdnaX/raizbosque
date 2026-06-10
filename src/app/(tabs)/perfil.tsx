import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, ImageBackground } from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';

const opciones = [
    { titulo: 'Editar Perfil',      icono: 'pencil'      },
    { titulo: 'Mis Direcciones',    icono: 'mappin'      },
    { titulo: 'Métodos de Pago',    icono: 'creditcard'  },
    { titulo: 'Historial de Compras',    icono: 'history'  },
    { titulo: 'Configuración',      icono: 'gearshape'   },
] as const;

export default function Perfil() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;

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
                <Text style={estilos.encabezadoTitulo}>Mi Perfil</Text>
                <Pressable style={estilos.botonEncabezado}>
                    <CarritoIcono width={30} height={30} fill="#1b3022" />
                </Pressable>
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.tarjetaUsuario}>
                    <View style={[estilos.avatar, esHorizontal && { width: 64, height: 64 }]} />
                    <Text style={estilos.nombre}>[Nombre del Usuario]</Text>
                    <Text style={estilos.correo}>[correo.usuario@ejemplo.com]</Text>
                    <Pressable style={estilos.botonFoto}>
                        <Text style={estilos.botonFotoTexto}>EDITAR FOTO</Text>
                    </Pressable>
                </View>

                <View style={estilos.listaOpciones}>
                    {opciones.map((opcion, indice) => (
                        <View key={opcion.titulo}>
                            <Pressable style={estilos.opcion}>
                                <SymbolView name={opcion.icono} size={22} tintColor="#434843" />
                                <Text style={estilos.opcionTexto}>{opcion.titulo}</Text>
                                <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                            </Pressable>
                            {indice < opciones.length - 1 && (
                                <View style={estilos.divisor} />
                            )}
                        </View>
                    ))}
                </View>

                <Pressable
                    style={estilos.botonCerrarSesion}
                    onPress={() => router.replace('/login')}
                >
                    <SymbolView
                        name="rectangle.portrait.and.arrow.right"
                        size={20}
                        tintColor="#ba1a1a"
                    />
                    <Text style={estilos.cerrarSesionTexto}>Cerrar Sesión</Text>
                </Pressable>
            </ScrollView>
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
    scroll: {
        padding: 20,
        gap: 16,
    },
    tituloPagina: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1c1c18',
        marginBottom: 4,
    },
    tarjetaUsuario: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: '#e5e2dc',
        marginBottom: 4,
    },
    nombre: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
    },
    correo: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        marginBottom: 8,
    },
    botonFoto: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 32,
    },
    botonFotoTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1c1c18',
        letterSpacing: 0.5,
    },
    listaOpciones: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 16,
    },
    opcionTexto: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#1c1c18',
    },
    divisor: {
        height: 1,
        backgroundColor: '#f0eee8',
        marginLeft: 58,
    },
    botonCerrarSesion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingVertical: 14,
        gap: 10,
        backgroundColor: '#ffffff',
    },
    cerrarSesionTexto: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ba1a1a',
    },
});
