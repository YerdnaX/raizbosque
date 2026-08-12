import { View, Text, Pressable, StyleSheet, ImageBackground, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIdioma } from '../context/IdiomaContext';

export default function CuentaBloqueada() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <View style={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]}>
                <View style={estilos.tarjeta}>
                    <Image source={require('@/assets/images/iconosv2/cuentabloqueada.png')} style={estilos.icono} />
                    <Text style={estilos.titulo}>{t('auth.blockedAccount.title')}</Text>
                    <Text style={estilos.descripcion}>
                        {t('auth.blockedAccount.message')}
                    </Text>
                    <Text style={estilos.instruccion}>
                        {t('auth.blockedAccount.hint')}
                    </Text>

                    <Pressable
                        style={estilos.boton}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={() => router.replace('/recuperar-contrasena' as any)}
                    >
                        <Text style={estilos.botonTexto}>{t('auth.blockedAccount.recover')}</Text>
                    </Pressable>

                    <Pressable style={estilos.enlaceAtras} onPress={() => router.replace('/login')}>
                        <Text style={estilos.enlaceAtrasTexto}>{t('auth.blockedAccount.backHome')}</Text>
                    </Pressable>
                </View>
            </View>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 36, width: '85%', elevation: 4, alignItems: 'center' },
    icono: { width: 56, height: 56, marginBottom: 16 },
    titulo: { fontSize: 24, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 12 },
    descripcion: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 12, lineHeight: 22 },
    instruccion: { fontSize: 14, fontWeight: '600', color: '#1b3022', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 16, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
