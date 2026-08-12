import { View, Text, StyleSheet } from 'react-native';
import { COLORES } from '@/constants/colores';
import type { PasoCheckout } from '../types/checkoutEstado';

const PASOS: { clave: PasoCheckout; titulo: string }[] = [
    { clave: 'entrega', titulo: 'Entrega' },
    { clave: 'pago', titulo: 'Pago' },
    { clave: 'confirmacion', titulo: 'Confirmación' },
];

type Props = {
    pasoActual: PasoCheckout;
};

export function CheckoutProgress({ pasoActual }: Props) {
    const indiceActual = PASOS.findIndex((paso) => paso.clave === pasoActual);

    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.pasoTexto}>
                Paso {indiceActual + 1} de {PASOS.length} · {PASOS[indiceActual].titulo}
            </Text>
            <View style={estilos.linea}>
                {PASOS.map((paso, indice) => (
                    <View key={paso.clave} style={estilos.segmento}>
                        <View style={[estilos.punto, indice <= indiceActual && estilos.puntoActivo]} />
                        {indice < PASOS.length - 1 && (
                            <View style={[estilos.trazo, indice < indiceActual && estilos.trazoActivo]} />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 10,
        gap: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e2dc',
    },
    pasoTexto: {
        fontSize: 12,
        fontWeight: '600',
        color: '#737973',
    },
    linea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    segmento: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    punto: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#c3c8c1',
    },
    puntoActivo: {
        backgroundColor: COLORES.esmeraldaTinta,
    },
    trazo: {
        flex: 1,
        height: 2,
        backgroundColor: '#c3c8c1',
        marginHorizontal: 6,
    },
    trazoActivo: {
        backgroundColor: COLORES.esmeraldaTinta,
    },
});
