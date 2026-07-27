import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { getPreguntasSeguridad, completarRegistro } from '../../features/auth/services/authService';

type Pregunta = { IdPregunta: number; TextoPregunta: string };

export default function RegistroPreguntas2() {
    const insets = useSafeAreaInsets();
    const { datos, setRespuesta3, reiniciar } = useRegistro();
    const [terceraPregunta, setTerceraPregunta] = useState<Pregunta | null>(null);
    const [resp3, setResp3] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        getPreguntasSeguridad()
            .then(preguntas => { if (preguntas[2]) setTerceraPregunta(preguntas[2]); })
            .catch(() => setError('No se pudo cargar la pregunta. Intenta de nuevo.'))
            .finally(() => setCargando(false));
    }, []);

    async function manejarFinalizar() {
        setError('');
        if (!resp3.trim()) { setError('La respuesta es requerida'); return; }

        setRespuesta3(resp3.trim());
        setEnviando(true);
        try {
            await completarRegistro({
                correo: datos.correo,
                token: datos.token,
                nombre: datos.nombre,
                apellidos: datos.apellidos,
                telefono: datos.telefono,
                direccion: datos.direccion,
                nombreUsuario: datos.nombreUsuario,
                contrasena: datos.contrasena,
                respuesta1: datos.respuesta1,
                respuesta2: datos.respuesta2,
                respuesta3: resp3.trim(),
            });
            reiniciar();
            router.replace('/registro/completado');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'USERNAME_ALREADY_EXISTS') setError('El nombre de usuario ya está en uso. Vuelve atrás y elige otro.');
            else if (cod === 'EMAIL_ALREADY_EXISTS') setError('Ya existe una cuenta con ese correo.');
            else if (cod === 'INVALID_TOKEN') setError('Sesión expirada. Vuelve a iniciar el registro.');
            else setError('No se pudo completar el registro. Intenta de nuevo.');
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
                    <Text style={estilos.paso}>Paso 7 de 7</Text>
                    <Text style={estilos.titulo}>Última Pregunta</Text>
                    <Text style={estilos.subtitulo}>Recuerda: las respuestas distinguen mayúsculas y minúsculas</Text>

                    {terceraPregunta && (
                        <View style={estilos.campo}>
                            <Text style={estilos.pregunta}>{terceraPregunta.TextoPregunta}</Text>
                            <TextInput
                                style={estilos.input}
                                value={resp3}
                                onChangeText={v => { setResp3(v); setError(''); }}
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
                        onPress={manejarFinalizar}
                        disabled={enviando}
                    >
                        {enviando
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={estilos.botonTexto}>CREAR CUENTA</Text>
                        }
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
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 26, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
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
