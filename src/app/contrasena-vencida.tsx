import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cambiarContrasenaVencida } from '../features/auth/services/authService';
import { useIdioma } from '../context/IdiomaContext';
import { BotonAtras } from '../components/ui/BotonAtras';

function evaluarRequisitos(valor: string, t: (key: string) => string) {
    return [
        { texto: t('common.passwordRequirements.minLength'), ok: valor.length >= 6 },
        { texto: t('common.passwordRequirements.uppercase'), ok: /[A-Z]/.test(valor) },
        { texto: t('common.passwordRequirements.lowercase'), ok: /[a-z]/.test(valor) },
        { texto: t('common.passwordRequirements.symbol'),    ok: /[^a-zA-Z0-9]/.test(valor) },
        { texto: t('common.passwordRequirements.noRepeats'), ok: valor.length > 0 && !/(.)\1/.test(valor) },
    ];
}

export default function ContrasenaVencida() {
    const insets = useSafeAreaInsets();
    const { correo } = useLocalSearchParams<{ correo: string }>();
    const { t } = useIdioma();

    const [contrasenaActual, setContrasenaActual] = useState('');
    const [contrasenaNueva, setContrasenaNueva] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const requisitos = evaluarRequisitos(contrasenaNueva, t);
    const todosOk = requisitos.every(r => r.ok);

    async function manejarCambio() {
        setError('');
        if (!contrasenaActual) { setError(t('auth.expiredPassword.errors.currentRequired')); return; }
        if (!todosOk) { setError(t('auth.expiredPassword.errors.requirements')); return; }

        setEnviando(true);
        try {
            await cambiarContrasenaVencida(correo ?? '', contrasenaActual, contrasenaNueva);
            router.replace('/login');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (e?.response?.status === 401 || cod === 'INVALID_CREDENTIALS') {
                setError(t('auth.expiredPassword.errors.wrongCurrent'));
            } else if (cod === 'INVALID_PASSWORD_POLICY') {
                setError(t('auth.expiredPassword.errors.policy'));
            } else {
                setError(t('auth.expiredPassword.errors.generic'));
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Image source={require('@/assets/images/iconosv2/contrasenavencida.png')} style={estilos.icono} />
                    <Text style={estilos.titulo}>{t('auth.expiredPassword.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.expiredPassword.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.expiredPassword.currentLabel')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={contrasenaActual}
                            onChangeText={v => { setContrasenaActual(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder={t('auth.expiredPassword.currentPlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.expiredPassword.newLabel')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={contrasenaNueva}
                            onChangeText={v => { setContrasenaNueva(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder={t('auth.expiredPassword.newPlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                        <Pressable onPress={() => setMostrar(m => !m)} style={estilos.toggleContenedor}>
                            <Text style={estilos.toggleTexto}>{mostrar ? t('auth.expiredPassword.hidePasswords') : t('auth.expiredPassword.showPasswords')}</Text>
                        </Pressable>
                        <View style={estilos.requisitos}>
                            {requisitos.map(r => (
                                <Text key={r.texto} style={[estilos.requisito, r.ok ? estilos.requisitoOk : estilos.requisitoPend]}>
                                    {r.ok ? '✓' : '○'} {r.texto}
                                </Text>
                            ))}
                        </View>
                    </View>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.boton, (!todosOk || enviando) && { opacity: 0.6 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarCambio}
                        disabled={enviando}
                    >
                        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('auth.expiredPassword.submit')}</Text>}
                    </Pressable>

                    <BotonAtras variante="enlace" etiqueta={t('auth.expiredPassword.backHome')} onPress={() => router.replace('/login')} />
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    icono: { width: 48, height: 48, marginBottom: 12 },
    titulo: { fontSize: 26, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 13, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 16 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    toggleContenedor: { alignSelf: 'flex-end', marginTop: 6 },
    toggleTexto: { fontSize: 12, color: '#526349', textDecorationLine: 'underline' },
    requisitos: { marginTop: 8, gap: 3 },
    requisito: { fontSize: 12 },
    requisitoOk: { color: '#526349' },
    requisitoPend: { color: '#b0b0a8' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
