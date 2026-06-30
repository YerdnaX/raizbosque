import { View, Text, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarContrasena } from '../../context/RecuperarContrasenaContext';
import { enviarCodigoRecuperacion } from '../../features/auth/services/authService';

export default function RecuperarContrasenaMetodo() {
    const insets = useSafeAreaInsets();
    const { datos, setMetodo } = useRecuperarContrasena();
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    async function elegirCorreo() {
        setError('');
        setEnviando(true);
        try {
            await enviarCodigoRecuperacion(datos.correo);
            setMetodo('CORREO');
            router.push('/recuperar-contrasena/codigo' as any);
        } catch {
            setError('No se pudo enviar el código. Intenta de nuevo.');
        } finally {
            setEnviando(false);
        }
    }

    function elegirPreguntas() {
        setMetodo('PREGUNTAS');
        router.push('/recuperar-contrasena/preguntas' as any);
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>¿Cómo deseas recuperarla?</Text>
                    <Text style={estilos.subtitulo}>Elige el método para verificar tu identidad</Text>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.opcion, enviando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                        onPress={elegirCorreo}
                        disabled={enviando}
                    >
                        <Text style={estilos.opcionIcono}>✉️</Text>
                        <View style={estilos.opcionTextos}>
                            <Text style={estilos.opcionTitulo}>Código por correo</Text>
                            <Text style={estilos.opcionDesc}>Te enviaremos un código de 6 dígitos</Text>
                        </View>
                        {enviando ? <ActivityIndicator color="#1b3022" size="small" /> : <Text style={estilos.flecha}>›</Text>}
                    </Pressable>

                    <Pressable
                        style={estilos.opcion}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                        onPress={elegirPreguntas}
                        disabled={enviando}
                    >
                        <Text style={estilos.opcionIcono}>🔐</Text>
                        <View style={estilos.opcionTextos}>
                            <Text style={estilos.opcionTitulo}>Preguntas de seguridad</Text>
                            <Text style={estilos.opcionDesc}>Responde tus preguntas de seguridad</Text>
                        </View>
                        <Text style={estilos.flecha}>›</Text>
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.back()}>
                        <Text style={estilos.enlaceAtrasTexto}>‹ Atrás</Text>
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
    titulo: { fontSize: 24, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    mensajeError: { fontSize: 13, color: '#ba1a1a', marginBottom: 16, textAlign: 'center' },
    opcion: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#c8d4c0', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12, overflow: 'hidden' },
    opcionIcono: { fontSize: 28 },
    opcionTextos: { flex: 1 },
    opcionTitulo: { fontSize: 15, fontWeight: '600', color: '#1c1c18', marginBottom: 2 },
    opcionDesc: { fontSize: 12, color: '#737973', lineHeight: 16 },
    flecha: { fontSize: 22, color: '#8da082', fontWeight: '700' },
    enlaceAtras: { alignItems: 'center', marginTop: 8 },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
