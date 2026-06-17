import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, ImageBackground } from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUsuario } from "../../context/UsuarioContext";
import { useCarrito } from "../../context/CarritoContext";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';

type Opcion = {
    titulo: string;
    icono: string;
    ruta?: string;
};

const opcionesExtras: Opcion[] = [
    { titulo: 'Cambiar Contraseña',   icono: 'lock',     ruta: '/cambiar-contrasena' },
    { titulo: 'Reservaciones',        icono: 'calendar',  ruta: '/reservaciones' },
    { titulo: 'Historial de Compras', icono: 'bag',      ruta: '/historial' },
];

export default function Perfil() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;
    const { usuario, cerrarSesion } = useUsuario();
    const { totalItems } = useCarrito();

    const nombreCompleto = usuario
        ? [usuario.Nombre, usuario.Apellidos].filter(Boolean).join(' ')
        : '';

    const primeraLetra = usuario?.Nombre?.[0]?.toUpperCase() ?? '?';

    function manejarCerrarSesion() {
        cerrarSesion();
        router.replace('/login');
    }

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
                <Text style={estilos.encabezadoTitulo}>Mi Perfil</Text>
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

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.tarjetaUsuario}>
                    <ImageBackground
                        source={require('@/assets/images/fotoperfil.png')}
                        style={[estilos.avatar, esHorizontal && { width: 64, height: 64 }]}
                        imageStyle={estilos.avatarImagen}
                        resizeMode="cover"
                    >
                        <Text style={[estilos.avatarLetra, esHorizontal && { fontSize: 26 }]}>
                            {primeraLetra}
                        </Text>
                    </ImageBackground>
                    <Text style={estilos.nombre}>{nombreCompleto}</Text>
                    <Text style={estilos.correo}>{usuario?.Correo ?? ''}</Text>
                    <Pressable
                        style={estilos.botonEditar}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => router.push('/editar-perfil')}
                    >
                        <Text style={estilos.botonEditarTexto}>EDITAR PERFIL</Text>
                    </Pressable>
                </View>

                <View style={estilos.listaOpciones}>
                    {opcionesExtras.map((opcion, indice) => (
                        <View key={opcion.titulo}>
                            <Pressable
                                style={estilos.opcion}
                                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                onPress={() => opcion.ruta ? router.push(opcion.ruta as any) : undefined}
                            >
                                <SymbolView name={opcion.icono as any} size={22} tintColor="#434843" />
                                <Text style={estilos.opcionTexto}>{opcion.titulo}</Text>
                                <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                            </Pressable>
                            {indice < opcionesExtras.length - 1 && (
                                <View style={estilos.divisor} />
                            )}
                        </View>
                    ))}
                </View>

                <Pressable
                    style={estilos.botonCerrarSesion}
                    android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                    onPress={manejarCerrarSesion}
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
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImagen: {
        borderRadius: 16,
    },
    avatarLetra: {
        fontSize: 42,
        fontWeight: '700',
        color: '#1b3022',
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
    botonEditar: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 32,
        overflow: 'hidden',
    },
    botonEditarTexto: {
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
        overflow: 'hidden',
    },
    cerrarSesionTexto: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ba1a1a',
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
