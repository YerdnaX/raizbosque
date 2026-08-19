import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useIdioma } from '@/context/IdiomaContext';
import { COLORES } from '@/constants/colores';
import { PASOS_ONBOARDING, ALTURA_BASE_TAB_BAR } from '../constants/pasosOnboarding';

const RELLENO_SPOTLIGHT = 8;
const RADIO_SPOTLIGHT = 20;
const MARGEN_TARJETA = 20;

// Genera el "d" de un rectángulo con esquinas redondeadas para el hueco del spotlight.
function trazarRectanguloRedondeado(x: number, y: number, ancho: number, alto: number, radio: number) {
    const r = Math.min(radio, ancho / 2, alto / 2);
    return `M${x + r},${y} H${x + ancho - r} A${r},${r} 0 0 1 ${x + ancho},${y + r} V${y + alto - r} A${r},${r} 0 0 1 ${x + ancho - r},${y + alto} H${x + r} A${r},${r} 0 0 1 ${x},${y + alto - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

type TourPrincipalProps = {
    visible: boolean;
    pasoActual: number;
    totalPasos: number;
    onSiguiente: () => void;
    onAnterior: () => void;
    onOmitir: () => void;
};

export function TourPrincipal({ visible, pasoActual, totalPasos, onSiguiente, onAnterior, onOmitir }: TourPrincipalProps) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { t, strings } = useIdioma();

    const paso = PASOS_ONBOARDING[pasoActual];
    if (!visible || !paso) return null;

    const esPrimero = pasoActual === 0;
    const esUltimo = pasoActual === totalPasos - 1;

    // El tab bar real (ver (tabs)/_layout.tsx) reparte el ancho en partes iguales
    // entre los tabs, así que el rectángulo de cada tab se puede calcular sin
    // depender de medir el árbol nativo de React Navigation.
    const alturaTabBar = ALTURA_BASE_TAB_BAR + insets.bottom;
    const anchoTab = width / totalPasos;
    const objetivo = {
        x: pasoActual * anchoTab,
        y: height - alturaTabBar,
        width: anchoTab,
        height: alturaTabBar,
    };

    const spotlight = {
        x: objetivo.x + RELLENO_SPOTLIGHT,
        y: objetivo.y + RELLENO_SPOTLIGHT,
        width: objetivo.width - RELLENO_SPOTLIGHT * 2,
        height: objetivo.height - RELLENO_SPOTLIGHT * 2,
    };

    const pathOverlay = `M0,0 H${width} V${height} H0 Z ${trazarRectanguloRedondeado(spotlight.x, spotlight.y, spotlight.width, spotlight.height, RADIO_SPOTLIGHT)}`;

    function manejarCerrarConBoton() {
        if (esPrimero) {
            onOmitir();
        } else {
            onAnterior();
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={manejarCerrarConBoton}
        >
            <View style={StyleSheet.absoluteFill}>
                <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Path d={pathOverlay} fill="rgba(6,27,14,0.78)" fillRule="evenodd" />
                </Svg>

                <View style={[estilos.tarjeta, { bottom: height - spotlight.y + 16, left: MARGEN_TARJETA, right: MARGEN_TARJETA }]}>
                    {!esUltimo && (
                        <Pressable
                            style={estilos.omitirEsquina}
                            android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: true }}
                            onPress={onOmitir}
                            accessibilityRole="button"
                            accessibilityLabel={t('onboarding.omitir')}
                        >
                            <Text style={estilos.omitirEsquinaTexto}>{t('onboarding.omitir')}</Text>
                        </Pressable>
                    )}

                    <Text style={estilos.pasoIndicador}>
                        {t('onboarding.pasoIndicador', { current: pasoActual + 1, total: totalPasos })}
                    </Text>
                    <Text style={estilos.titulo}>{t(`nav.${paso.claveNav}`)}</Text>
                    <Text style={estilos.descripcion}>{strings.onboarding.descripciones[paso.ruta]}</Text>

                    <View style={estilos.filaBotones}>
                        {esPrimero ? (
                            <View style={estilos.espacioBoton} />
                        ) : (
                            <Pressable
                                style={estilos.botonSecundario}
                                android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                                onPress={onAnterior}
                                accessibilityRole="button"
                                accessibilityLabel={t('onboarding.anterior')}
                            >
                                <Text style={estilos.botonSecundarioTexto}>{t('onboarding.anterior')}</Text>
                            </Pressable>
                        )}

                        <Pressable
                            style={estilos.botonPrimario}
                            android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                            onPress={onSiguiente}
                            accessibilityRole="button"
                            accessibilityLabel={esUltimo ? t('onboarding.comenzar') : t('onboarding.siguiente')}
                        >
                            <Text style={estilos.botonPrimarioTexto}>
                                {esUltimo ? t('onboarding.comenzar') : t('onboarding.siguiente')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const estilos = StyleSheet.create({
    tarjeta: {
        position: 'absolute',
        backgroundColor: COLORES.superficie,
        borderRadius: 24,
        padding: 20,
        paddingTop: 16,
        shadowColor: COLORES.primario,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    omitirEsquina: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    omitirEsquinaTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORES.textoSecundario,
    },
    pasoIndicador: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORES.secundarioClaro,
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    titulo: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORES.texto,
        marginBottom: 6,
    },
    descripcion: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORES.textoSecundario,
        marginBottom: 18,
    },
    filaBotones: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    espacioBoton: {
        flex: 1,
    },
    botonSecundario: {
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    botonSecundarioTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORES.textoSecundario,
    },
    botonPrimario: {
        backgroundColor: COLORES.primario,
        borderRadius: 999,
        paddingVertical: 12,
        paddingHorizontal: 24,
        overflow: 'hidden',
    },
    botonPrimarioTexto: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORES.blanco,
    },
});
