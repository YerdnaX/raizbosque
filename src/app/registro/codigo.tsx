import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { verificarCodigoRegistro, enviarCodigoRegistro } from '../../features/auth/services/authService';

export default function RegistroCodigo() {
    const insets = useSafeAreaInsets();
    const { datos, setToken } = useRegistro();
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    async function manejarVerificar() {
        setError('');
        if (!codigo || codigo.length !== 6) { setError('Ingresa el código de 6 dígitos'); return; }

        setCargando(true);
        try {
            const token = await verificarCodigoRegistro(datos.correo, codigo);
            setToken(token);
            router.push('/registro/nombre');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'EXPIRED_CODE') setError('El código ha vencido. Solicita uno nuevo.');
            else setError('Código incorrecto. Verifica e intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    }

    async function manejarReenviar() {
        setError('');
        setMensajeExito('');
        setReenviando(true);
        try {
            await enviarCodigoRegistro(datos.correo);
            setMensajeExito('Nuevo código enviado al correo.');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'EMAIL_NETWORK_ERROR') {
                setError('No fue posible conectar al servicio de correo. Intenta más tarde.');
            } else if (e?.code === 'ECONNABORTED') {
                setError('El servidor tardó demasiado en responder. Intenta nuevamente.');
            } else if (!e?.response) {
                setError('Sin conexión con el servidor. Verifica internet e intenta otra vez.');
            } else {
                setError('No se pudo reenviar el código. Intenta de nuevo.');
            }
        } finally {
            setReenviando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>Paso 2 de 6</Text>
                    <Text style={estilos.titulo}>Verificar Correo</Text>
                    <Text style={estilos.subtitulo}>
                        Ingresa el código de 6 dígitos enviado a{'\n'}
                        <Text style={estilos.correoDestacado}>{datos.correo}</Text>
                    </Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Código de verificación</Text>
                        <TextInput
                            style={[estilos.inputCodigo, error ? estilos.inputError : null]}
                            value={codigo}
                            onChangeText={v => { setCodigo(v.replace(/[^0-9]/g, '')); setError(''); }}
                            keyboardType="numeric"
                            maxLength={6}
                            placeholder="000000"
                            placeholderTextColor="#b0b0a8"
                        />
                        {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}
                        {mensajeExito ? <Text style={estilos.mensajeExito}>{mensajeExito}</Text> : null}
                    </View>

                    <Pressable
                        style={[estilos.boton, cargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarVerificar}
                        disabled={cargando}
                    >
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>VERIFICAR</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlace} onPress={manejarReenviar} disabled={reenviando}>
                        {reenviando
                            ? <ActivityIndicator color="#526349" size="small" />
                            : <Text style={estilos.enlaceTexto}>¿No recibiste el código? <Text style={estilos.enlaceDestacado}>Reenviar</Text></Text>
                        }
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.back()}>
                        <Text style={estilos.enlaceAtrasTexto}>‹ Cambiar correo</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 28, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    correoDestacado: { fontWeight: '700', color: '#1b3022' },
    campo: { marginBottom: 20 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8, textAlign: 'center' },
    inputCodigo: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, color: '#1c1c18', textAlign: 'center', letterSpacing: 8 },
    inputError: { borderColor: '#ba1a1a' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginTop: 6, textAlign: 'center' },
    mensajeExito: { fontSize: 12, color: '#526349', marginTop: 6, textAlign: 'center' },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlace: { alignItems: 'center', marginBottom: 12 },
    enlaceTexto: { fontSize: 13, color: '#737973' },
    enlaceDestacado: { fontWeight: '700', color: '#1c1c18' },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
