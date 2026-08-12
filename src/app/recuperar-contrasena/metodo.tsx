import { View, Text, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarContrasena } from '../../context/RecuperarContrasenaContext';
import { enviarCodigoRecuperacion } from '../../features/auth/services/authService';
import { useIdioma } from '../../context/IdiomaContext';
import { BotonAtras } from '../../components/ui/BotonAtras';

export default function RecuperarContrasenaMetodo() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();
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
            setError(t('auth.recoverPassword.errors.sendFailed'));
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
                    <Text style={estilos.titulo}>{t('auth.recoverPassword.method.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.recoverPassword.method.subtitle')}</Text>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.opcion, enviando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                        onPress={elegirCorreo}
                        disabled={enviando}
                    >
                        <Image source={require('@/assets/images/iconosv2/opcioncorreo.png')} style={estilos.opcionIcono} />
                        <View style={estilos.opcionTextos}>
                            <Text style={estilos.opcionTitulo}>{t('auth.recoverPassword.method.emailOption')}</Text>
                            <Text style={estilos.opcionDesc}>{t('auth.recoverPassword.method.emailOptionSub')}</Text>
                        </View>
                        {enviando ? <ActivityIndicator color="#1b3022" size="small" /> : <Text style={estilos.flecha}>›</Text>}
                    </Pressable>

                    <Pressable
                        style={estilos.opcion}
                        android_ripple={{ color: 'rgba(0,0,0,0.08)', foreground: true }}
                        onPress={elegirPreguntas}
                        disabled={enviando}
                    >
                        <Image source={require('@/assets/images/iconosv2/recuperacioncontrasena.png')} style={estilos.opcionIcono} />
                        <View style={estilos.opcionTextos}>
                            <Text style={estilos.opcionTitulo}>{t('auth.recoverPassword.method.questionsOption')}</Text>
                            <Text style={estilos.opcionDesc}>{t('auth.recoverPassword.method.questionsOptionSub')}</Text>
                        </View>
                        <Text style={estilos.flecha}>›</Text>
                    </Pressable>

                    <BotonAtras variante="enlace" />
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
    opcionIcono: { width: 28, height: 28 },
    opcionTextos: { flex: 1 },
    opcionTitulo: { fontSize: 15, fontWeight: '600', color: '#1c1c18', marginBottom: 2 },
    opcionDesc: { fontSize: 12, color: '#737973', lineHeight: 16 },
    flecha: { fontSize: 22, color: '#8da082', fontWeight: '700' },
    enlaceAtras: { alignItems: 'center', marginTop: 8 },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
