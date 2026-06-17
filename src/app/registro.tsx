import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { registro } from "../features/auth/services/authService";

export default function Registro() {
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [estaCargando, setEstaCargando] = useState(false);
    const insets = useSafeAreaInsets();

    async function manejarRegistro() {
        if (!nombre || !apellidos || !correo || !contrasena || !confirmarContrasena) {
            Alert.alert('Campos requeridos', 'Por favor complete todos los campos obligatorios.');
            return;
        }
        if (contrasena.length < 4) {
            Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 4 caracteres.');
            return;
        }
        if (contrasena !== confirmarContrasena) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        setEstaCargando(true);
        try {
            await registro({
                nombre,
                apellidos,
                correo,
                contrasena,
                telefono: telefono || undefined,
                direccion: direccion || undefined,
            });
            Alert.alert('Cuenta creada', 'Tu cuenta fue creada correctamente.', [
                { text: 'Iniciar Sesión', onPress: () => router.replace('/login') },
            ]);
        } catch (error: any) {
            if (error?.response?.status === 409) {
                Alert.alert('Correo en uso', 'Ya existe una cuenta con ese correo.');
            } else {
                Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
            }
        } finally {
            setEstaCargando(false);
        }
    }

    return (
        <ImageBackground
            source={require('@/assets/images/login/inicio.png')}
            style={estilos.fondo}
            resizeMode="cover"
        >
            <ScrollView
                contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>Crear Cuenta</Text>
                    <Text style={estilos.subtitulo}>Completa tus datos para registrarte.</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Nombre <Text style={estilos.requerido}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="Ej. Juan"
                            placeholderTextColor="#b0b0a8"
                            value={nombre}
                            onChangeText={setNombre}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Apellidos <Text style={estilos.requerido}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="Ej. Santamaría Pérez"
                            placeholderTextColor="#b0b0a8"
                            value={apellidos}
                            onChangeText={setApellidos}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Correo Electrónico <Text style={estilos.requerido}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#b0b0a8"
                            value={correo}
                            onChangeText={setCorreo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Teléfono</Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="+506 8888 8888"
                            placeholderTextColor="#b0b0a8"
                            value={telefono}
                            onChangeText={setTelefono}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Dirección</Text>
                        <TextInput
                            style={[estilos.input, estilos.inputMultilinea]}
                            placeholder="Tu dirección"
                            placeholderTextColor="#b0b0a8"
                            value={direccion}
                            onChangeText={setDireccion}
                            multiline
                            numberOfLines={2}
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Contraseña <Text style={estilos.requerido}>*</Text></Text>
                        <View style={estilos.inputContrasena}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={contrasena}
                                onChangeText={setContrasena}
                                secureTextEntry={!mostrarContrasena}
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                                <Text style={estilos.toggle}>
                                    {mostrarContrasena ? "Ocultar" : "Ver"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Confirmar Contraseña <Text style={estilos.requerido}>*</Text></Text>
                        <View style={estilos.inputContrasena}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={confirmarContrasena}
                                onChangeText={setConfirmarContrasena}
                                secureTextEntry={!mostrarConfirmar}
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                                <Text style={estilos.toggle}>
                                    {mostrarConfirmar ? "Ocultar" : "Ver"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        style={[estilos.botonRegistrarse, estaCargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarRegistro}
                        disabled={estaCargando}
                    >
                        {estaCargando
                            ? <ActivityIndicator color="#ffffff" />
                            : <Text style={estilos.botonRegistrarseTexto}>REGISTRARSE</Text>
                        }
                    </Pressable>

                    <Pressable
                        style={estilos.enlace}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                        onPress={() => router.replace('/login')}
                    >
                        <Text style={estilos.enlaceTexto}>
                            ¿Ya tienes una cuenta?{' '}
                            <Text style={estilos.enlaceDestacado}>Inicia Sesión</Text>
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: {
        flex: 1,
    },
    contenedor: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 40,
    },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 30,
        width: '85%',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    titulo: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitulo: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        marginBottom: 24,
    },
    campo: {
        marginBottom: 16,
    },
    etiqueta: {
        fontSize: 14,
        fontWeight: '500',
        color: '#434843',
        marginBottom: 8,
    },
    requerido: {
        color: '#ba1a1a',
    },
    input: {
        backgroundColor: '#fefcf8',
        borderColor: '#8da082',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1c1c18',
    },
    inputMultilinea: {
        borderRadius: 16,
        textAlignVertical: 'top',
        minHeight: 72,
    },
    inputContrasena: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fefcf8',
        borderColor: '#8da082',
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputDentro: {
        flex: 1,
        fontSize: 16,
        color: '#1c1c18',
        paddingVertical: 0,
    },
    toggle: {
        fontSize: 13,
        color: '#737973',
    },
    botonRegistrarse: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
        overflow: 'hidden',
    },
    botonRegistrarseTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    enlace: {
        alignItems: 'center',
    },
    enlaceTexto: {
        fontSize: 13,
        color: '#737973',
    },
    enlaceDestacado: {
        fontWeight: '700',
        color: '#1c1c18',
    },
});
