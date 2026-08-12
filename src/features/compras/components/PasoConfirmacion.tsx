import { View, Text, Pressable, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { COLORES } from '@/constants/colores';
import type { Usuario } from '../../auth/types/usuario';
import type { ItemCarrito } from '../../carrito/types/carritoItem';
import type { CuponAplicado, TipoCambioVenta } from '../services/compraService';
import type { ResumenPaso } from '../types/checkoutEstado';

function formatearMontoDolares(monto: number) {
    return monto.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

type Props = {
    usuario: Usuario;
    telefono: string;
    items: ItemCarrito[];
    entregaResumen: ResumenPaso;
    pagoResumen: ResumenPaso;
    onEditarEntrega: () => void;
    onEditarPago: () => void;
    codigoCupon: string;
    onCambiarCupon: (texto: string) => void;
    onAplicarCupon: () => void;
    estaValidandoCupon: boolean;
    mensajeCupon: string;
    errorCupon: string;
    cuponAplicado: CuponAplicado | null;
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    tipoCambioVenta: TipoCambioVenta | null;
    errorTipoCambio: string;
    totalDolares: number | null;
    error: string;
    estaProcesando: boolean;
    onConfirmar: () => void;
};

export function PasoConfirmacion({
    usuario,
    telefono,
    items,
    entregaResumen,
    pagoResumen,
    onEditarEntrega,
    onEditarPago,
    codigoCupon,
    onCambiarCupon,
    onAplicarCupon,
    estaValidandoCupon,
    mensajeCupon,
    errorCupon,
    cuponAplicado,
    subtotal,
    descuento,
    impuesto,
    total,
    tipoCambioVenta,
    errorTipoCambio,
    totalDolares,
    error,
    estaProcesando,
    onConfirmar,
}: Props) {
    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.pregunta}>Revisá tu pedido</Text>

            <View style={estilos.tarjeta}>
                <View style={estilos.filaEditable}>
                    <View style={{ flex: 1 }}>
                        <Text style={estilos.etiquetaTarjeta}>Entrega</Text>
                        <Text style={estilos.valorTarjeta}>{entregaResumen.titulo}</Text>
                        {!!entregaResumen.detalle && <Text style={estilos.detalleTarjeta}>{entregaResumen.detalle}</Text>}
                    </View>
                    <Pressable onPress={onEditarEntrega} hitSlop={8}>
                        <Text style={estilos.cambiar}>Cambiar</Text>
                    </Pressable>
                </View>

                <View style={estilos.separador} />

                <View style={estilos.filaEditable}>
                    <View style={{ flex: 1 }}>
                        <Text style={estilos.etiquetaTarjeta}>Pago</Text>
                        <Text style={estilos.valorTarjeta}>{pagoResumen.titulo}</Text>
                        {!!pagoResumen.detalle && <Text style={estilos.detalleTarjeta}>{pagoResumen.detalle}</Text>}
                    </View>
                    <Pressable onPress={onEditarPago} hitSlop={8}>
                        <Text style={estilos.cambiar}>Cambiar</Text>
                    </Pressable>
                </View>

                <View style={estilos.separador} />

                <View>
                    <Text style={estilos.etiquetaTarjeta}>Contacto</Text>
                    <Text style={estilos.detalleTarjeta}>{usuario.Nombre} {usuario.Apellidos}</Text>
                    <Text style={estilos.detalleTarjeta}>{usuario.Correo}</Text>
                    <Text style={estilos.detalleTarjeta}>{usuario.Telefono || telefono}</Text>
                </View>
            </View>

            <View style={estilos.tarjeta}>
                <View style={estilos.seccionEncabezado}>
                    <SymbolView name="ticket.fill" size={16} tintColor={COLORES.esmeraldaTinta} />
                    <Text style={estilos.seccionTitulo}>¿Tenés un cupón?</Text>
                </View>
                <View style={estilos.cuponFila}>
                    <TextInput
                        style={[estilos.inputContenedor, estilos.inputCupon]}
                        value={codigoCupon}
                        onChangeText={onCambiarCupon}
                        placeholder="Ej. RAICES10"
                        placeholderTextColor="#b0b0a8"
                        autoCapitalize="characters"
                    />
                    <Pressable
                        style={[estilos.botonCupon, estaValidandoCupon && estilos.botonCuponDesactivado]}
                        android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }}
                        onPress={onAplicarCupon}
                        disabled={estaValidandoCupon}
                    >
                        {estaValidandoCupon
                            ? <ActivityIndicator color="#ffffff" size="small" />
                            : <Text style={estilos.botonCuponTexto}>APLICAR</Text>}
                    </Pressable>
                </View>
                {!!mensajeCupon && (
                    <View style={estilos.mensajeCuponAplicado}>
                        <Text style={estilos.mensajeCuponAplicadoTexto}>{mensajeCupon}</Text>
                    </View>
                )}
                {!!errorCupon && (
                    <View style={estilos.mensajeCuponError}>
                        <Text style={estilos.mensajeCuponErrorTexto}>{errorCupon}</Text>
                    </View>
                )}
            </View>

            <View style={estilos.tarjeta}>
                <View style={estilos.seccionEncabezado}>
                    <SymbolView name="list.bullet.rectangle.fill" size={16} tintColor={COLORES.esmeraldaTinta} />
                    <Text style={estilos.seccionTitulo}>Tu pedido</Text>
                </View>

                {items.map((item) => (
                    <View key={item.IdDetalle} style={estilos.itemResumen}>
                        <View style={estilos.itemResumenInfo}>
                            <Text style={estilos.itemResumenNombre} numberOfLines={1}>{item.Nombre}</Text>
                            <Text style={estilos.itemResumenCant}>Cant: {item.Cantidad}</Text>
                        </View>
                        <Text style={estilos.itemResumenSubtotal}>₡{item.Subtotal.toLocaleString('es-CR')}</Text>
                    </View>
                ))}

                <View style={estilos.separador} />

                <View style={estilos.totalFila}>
                    <Text style={estilos.totalEtiqueta}>Subtotal</Text>
                    <Text style={estilos.totalValor}>₡{subtotal.toLocaleString('es-CR')}</Text>
                </View>
                {descuento > 0 && (
                    <View style={estilos.totalFila}>
                        <Text style={estilos.totalEtiqueta}>Descuento</Text>
                        <Text style={estilos.descuentoValor}>-₡{descuento.toLocaleString('es-CR')}</Text>
                    </View>
                )}
                {cuponAplicado && (
                    <Text style={estilos.cuponDetalle}>{cuponAplicado.codigo}: {cuponAplicado.descripcion}</Text>
                )}
                <View style={estilos.totalFila}>
                    <Text style={estilos.totalEtiqueta}>IVA (13%)</Text>
                    <Text style={estilos.totalValor}>₡{impuesto.toLocaleString('es-CR')}</Text>
                </View>
                <View style={[estilos.totalFila, estilos.totalFilaFinal]}>
                    <Text style={estilos.totalFinalEtiqueta}>Total</Text>
                    <Text style={estilos.totalFinalValor}>₡{total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={estilos.tipoCambioCaja}>
                    <View style={estilos.totalFila}>
                        <Text style={estilos.totalEtiqueta}>Tipo de cambio venta</Text>
                        <Text style={estilos.totalValor}>
                            {tipoCambioVenta ? `₡${tipoCambioVenta.valor.toLocaleString('es-CR', { minimumFractionDigits: 2 })}` : 'Cargando...'}
                        </Text>
                    </View>
                    {tipoCambioVenta ? (
                        <>
                            <Text style={estilos.tipoCambioFecha}>Fecha: {tipoCambioVenta.fecha}</Text>
                            <View style={estilos.totalFila}>
                                <Text style={estilos.totalEtiqueta}>Total en dólares</Text>
                                <Text style={estilos.totalValor}>{totalDolares !== null ? formatearMontoDolares(totalDolares) : '-'}</Text>
                            </View>
                        </>
                    ) : null}
                    {!!errorTipoCambio && <Text style={estilos.tipoCambioError}>{errorTipoCambio}</Text>}
                </View>
            </View>

            {!!error && (
                <View style={estilos.error}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                </View>
            )}

            <Pressable
                style={[estilos.botonConfirmar, estaProcesando && estilos.botonConfirmarDesactivado]}
                android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                onPress={onConfirmar}
                disabled={estaProcesando}
            >
                {estaProcesando
                    ? <ActivityIndicator color="#ffffff" />
                    : <Text style={estilos.botonConfirmarTexto}>Confirmar pedido</Text>}
            </Pressable>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { padding: 20, gap: 14 },
    pregunta: { fontSize: 18, fontWeight: '700', color: '#1c1c18', marginBottom: 2 },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        gap: 10,
        shadowColor: COLORES.esmeraldaTinta,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    filaEditable: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
    etiquetaTarjeta: { fontSize: 12, color: '#737973', fontWeight: '500' },
    valorTarjeta: { fontSize: 15, fontWeight: '700', color: '#1c1c18', marginTop: 2 },
    detalleTarjeta: { fontSize: 13, color: '#526349', marginTop: 2 },
    cambiar: { fontSize: 13, color: COLORES.esmeraldaTinta, fontWeight: '700' },
    separador: { height: 1, backgroundColor: '#e5e2dc' },
    seccionEncabezado: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    seccionTitulo: { fontSize: 14, fontWeight: '700', color: '#1c1c18' },
    cuponFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inputContenedor: {
        borderWidth: 1, borderColor: '#c3c8c1', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1c1c18', backgroundColor: '#ffffff',
    },
    inputCupon: { flex: 1 },
    botonCupon: {
        backgroundColor: COLORES.esmeraldaTinta, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11,
        minWidth: 92, alignItems: 'center', overflow: 'hidden',
    },
    botonCuponDesactivado: { backgroundColor: '#8da082' },
    botonCuponTexto: { color: '#ffffff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
    mensajeCuponAplicado: {
        backgroundColor: '#f0f5ee', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: COLORES.esmeraldaTinta,
    },
    mensajeCuponAplicadoTexto: { fontSize: 12, color: '#526349', fontWeight: '600' },
    mensajeCuponError: { backgroundColor: '#ffdad6', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: '#ba1a1a' },
    mensajeCuponErrorTexto: { fontSize: 12, color: '#93000a', fontWeight: '600' },
    itemResumen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    itemResumenInfo: { flex: 1, gap: 2 },
    itemResumenNombre: { fontSize: 13, fontWeight: '600', color: '#1c1c18' },
    itemResumenCant: { fontSize: 12, color: '#737973' },
    itemResumenSubtotal: { fontSize: 14, fontWeight: '600', color: '#526349' },
    totalFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalEtiqueta: { fontSize: 13, color: '#737973' },
    totalValor: { fontSize: 13, color: '#1c1c18', fontWeight: '500' },
    descuentoValor: { fontSize: 13, color: '#526349', fontWeight: '700' },
    cuponDetalle: { fontSize: 12, color: '#526349', textAlign: 'right' },
    totalFilaFinal: { marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e2dc' },
    totalFinalEtiqueta: { fontSize: 15, fontWeight: '700', color: '#1c1c18' },
    totalFinalValor: { fontSize: 18, fontWeight: '700', color: COLORES.esmeraldaTinta },
    tipoCambioCaja: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e2dc', gap: 6 },
    tipoCambioFecha: { fontSize: 11, color: '#737973', textAlign: 'right' },
    tipoCambioError: { fontSize: 12, color: '#ba1a1a', textAlign: 'right' },
    error: { backgroundColor: '#ffdad6', borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: '#ba1a1a' },
    errorTexto: { fontSize: 13, color: '#93000a', fontWeight: '600' },
    botonConfirmar: {
        backgroundColor: COLORES.esmeraldaTinta, borderRadius: 8, paddingVertical: 14,
        alignItems: 'center', overflow: 'hidden',
    },
    botonConfirmarDesactivado: { backgroundColor: '#8da082' },
    botonConfirmarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
