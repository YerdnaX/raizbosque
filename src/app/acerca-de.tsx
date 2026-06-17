import { View, Text, Image, Pressable, StyleSheet, ImageBackground } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AtrasIcono from '@/assets/icons/atras.svg';

export default function AcercaDe() {
    const insets = useSafeAreaInsets();

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonAtras} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Acerca de</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <View style={estilos.cuerpo}>
                <Image
                    source={require('@/assets/images/cuclogo.png')}
                    style={estilos.logo}
                    resizeMode="contain"
                />

                <View style={estilos.separador} />

                <Text style={estilos.institucion}>Colegio Universitario de Cartago</Text>
                <Text style={estilos.carrera}>Tecnologías de la Información</Text>
                <Text style={estilos.curso}>Programación 5</Text>

                <View style={estilos.separador} />

                <Text style={estilos.nombre}>Wilberth Andrey Mora Chinchilla</Text>
                <Text style={estilos.correo}>yerdnacr@gmail.com</Text>
                <Text style={estilos.correo}>84491492</Text>

                <View style={estilos.separadorGrande} />

                <Text style={estilos.firma}>Hecho con ❤️</Text>
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#ffffff',
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
        backgroundColor: '#6b7068',
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
        width: 52,
    },
    cuerpo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 8,
    },
    logo: {
        width: 180,
        height: 180,
    },
    separador: {
        height: 1,
        backgroundColor: '#e5e2dc',
        width: '80%',
        marginVertical: 8,
    },
    separadorGrande: {
        height: 24,
    },
    institucion: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1c1c18',
        textAlign: 'center',
    },
    carrera: {
        fontSize: 15,
        fontWeight: '500',
        color: '#434843',
        textAlign: 'center',
    },
    curso: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
    },
    nombre: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1b3022',
        textAlign: 'center',
    },
    correo: {
        fontSize: 14,
        color: '#526349',
        textAlign: 'center',
    },
    firma: {
        fontSize: 13,
        color: '#9ca09a',
        textAlign: 'center',
    },
});
