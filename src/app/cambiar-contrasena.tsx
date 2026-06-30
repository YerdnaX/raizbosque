import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cambiarContrasena } from "../features/auth/services/authService";
import { useUsuario } from "../context/UsuarioContext";

function evaluarRequisitos(valor: string) {
    return [
        { texto: 'Al menos 6 caracteres',             ok: valor.length >= 6 },
        { texto: 'Al menos una mayúscula',             ok: /[A-Z]/.test(valor) },
        { texto: 'Al menos una minúscula',             ok: /[a-z]/.test(valor) },
        { texto: 'Al menos un símbolo',                ok: /[^a-zA-Z0-9]/.test(valor) },
        { texto: 'Sin caracteres consecutivos iguales', ok: valor.length > 0 && !/(.)\1/.test(valor) },
    ];
}

export default function CambiarContrasena() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();

    const [contrasenaActual, setContrasenaActual] = useState('');
    const [contrasenaNueva, setContrasenaNueva] = useState('');
    const [confirmarNueva, setConfirmarNueva] = useState('');
    const [verActual, setVerActual] = useState(false);
    const [verNueva, setVerNueva] = useState(false);
    const [estaCargando, setEstaCargando] = useState(false);
    const [error, setError] = useState('');

    const requisitos = evaluarRequisitos(contrasenaNueva);
    const todosOk = requisitos.every(r => r.ok);

    async function manejarCambio() {
        setError('');
        if (!contrasenaActual || !contrasenaNueva || !confirmarNueva) {
            setError('Por favor completa todos los campos.');
            return;
        }
        if (!todosOk) {
            setError('La contraseña nueva no cumple todos los requisitos.');
            return;
        }
        if (contrasenaNueva !== confirmarNueva) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }
        if (!usuario) return;

        setEstaCargando(true);
        try {
            await cambiarContrasena(usuario.IdUsuario, contrasenaActual, contrasenaNueva);
            Alert.alert(
                '¡Contraseña actualizada!',
                'Tu contraseña fue cambiada correctamente.',
                [{ text: 'OK', onPress: () => router.back() }],
            );
        } catch (err: any) {
            const cod = err?.response?.data?.codigo;
            if (err?.response?.status === 401 || cod === 'INVALID_CREDENTIALS') {
                setError('La contraseña actual que ingresaste no es correcta.');
            } else if (cod === 'INVALID_PASSWORD_POLICY') {
                setError('La contraseña nueva no cumple la política de seguridad.');
            } else {
                setError('No se pudo cambiar la contraseña. Intenta de nuevo.');
            }
        } finally {
            setEstaCargando(false);
        }
    }

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonAtras} android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <Text style={estilos.botonAtrasTexto}>‹</Text>
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Cambiar Contraseña</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.tarjeta}>
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña Actual</Text>
                        <View style={estilos.inputFila}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={contrasenaActual}
                                onChangeText={v => { setContrasenaActual(v); setError(''); }}
                                secureTextEntry={!verActual}
                                placeholderTextColor="#b0b0a8"
                                autoCapitalize="none"
                            />
                            <Pressable android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => setVerActual(!verActual)}>
                                <Text style={estilos.toggle}>{verActual ? 'Ocultar' : 'Ver'}</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={estilos.divisor} />

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña Nueva</Text>
                        <View style={estilos.inputFila}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={contrasenaNueva}
                                onChangeText={v => { setContrasenaNueva(v); setError(''); }}
                                secureTextEntry={!verNueva}
                                placeholderTextColor="#b0b0a8"
                                autoCapitalize="none"
                            />
                            <Pressable android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => setVerNueva(!verNueva)}>
                                <Text style={estilos.toggle}>{verNueva ? 'Ocultar' : 'Ver'}</Text>
                            </Pressable>
                        </View>
                        <View style={estilos.requisitos}>
                            {requisitos.map(r => (
                                <Text key={r.texto} style={[estilos.requisito, r.ok ? estilos.requisitoOk : estilos.requisitoPend]}>
                                    {r.ok ? '✓' : '○'} {r.texto}
                                </Text>
                            ))}
                        </View>
                    </View>

                    <View style={estilos.divisor} />

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Confirmar Contraseña Nueva</Text>
                        <View style={estilos.inputFila}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={confirmarNueva}
                                onChangeText={v => { setConfirmarNueva(v); setError(''); }}
                                secureTextEntry={!verNueva}
                                placeholderTextColor="#b0b0a8"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>

                {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                <Pressable
                    style={[estilos.botonCambiar, (estaCargando || !todosOk) && { opacity: 0.6 }]}
                    android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                    onPress={manejarCambio}
                    disabled={estaCargando}
                >
                    {estaCargando
                        ? <ActivityIndicator color="#ffffff" />
                        : <Text style={estilos.botonCambiarTexto}>CAMBIAR CONTRASEÑA</Text>
                    }
                </Pressable>
            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f0eee8' },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#c8d4c0' },
    botonAtras: { borderRadius: 999, overflow: 'hidden' },
    fondoAtras: { backgroundColor: 'rgba(27,48,34,0.46)', borderRadius: 999, width: 46, height: 46, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.80)', elevation: 4 },
    botonAtrasTexto: { color: '#ffffff', fontSize: 30, fontWeight: '700', lineHeight: 34, textAlign: 'center', marginLeft: -1, marginTop: -1 },
    encabezadoTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18', letterSpacing: 1 },
    espaciador: { width: 52 },
    scroll: { padding: 20, paddingBottom: 40, gap: 16, alignItems: 'center' },
    tarjeta: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, width: '90%', elevation: 2, gap: 4 },
    campo: { paddingVertical: 8 },
    etiqueta: { fontSize: 13, fontWeight: '600', color: '#737973', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    inputFila: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fefcf8', borderColor: '#c3c8c1', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
    inputDentro: { flex: 1, fontSize: 16, color: '#1c1c18', paddingVertical: 0, textAlign: 'center' },
    toggle: { fontSize: 13, color: '#737973', paddingLeft: 8 },
    divisor: { height: 1, backgroundColor: '#f0eee8' },
    requisitos: { marginTop: 8, gap: 3 },
    requisito: { fontSize: 12, textAlign: 'center' },
    requisitoOk: { color: '#526349' },
    requisitoPend: { color: '#b0b0a8' },
    mensajeError: { fontSize: 13, color: '#ba1a1a', textAlign: 'center', width: '90%' },
    botonCambiar: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', width: '90%', overflow: 'hidden' },
    botonCambiarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
});
