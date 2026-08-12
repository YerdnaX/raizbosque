import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { useIdioma } from '../../context/IdiomaContext';
import { verificarNombreUsuario } from '../../features/auth/services/authService';
import { BotonAtras } from '../../components/ui/BotonAtras';

export default function RegistroNombre() {
    const insets = useSafeAreaInsets();
    const { setNombreUsuario } = useRegistro();
    const { t } = useIdioma();
    const [nombreUsuario, setNombreUsuarioLocal] = useState('');
    const [estado, setEstado] = useState<'idle' | 'disponible' | 'error'>('idle');
    const [mensajeEstado, setMensajeEstado] = useState('');
    const [cargando, setCargando] = useState(false);

    function obtenerRequisitos(valor: string) {
        return [
            { texto: t('auth.register.username.requirements.minLength'),       ok: valor.length >= 6 },
            { texto: t('auth.register.username.requirements.alphanumeric'),        ok: /^[a-zA-Z0-9]*$/.test(valor) && valor.length > 0 },
        ];
    }

    async function manejarVerificar() {
        setEstado('idle');
        setMensajeEstado('');
        if (!nombreUsuario) { setEstado('error'); setMensajeEstado(t('auth.register.username.errors.required')); return; }

        const requisitos = obtenerRequisitos(nombreUsuario);
        const fallidos = requisitos.filter(r => !r.ok);
        if (fallidos.length > 0) { setEstado('error'); setMensajeEstado(fallidos[0].texto); return; }

        setCargando(true);
        try {
            await verificarNombreUsuario(nombreUsuario);
            setEstado('disponible');
            setMensajeEstado(t('auth.register.username.available'));
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            setEstado('error');
            if (cod === 'USERNAME_ALREADY_EXISTS') setMensajeEstado(t('auth.register.username.errors.taken'));
            else setMensajeEstado(t('auth.register.username.errors.generic'));
        } finally {
            setCargando(false);
        }
    }

    function manejarSiguiente() {
        if (estado !== 'disponible') { manejarVerificar(); return; }
        setNombreUsuario(nombreUsuario);
        router.push('/registro/datos-personales');
    }

    const requisitos = obtenerRequisitos(nombreUsuario);

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>{t('auth.register.step', { current: 4, total: 7 })}</Text>
                    <Text style={estilos.titulo}>{t('auth.register.username.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.register.username.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.register.username.label')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={[estilos.input, estado === 'error' ? estilos.inputError : estado === 'disponible' ? estilos.inputOk : null]}
                            value={nombreUsuario}
                            onChangeText={v => { setNombreUsuarioLocal(v.replace(/[^a-zA-Z0-9]/g, '')); setEstado('idle'); setMensajeEstado(''); }}
                            autoCapitalize="none"
                            placeholder={t('auth.register.username.placeholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                        {mensajeEstado ? (
                            <Text style={[estilos.mensajeEstado, estado === 'disponible' ? estilos.exito : estilos.error]}>
                                {mensajeEstado}
                            </Text>
                        ) : null}
                    </View>

                    <View style={estilos.requisitos}>
                        {requisitos.map(r => (
                            <Text key={r.texto} style={[estilos.requisito, r.ok ? estilos.requisitoOk : estilos.requisitoPend]}>
                                {r.ok ? '✓' : '○'} {r.texto}
                            </Text>
                        ))}
                    </View>

                    <Pressable
                        style={[estilos.botonVerificar, cargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)', foreground: true }}
                        onPress={manejarVerificar}
                        disabled={cargando}
                    >
                        {cargando ? <ActivityIndicator color="#1b3022" size="small" /> : <Text style={estilos.botonVerificarTexto}>{t('auth.register.username.checkAvailability')}</Text>}
                    </Pressable>

                    <Pressable
                        style={[estilos.boton, estado !== 'disponible' && { opacity: 0.5 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarSiguiente}
                        disabled={estado !== 'disponible'}
                    >
                        <Text style={estilos.botonTexto}>{t('common.continue')}</Text>
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
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 28, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 12 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    inputOk: { borderColor: '#526349' },
    mensajeEstado: { fontSize: 12, marginTop: 6 },
    exito: { color: '#526349' },
    error: { color: '#ba1a1a' },
    requisitos: { marginBottom: 16, gap: 4 },
    requisito: { fontSize: 13 },
    requisitoOk: { color: '#526349' },
    requisitoPend: { color: '#737973' },
    botonVerificar: { borderWidth: 1.5, borderColor: '#1b3022', borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonVerificarTexto: { color: '#1b3022', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
