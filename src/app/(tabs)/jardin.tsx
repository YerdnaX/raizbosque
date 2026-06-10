import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Jardin() {
    return (
        <SafeAreaView style={estilos.contenedor} edges={['top']}>
            <Text style={estilos.texto}>Mi Jardín</Text>
        </SafeAreaView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fcf9f3',
    },
    texto: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1c1c18',
    },
});
