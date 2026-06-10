import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Jardin() {
    const insets = useSafeAreaInsets();
    return (
        <View style={[estilos.contenedor]}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
                
            >
                <View style={estilos.espacioIzq} />
                <Text style={estilos.encabezadoTitulo}>Mi Jardín</Text>
                <View style={estilos.espacioIzq} />
            </ImageBackground>

            <View style={estilos.cuerpo}>
                <Text style={estilos.texto}>Mi Jardín</Text>
            </View>
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
    espacioIzq: {
        width: 32,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1b3022',
        letterSpacing: 0.5,
    },
    cuerpo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    texto: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1c1c18',
    },
});
