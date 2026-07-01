import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cambiarContrasenaVencida } from '../features/auth/services/authService';

function evaluarRequisitos(valor: string) {
    return [
        { texto: 'Al menos 6 caracteres',              ok: valor.length >= 6 },
        { texto: 'Al menos una mayúscula',              ok: /[A-Z]/.test(valor) },
        { texto: 'Al menos una minúscula',              ok: /[a-z]/.test(valor) },
        { texto: 'Al menos un símbolo',                 ok: /[^a-zA-Z0-9]/.test(valor) },
        { texto: 'Sin caracteres consecutivos iguales', ok: valor.length > 0 && !/(.)\1/.test(valor) },
    ];
}

export default function ContrasenaVencida() {
    const insets = useSafeAreaInsets();
    const { correo } = useLocalSearchParams<{ correo: string }>();

    const [contrasenaActual, setContrasenaActual] = useState('');
    const [contrasenaNueva, setContrasenaNueva] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const requisitos = evaluarRequisitos(contrasenaNueva);
    const todosOk = requisitos.every(r => r.ok);

    async function manejarCambio() {
        setError('');
        if (!contrasenaActual) { setError('Ingresa tu contraseña actual'); return; }
        if (!todosOk) { setError('La contraseña nueva no cumple todos los requisitos'); return; }

        setEnviando(true);
        try {
            await cambiarContrasenaVencida(correo ?? '', contrasenaActual, contrasenaNueva);
            router.replace('/login');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (e?.response?.status === 401 || cod === 'INVALID_CREDENTIALS') {
                setError('La contraseña actual es incorrecta.');
            } else if (cod === 'INVALID_PASSWORD_POLICY') {
                setError('La contraseña nueva no cumple la política de seguridad.');
            } else {
                setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
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
                    <Text style={estilos.titulo}>Contraseña Vencida</Text>
                    <Text style={estilos.subtitulo}>Tu contraseña ha expirado. Crea una nueva para continuar.</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña Actual <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={contrasenaActual}
                            onChangeText={v => { setContrasenaActual(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder="Tu contraseña actual"
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña Nueva <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={contrasenaNueva}
                            onChangeText={v => { setContrasenaNueva(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder="Tu nueva contraseña"
                            placeholderTextColor="#b0b0a8"
                        />
                        <Pressable onPress={() => setMostrar(m => !m)} style={estilos.toggleContenedor}>
                            <Text style={estilos.toggleTexto}>{mostrar ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}</Text>
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
                        {enviando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botonTexto}>ACTUALIZAR CONTRASEÑA</Text>}
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.replace('/login')}>
                        <Text style={estilos.enlaceAtrasTexto}>‹ Volver al inicio</Text>
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
