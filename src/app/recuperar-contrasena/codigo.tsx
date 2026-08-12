import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarContrasena } from '../../context/RecuperarContrasenaContext';
import { verificarCodigoRecuperacion, enviarCodigoRecuperacion } from '../../features/auth/services/authService';
import { useIdioma } from '../../context/IdiomaContext';
import { BotonAtras } from '../../components/ui/BotonAtras';

export default function RecuperarContrasenaCodigo() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();
    const { datos, setToken } = useRecuperarContrasena();
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');

    async function manejarVerificar() {
        setError('');
        if (!codigo || codigo.length !== 6) { setError(t('auth.recoverPassword.code.errors.required')); return; }

        setCargando(true);
        try {
            const token = await verificarCodigoRecuperacion(datos.correo, codigo);
            setToken(token);
            router.push('/recuperar-contrasena/nueva-contrasena' as any);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'EXPIRED_CODE') setError(t('auth.recoverPassword.code.errors.expired'));
            else setError(t('auth.recoverPassword.code.errors.incorrect'));
        } finally {
            setCargando(false);
        }
    }

    async function manejarReenviar() {
        setError('');
        setMensajeExito('');
        setReenviando(true);
        try {
            await enviarCodigoRecuperacion(datos.correo);
            setMensajeExito(t('auth.recoverPassword.code.resent'));
        } catch {
            setError(t('auth.recoverPassword.code.errors.resendFailed'));
        } finally {
            setReenviando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>{t('auth.recoverPassword.code.title')}</Text>
                    <Text style={estilos.subtitulo}>
                        {t('auth.recoverPassword.code.subtitle')}{'\n'}
                        <Text style={estilos.correoDestacado}>{datos.correo}</Text>
                    </Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.recoverPassword.code.label')}</Text>
                        <TextInput
                            style={[estilos.inputCodigo, error ? estilos.inputError : null]}
                            value={codigo}
                            onChangeText={v => { setCodigo(v.replace(/[^0-9]/g, '')); setError(''); }}
                            keyboardType="numeric"
                            maxLength={6}
                            placeholder={t('common.codePlaceholder')}
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
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('common.verify')}</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlace} onPress={manejarReenviar} disabled={reenviando}>
                        {reenviando
                            ? <ActivityIndicator color="#526349" size="small" />
                            : <Text style={estilos.enlaceTexto}>{t('auth.recoverPassword.code.resendPrompt')} <Text style={estilos.enlaceDestacado}>{t('auth.recoverPassword.code.resend')}</Text></Text>
                        }
                    </Pressable>

                    <BotonAtras variante="enlace" etiqueta={t('auth.recoverPassword.code.changeMethod')} />
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
