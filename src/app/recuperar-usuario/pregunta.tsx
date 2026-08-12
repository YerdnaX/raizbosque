import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarUsuario } from '../../context/RecuperarUsuarioContext';
import { obtenerPreguntaRecuperacionUsuario, verificarRespuestaRecuperacionUsuario } from '../../features/auth/services/authService';
import { useIdioma } from '../../context/IdiomaContext';

export default function RecuperarUsuarioPregunta() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();
    const { datos, reiniciar } = useRecuperarUsuario();
    const [pregunta, setPregunta] = useState<{ IdPregunta: number; TextoPregunta: string } | null>(null);
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        obtenerPreguntaRecuperacionUsuario(datos.correo)
            .then(setPregunta)
            .catch(() => setError(t('auth.recoverUsername.question.errors.loadFailed')))
            .finally(() => setCargando(false));
    }, []);

    async function manejarVerificar() {
        setError('');
        if (!respuesta.trim()) { setError(t('auth.recoverUsername.question.errors.required')); return; }
        if (!pregunta) return;

        setEnviando(true);
        try {
            await verificarRespuestaRecuperacionUsuario(datos.correo, respuesta.trim());
            reiniciar();
            router.replace('/recuperar-usuario/confirmacion' as any);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_ANSWER') setError(t('auth.recoverUsername.question.errors.incorrect'));
            else setError(t('auth.recoverUsername.question.errors.generic'));
        } finally {
            setEnviando(false);
        }
    }

    if (cargando) {
        return (
            <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
                <View style={estilos.centrado}>
                    <ActivityIndicator color="#fff" size="large" />
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>{t('auth.recoverUsername.question.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.recoverUsername.question.subtitle')}</Text>

                    {pregunta && (
                        <View style={estilos.campo}>
                            <Text style={estilos.pregunta}>{pregunta.TextoPregunta}</Text>
                            <TextInput
                                style={[estilos.input, error ? estilos.inputError : null]}
                                value={respuesta}
                                onChangeText={v => { setRespuesta(v); setError(''); }}
                                placeholder={t('common.answerPlaceholder')}
                                placeholderTextColor="#b0b0a8"
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.boton, enviando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarVerificar}
                        disabled={enviando}
                    >
                        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('common.verify')}</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.back()}>
                        <Text style={estilos.enlaceAtrasTexto}>{t('common.back')}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    titulo: { fontSize: 26, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 12, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 18 },
    campo: { marginBottom: 20 },
    pregunta: { fontSize: 14, fontWeight: '600', color: '#1b3022', marginBottom: 8, lineHeight: 20 },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
