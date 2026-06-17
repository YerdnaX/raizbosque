import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RecuperarContrasena() {
    const [correo, setCorreo] = useState("");
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
                    <Text style={estilos.titulo}>Recuperar{'\n'}Contraseña</Text>
                    <Text style={estilos.subtitulo}>
                        Ingresa tu correo y te enviaremos las instrucciones para restablecerla.
                    </Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Correo Electrónico</Text>
                        <TextInput
                            style={estilos.input}
                            value={correo}
                            onChangeText={setCorreo}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="correo@ejemplo.com"
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    <Pressable
                        style={estilos.botonEnviar}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={() => {
                            if (correo === "") {
                                alert("Por favor, ingresa tu correo electrónico.");
                            }
                        }}
                    >
                        <Text style={estilos.botonEnviarTexto}>ENVIAR</Text>
                    </Pressable>

                    <Pressable
                        style={estilos.enlace}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                        onPress={() => router.back()}
                    >
                        <Text style={estilos.enlaceTexto}>Volver al inicio de sesión</Text>
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
        marginBottom: 12,
    },
    subtitulo: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    campo: {
        marginBottom: 24,
    },
    etiqueta: {
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
    botonEnviar: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    botonEnviarTexto: {
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
        color: '#526349',
        textDecorationLine: 'underline',
    },
});
