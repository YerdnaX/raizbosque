import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUsuario } from '../context/UsuarioContext';
import { useIdioma } from '../context/IdiomaContext';
import { elegirIndiceMensajeBienvenida } from '../features/bienvenida/constants/mensajesBienvenida';
import { SimboloBrote } from '../features/bienvenida/components/SimboloBrote';
import { COLORES } from '../constants/colores';

// Tiempo máximo antes de continuar a Home aunque la animación no haya
// terminado (o haya fallado). El ritual nunca debe bloquear al usuario.
const TIEMPO_MAXIMO_SEGURIDAD = 2500;

export default function Bienvenida() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { t, strings } = useIdioma();
    const indiceMensaje = useRef(elegirIndiceMensajeBienvenida(strings.welcome.messages.length)).current;
    const mensaje = strings.welcome.messages[indiceMensaje];
    const yaNavego = useRef(false);

    const iconoOpacidad = useRef(new Animated.Value(0)).current;
    const iconoEscala = useRef(new Animated.Value(0.96)).current;
    const textoOpacidad = useRef(new Animated.Value(0)).current;
    const salidaOpacidad = useRef(new Animated.Value(1)).current;
    const salidaTraslado = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let cancelado = false;

        function irAHome() {
            if (yaNavego.current) return;
            yaNavego.current = true;
            router.replace('/(tabs)/perfil');
        }

        const seguridad = setTimeout(irAHome, TIEMPO_MAXIMO_SEGURIDAD);

        function animar(reducido: boolean) {
            if (cancelado) return;

            const duracionEntrada = reducido ? 300 : 550;
            const duracionSalida = reducido ? 250 : 400;
            const pausa = reducido ? 500 : 650;

            // Con reducción de movimiento activa, el ícono no escala: solo aparece con fade.
            if (reducido) {
                iconoEscala.setValue(1);
            }

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(iconoOpacidad, { toValue: 1, duration: duracionEntrada, useNativeDriver: true }),
                    ...(reducido ? [] : [Animated.timing(iconoEscala, { toValue: 1, duration: duracionEntrada, useNativeDriver: true })]),
                ]),
                Animated.timing(textoOpacidad, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.delay(pausa),
                Animated.parallel([
                    Animated.timing(salidaOpacidad, { toValue: 0, duration: duracionSalida, useNativeDriver: true }),
                    Animated.timing(salidaTraslado, { toValue: reducido ? 0 : -16, duration: duracionSalida, useNativeDriver: true }),
                ]),
            ]).start(() => {
                clearTimeout(seguridad);
                irAHome();
            });
        }

        AccessibilityInfo.isReduceMotionEnabled()
            .then(animar)
            .catch(() => animar(false));

        return () => {
            cancelado = true;
            clearTimeout(seguridad);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nombre = usuario?.Nombre?.trim() || '';

    return (
        <View style={[estilos.contenedor, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Animated.View
                style={[
                    estilos.contenido,
                    { opacity: salidaOpacidad, transform: [{ translateY: salidaTraslado }] },
                ]}
            >
                <Animated.View style={{ opacity: iconoOpacidad, transform: [{ scale: iconoEscala }] }}>
                    <SimboloBrote tamano={72} color={COLORES.champan} />
                </Animated.View>

                <Animated.View style={{ opacity: textoOpacidad, marginTop: 28 }}>
                    {nombre ? <Text style={estilos.saludo}>{t('welcome.greeting', { name: nombre })}</Text> : null}
                    <Text style={estilos.mensaje}>{mensaje}</Text>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: COLORES.esmeraldaTinta,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    contenido: {
        alignItems: 'center',
    },
    saludo: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORES.champan,
        textAlign: 'center',
        marginBottom: 8,
        opacity: 0.85,
    },
    mensaje: {
        fontSize: 22,
        fontWeight: '600',
        color: COLORES.champan,
        textAlign: 'center',
        lineHeight: 30,
    },
});
