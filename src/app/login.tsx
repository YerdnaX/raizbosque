import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
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
            >
            <View style={estilos.tarjeta}>
                <Text style={estilos.titulo}>RAÍCES BOSQUE</Text>
                <Text style={estilos.subtitulo}>Iniciar Sesión</Text>

                <View style={estilos.campo}>
                    <Text style={estilos.etiqueta}>Correo Electrónico</Text>
                    <TextInput
                        style={estilos.input}
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
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
                        />
                        <Pressable onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                            <Text style={estilos.toggleContrasena}>
                                {mostrarContrasena ? "Ocultar" : "Mostrar"}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={estilos.olvidaste}
                    onPress={() => router.push('/recuperar-contrasena')}
                >
                    <Text style={estilos.olvidasteTexto}>¿Olvidaste tu contraseña?</Text>
                </Pressable>

                <Pressable
                    style={estilos.botonEntrar}
                    onPress={() => {
                        if (estanVacios(correo, contrasena)) {
                            alert("Por favor, complete todos los campos.");
                        } else {
                            router.replace('/(tabs)/perfil');
                        }
                    }}
                >
                    <Text style={estilos.botonEntrarTexto}>ENTRAR</Text>
                </Pressable>
                <Pressable
                    style={estilos.botonRegistrarse}
                    onPress={() => router.push('/registro')}
                >
                    <Text style={estilos.botonRegistrarseTexto}>REGISTRARSE</Text>
                </Pressable>

            </View>
            </ScrollView>
        </ImageBackground>
    );
}

function estanVacios(correo: string, contrasena: string) {
    return correo === "" || contrasena === "";
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
        marginBottom: 20,
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1c1c18',
        textAlign: 'center',
        marginBottom: 20,
    },
    campo: {
        marginBottom: 16,
    },
    etiqueta: {
        alignSelf: 'center',
        fontSize: 18,
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
    olvidaste: {
        alignSelf: 'center',
        marginTop: 4,
        marginBottom: 24,
    },
    olvidasteTexto: {
        fontSize: 13,
        color: '#526349',
        textDecorationLine: 'underline',
    },
    botonEntrar: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    botonEntrarTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    botonRegistrarse: {
        borderWidth: 1.5,
        borderColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    botonRegistrarseTexto: {
        color: '#1b3022',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    separador: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    linea: {
        flex: 1,
        height: 1,
        backgroundColor: '#c3c8c1',
    },
    separadorTexto: {
        marginHorizontal: 12,
        fontSize: 13,
        color: '#737973',
    },
    botonesRedes: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    botonRed: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        width: '45%',
        paddingVertical: 12,
        alignItems: 'center',
    },
    botonRedTexto: {
        fontSize: 16,
        color: '#1c1c18',
        fontWeight: '500',
    },
    toggleContrasena: {
        fontSize: 13,
        color: '#737973',
    },
});
