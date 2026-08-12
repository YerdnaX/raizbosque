import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { useIdioma } from '../../context/IdiomaContext';

const ICONO_ATRAS = require('@/assets/icons/atras.png');

type Props = {
    /** Por defecto navega a la pantalla anterior (router.back()). */
    onPress?: () => void;
    /**
     * 'circular': botón redondo con fondo, para encabezados con foto (patrón
     * ya usado en Carrito, Checkout, Historial, etc).
     * 'enlace': ícono + texto subrayado, para pantallas de tarjeta blanca
     * (registro, recuperación de contraseña/usuario).
     */
    variante?: 'circular' | 'enlace';
    /** Solo variante 'enlace'. Por defecto usa el texto "Atrás" traducido. */
    etiqueta?: string;
    style?: StyleProp<ViewStyle>;
};

export function BotonAtras({ onPress, variante = 'circular', etiqueta, style }: Props) {
    const { t } = useIdioma();
    const accionVolver = onPress ?? (() => router.back());

    if (variante === 'enlace') {
        return (
            <Pressable
                style={[estilos.enlace, style]}
                onPress={accionVolver}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
            >
                <Image source={ICONO_ATRAS} style={estilos.iconoEnlace} resizeMode="contain" />
                <Text style={estilos.enlaceTexto}>{etiqueta ?? t('common.back')}</Text>
            </Pressable>
        );
    }

    return (
        <Pressable
            style={[estilos.circular, style]}
            android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }}
            onPress={accionVolver}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
        >
            <View style={estilos.circularFondo}>
                <Image source={ICONO_ATRAS} style={estilos.iconoCircular} resizeMode="contain" />
            </View>
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    circular: {
        borderRadius: 999,
        overflow: 'hidden',
    },
    circularFondo: {
        backgroundColor: 'rgba(27,48,34,0.46)',
        borderRadius: 999,
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.80)',
        elevation: 4,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
    },
    iconoCircular: {
        width: 26,
        height: 26,
    },
    enlace: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        alignSelf: 'center',
    },
    iconoEnlace: {
        width: 15,
        height: 15,
    },
    enlaceTexto: {
        fontSize: 13,
        color: '#526349',
        textDecorationLine: 'underline',
    },
});
