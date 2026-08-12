import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecuperarContrasena } from '../../context/RecuperarContrasenaContext';
import { establecerNuevaContrasena } from '../../features/auth/services/authService';
import { useIdioma } from '../../context/IdiomaContext';

function evaluarRequisitos(valor: string, t: (key: string) => string) {
    return [
        { texto: t('common.passwordRequirements.minLength'),  ok: valor.length >= 6 },
        { texto: t('common.passwordRequirements.uppercase'),  ok: /[A-Z]/.test(valor) },
        { texto: t('common.passwordRequirements.lowercase'),  ok: /[a-z]/.test(valor) },
        { texto: t('common.passwordRequirements.symbol'),     ok: /[^a-zA-Z0-9]/.test(valor) },
        { texto: t('common.passwordRequirements.noRepeats'),  ok: valor.length > 0 && !/(.)\1/.test(valor) },
    ];
}

export default function RecuperarContrasenaNueva() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();
    const { datos, reiniciar } = useRecuperarContrasena();
    const [contrasena, setContrasena] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const requisitos = evaluarRequisitos(contrasena, t);
    const todosOk = requisitos.every(r => r.ok);

    async function manejarGuardar() {
        setError('');
        if (!todosOk) { setError(t('auth.recoverPassword.newPassword.errors.requirements')); return; }
        if (contrasena !== confirmar) { setError(t('auth.recoverPassword.newPassword.errors.mismatch')); return; }

        setEnviando(true);
        try {
            const tipo = datos.metodo === 'CORREO' ? 'RECUPERACION_CORREO' : 'RECUPERACION_PREGUNTAS';
            await establecerNuevaContrasena(datos.correo, datos.token, tipo, contrasena);
            reiniciar();
            router.replace('/recuperar-contrasena/completado' as any);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_TOKEN') setError(t('auth.recoverPassword.newPassword.errors.sessionExpired'));
            else if (cod === 'INVALID_PASSWORD_POLICY') setError(t('auth.recoverPassword.newPassword.errors.policy'));
            else setError(t('auth.recoverPassword.newPassword.errors.generic'));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>{t('auth.recoverPassword.newPassword.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.recoverPassword.newPassword.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.recoverPassword.newPassword.label')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={contrasena}
                            onChangeText={v => { setContrasena(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder={t('auth.recoverPassword.newPassword.placeholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                        <View style={estilos.requisitos}>
                            {requisitos.map(r => (
                                <Text key={r.texto} style={[estilos.requisito, r.ok ? estilos.requisitoOk : estilos.requisitoPend]}>
                                    {r.ok ? '✓' : '○'} {r.texto}
                                </Text>
                            ))}
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.recoverPassword.newPassword.confirmLabel')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={confirmar}
                            onChangeText={v => { setConfirmar(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder={t('auth.recoverPassword.newPassword.confirmPlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                        <Pressable onPress={() => setMostrar(m => !m)} style={estilos.toggleContenedor}>
                            <Text style={estilos.toggleTexto}>{mostrar ? t('common.hide') : t('common.show')}</Text>
                        </Pressable>
                    </View>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.boton, (!todosOk || enviando) && { opacity: 0.6 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarGuardar}
                        disabled={enviando || !todosOk}
                    >
                        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('auth.recoverPassword.newPassword.submit')}</Text>}
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
    campo: { marginBottom: 16 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    requisitos: { marginTop: 8, gap: 3 },
    requisito: { fontSize: 12 },
    requisitoOk: { color: '#526349' },
    requisitoPend: { color: '#b0b0a8' },
    toggleContenedor: { alignSelf: 'flex-end', marginTop: 6 },
    toggleTexto: { fontSize: 12, color: '#526349', textDecorationLine: 'underline' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
});
