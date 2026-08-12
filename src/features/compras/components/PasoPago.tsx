import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { COLORES } from '@/constants/colores';
import VisaLogo from '@/assets/images/checkout/logo-payment-visa.svg';
import MastercardLogo from '@/assets/images/checkout/logo-payment-mastercard.svg';
import type { MarcaTarjeta, MetodoPago } from '../types/checkoutEstado';

type Props = {
    metodoPago: MetodoPago;
    onCambiarMetodoPago: (metodo: MetodoPago) => void;
    numeroTarjeta: string;
    onCambiarNumeroTarjeta: (valor: string) => void;
    nombreTarjeta: string;
    onCambiarNombreTarjeta: (valor: string) => void;
    fechaVencimiento: string;
    onCambiarFechaVencimiento: (valor: string) => void;
    cvv: string;
    onCambiarCvv: (valor: string) => void;
    marcaTarjeta: MarcaTarjeta;
    telefonoSinpe: string;
    onCambiarTelefonoSinpe: (valor: string) => void;
    error: string;
    onVolver: () => void;
    onContinuar: () => void;
};

export function PasoPago({
    metodoPago,
    onCambiarMetodoPago,
    numeroTarjeta,
    onCambiarNumeroTarjeta,
    nombreTarjeta,
    onCambiarNombreTarjeta,
    fechaVencimiento,
    onCambiarFechaVencimiento,
    cvv,
    onCambiarCvv,
    marcaTarjeta,
    telefonoSinpe,
    onCambiarTelefonoSinpe,
    error,
    onVolver,
    onContinuar,
}: Props) {
    const LogoTarjeta = marcaTarjeta === 'Visa' ? VisaLogo : marcaTarjeta === 'Mastercard' ? MastercardLogo : null;

    return (
        <View style={estilos.contenedor}>
            <Pressable onPress={onVolver} hitSlop={8} style={estilos.volver}>
                <SymbolView name="chevron.left" size={14} tintColor="#737973" />
                <Text style={estilos.volverTexto}>Entrega</Text>
            </Pressable>

            <Text style={estilos.pregunta}>¿Cómo querés pagar?</Text>

            <Pressable
                style={[estilos.opcion, metodoPago === 'SINPE' && estilos.opcionActiva]}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={() => onCambiarMetodoPago('SINPE')}
            >
                <View style={estilos.opcionIzq}>
                    <SymbolView name="iphone" size={22} tintColor={metodoPago === 'SINPE' ? COLORES.esmeraldaTinta : '#737973'} />
                    <View>
                        <Text style={[estilos.opcionNombre, metodoPago === 'SINPE' && estilos.opcionNombreActivo]}>SINPE Móvil</Text>
                        <Text style={estilos.opcionDetalle}>Transferencia desde tu número</Text>
                    </View>
                </View>
                <View style={[estilos.radio, metodoPago === 'SINPE' && estilos.radioActivo]}>
                    {metodoPago === 'SINPE' && <View style={estilos.radioPunto} />}
                </View>
            </Pressable>

            {metodoPago === 'SINPE' && (
                <View style={estilos.formulario}>
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Teléfono SINPE</Text>
                        <TextInput
                            style={estilos.inputContenedor}
                            value={telefonoSinpe}
                            onChangeText={onCambiarTelefonoSinpe}
                            placeholder="8888-8888"
                            placeholderTextColor="#b0b0a8"
                            keyboardType="phone-pad"
                            maxLength={9}
                        />
                    </View>
                </View>
            )}

            <Pressable
                style={[estilos.opcion, metodoPago === 'Tarjeta' && estilos.opcionActiva]}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={() => onCambiarMetodoPago('Tarjeta')}
            >
                <View style={estilos.opcionIzq}>
                    <SymbolView name="creditcard.fill" size={22} tintColor={metodoPago === 'Tarjeta' ? COLORES.esmeraldaTinta : '#737973'} />
                    <View>
                        <Text style={[estilos.opcionNombre, metodoPago === 'Tarjeta' && estilos.opcionNombreActivo]}>Tarjeta</Text>
                        <Text style={estilos.opcionDetalle}>Visa o Mastercard</Text>
                    </View>
                </View>
                <View style={[estilos.radio, metodoPago === 'Tarjeta' && estilos.radioActivo]}>
                    {metodoPago === 'Tarjeta' && <View style={estilos.radioPunto} />}
                </View>
            </Pressable>

            {metodoPago === 'Tarjeta' && (
                <View style={estilos.formulario}>
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Número de tarjeta</Text>
                        <View style={estilos.inputTarjetaFila}>
                            <TextInput
                                style={estilos.inputTarjeta}
                                value={numeroTarjeta}
                                onChangeText={onCambiarNumeroTarjeta}
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor="#b0b0a8"
                                keyboardType="number-pad"
                            />
                            {LogoTarjeta && <LogoTarjeta width={42} height={28} />}
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Nombre de quien es dueño de la tarjeta</Text>
                        <TextInput
                            style={estilos.inputContenedor}
                            value={nombreTarjeta}
                            onChangeText={onCambiarNombreTarjeta}
                            placeholder="Nombre y apellidos"
                            placeholderTextColor="#b0b0a8"
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={estilos.filaPago}>
                        <View style={[estilos.campo, estilos.campoMitad]}>
                            <Text style={estilos.etiqueta}>Vencimiento</Text>
                            <TextInput
                                style={estilos.inputContenedor}
                                value={fechaVencimiento}
                                onChangeText={onCambiarFechaVencimiento}
                                placeholder="MM/AA"
                                placeholderTextColor="#b0b0a8"
                                keyboardType="number-pad"
                                maxLength={5}
                            />
                        </View>

                        <View style={[estilos.campo, estilos.campoMitad]}>
                            <Text style={estilos.etiqueta}>CVV</Text>
                            <TextInput
                                style={estilos.inputContenedor}
                                value={cvv}
                                onChangeText={onCambiarCvv}
                                placeholder="123"
                                placeholderTextColor="#b0b0a8"
                                keyboardType="number-pad"
                                maxLength={3}
                            />
                        </View>
                    </View>
                </View>
            )}

            <Pressable
                style={[estilos.opcion, metodoPago === 'PayPal' && estilos.opcionActiva]}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={() => onCambiarMetodoPago('PayPal')}
            >
                <View style={estilos.opcionIzq}>
                    <SymbolView name="globe" size={22} tintColor={metodoPago === 'PayPal' ? COLORES.esmeraldaTinta : '#737973'} />
                    <View>
                        <Text style={[estilos.opcionNombre, metodoPago === 'PayPal' && estilos.opcionNombreActivo]}>PayPal</Text>
                        <Text style={estilos.opcionDetalle}>Vas a salir a PayPal para pagar</Text>
                    </View>
                </View>
                <View style={[estilos.radio, metodoPago === 'PayPal' && estilos.radioActivo]}>
                    {metodoPago === 'PayPal' && <View style={estilos.radioPunto} />}
                </View>
            </Pressable>

            {!!error && (
                <View style={estilos.error}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                </View>
            )}

            <Pressable
                style={estilos.botonContinuar}
                android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                onPress={onContinuar}
            >
                <Text style={estilos.botonContinuarTexto}>Revisar pedido</Text>
            </Pressable>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { padding: 20, gap: 14 },
    volver: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: -4 },
    volverTexto: { fontSize: 13, color: '#737973', fontWeight: '600' },
    pregunta: { fontSize: 18, fontWeight: '700', color: '#1c1c18', marginBottom: 2 },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 12,
        padding: 14,
        gap: 12,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    opcionActiva: {
        borderColor: COLORES.esmeraldaTinta,
        backgroundColor: '#f0f5ee',
    },
    opcionIzq: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    opcionNombre: { fontSize: 15, fontWeight: '600', color: '#737973' },
    opcionNombreActivo: { color: COLORES.esmeraldaTinta },
    opcionDetalle: { fontSize: 12, color: '#9ca09a', marginTop: 2 },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: '#c3c8c1', justifyContent: 'center', alignItems: 'center',
    },
    radioActivo: { borderColor: COLORES.esmeraldaTinta },
    radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORES.esmeraldaTinta },
    formulario: {
        gap: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e2dc',
        padding: 14,
        marginTop: -6,
    },
    campo: { gap: 6 },
    etiqueta: { fontSize: 12, color: '#737973', fontWeight: '500' },
    inputContenedor: {
        borderWidth: 1, borderColor: '#c3c8c1', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1c1c18', backgroundColor: '#ffffff',
    },
    inputTarjetaFila: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#c3c8c1',
        borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#ffffff', gap: 8,
    },
    inputTarjeta: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#1c1c18' },
    filaPago: { flexDirection: 'row', gap: 10 },
    campoMitad: { flex: 1 },
    error: {
        backgroundColor: '#ffdad6',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ba1a1a',
    },
    errorTexto: { fontSize: 13, color: '#93000a', fontWeight: '600' },
    botonContinuar: {
        backgroundColor: COLORES.esmeraldaTinta,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
        overflow: 'hidden',
    },
    botonContinuarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
