import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { useIdioma } from '../../context/IdiomaContext';
import { consultarPersonaPorCedula } from '../../features/auth/services/identidadService';

export default function RegistroCedula() {
    const insets = useSafeAreaInsets();
    const { setNombre, setApellidos } = useRegistro();
    const { t } = useIdioma();
    const [cedula, setCedula] = useState('');
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    function esCedulaValida(valor: string) {
        return /^\d{9,14}$/.test(valor);
    }

    function continuarSinDatos() {
        router.push('/registro/nombre');
    }

    async function manejarConsultar() {
        setError('');
        setMensaje('');

        if (!esCedulaValida(cedula)) {
            setError(t('auth.register.cedula.errors.invalid'));
            return;
        }

        setCargando(true);
        try {
            const persona = await consultarPersonaPorCedula(cedula);

            if (persona) {
                setNombre(persona.primerNombre);
                setApellidos(persona.apellidos);
                router.push('/registro/nombre');
                return;
            }

            setMensaje(t('auth.register.cedula.notFound'));
        } finally {
            setCargando(false);
        }
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>{t('auth.register.step', { current: 3, total: 7 })}</Text>
                    <Text style={estilos.titulo}>{t('auth.register.cedula.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.register.cedula.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.register.cedula.label')}</Text>
                        <TextInput
                            style={[estilos.input, error ? estilos.inputError : null]}
                            value={cedula}
                            onChangeText={v => { setCedula(v.replace(/[^0-9]/g, '')); setError(''); setMensaje(''); }}
                            keyboardType="numeric"
                            maxLength={14}
                            placeholder={t('auth.register.cedula.placeholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                        {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}
                        {mensaje ? <Text style={estilos.mensajeInfo}>{mensaje}</Text> : null}
                    </View>

                    <Pressable
                        style={[estilos.boton, cargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarConsultar}
                        disabled={cargando}
                    >
                        {cargando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>{t('auth.register.cedula.submit')}</Text>}
                    </Pressable>

                    <Pressable
                        style={estilos.botonSecundario}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)', foreground: true }}
                        onPress={continuarSinDatos}
                        disabled={cargando}
                    >
                        <Text style={estilos.botonSecundarioTexto}>{t('auth.register.cedula.skip')}</Text>
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.back()}>
                        <Text style={estilos.enlaceAtrasTexto}>{"<"} {t('common.back')}</Text>
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
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 28, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 20 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginTop: 6 },
    mensajeInfo: { fontSize: 12, color: '#526349', marginTop: 6, lineHeight: 16 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    botonSecundario: { borderWidth: 1.5, borderColor: '#1b3022', borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonSecundarioTexto: { color: '#1b3022', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
