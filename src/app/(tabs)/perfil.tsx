import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, ImageBackground, Modal, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useUsuario } from "../../context/UsuarioContext";
import { useCarrito } from "../../context/CarritoContext";
import { iniciar2FA, activar2FA, desactivar2FA } from "../../features/auth/services/authService";
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

type Fase2FA = 'activar' | 'desactivar' | null;

export default function Perfil() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;
    const { usuario, cerrarSesion, actualizarTotp2FA } = useUsuario();
    const { totalItems } = useCarrito();

    // Estado de modal 2FA
    const [fase2FA, setFase2FA] = useState<Fase2FA>(null);
    const [qrImagen, setQrImagen] = useState('');
    const [codigo2FA, setCodigo2FA] = useState('');
    const [cargando2FA, setCargando2FA] = useState(false);
    const [error2FA, setError2FA] = useState('');
    const [exito2FA, setExito2FA] = useState('');
    const [cargandoQR, setCargandoQR] = useState(false);

    const nombreCompleto = usuario
        ? [usuario.Nombre, usuario.Apellidos].filter(Boolean).join(' ')
        : '';

    const primeraLetra = usuario?.Nombre?.[0]?.toUpperCase() ?? '?';
    const tieneTotp2FA = usuario?.TieneTotp2FA ?? false;

    function manejarCerrarSesion() {
        cerrarSesion();
        router.replace('/login');
    }

    async function abrirActivar2FA() {
        setCargandoQR(true);
        setError2FA('');
        setCodigo2FA('');
        setExito2FA('');
        setFase2FA('activar');
        try {
            const { qrImage } = await iniciar2FA(usuario!.IdUsuario);
            setQrImagen(qrImage);
        } catch {
            setError2FA('No se pudo iniciar la configuración. Intenta de nuevo.');
        } finally {
            setCargandoQR(false);
        }
    }

    function abrirDesactivar2FA() {
        setCodigo2FA('');
        setError2FA('');
        setExito2FA('');
        setFase2FA('desactivar');
    }

    function cerrarModal2FA() {
        setFase2FA(null);
        setQrImagen('');
        setCodigo2FA('');
        setError2FA('');
        setExito2FA('');
    }

    async function manejarActivar2FA() {
        setError2FA('');
        if (!codigo2FA || codigo2FA.length !== 6) {
            setError2FA('Ingresa el código de 6 dígitos.');
            return;
        }
        setCargando2FA(true);
        try {
            await activar2FA(usuario!.IdUsuario, codigo2FA);
            actualizarTotp2FA(true);
            setExito2FA('¡Verificación en dos pasos activada correctamente!');
            setTimeout(cerrarModal2FA, 1800);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_2FA_CODE') {
                setError2FA('Código inválido. Inténtalo nuevamente.');
            } else {
                setError2FA('No se pudo activar. Intenta de nuevo.');
            }
        } finally {
            setCargando2FA(false);
        }
    }

    async function manejarDesactivar2FA() {
        setError2FA('');
        if (!codigo2FA || codigo2FA.length !== 6) {
            setError2FA('Ingresa el código de 6 dígitos.');
            return;
        }
        setCargando2FA(true);
        try {
            await desactivar2FA(usuario!.IdUsuario, codigo2FA);
            actualizarTotp2FA(false);
            setExito2FA('Verificación en dos pasos desactivada.');
            setTimeout(cerrarModal2FA, 1800);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_2FA_CODE') {
                setError2FA('Código inválido. Inténtalo nuevamente.');
            } else {
                setError2FA('No se pudo desactivar. Intenta de nuevo.');
            }
        } finally {
            setCargando2FA(false);
        }
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
                    {opcionesExtras.map((opcion) => (
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
                            <View style={estilos.divisor} />
                        </View>
                    ))}

                    {/* Opción: Verificación en dos pasos */}
                    <Pressable
                        style={estilos.opcion}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={tieneTotp2FA ? abrirDesactivar2FA : abrirActivar2FA}
                    >
                        <SymbolView name="lock.shield" size={22} tintColor="#434843" />
                        <View style={estilos.opcionConEstado}>
                            <Text style={estilos.opcionTexto}>Verificación en dos pasos</Text>
                            <Text style={tieneTotp2FA ? estilos.estadoActivo : estilos.estadoInactivo}>
                                {tieneTotp2FA ? 'Activa' : 'Inactiva'}
                            </Text>
                        </View>
                        <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                    </Pressable>
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

                <Pressable
                    style={estilos.botonAcercaDe}
                    android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                    onPress={() => router.push('/acerca-de')}
                >
                    <Text style={estilos.acercaDeTexto}>Hecho con ❤️ Wilberth Mora</Text>
                </Pressable>
            </ScrollView>

            {/* Modal: Configurar / Desactivar 2FA */}
            <Modal
                visible={fase2FA !== null}
                transparent
                animationType="slide"
                onRequestClose={cerrarModal2FA}
            >
                <KeyboardAvoidingView
                    style={estilos.modalFondo}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={estilos.modalTarjeta}>
                        <Text style={estilos.modalTitulo}>
                            {fase2FA === 'activar' ? 'Configurar Google Authenticator' : 'Desactivar verificación en dos pasos'}
                        </Text>

                        {fase2FA === 'activar' && (
                            <>
                                <Text style={estilos.modalSubtitulo}>
                                    Escanea el código QR con la app Google Authenticator y luego ingresa el código generado para activar la verificación en dos pasos.
                                </Text>
                                <View style={estilos.qrContenedor}>
                                    {cargandoQR
                                        ? <ActivityIndicator color="#1b3022" size="large" />
                                        : qrImagen
                                            ? <Image source={{ uri: qrImagen }} style={estilos.qrImagen} resizeMode="contain" />
                                            : null
                                    }
                                </View>
                            </>
                        )}

                        {fase2FA === 'desactivar' && (
                            <Text style={estilos.modalSubtitulo}>
                                Ingresa el código actual de Google Authenticator para confirmar que deseas desactivar la verificación en dos pasos.
                            </Text>
                        )}

                        {exito2FA ? (
                            <Text style={estilos.textoExito}>{exito2FA}</Text>
                        ) : (
                            <>
                                <Text style={estilos.modalEtiqueta}>Código de 6 dígitos</Text>
                                <TextInput
                                    style={[estilos.inputCodigo, error2FA ? estilos.inputCodigoError : null]}
                                    value={codigo2FA}
                                    onChangeText={v => { setCodigo2FA(v.replace(/\D/g, '')); setError2FA(''); }}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    placeholder="000000"
                                    placeholderTextColor="#b0b0a8"
                                />

                                {error2FA ? <Text style={estilos.mensajeError}>{error2FA}</Text> : null}

                                <Pressable
                                    style={[
                                        fase2FA === 'desactivar' ? estilos.botonDesactivar : estilos.botonPrincipal,
                                        cargando2FA && { opacity: 0.7 },
                                    ]}
                                    android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                    onPress={fase2FA === 'activar' ? manejarActivar2FA : manejarDesactivar2FA}
                                    disabled={cargando2FA}
                                >
                                    {cargando2FA
                                        ? <ActivityIndicator color="#ffffff" size="small" />
                                        : <Text style={estilos.botonPrincipalTexto}>
                                            {fase2FA === 'activar' ? 'VERIFICAR Y ACTIVAR' : 'DESACTIVAR'}
                                        </Text>
                                    }
                                </Pressable>
                            </>
                        )}

                        <Pressable
                            style={estilos.botonCancelarModal}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                            onPress={cerrarModal2FA}
                        >
                            <Text style={estilos.botonCancelarModalTexto}>Cancelar</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    opcionConEstado: {
        flex: 1,
        gap: 2,
    },
    estadoActivo: {
        fontSize: 12,
        color: '#526349',
        fontWeight: '500',
    },
    estadoInactivo: {
        fontSize: 12,
        color: '#737973',
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
    botonAcercaDe: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    acercaDeTexto: {
        fontSize: 12,
        color: '#9ca09a',
    },
    // Modal 2FA
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(27,48,34,0.55)',
        justifyContent: 'flex-end',
    },
    modalTarjeta: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 28,
        paddingBottom: 36,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 12,
    },
    modalTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitulo: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    modalEtiqueta: {
        fontSize: 14,
        fontWeight: '500',
        color: '#434843',
        marginBottom: 8,
    },
    qrContenedor: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginBottom: 16,
    },
    qrImagen: {
        width: 190,
        height: 190,
        borderRadius: 8,
    },
    inputCodigo: {
        backgroundColor: '#fefcf8',
        borderColor: '#8da082',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 24,
        color: '#1c1c18',
        textAlign: 'center',
        letterSpacing: 6,
        marginBottom: 8,
    },
    inputCodigoError: {
        borderColor: '#ba1a1a',
    },
    mensajeError: {
        fontSize: 13,
        color: '#ba1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    textoExito: {
        fontSize: 15,
        color: '#526349',
        fontWeight: '600',
        textAlign: 'center',
        marginVertical: 16,
    },
    botonPrincipal: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    botonDesactivar: {
        backgroundColor: '#ba1a1a',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    botonPrincipalTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    botonCancelarModal: {
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonCancelarModalTexto: {
        fontSize: 14,
        color: '#737973',
        fontWeight: '500',
    },
});
