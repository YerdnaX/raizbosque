import {
    View, Text, Pressable, ScrollView, TextInput,
    StyleSheet, ActivityIndicator, ImageBackground, Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { useUsuario } from '../context/UsuarioContext';
import { useCarrito } from '../context/CarritoContext';
import {
    capturarPagoPaypal,
    crearOrdenPaypal,
    obtenerResumenCompra,
    obtenerTipoCambioVenta,
    realizarCompra,
    type MetodoPagoCompra,
    type ResumenCompra,
    type TipoCambioVenta,
} from '../features/compras/services/compraService';
import SelectorUbicacion from '../features/ubicaciones/components/SelectorUbicacion';
import VisaLogo from '@/assets/images/checkout/logo-payment-visa.svg';
import MastercardLogo from '@/assets/images/checkout/logo-payment-mastercard.svg';

const PAYPAL_URL_RETORNO = 'raizbosque://paypal-retorno';

type MetodoEntrega = 'Tienda' | 'Domicilio';
type MetodoPago = 'Tarjeta' | 'SINPE' | 'PayPal' | null;
type MarcaTarjeta = 'Visa' | 'Mastercard' | null;

type SeleccionUbicacion = {
    idsSeleccionados: number[];
    completo: boolean;
};

type ErrorApi = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

function obtenerMensajeError(error: unknown, mensajePorDefecto: string) {
    if (typeof error === 'object' && error !== null) {
        const errorApi = error as ErrorApi;
        return errorApi.response?.data?.message ?? mensajePorDefecto;
    }
    return mensajePorDefecto;
}

function obtenerSoloDigitos(texto: string) {
    return texto.replace(/\D/g, '');
}

function formatearNumeroTarjeta(texto: string) {
    return obtenerSoloDigitos(texto)
        .slice(0, 19)
        .replace(/(.{4})/g, '$1 ')
        .trim();
}

function formatearFechaVencimiento(texto: string) {
    const digitos = obtenerSoloDigitos(texto).slice(0, 4);
    if (digitos.length <= 2) return digitos;
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function formatearTelefonoSinpe(texto: string) {
    const digitos = obtenerSoloDigitos(texto).slice(0, 8);
    if (digitos.length <= 4) return digitos;
    return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
}

function detectarMarcaTarjeta(numeroTarjeta: string): MarcaTarjeta {
    const numero = obtenerSoloDigitos(numeroTarjeta);
    if (numero.startsWith('4')) return 'Visa';

    const dosDigitos = Number(numero.slice(0, 2));
    const cuatroDigitos = Number(numero.slice(0, 4));
    if ((dosDigitos >= 51 && dosDigitos <= 55) || (cuatroDigitos >= 2221 && cuatroDigitos <= 2720)) {
        return 'Mastercard';
    }

    return null;
}

function validarLuhn(numeroTarjeta: string) {
    const numero = obtenerSoloDigitos(numeroTarjeta);
    let suma = 0;
    let duplicar = false;

    for (let i = numero.length - 1; i >= 0; i -= 1) {
        let digito = Number(numero[i]);
        if (duplicar) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
        duplicar = !duplicar;
    }

    return suma > 0 && suma % 10 === 0;
}

function validarFechaVencimiento(fechaVencimiento: string) {
    const partes = fechaVencimiento.split('/');
    if (partes.length !== 2 || partes[0].length !== 2 || partes[1].length !== 2) return false;

    const mes = Number(partes[0]);
    const anio = Number(`20${partes[1]}`);
    if (mes < 1 || mes > 12) return false;

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    return anio > anioActual || (anio === anioActual && mes >= mesActual);
}

function enmascararUltimosCuatro(valor: string, mascara: string) {
    const digitos = obtenerSoloDigitos(valor);
    return `${mascara}${digitos.slice(-4)}`;
}

function formatearMontoDolares(monto: number) {
    return monto.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
}

function obtenerParametroUrl(url: string, nombre: string) {
    const coincidencia = url.match(new RegExp(`[?&]${nombre}=([^&]+)`));
    return coincidencia ? decodeURIComponent(coincidencia[1]) : null;
}

export default function Checkout() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { items, total, limpiarCarrito } = useCarrito();

    const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('Tienda');
    const [telefono, setTelefono] = useState(usuario?.Telefono ?? '');
    const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true);
    const [ubicacionSeleccion, setUbicacionSeleccion] = useState<SeleccionUbicacion>({
        idsSeleccionados: [],
        completo: false,
    });
    const [direccionExacta, setDireccionExacta] = useState('');
    const [estaProcesando, setEstaProcesando] = useState(false);
    const [codigoCupon, setCodigoCupon] = useState('');
    const [resumenCompra, setResumenCompra] = useState<ResumenCompra | null>(null);
    const [mensajeCupon, setMensajeCupon] = useState('');
    const [errorCupon, setErrorCupon] = useState('');
    const [estaValidandoCupon, setEstaValidandoCupon] = useState(false);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [nombreTarjeta, setNombreTarjeta] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [cvv, setCvv] = useState('');
    const [telefonoSinpe, setTelefonoSinpe] = useState('');
    const [tipoCambioVenta, setTipoCambioVenta] = useState<TipoCambioVenta | null>(null);
    const [errorTipoCambio, setErrorTipoCambio] = useState('');

    const impuesto = Math.round(total * 0.13 * 100) / 100;
    const totalConIva = Math.round((total + impuesto) * 100) / 100;
    const subtotalMostrado = resumenCompra?.subtotal ?? total;
    const descuentoMostrado = resumenCompra?.descuento ?? 0;
    const impuestoMostrado = resumenCompra?.impuesto ?? impuesto;
    const totalMostrado = resumenCompra?.total ?? totalConIva;
    const totalDolares = tipoCambioVenta
        ? Math.round((totalMostrado / tipoCambioVenta.valor) * 100) / 100
        : null;

    const telefonoYaRegistrado = !!(usuario?.Telefono);
    const marcaTarjeta = detectarMarcaTarjeta(numeroTarjeta);
    const LogoTarjeta = marcaTarjeta === 'Visa' ? VisaLogo : marcaTarjeta === 'Mastercard' ? MastercardLogo : null;

    useEffect(() => {
        let activo = true;

        async function cargarTipoCambio() {
            try {
                const tipoCambio = await obtenerTipoCambioVenta();
                if (!activo) return;
                setTipoCambioVenta(tipoCambio);
                setErrorTipoCambio('');
            } catch (error) {
                if (!activo) return;
                setTipoCambioVenta(null);
                setErrorTipoCambio('No se pudo cargar el tipo de cambio.');
            }
        }

        cargarTipoCambio();

        return () => {
            activo = false;
        };
    }, []);

    function construirDatosDireccion() {
        if (metodoEntrega === 'Tienda') return {};
        if (usarDireccionGuardada && usuario?.Direccion) {
            return { direccionEntrega: usuario.Direccion };
        }
        if (ubicacionSeleccion.completo && direccionExacta.trim()) {
            return {
                ubicacion: {
                    idsSeleccionados: ubicacionSeleccion.idsSeleccionados,
                    direccionExacta: direccionExacta.trim(),
                },
            };
        }
        return null;
    }

    function manejarCambioCupon(texto: string) {
        setCodigoCupon(texto.toUpperCase());
        setResumenCompra(null);
        setMensajeCupon('');
        setErrorCupon('');
    }

    async function aplicarCupon() {
        if (!usuario) return;

        const codigo = codigoCupon.trim();
        if (!codigo) {
            setResumenCompra(null);
            setMensajeCupon('');
            setErrorCupon('Ingresa un codigo de cupon.');
            return;
        }

        setEstaValidandoCupon(true);
        setMensajeCupon('');
        setErrorCupon('');

        try {
            const resumen = await obtenerResumenCompra(usuario.IdUsuario, codigo);
            setResumenCompra(resumen);
            if (resumen.cupon) {
                setCodigoCupon(resumen.cupon.codigo);
                setMensajeCupon(`Cupon aplicado. Rebaja de ₡${resumen.descuento.toLocaleString('es-CR')}.`);
            }
        } catch (error) {
            setResumenCompra(null);
            setErrorCupon(obtenerMensajeError(error, 'No se pudo validar el cupon.'));
        } finally {
            setEstaValidandoCupon(false);
        }
    }

    function validarPagoSeleccionado() {
        if (!metodoPago) {
            Alert.alert('Metodo de pago requerido', 'Selecciona un metodo de pago para continuar.');
            return false;
        }

        if (metodoPago === 'PayPal') {
            return true;
        }

        if (metodoPago === 'SINPE') {
            if (obtenerSoloDigitos(telefonoSinpe).length !== 8) {
                Alert.alert('SINPE no valido', 'Ingresa un numero SINPE de 8 digitos.');
                return false;
            }
            return true;
        }

        const numeroLimpio = obtenerSoloDigitos(numeroTarjeta);
        const nombreLimpio = nombreTarjeta.trim();
        const palabrasNombre = nombreLimpio.split(/\s+/).filter(Boolean);

        if (!numeroLimpio || !nombreLimpio || !fechaVencimiento.trim() || !cvv.trim()) {
            Alert.alert('Pago incompleto', 'Completa la informacion de la tarjeta.');
            return false;
        }

        if (!marcaTarjeta) {
            Alert.alert('Tarjeta no valida', 'Ingresa una tarjeta Visa o Mastercard valida.');
            return false;
        }

        const longitudValida = marcaTarjeta === 'Visa'
            ? [13, 16, 19].includes(numeroLimpio.length)
            : numeroLimpio.length === 16;

        if (!longitudValida || !validarLuhn(numeroLimpio)) {
            Alert.alert('Tarjeta no valida', 'Ingresa una tarjeta Visa o Mastercard valida.');
            return false;
        }

        if (palabrasNombre.length < 2) {
            Alert.alert('Nombre requerido', 'Ingresa el nombre completo del dueno de la tarjeta.');
            return false;
        }

        if (!validarFechaVencimiento(fechaVencimiento)) {
            Alert.alert('Fecha no valida', 'Ingresa una fecha de vencimiento valida.');
            return false;
        }

        if (obtenerSoloDigitos(cvv).length !== 3) {
            Alert.alert('CVV no valido', 'Ingresa el CVV de 3 digitos.');
            return false;
        }

        return true;
    }

    function construirMetodoPago(): MetodoPagoCompra | null {
        if (metodoPago === 'Tarjeta') {
            return {
                tarjeta: {
                    tarjeta: {
                        identificador: obtenerSoloDigitos(numeroTarjeta),
                        cvv: obtenerSoloDigitos(cvv),
                        fechaVencimiento,
                    },
                    propietario: {
                        nombre: nombreTarjeta.trim(),
                    },
                },
            };
        }

        if (metodoPago === 'SINPE') {
            return {
                sinpe: {
                    telefono: obtenerSoloDigitos(telefonoSinpe),
                },
            };
        }

        return null;
    }

    async function confirmarCompraPaypal(datosDireccion: ReturnType<typeof construirDatosDireccion>) {
        if (!usuario) return;

        try {
            const orden = await crearOrdenPaypal(usuario.IdUsuario, resumenCompra?.cupon?.codigo);

            const resultadoAuth = await WebBrowser.openAuthSessionAsync(orden.approveUrl, PAYPAL_URL_RETORNO);

            if (resultadoAuth.type !== 'success') {
                Alert.alert('Pago cancelado', 'No se completo el pago con PayPal.');
                return;
            }

            const payerId = obtenerParametroUrl(resultadoAuth.url, 'PayerID');
            if (!payerId) {
                Alert.alert('Pago cancelado', 'No se completo el pago con PayPal.');
                return;
            }

            const resultado = await capturarPagoPaypal({
                idUsuario: usuario.IdUsuario,
                metodoEntrega,
                codigoCupon: resumenCompra?.cupon?.codigo,
                orderId: orden.orderId,
                ...datosDireccion,
            });

            limpiarCarrito();

            router.replace({
                pathname: './compra-confirmada',
                params: {
                    metodoEntrega,
                    numeroOrden: resultado.numeroOrden.toString(),
                    trackingNumber: resultado.trackingNumber ?? '',
                    direccionEntrega: resultado.direccionEntrega ?? '',
                    metodoPago: 'PayPal',
                    detallePago: usuario.Correo,
                },
            });
        } catch (error) {
            Alert.alert('Error', obtenerMensajeError(error, 'No se pudo procesar el pago con PayPal.'));
        }
    }

    async function confirmarCompraBanco(datosDireccion: ReturnType<typeof construirDatosDireccion>) {
        if (!usuario) return;

        const datosPago = construirMetodoPago();
        if (!datosPago) {
            Alert.alert('Metodo de pago requerido', 'Selecciona un metodo de pago para continuar.');
            return;
        }

        try {
            const resultado = await realizarCompra({
                idUsuario: usuario.IdUsuario,
                metodoEntrega,
                codigoCupon: resumenCompra?.cupon?.codigo,
                metodoPago: datosPago,
                ...datosDireccion,
            });

            limpiarCarrito();
            const metodoPagoConfirmacion = metodoPago === 'Tarjeta' ? 'Tarjeta' : 'SINPE';
            const detallePagoConfirmacion = metodoPago === 'Tarjeta'
                ? enmascararUltimosCuatro(numeroTarjeta, '************')
                : enmascararUltimosCuatro(telefonoSinpe, '****');

            router.replace({
                pathname: './compra-confirmada',
                params: {
                    metodoEntrega,
                    numeroOrden: resultado.numeroOrden.toString(),
                    trackingNumber: resultado.trackingNumber ?? '',
                    direccionEntrega: resultado.direccionEntrega ?? '',
                    metodoPago: metodoPagoConfirmacion,
                    detallePago: detallePagoConfirmacion,
                },
            });
        } catch (error) {
            Alert.alert('Error', obtenerMensajeError(error, 'No se pudo procesar la compra. Intenta de nuevo.'));
        }
    }

    async function confirmarCompra() {
        if (!usuario) return;

        if (!telefonoYaRegistrado && !telefono.trim()) {
            Alert.alert('Teléfono requerido', 'Por favor ingresa un número de teléfono.');
            return;
        }

        const datosDireccion = construirDatosDireccion();
        if (metodoEntrega === 'Domicilio' && !datosDireccion) {
            Alert.alert('Dirección requerida', 'Por favor completa la ubicación y la dirección exacta.');
            return;
        }

        if (codigoCupon.trim() && !resumenCompra?.cupon) {
            Alert.alert('Cupon pendiente', 'Presiona APLICAR para validar el cupon antes de confirmar.');
            return;
        }

        if (!validarPagoSeleccionado()) {
            return;
        }

        setEstaProcesando(true);
        try {
            if (metodoPago === 'PayPal') {
                await confirmarCompraPaypal(datosDireccion);
            } else {
                await confirmarCompraBanco(datosDireccion);
            }
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
                <Pressable style={estilos.botonAtras} android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <Text style={estilos.botonAtrasTexto}>‹</Text>
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
                                        <View style={{ marginTop: 8, gap: 10 }}>
                                            <SelectorUbicacion onCambio={setUbicacionSeleccion} />
                                            {ubicacionSeleccion.completo && (
                                                <View style={estilos.campo}>
                                                    <Text style={estilos.etiqueta}>Dirección exacta</Text>
                                                    <TextInput
                                                        style={estilos.inputContenedor}
                                                        value={direccionExacta}
                                                        onChangeText={setDireccionExacta}
                                                        placeholder="Ej. 200 metros norte de la iglesia"
                                                        placeholderTextColor="#b0b0a8"
                                                        multiline
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={{ gap: 10 }}>
                                    <SelectorUbicacion onCambio={setUbicacionSeleccion} />
                                    {ubicacionSeleccion.completo && (
                                        <View style={estilos.campo}>
                                            <Text style={estilos.etiqueta}>Dirección exacta</Text>
                                            <TextInput
                                                style={estilos.inputContenedor}
                                                value={direccionExacta}
                                                onChangeText={setDireccionExacta}
                                                placeholder="Ej. 200 metros norte de la iglesia"
                                                placeholderTextColor="#b0b0a8"
                                                multiline
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Metodo de Pago */}
                <View style={estilos.seccion}>
                    <View style={estilos.seccionEncabezado}>
                        <SymbolView name="creditcard.fill" size={18} tintColor="#1b3022" />
                        <Text style={estilos.seccionTitulo}>Metodo de pago</Text>
                    </View>

                    <Pressable
                        style={[estilos.opcionEntrega, metodoPago === 'Tarjeta' && estilos.opcionEntregaActiva]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => setMetodoPago('Tarjeta')}
                    >
                        <View style={estilos.opcionEntregaIzq}>
                            <SymbolView name="creditcard.fill" size={22} tintColor={metodoPago === 'Tarjeta' ? '#1b3022' : '#737973'} />
                            <View>
                                <Text style={[estilos.opcionEntregaNombre, metodoPago === 'Tarjeta' && estilos.opcionEntregaNombreActivo]}>
                                    Pago con tarjeta
                                </Text>
                                <Text style={estilos.opcionEntregaDetalle}>Visa o Mastercard</Text>
                            </View>
                        </View>
                        <View style={[estilos.radio, metodoPago === 'Tarjeta' && estilos.radioActivo]}>
                            {metodoPago === 'Tarjeta' && <View style={estilos.radioPunto} />}
                        </View>
                    </Pressable>

                    {metodoPago === 'Tarjeta' && (
                        <View style={estilos.formularioPago}>
                            <View style={estilos.campo}>
                                <Text style={estilos.etiqueta}>Numero de tarjeta</Text>
                                <View style={estilos.inputTarjetaFila}>
                                    <TextInput
                                        style={estilos.inputTarjeta}
                                        value={numeroTarjeta}
                                        onChangeText={(texto) => setNumeroTarjeta(formatearNumeroTarjeta(texto))}
                                        placeholder="0000 0000 0000 0000"
                                        placeholderTextColor="#b0b0a8"
                                        keyboardType="number-pad"
                                    />
                                    {LogoTarjeta && <LogoTarjeta width={42} height={28} />}
                                </View>
                            </View>

                            <View style={estilos.campo}>
                                <Text style={estilos.etiqueta}>Nombre completo del dueno</Text>
                                <TextInput
                                    style={estilos.inputContenedor}
                                    value={nombreTarjeta}
                                    onChangeText={setNombreTarjeta}
                                    placeholder="Nombre y apellidos"
                                    placeholderTextColor="#b0b0a8"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={estilos.filaPago}>
                                <View style={[estilos.campo, estilos.campoPagoMitad]}>
                                    <Text style={estilos.etiqueta}>Vencimiento</Text>
                                    <TextInput
                                        style={estilos.inputContenedor}
                                        value={fechaVencimiento}
                                        onChangeText={(texto) => setFechaVencimiento(formatearFechaVencimiento(texto))}
                                        placeholder="MM/AA"
                                        placeholderTextColor="#b0b0a8"
                                        keyboardType="number-pad"
                                        maxLength={5}
                                    />
                                </View>

                                <View style={[estilos.campo, estilos.campoPagoMitad]}>
                                    <Text style={estilos.etiqueta}>CVV</Text>
                                    <TextInput
                                        style={estilos.inputContenedor}
                                        value={cvv}
                                        onChangeText={(texto) => setCvv(obtenerSoloDigitos(texto).slice(0, 3))}
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
                        style={[estilos.opcionEntrega, metodoPago === 'SINPE' && estilos.opcionEntregaActiva]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => setMetodoPago('SINPE')}
                    >
                        <View style={estilos.opcionEntregaIzq}>
                            <SymbolView name="iphone" size={22} tintColor={metodoPago === 'SINPE' ? '#1b3022' : '#737973'} />
                            <View>
                                <Text style={[estilos.opcionEntregaNombre, metodoPago === 'SINPE' && estilos.opcionEntregaNombreActivo]}>
                                    Pago con SINPE
                                </Text>
                                <Text style={estilos.opcionEntregaDetalle}>Numero de telefono</Text>
                            </View>
                        </View>
                        <View style={[estilos.radio, metodoPago === 'SINPE' && estilos.radioActivo]}>
                            {metodoPago === 'SINPE' && <View style={estilos.radioPunto} />}
                        </View>
                    </Pressable>

                    {metodoPago === 'SINPE' && (
                        <View style={estilos.formularioPago}>
                            <View style={estilos.campo}>
                                <Text style={estilos.etiqueta}>Telefono SINPE</Text>
                                <TextInput
                                    style={estilos.inputContenedor}
                                    value={telefonoSinpe}
                                    onChangeText={(texto) => setTelefonoSinpe(formatearTelefonoSinpe(texto))}
                                    placeholder="8888-8888"
                                    placeholderTextColor="#b0b0a8"
                                    keyboardType="phone-pad"
                                    maxLength={9}
                                />
                            </View>
                        </View>
                    )}

                    <Pressable
                        style={[estilos.opcionEntrega, metodoPago === 'PayPal' && estilos.opcionEntregaActiva]}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => setMetodoPago('PayPal')}
                    >
                        <View style={estilos.opcionEntregaIzq}>
                            <SymbolView name="globe" size={22} tintColor={metodoPago === 'PayPal' ? '#1b3022' : '#737973'} />
                            <View>
                                <Text style={[estilos.opcionEntregaNombre, metodoPago === 'PayPal' && estilos.opcionEntregaNombreActivo]}>
                                    Pago con PayPal
                                </Text>
                                <Text style={estilos.opcionEntregaDetalle}>Seras redirigido a PayPal para pagar</Text>
                            </View>
                        </View>
                        <View style={[estilos.radio, metodoPago === 'PayPal' && estilos.radioActivo]}>
                            {metodoPago === 'PayPal' && <View style={estilos.radioPunto} />}
                        </View>
                    </Pressable>
                </View>

                <View style={estilos.seccion}>
                    <View style={estilos.seccionEncabezado}>
                        <SymbolView name="ticket.fill" size={18} tintColor="#1b3022" />
                        <Text style={estilos.seccionTitulo}>Cupon de descuento</Text>
                    </View>

                    <View style={estilos.cuponFila}>
                        <TextInput
                            style={[estilos.inputContenedor, estilos.inputCupon]}
                            value={codigoCupon}
                            onChangeText={manejarCambioCupon}
                            placeholder="Ej. RAICES10"
                            placeholderTextColor="#b0b0a8"
                            autoCapitalize="characters"
                        />
                        <Pressable
                            style={[estilos.botonCupon, estaValidandoCupon && estilos.botonCuponDesactivado]}
                            android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }}
                            onPress={aplicarCupon}
                            disabled={estaValidandoCupon}
                        >
                            {estaValidandoCupon
                                ? <ActivityIndicator color="#ffffff" size="small" />
                                : <Text style={estilos.botonCuponTexto}>APLICAR</Text>
                            }
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
                        <Text style={estilos.totalValor}>₡{subtotalMostrado.toLocaleString('es-CR')}</Text>
                    </View>
                    {descuentoMostrado > 0 && (
                        <View style={estilos.totalFila}>
                            <Text style={estilos.totalEtiqueta}>Descuento</Text>
                            <Text style={estilos.descuentoValor}>-₡{descuentoMostrado.toLocaleString('es-CR')}</Text>
                        </View>
                    )}
                    {resumenCompra?.cupon && (
                        <Text style={estilos.cuponDetalle}>
                            {resumenCompra.cupon.codigo}: {resumenCompra.cupon.descripcion}
                        </Text>
                    )}
                    <View style={estilos.totalFila}>
                        <Text style={estilos.totalEtiqueta}>IVA (13%)</Text>
                        <Text style={estilos.totalValor}>₡{impuestoMostrado.toLocaleString('es-CR')}</Text>
                    </View>
                    <View style={[estilos.totalFila, estilos.totalFilaFinal]}>
                        <Text style={estilos.totalFinalEtiqueta}>Total</Text>
                        <Text style={estilos.totalFinalValor}>₡{totalMostrado.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={estilos.tipoCambioCaja}>
                        <View style={estilos.totalFila}>
                            <Text style={estilos.totalEtiqueta}>Tipo de cambio venta</Text>
                            <Text style={estilos.totalValor}>
                                {tipoCambioVenta
                                    ? `₡${tipoCambioVenta.valor.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`
                                    : 'Cargando...'}
                            </Text>
                        </View>
                        {tipoCambioVenta ? (
                            <>
                                <Text style={estilos.tipoCambioFecha}>Fecha: {tipoCambioVenta.fecha}</Text>
                                <View style={estilos.totalFila}>
                                    <Text style={estilos.totalEtiqueta}>Total en dolares</Text>
                                    <Text style={estilos.totalValor}>
                                        {totalDolares !== null ? formatearMontoDolares(totalDolares) : '-'}
                                    </Text>
                                </View>
                            </>
                        ) : null}
                        {errorTipoCambio ? <Text style={estilos.tipoCambioError}>{errorTipoCambio}</Text> : null}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={estilos.pie}>
                <View style={estilos.pieInfo}>
                    <Text style={estilos.pieTotalEtiqueta}>Total a pagar</Text>
                    <Text style={estilos.pieTotalValor}>₡{totalMostrado.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</Text>
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
        borderRadius: 999,
        overflow: 'hidden',
    },
    fondoAtras: {
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
    botonAtrasTexto: {
        color: '#ffffff',
        fontSize: 30,
        fontWeight: '700',
        lineHeight: 34,
        textAlign: 'center',
        marginLeft: -1,
        marginTop: -1,
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
    cuponFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputCupon: {
        flex: 1,
    },
    botonCupon: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 11,
        minWidth: 92,
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonCuponDesactivado: {
        backgroundColor: '#8da082',
    },
    botonCuponTexto: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    mensajeCuponAplicado: {
        backgroundColor: '#f0f5ee',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#1b3022',
    },
    mensajeCuponAplicadoTexto: {
        fontSize: 12,
        color: '#526349',
        fontWeight: '600',
    },
    mensajeCuponError: {
        backgroundColor: '#ffdad6',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ba1a1a',
    },
    mensajeCuponErrorTexto: {
        fontSize: 12,
        color: '#93000a',
        fontWeight: '600',
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
    formularioPago: {
        gap: 12,
        paddingTop: 2,
    },
    inputTarjetaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#ffffff',
        gap: 8,
    },
    inputTarjeta: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1c1c18',
    },
    filaPago: {
        flexDirection: 'row',
        gap: 10,
    },
    campoPagoMitad: {
        flex: 1,
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
    descuentoValor: {
        fontSize: 13,
        color: '#526349',
        fontWeight: '700',
    },
    cuponDetalle: {
        fontSize: 12,
        color: '#526349',
        textAlign: 'right',
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
    tipoCambioCaja: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
        gap: 6,
    },
    tipoCambioFecha: {
        fontSize: 11,
        color: '#737973',
        textAlign: 'right',
    },
    tipoCambioError: {
        fontSize: 12,
        color: '#ba1a1a',
        textAlign: 'right',
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
