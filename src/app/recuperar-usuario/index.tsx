import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarUsuario } from '../../context/RecuperarUsuarioContext';
import { useIdioma } from '../../context/IdiomaContext';

export default function RecuperarUsuarioCorreo() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();
    const { setCorreo } = useRecuperarUsuario();
    const [correoLocal, setCorreoLocal] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    function manejarSiguiente() {
        setError('');
        if (!correoLocal) { setError(t('auth.recoverUsername.errors.emailRequired')); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLocal)) { setError(t('auth.recoverUsername.errors.emailInvalid')); return; }

        setCargando(true);
        setCorreo(correoLocal);
        setCargando(false);
        router.push('/recuperar-usuario/pregunta' as any);
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>{t('auth.recoverUsername.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.recoverUsername.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.recoverUsername.emailLabel')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={[estilos.input, error ? estilos.inputError : null]}
                            value={correoLocal}
                            onChangeText={v => { setCorreoLocal(v); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder={t('common.emailPlaceholder')}
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
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('common.continue')}</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.replace('/login')}>
                        <Text style={estilos.enlaceAtrasTexto}>{t('auth.recoverUsername.backHome')}</Text>
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
    titulo: { fontSize: 26, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 20 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginTop: 6 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
