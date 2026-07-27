import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { enviarCodigoRegistro } from '../../features/auth/services/authService';

export default function RegistroCorreo() {
    const insets = useSafeAreaInsets();
    const { datos, setCorreo } = useRegistro();
    const [correoLocal, setCorreoLocal] = useState(datos.correo);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function manejarSiguiente() {
        setError('');
        if (!correoLocal) { setError('El correo es requerido'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLocal)) { setError('Ingresa un correo válido'); return; }

        setCargando(true);
        try {
            await enviarCodigoRegistro(correoLocal);
            setCorreo(correoLocal);
            router.push('/registro/codigo');
        } catch (e: any) {
            const codigo = e?.response?.data?.codigo;
            if (codigo === 'EMAIL_ALREADY_EXISTS') {
                setError('Ya existe una cuenta con ese correo');
            } else if (codigo === 'EMAIL_NETWORK_ERROR') {
                setError('No se pudo conectar al servicio de correo. Intenta de nuevo en unos minutos.');
            } else if (e?.code === 'ECONNABORTED') {
                setError('El servidor tardó demasiado en responder. Intenta nuevamente.');
            } else if (!e?.response) {
                setError('Sin conexión con el servidor. Verifica internet e intenta otra vez.');
            } else {
                setError('No se pudo enviar el código. Intenta de nuevo.');
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>Paso 1 de 7</Text>
                    <Text style={estilos.titulo}>Crear Cuenta</Text>
                    <Text style={estilos.subtitulo}>
                        Ingresa tu correo electrónico. Te enviaremos un código de verificación.
                    </Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Correo Electrónico <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={[estilos.input, error ? estilos.inputError : null]}
                            value={correoLocal}
                            onChangeText={v => { setCorreoLocal(v); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#b0b0a8"
                        />
                        {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}
                    </View>

                    <Pressable
                        style={[estilos.boton, cargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarSiguiente}
                        disabled={cargando}
                    >
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>CONTINUAR</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlace} onPress={() => router.replace('/login')}>
                        <Text style={estilos.enlaceTexto}>¿Ya tienes cuenta? <Text style={estilos.enlaceDestacado}>Inicia Sesión</Text></Text>
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
    campo: { marginBottom: 20 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginTop: 6 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlace: { alignItems: 'center' },
    enlaceTexto: { fontSize: 13, color: '#737973' },
    enlaceDestacado: { fontWeight: '700', color: '#1c1c18' },
});
