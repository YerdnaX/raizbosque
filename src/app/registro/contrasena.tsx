import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';

function evaluarRequisitos(valor: string) {
    return [
        { texto: 'Al menos 6 caracteres',        ok: valor.length >= 6 },
        { texto: 'Al menos una mayúscula',        ok: /[A-Z]/.test(valor) },
        { texto: 'Al menos una minúscula',        ok: /[a-z]/.test(valor) },
        { texto: 'Al menos un símbolo',           ok: /[^a-zA-Z0-9]/.test(valor) },
        { texto: 'Sin caracteres consecutivos iguales', ok: !/(.)\1/.test(valor) && valor.length > 0 },
    ];
}

export default function RegistroContrasena() {
    const insets = useSafeAreaInsets();
    const { setContrasena } = useRegistro();
    const [contrasena, setContrasenaLocal] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [error, setError] = useState('');

    const requisitos = evaluarRequisitos(contrasena);
    const todosOk = requisitos.every(r => r.ok);

    function manejarSiguiente() {
        setError('');
        if (!contrasena) { setError('La contraseña es requerida'); return; }
        if (!todosOk) { setError('La contraseña no cumple todos los requisitos'); return; }
        if (contrasena !== confirmar) { setError('Las contraseñas no coinciden'); return; }
        setContrasena(contrasena);
        router.push('/registro/preguntas-1');
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>Paso 6 de 7</Text>
                    <Text style={estilos.titulo}>Contraseña</Text>
                    <Text style={estilos.subtitulo}>Crea una contraseña segura para tu cuenta</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña <Text style={estilos.req}>*</Text></Text>
                        <View style={estilos.inputContenedor}>
                            <TextInput
                                style={[estilos.input, error && !todosOk ? estilos.inputError : null]}
                                value={contrasena}
                                onChangeText={v => { setContrasenaLocal(v); setError(''); }}
                                secureTextEntry={!mostrar}
                                autoCapitalize="none"
                                placeholder="Tu contraseña"
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable style={estilos.ojo} onPress={() => setMostrar(m => !m)}>
                                <Text style={estilos.ojoTexto}>{mostrar ? '🙈' : '👁️'}</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={estilos.requisitos}>
                        {requisitos.map(r => (
                            <Text key={r.texto} style={[estilos.requisito, r.ok ? estilos.requisitoOk : estilos.requisitoPend]}>
                                {r.ok ? '✓' : '○'} {r.texto}
                            </Text>
                        ))}
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Confirmar Contraseña <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={[estilos.input, error && confirmar !== contrasena ? estilos.inputError : null]}
                            value={confirmar}
                            onChangeText={v => { setConfirmar(v); setError(''); }}
                            secureTextEntry={!mostrar}
                            autoCapitalize="none"
                            placeholder="Repite tu contraseña"
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={[estilos.boton, !todosOk && { opacity: 0.5 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarSiguiente}
                    >
                        <Text style={estilos.botonTexto}>CONTINUAR</Text>
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
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 28, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 12 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    inputContenedor: { position: 'relative' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, paddingRight: 48, fontSize: 16, color: '#1c1c18' },
    inputError: { borderColor: '#ba1a1a' },
    ojo: { position: 'absolute', right: 16, top: 12 },
    ojoTexto: { fontSize: 18 },
    requisitos: { marginBottom: 16, gap: 3 },
    requisito: { fontSize: 12 },
    requisitoOk: { color: '#526349' },
    requisitoPend: { color: '#737973' },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
