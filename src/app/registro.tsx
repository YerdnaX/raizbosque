import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Registro() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const insets = useSafeAreaInsets();

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
                        <Text style={estilos.etiqueta}>Nombre Completo</Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="Ej. Juan Santamaria"
                            placeholderTextColor="#b0b0a8"
                            value={nombre}
                            onChangeText={setNombre}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Correo Electrónico</Text>
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
                        <Text style={estilos.etiqueta}>Contraseña</Text>
                        <View style={estilos.inputContrasena}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={contrasena}
                                onChangeText={setContrasena}
                                secureTextEntry={!mostrarContrasena}
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                                <Text style={estilos.toggle}>
                                    {mostrarContrasena ? "Ocultar" : "Ver"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Confirmar Contraseña</Text>
                        <View style={estilos.inputContrasena}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={confirmarContrasena}
                                onChangeText={setConfirmarContrasena}
                                secureTextEntry={!mostrarConfirmar}
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                                <Text style={estilos.toggle}>
                                    {mostrarConfirmar ? "Ocultar" : "Ver"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable style={estilos.botonRegistrarse}>
                        <Text style={estilos.botonRegistrarseTexto}>REGISTRARSE</Text>
                    </Pressable>

                    <Pressable
                        style={estilos.enlace}
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
    checkboxFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
        marginTop: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: '#8da082',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActivo: {
        backgroundColor: '#1b3022',
        borderColor: '#1b3022',
    },
    checkboxMarca: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 16,
    },
    checkboxTexto: {
        fontSize: 14,
        color: '#434843',
    },
    botonRegistrarse: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8
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
