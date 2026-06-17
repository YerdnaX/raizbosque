import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AtrasIcono from '@/assets/icons/atras.svg';
import { actualizarPerfil } from "../features/auth/services/authService";
import { useUsuario } from "../context/UsuarioContext";

export default function EditarPerfil() {
    const insets = useSafeAreaInsets();
    const { usuario, guardarUsuario } = useUsuario();

    const [nombre, setNombre] = useState(usuario?.Nombre ?? '');
    const [apellidos, setApellidos] = useState(usuario?.Apellidos ?? '');
    const [telefono, setTelefono] = useState(usuario?.Telefono ?? '');
    const [direccion, setDireccion] = useState(usuario?.Direccion ?? '');
    const [estaCargando, setEstaCargando] = useState(false);

    async function manejarGuardar() {
        if (!nombre || !apellidos) {
            Alert.alert('Campos requeridos', 'El nombre y los apellidos son obligatorios.');
            return;
        }
        if (!usuario) return;

        setEstaCargando(true);
        try {
            await actualizarPerfil(usuario.IdUsuario, { nombre, apellidos, telefono, direccion });
            guardarUsuario({ ...usuario, Nombre: nombre, Apellidos: apellidos, Telefono: telefono, Direccion: direccion });
            Alert.alert('Listo', 'Tu perfil fue actualizado correctamente.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
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
                <Pressable style={estilos.botonAtras} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Editar Perfil</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.tarjeta}>
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Nombre <Text style={estilos.requerido}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="Tu nombre"
                            placeholderTextColor="#b0b0a8"
                            value={nombre}
                            onChangeText={setNombre}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.divisor} />

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Apellidos <Text style={estilos.requerido}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            placeholder="Tus apellidos"
                            placeholderTextColor="#b0b0a8"
                            value={apellidos}
                            onChangeText={setApellidos}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.divisor} />

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

                    <View style={estilos.divisor} />

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Dirección</Text>
                        <TextInput
                            style={[estilos.input, estilos.inputMultilinea]}
                            placeholder="Tu dirección"
                            placeholderTextColor="#b0b0a8"
                            value={direccion}
                            onChangeText={setDireccion}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                <Pressable
                    style={[estilos.botonGuardar, estaCargando && { opacity: 0.7 }]}
                    onPress={manejarGuardar}
                    disabled={estaCargando}
                >
                    {estaCargando
                        ? <ActivityIndicator color="#ffffff" />
                        : <Text style={estilos.botonGuardarTexto}>GUARDAR CAMBIOS</Text>
                    }
                </Pressable>

                <View style={estilos.infoCorreo}>
                    <Text style={estilos.infoCorreoTexto}>
                        Correo: {usuario?.Correo ?? ''}
                    </Text>
                    <Text style={estilos.infoCorreoNota}>
                        El correo no se puede modificar.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#f0eee8',
    },
    encabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#c8d4c0',
    },
    botonAtras: {
        padding: 4,
    },
    fondoAtras: {
        backgroundColor: '#1c1c18',
        borderRadius: 999,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 1,
    },
    espaciador: {
        width: 32,
    },
    scroll: {
        padding: 20,
        paddingBottom: 40,
        gap: 16,
        alignItems: 'center',
    },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        gap: 4,
    },
    campo: {
        paddingVertical: 8,
    },
    etiqueta: {
        fontSize: 13,
        fontWeight: '600',
        color: '#737973',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    requerido: {
        color: '#ba1a1a',
    },
    input: {
        backgroundColor: '#fefcf8',
        borderColor: '#c3c8c1',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 16,
        color: '#1c1c18',
        textAlign: 'center',
    },
    inputMultilinea: {
        textAlignVertical: 'top',
        minHeight: 80,
        textAlign: 'center',
    },
    divisor: {
        height: 1,
        backgroundColor: '#f0eee8',
    },
    botonGuardar: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: 'center',
        width: '90%',
    },
    botonGuardarTexto: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    infoCorreo: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        width: '90%',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        gap: 4,
        alignItems: 'center',
    },
    infoCorreoTexto: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1c1c18',
        textAlign: 'center',
    },
    infoCorreoNota: {
        fontSize: 13,
        color: '#737973',
        textAlign: 'center',
    },
});
