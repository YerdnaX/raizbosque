import {
    View, Text, Pressable, ScrollView, TextInput,
    StyleSheet, ActivityIndicator, ImageBackground, Alert,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import AtrasIcono from '@/assets/icons/atras.svg';
import { useUsuario } from '../context/UsuarioContext';
import { useCarrito } from '../context/CarritoContext';
import { realizarCompra } from '../features/compras/services/compraService';

type MetodoEntrega = 'Tienda' | 'Domicilio';

export default function Checkout() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { items, total, limpiarCarrito } = useCarrito();

    const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('Tienda');
    const [telefono, setTelefono] = useState(usuario?.Telefono ?? '');
    const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true);
    const [nuevaDireccion, setNuevaDireccion] = useState('');
    const [estaProcesando, setEstaProcesando] = useState(false);

    const impuesto = Math.round(total * 0.13 * 100) / 100;
    const totalConIva = Math.round((total + impuesto) * 100) / 100;

    const telefonoYaRegistrado = !!(usuario?.Telefono);

    function obtenerDireccionEntrega(): string | undefined {
        if (metodoEntrega === 'Tienda') return undefined;
        if (usarDireccionGuardada && usuario?.Direccion) return usuario.Direccion;
        return nuevaDireccion.trim() || undefined;
    }

    async function confirmarCompra() {
        if (!usuario) return;

        if (!telefonoYaRegistrado && !telefono.trim()) {
            Alert.alert('Teléfono requerido', 'Por favor ingresa un número de teléfono.');
            return;
        }

        if (metodoEntrega === 'Domicilio') {
            const dir = obtenerDireccionEntrega();
            if (!dir) {
                Alert.alert('Dirección requerida', 'Por favor ingresa una dirección de entrega.');
                return;
            }
        }

        setEstaProcesando(true);
        try {
            await realizarCompra({
                idUsuario: usuario.IdUsuario,
                metodoEntrega,
                direccionEntrega: obtenerDireccionEntrega(),
            });

            limpiarCarrito();

            Alert.alert(
                '¡Compra confirmada!',
                metodoEntrega === 'Tienda'
                    ? 'Tu pedido estará listo para recoger en la tienda en 1 hora.'
                    : 'Tu pedido será enviado a la dirección indicada.',
                [{ text: 'Ir al inicio', onPress: () => router.replace('/(tabs)') }],
            );
        } catch {
            Alert.alert('Error', 'No se pudo procesar la compra. Intenta de nuevo.');
        } finally {
            setEstaProcesando(false);
        }
    }

    if (!usuario) return null;

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
                <Text style={estilos.encabezadoTitulo}>Checkout</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Datos de Facturación */}
                <View style={estilos.seccion}>
                    <View style={estilos.seccionEncabezado}>
                        <SymbolView name="person.fill" size={18} tintColor="#1b3022" />
                        <Text style={estilos.seccionTitulo}>Datos de Facturación</Text>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Nombre completo</Text>
                        <View style={[estilos.inputContenedor, estilos.inputDesactivado]}>
                            <Text style={estilos.inputTextoDesactivado}>
                                {usuario.Nombre} {usuario.Apellidos}
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Correo electrónico</Text>
                        <View style={[estilos.inputContenedor, estilos.inputDesactivado]}>
                            <Text style={estilos.inputTextoDesactivado}>{usuario.Correo}</Text>
                        </View>
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Teléfono</Text>
                        {telefonoYaRegistrado ? (
                            <View style={[estilos.inputContenedor, estilos.inputDesactivado]}>
                                <Text style={estilos.inputTextoDesactivado}>{usuario.Telefono}</Text>
                            </View>
                        ) : (
                            <TextInput
                                style={estilos.inputContenedor}
                                value={telefono}
                                onChangeText={setTelefono}
                                placeholder="Ej. 8888-8888"
                                placeholderTextColor="#b0b0a8"
                                keyboardType="phone-pad"
                            />
                        )}
                    </View>
                </View>

                {/* Método de Entrega */}
                <View style={estilos.seccion}>
                    <View style={estilos.seccionEncabezado}>
                        <SymbolView name="shippingbox.fill" size={18} tintColor="#1b3022" />
                        <Text style={estilos.seccionTitulo}>Método de Entrega</Text>
                    </View>

                    <Pressable
                        style={[estilos.opcionEntrega, metodoEntrega === 'Tienda' && estilos.opcionEntregaActiva]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => setMetodoEntrega('Tienda')}
                    >
                        <View style={estilos.opcionEntregaIzq}>
                            <SymbolView name="storefront.fill" size={22} tintColor={metodoEntrega === 'Tienda' ? '#1b3022' : '#737973'} />
                            <View>
                                <Text style={[estilos.opcionEntregaNombre, metodoEntrega === 'Tienda' && estilos.opcionEntregaNombreActivo]}>
                                    Recoger en Tienda
                                </Text>
                                <Text style={estilos.opcionEntregaDetalle}>Gratis · Disponible en 1 hora</Text>
                            </View>
                        </View>
                        <View style={[estilos.radio, metodoEntrega === 'Tienda' && estilos.radioActivo]}>
                            {metodoEntrega === 'Tienda' && <View style={estilos.radioPunto} />}
                        </View>
                    </Pressable>

                    <Pressable
                        style={[estilos.opcionEntrega, metodoEntrega === 'Domicilio' && estilos.opcionEntregaActiva]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => setMetodoEntrega('Domicilio')}
                    >
                        <View style={estilos.opcionEntregaIzq}>
                            <SymbolView name="truck.box.fill" size={22} tintColor={metodoEntrega === 'Domicilio' ? '#1b3022' : '#737973'} />
                            <View>
                                <Text style={[estilos.opcionEntregaNombre, metodoEntrega === 'Domicilio' && estilos.opcionEntregaNombreActivo]}>
                                    Entrega a Domicilio
                                </Text>
                                <Text style={estilos.opcionEntregaDetalle}>Envío calculado al confirmar</Text>
                            </View>
                        </View>
                        <View style={[estilos.radio, metodoEntrega === 'Domicilio' && estilos.radioActivo]}>
                            {metodoEntrega === 'Domicilio' && <View style={estilos.radioPunto} />}
                        </View>
                    </Pressable>

                    {metodoEntrega === 'Tienda' && (
                        <View style={estilos.infoTienda}>
                            <SymbolView name="clock.fill" size={16} tintColor="#526349" />
                            <Text style={estilos.infoTiendaTexto}>
                                Tu pedido estará listo para recoger en la tienda en 1 hora.
                            </Text>
                        </View>
                    )}

                    {metodoEntrega === 'Domicilio' && (
                        <View style={estilos.seccionDireccion}>
                            {usuario.Direccion ? (
                                <>
                                    <Pressable
                                        style={estilos.opcionDireccion}
                                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                        onPress={() => setUsarDireccionGuardada(true)}
                                    >
                                        <View style={[estilos.radio, usarDireccionGuardada && estilos.radioActivo]}>
                                            {usarDireccionGuardada && <View style={estilos.radioPunto} />}
                                        </View>
                                        <View style={estilos.opcionDireccionInfo}>
                                            <Text style={estilos.opcionDireccionTitulo}>Dirección registrada</Text>
                                            <Text style={estilos.opcionDireccionTexto}>{usuario.Direccion}</Text>
                                        </View>
                                    </Pressable>

                                    <Pressable
                                        style={estilos.opcionDireccion}
                                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                        onPress={() => setUsarDireccionGuardada(false)}
                                    >
                                        <View style={[estilos.radio, !usarDireccionGuardada && estilos.radioActivo]}>
                                            {!usarDireccionGuardada && <View style={estilos.radioPunto} />}
                                        </View>
                                        <Text style={estilos.opcionDireccionTitulo}>Otra dirección</Text>
                                    </Pressable>

                                    {!usarDireccionGuardada && (
                                        <TextInput
                                            style={[estilos.inputContenedor, { marginTop: 8 }]}
                                            value={nuevaDireccion}
                                            onChangeText={setNuevaDireccion}
                                            placeholder="Ingresa la dirección de entrega"
                                            placeholderTextColor="#b0b0a8"
                                            multiline
                                        />
                                    )}
                                </>
                            ) : (
                                <View style={estilos.campo}>
                                    <Text style={estilos.etiqueta}>Dirección de entrega</Text>
                                    <TextInput
                                        style={estilos.inputContenedor}
                                        value={nuevaDireccion}
                                        onChangeText={setNuevaDireccion}
                                        placeholder="Ingresa la dirección de entrega"
                                        placeholderTextColor="#b0b0a8"
                                        multiline
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Resumen del Pedido */}
                <View style={estilos.seccion}>
                    <View style={estilos.seccionEncabezado}>
                        <SymbolView name="list.bullet.rectangle.fill" size={18} tintColor="#1b3022" />
                        <Text style={estilos.seccionTitulo}>Resumen del Pedido</Text>
                    </View>

                    {items.map(item => (
                        <View key={item.IdDetalle} style={estilos.itemResumen}>
                            <View style={estilos.itemResumenInfo}>
                                <Text style={estilos.itemResumenNombre} numberOfLines={1}>{item.Nombre}</Text>
                                <Text style={estilos.itemResumenCant}>Cant: {item.Cantidad}</Text>
                            </View>
                            <Text style={estilos.itemResumenSubtotal}>
                                ₡{item.Subtotal.toLocaleString('es-CR')}
                            </Text>
                        </View>
                    ))}

                    <View style={estilos.separador} />

                    <View style={estilos.totalFila}>
                        <Text style={estilos.totalEtiqueta}>Subtotal</Text>
                        <Text style={estilos.totalValor}>₡{total.toLocaleString('es-CR')}</Text>
                    </View>
                    <View style={estilos.totalFila}>
                        <Text style={estilos.totalEtiqueta}>IVA (13%)</Text>
                        <Text style={estilos.totalValor}>₡{impuesto.toLocaleString('es-CR')}</Text>
                    </View>
                    <View style={[estilos.totalFila, estilos.totalFilaFinal]}>
                        <Text style={estilos.totalFinalEtiqueta}>Total</Text>
                        <Text style={estilos.totalFinalValor}>₡{totalConIva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={estilos.pie}>
                <View style={estilos.pieInfo}>
                    <Text style={estilos.pieTotalEtiqueta}>Total a pagar</Text>
                    <Text style={estilos.pieTotalValor}>₡{totalConIva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</Text>
                </View>
                <Pressable
                    style={[estilos.botonConfirmar, estaProcesando && estilos.botonConfirmarDesactivado]}
                    android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                    onPress={confirmarCompra}
                    disabled={estaProcesando}
                >
                    {estaProcesando
                        ? <ActivityIndicator color="#ffffff" />
                        : <Text style={estilos.botonConfirmarTexto}>CONFIRMAR PEDIDO</Text>
                    }
                </Pressable>
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#f0eee8',
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
    scroll: {
        padding: 16,
        gap: 16,
    },
    seccion: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        gap: 12,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    seccionEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    seccionTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1c18',
    },
    campo: {
        gap: 6,
    },
    etiqueta: {
        fontSize: 12,
        color: '#737973',
        fontWeight: '500',
    },
    inputContenedor: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1c1c18',
        backgroundColor: '#ffffff',
    },
    inputDesactivado: {
        backgroundColor: '#f5f3ef',
        borderColor: '#e0ddd8',
    },
    inputTextoDesactivado: {
        fontSize: 14,
        color: '#9ca09a',
    },
    opcionEntrega: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 10,
        padding: 12,
        gap: 12,
        overflow: 'hidden',
    },
    opcionEntregaActiva: {
        borderColor: '#1b3022',
        backgroundColor: '#f0f5ee',
    },
    opcionEntregaIzq: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    opcionEntregaNombre: {
        fontSize: 14,
        fontWeight: '600',
        color: '#737973',
    },
    opcionEntregaNombreActivo: {
        color: '#1b3022',
    },
    opcionEntregaDetalle: {
        fontSize: 12,
        color: '#9ca09a',
        marginTop: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#c3c8c1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActivo: {
        borderColor: '#1b3022',
    },
    radioPunto: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1b3022',
    },
    infoTienda: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#f0f5ee',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#1b3022',
    },
    infoTiendaTexto: {
        flex: 1,
        fontSize: 13,
        color: '#526349',
        lineHeight: 18,
    },
    seccionDireccion: {
        gap: 10,
    },
    opcionDireccion: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 6,
    },
    opcionDireccionInfo: {
        flex: 1,
        gap: 2,
    },
    opcionDireccionTitulo: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1c1c18',
    },
    opcionDireccionTexto: {
        fontSize: 12,
        color: '#737973',
        lineHeight: 17,
    },
    itemResumen: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    itemResumenInfo: {
        flex: 1,
        gap: 2,
    },
    itemResumenNombre: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1c1c18',
    },
    itemResumenCant: {
        fontSize: 12,
        color: '#737973',
    },
    itemResumenSubtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#526349',
    },
    separador: {
        height: 1,
        backgroundColor: '#e5e2dc',
        marginVertical: 4,
    },
    totalFila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalEtiqueta: {
        fontSize: 13,
        color: '#737973',
    },
    totalValor: {
        fontSize: 13,
        color: '#1c1c18',
        fontWeight: '500',
    },
    totalFilaFinal: {
        marginTop: 6,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
    },
    totalFinalEtiqueta: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1c18',
    },
    totalFinalValor: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1b3022',
    },
    pie: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
        paddingHorizontal: 20,
        paddingVertical: 14,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    pieInfo: {
        flex: 1,
        gap: 2,
    },
    pieTotalEtiqueta: {
        fontSize: 11,
        color: '#737973',
    },
    pieTotalValor: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1c18',
    },
    botonConfirmar: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden',
    },
    botonConfirmarDesactivado: {
        backgroundColor: '#8da082',
    },
    botonConfirmarTexto: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
