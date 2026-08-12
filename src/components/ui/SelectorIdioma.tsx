import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useIdioma } from '../../context/IdiomaContext';
import type { Idioma } from '../../i18n';

const OPCIONES: { idioma: Idioma; etiquetaBoton: string }[] = [
    { idioma: 'es', etiquetaBoton: 'ES' },
    { idioma: 'en', etiquetaBoton: 'EN' },
];

// Bottom sheet compartido por los dos selectores (Home y Perfil): una única
// fuente de verdad para elegir el idioma, con distinta presentación visual.
function ModalIdioma({ visible, onCerrar }: { visible: boolean; onCerrar: () => void }) {
    const { idioma, cambiarIdioma, t, strings } = useIdioma();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
            <Pressable style={estilos.modalFondo} onPress={onCerrar}>
                <Pressable style={estilos.modalTarjeta} onPress={(e) => e.stopPropagation()}>
                    <Text style={estilos.modalTitulo}>{t('common.chooseLanguage')}</Text>

                    {OPCIONES.map((opcion) => {
                        const seleccionado = idioma === opcion.idioma;
                        const etiqueta = opcion.idioma === 'es' ? strings.common.spanish : strings.common.english;
                        return (
                            <Pressable
                                key={opcion.idioma}
                                style={estilos.opcion}
                                android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                                onPress={() => { cambiarIdioma(opcion.idioma); onCerrar(); }}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: seleccionado }}
                                accessibilityLabel={etiqueta}
                            >
                                <Text style={[estilos.opcionTexto, seleccionado && estilos.opcionTextoSeleccionado]}>
                                    {etiqueta}
                                </Text>
                                {seleccionado ? (
                                    <SymbolView name="checkmark" size={18} tintColor="#1b3022" />
                                ) : null}
                            </Pressable>
                        );
                    })}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/** Selector compacto tipo "ES ▾" para el encabezado del Home. */
export function SelectorIdiomaCompacto({ visible, onAbrir, onCerrar }: {
    visible: boolean;
    onAbrir: () => void;
    onCerrar: () => void;
}) {
    const { idioma, t } = useIdioma();
    const etiqueta = OPCIONES.find((o) => o.idioma === idioma)?.etiquetaBoton ?? 'ES';

    return (
        <>
            <Pressable
                style={estilos.pill}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={onAbrir}
                accessibilityRole="button"
                accessibilityLabel={t('common.changeLanguage')}
            >
                <Text style={estilos.pillTexto}>{etiqueta}</Text>
                <SymbolView name="chevron.down" size={11} tintColor="#1b3022" />
            </Pressable>
            <ModalIdioma visible={visible} onCerrar={onCerrar} />
        </>
    );
}

/** Fila de configuración "Idioma  Español  ›" para la pantalla de Perfil. */
export function SelectorIdiomaFila({ visible, onAbrir, onCerrar }: {
    visible: boolean;
    onAbrir: () => void;
    onCerrar: () => void;
}) {
    const { t } = useIdioma();
    const nombreIdioma = useNombreIdiomaActual();

    return (
        <>
            <Pressable
                style={estilos.fila}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={onAbrir}
                accessibilityRole="button"
                accessibilityLabel={t('common.changeLanguage')}
            >
                <SymbolView name="globe" size={22} tintColor="#434843" />
                <View style={estilos.filaConEstado}>
                    <Text style={estilos.filaTexto}>{t('common.language')}</Text>
                    <Text style={estilos.filaValor}>{nombreIdioma}</Text>
                </View>
                <SymbolView name="chevron.right" size={16} tintColor="#737973" />
            </Pressable>
            <ModalIdioma visible={visible} onCerrar={onCerrar} />
        </>
    );
}

function useNombreIdiomaActual() {
    const { idioma, strings } = useIdioma();
    return idioma === 'es' ? strings.common.spanish : strings.common.english;
}

const estilos = StyleSheet.create({
    // Pill compacto (Home)
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(27,48,34,0.08)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    pillTexto: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1b3022',
        letterSpacing: 0.5,
    },
    // Fila (Perfil)
    fila: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 16 },
    filaConEstado: { flex: 1, gap: 2 },
    filaTexto: { fontSize: 16, fontWeight: '500', color: '#1c1c18' },
    filaValor: { fontSize: 12, color: '#737973' },
    // Modal compartido
    modalFondo: { flex: 1, backgroundColor: 'rgba(27,48,34,0.55)', justifyContent: 'flex-end' },
    modalTarjeta: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 28,
        paddingBottom: 36,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 12,
    },
    modalTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 16 },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    opcionTexto: { fontSize: 16, fontWeight: '500', color: '#434843' },
    opcionTextoSeleccionado: { color: '#1b3022', fontWeight: '700' },
});
