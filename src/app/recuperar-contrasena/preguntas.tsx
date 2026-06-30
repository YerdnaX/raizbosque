import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarContrasena } from '../../context/RecuperarContrasenaContext';
import { obtenerPreguntasRecuperacion, verificarRespuestasSeguridad } from '../../features/auth/services/authService';

type Pregunta = { IdPregunta: number; TextoPregunta: string };

export default function RecuperarContrasenaPreguntas() {
    const insets = useSafeAreaInsets();
    const { datos, setToken } = useRecuperarContrasena();
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [resp1, setResp1] = useState('');
    const [resp2, setResp2] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        obtenerPreguntasRecuperacion(datos.correo)
            .then(setPreguntas)
            .catch(() => setError('No se pudieron cargar las preguntas. Verifica que el correo sea correcto.'))
            .finally(() => setCargando(false));
    }, []);

    async function manejarVerificar() {
        setError('');
        if (!resp1.trim() || !resp2.trim()) { setError('Completa todas las respuestas'); return; }
        if (preguntas.length < 2) { setError('Error al cargar las preguntas'); return; }

        setEnviando(true);
        try {
            const token = await verificarRespuestasSeguridad(datos.correo, resp1.trim(), resp2.trim());
            setToken(token);
            router.push('/recuperar-contrasena/nueva-contrasena' as any);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_ANSWERS') setError('Las respuestas no son correctas. Recuerda que distinguen mayúsculas y minúsculas.');
            else setError('No se pudo verificar. Intenta de nuevo.');
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
                    <Text style={estilos.titulo}>Preguntas de Seguridad</Text>
                    <Text style={estilos.subtitulo}>Las respuestas son sensibles a mayúsculas y minúsculas</Text>

                    {preguntas[0] && (
                        <View style={estilos.campo}>
                            <Text style={estilos.pregunta}>{preguntas[0].TextoPregunta}</Text>
                            <TextInput
                                style={estilos.input}
                                value={resp1}
                                onChangeText={v => { setResp1(v); setError(''); }}
                                placeholder="Tu respuesta"
                                placeholderTextColor="#b0b0a8"
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    {preguntas[1] && (
                        <View style={estilos.campo}>
                            <Text style={estilos.pregunta}>{preguntas[1].TextoPregunta}</Text>
                            <TextInput
                                style={estilos.input}
                                value={resp2}
                                onChangeText={v => { setResp2(v); setError(''); }}
                                placeholder="Tu respuesta"
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
                        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>VERIFICAR</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.back()}>
                        <Text style={estilos.enlaceAtrasTexto}>‹ Cambiar método</Text>
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
    titulo: { fontSize: 24, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 12, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 18 },
    campo: { marginBottom: 20 },
    pregunta: { fontSize: 14, fontWeight: '600', color: '#1b3022', marginBottom: 8, lineHeight: 20 },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
