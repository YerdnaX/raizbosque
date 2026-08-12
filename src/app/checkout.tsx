import {
    View, Text, Pressable, ScrollView,
    StyleSheet, ImageBackground, Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useUsuario } from '../context/UsuarioContext';
import { useCarrito } from '../context/CarritoContext';
import { useIdioma } from '../context/IdiomaContext';
import { cargarBorrador, eliminarBorrador } from '../utils/borradores';
import { useGuardadoAutomatico } from '../hooks/useGuardadoAutomatico';
import { claveBorradorCheckout } from '../features/compras/utils/claveBorradorCheckout';
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
import { CheckoutProgress } from '../features/compras/components/CheckoutProgress';
import { PasoEntrega } from '../features/compras/components/PasoEntrega';
import { PasoPago } from '../features/compras/components/PasoPago';
import { PasoConfirmacion } from '../features/compras/components/PasoConfirmacion';
import type {
    MarcaTarjeta, MetodoEntrega, MetodoPago, PasoCheckout, ResumenPaso, SeleccionUbicacion,
} from '../features/compras/types/checkoutEstado';

type ErrorApi = {
    response?: {
        data?: {
            message?: string;
        };
    };
};

// Progreso temporal de checkout: nunca incluye número de tarjeta, nombre en
// la tarjeta, vencimiento, CVV ni teléfono SINPE (solo el método elegido).
type DraftCheckout = {
    paso: PasoCheckout;
    metodoEntrega: MetodoEntrega;
    telefono: string;
    usarDireccionGuardada: boolean;
    ubicacionSeleccion: SeleccionUbicacion;
    direccionExacta: string;
    metodoPago: MetodoPago;
    codigoCupon: string;
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

function obtenerParametroUrl(url: string, nombre: string) {
    const coincidencia = url.match(new RegExp(`[?&]${nombre}=([^&]+)`));
    return coincidencia ? decodeURIComponent(coincidencia[1]) : null;
}

export default function Checkout() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { items, total, limpiarCarrito } = useCarrito();
    const { t } = useIdioma();

    const [paso, setPaso] = useState<PasoCheckout>('entrega');

    const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntrega>('Tienda');
    const [telefono, setTelefono] = useState(usuario?.Telefono ?? '');
    const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true);
    const [ubicacionSeleccion, setUbicacionSeleccion] = useState<SeleccionUbicacion>({
        idsSeleccionados: [],
        completo: false,
    });
    const [direccionExacta, setDireccionExacta] = useState('');
    const [errorEntrega, setErrorEntrega] = useState('');

    const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [nombreTarjeta, setNombreTarjeta] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [cvv, setCvv] = useState('');
    const [telefonoSinpe, setTelefonoSinpe] = useState('');
    const [errorPago, setErrorPago] = useState('');

    const [codigoCupon, setCodigoCupon] = useState('');
    const [resumenCompra, setResumenCompra] = useState<ResumenCompra | null>(null);
    const [mensajeCupon, setMensajeCupon] = useState('');
    const [errorCupon, setErrorCupon] = useState('');
    const [estaValidandoCupon, setEstaValidandoCupon] = useState(false);
    const [errorConfirmacion, setErrorConfirmacion] = useState('');

    const [estaProcesando, setEstaProcesando] = useState(false);
    const [tipoCambioVenta, setTipoCambioVenta] = useState<TipoCambioVenta | null>(null);
    const [errorTipoCambio, setErrorTipoCambio] = useState('');

    const [draftHidratado, setDraftHidratado] = useState(false);
    const claveDraft = usuario ? claveBorradorCheckout(usuario.IdUsuario) : null;

    // Restaura progreso guardado (si existe y no expiró) al entrar a Checkout.
    useEffect(() => {
        if (!claveDraft) { setDraftHidratado(true); return; }
        let activo = true;
        cargarBorrador<DraftCheckout>(claveDraft).then((draft) => {
            if (activo && draft) {
                setPaso(draft.paso);
                setMetodoEntrega(draft.metodoEntrega);
                if (draft.telefono) setTelefono(draft.telefono);
                setUsarDireccionGuardada(draft.usarDireccionGuardada);
                setUbicacionSeleccion(draft.ubicacionSeleccion);
                setDireccionExacta(draft.direccionExacta);
                setMetodoPago(draft.metodoPago);
                setCodigoCupon(draft.codigoCupon);
            }
            if (activo) setDraftHidratado(true);
        });
        return () => { activo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claveDraft]);

    // Auto-guardado con debounce mientras el usuario completa el checkout.
    useGuardadoAutomatico<DraftCheckout>(claveDraft, {
        paso, metodoEntrega, telefono, usarDireccionGuardada, ubicacionSeleccion,
        direccionExacta, metodoPago, codigoCupon,
    }, draftHidratado && !!claveDraft);

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

    const direccionMostrada = metodoEntrega === 'Domicilio'
        ? (usarDireccionGuardada && usuario?.Direccion
            ? usuario.Direccion
            : (ubicacionSeleccion.completo && direccionExacta.trim() ? direccionExacta.trim() : t('checkout.delivery.pendingAddress')))
        : '';

    const entregaResumen: ResumenPaso = {
        titulo: metodoEntrega === 'Tienda' ? t('checkout.delivery.pickupTitle') : t('checkout.delivery.homeTitle'),
        detalle: metodoEntrega === 'Tienda' ? t('checkout.delivery.storePickupSummary') : direccionMostrada,
    };

    const pagoResumen: ResumenPaso = {
        titulo: metodoPago === 'Tarjeta' ? t('checkout.payment.cardTitle') : metodoPago === 'SINPE' ? t('checkout.payment.sinpeTitle') : metodoPago === 'PayPal' ? t('checkout.payment.paypalTitle') : t('checkout.payment.notChosen'),
        detalle: metodoPago === 'Tarjeta' && numeroTarjeta
            ? enmascararUltimosCuatro(numeroTarjeta, '•••• ')
            : metodoPago === 'SINPE' && telefonoSinpe
                ? telefonoSinpe
                : metodoPago === 'PayPal'
                    ? (usuario?.Correo ?? '')
                    : '',
    };

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
                setErrorTipoCambio(t('checkout.confirmation.errors.exchangeRateFailed'));
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

    function validarEntregaCompleta(): string | null {
        if (!telefonoYaRegistrado && !telefono.trim()) {
            return t('checkout.delivery.errors.phoneRequired');
        }
        if (metodoEntrega === 'Domicilio' && !construirDatosDireccion()) {
            return t('checkout.delivery.errors.addressRequired');
        }
        return null;
    }

    function validarPagoSeleccionado(): string | null {
        if (!metodoPago) {
            return t('checkout.payment.errors.methodRequired');
        }

        if (metodoPago === 'PayPal') {
            return null;
        }

        if (metodoPago === 'SINPE') {
            if (obtenerSoloDigitos(telefonoSinpe).length !== 8) {
                return t('checkout.payment.errors.sinpeInvalid');
            }
            return null;
        }

        const numeroLimpio = obtenerSoloDigitos(numeroTarjeta);
        const nombreLimpio = nombreTarjeta.trim();
        const palabrasNombre = nombreLimpio.split(/\s+/).filter(Boolean);

        if (!numeroLimpio || !nombreLimpio || !fechaVencimiento.trim() || !cvv.trim()) {
            return t('checkout.payment.errors.cardIncomplete');
        }

        if (!marcaTarjeta) {
            return t('checkout.payment.errors.cardInvalid');
        }

        const longitudValida = marcaTarjeta === 'Visa'
            ? [13, 16, 19].includes(numeroLimpio.length)
            : numeroLimpio.length === 16;

        if (!longitudValida || !validarLuhn(numeroLimpio)) {
            return t('checkout.payment.errors.cardInvalid');
        }

        if (palabrasNombre.length < 2) {
            return t('checkout.payment.errors.cardHolderIncomplete');
        }

        if (!validarFechaVencimiento(fechaVencimiento)) {
            return t('checkout.payment.errors.expiryInvalid');
        }

        if (obtenerSoloDigitos(cvv).length !== 3) {
            return t('checkout.payment.errors.cvvInvalid');
        }

        return null;
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

    function avanzarAPago() {
        const mensaje = validarEntregaCompleta();
        if (mensaje) {
            setErrorEntrega(mensaje);
            return;
        }
        setErrorEntrega('');
        setPaso('pago');
    }

    function avanzarAConfirmacion() {
        const mensaje = validarPagoSeleccionado();
        if (mensaje) {
            setErrorPago(mensaje);
            return;
        }
        setErrorPago('');
        setErrorConfirmacion('');
        setPaso('confirmacion');
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
            setErrorCupon(t('checkout.confirmation.errors.couponRequired'));
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
                setMensajeCupon(t('checkout.confirmation.couponApplied', { amount: `₡${resumen.descuento.toLocaleString('es-CR')}` }));
            }
        } catch (error) {
            setResumenCompra(null);
            setErrorCupon(obtenerMensajeError(error, t('checkout.confirmation.errors.couponInvalid')));
        } finally {
            setEstaValidandoCupon(false);
        }
    }

    async function confirmarCompraPaypal(datosDireccion: ReturnType<typeof construirDatosDireccion>) {
        if (!usuario) return;

        try {
            // Linking.createURL genera el deep link correcto segun el entorno:
            // exp://<ip>:8081/--/paypal-retorno en Expo Go, raizbosque://paypal-retorno en un build standalone.
            const urlRetorno = Linking.createURL('paypal-retorno');
            const urlCancelado = Linking.createURL('paypal-cancelado');

            const orden = await crearOrdenPaypal(usuario.IdUsuario, urlRetorno, urlCancelado, resumenCompra?.cupon?.codigo);

            const resultadoAuth = await WebBrowser.openAuthSessionAsync(orden.approveUrl, urlRetorno);

            if (resultadoAuth.type !== 'success') {
                Alert.alert(t('checkout.paypal.cancelledTitle'), t('checkout.paypal.cancelledMessage'));
                return;
            }

            const payerId = obtenerParametroUrl(resultadoAuth.url, 'PayerID');
            if (!payerId) {
                Alert.alert(t('checkout.paypal.cancelledTitle'), t('checkout.paypal.cancelledMessage'));
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
            if (claveDraft) eliminarBorrador(claveDraft);

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
            Alert.alert(t('checkout.paypal.errorTitle'), obtenerMensajeError(error, t('checkout.paypal.paypalFailed')));
        }
    }

    async function confirmarCompraBanco(datosDireccion: ReturnType<typeof construirDatosDireccion>) {
        if (!usuario) return;

        const datosPago = construirMetodoPago();
        if (!datosPago) {
            setErrorConfirmacion(t('checkout.confirmation.errors.paymentMethodRequired'));
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
            if (claveDraft) eliminarBorrador(claveDraft);
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
            Alert.alert(t('checkout.paypal.errorTitle'), obtenerMensajeError(error, t('checkout.paypal.purchaseFailed')));
        }
    }

    async function confirmarCompra() {
        if (!usuario) return;

        const errorEntregaFinal = validarEntregaCompleta();
        if (errorEntregaFinal) {
            setErrorConfirmacion(errorEntregaFinal);
            return;
        }

        if (codigoCupon.trim() && !resumenCompra?.cupon) {
            setErrorConfirmacion(t('checkout.confirmation.errors.applyCouponFirst'));
            return;
        }

        const errorPagoFinal = validarPagoSeleccionado();
        if (errorPagoFinal) {
            setErrorConfirmacion(errorPagoFinal);
            return;
        }

        setErrorConfirmacion('');
        const datosDireccion = construirDatosDireccion();

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
                <Pressable
                    style={estilos.botonAtras}
                    android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }}
                    onPress={() => (paso === 'entrega' ? router.back() : setPaso(paso === 'confirmacion' ? 'pago' : 'entrega'))}
                >
                    <View style={estilos.fondoAtras}>
                        <Text style={estilos.botonAtrasTexto}>‹</Text>
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>{t('checkout.headerTitle')}</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <CheckoutProgress pasoActual={paso} />

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {paso === 'entrega' && (
                    <PasoEntrega
                        usuario={usuario}
                        metodoEntrega={metodoEntrega}
                        onCambiarMetodoEntrega={(metodo) => { setMetodoEntrega(metodo); setErrorEntrega(''); }}
                        telefono={telefono}
                        onCambiarTelefono={(valor) => { setTelefono(valor); setErrorEntrega(''); }}
                        telefonoYaRegistrado={telefonoYaRegistrado}
                        usarDireccionGuardada={usarDireccionGuardada}
                        onCambiarUsarDireccionGuardada={(usar) => { setUsarDireccionGuardada(usar); setErrorEntrega(''); }}
                        ubicacionSeleccion={ubicacionSeleccion}
                        onCambiarUbicacion={(seleccion) => { setUbicacionSeleccion(seleccion); setErrorEntrega(''); }}
                        direccionExacta={direccionExacta}
                        onCambiarDireccionExacta={(valor) => { setDireccionExacta(valor); setErrorEntrega(''); }}
                        error={errorEntrega}
                        onContinuar={avanzarAPago}
                    />
                )}

                {paso === 'pago' && (
                    <PasoPago
                        metodoPago={metodoPago}
                        onCambiarMetodoPago={(metodo) => { setMetodoPago(metodo); setErrorPago(''); }}
                        numeroTarjeta={numeroTarjeta}
                        onCambiarNumeroTarjeta={(texto) => { setNumeroTarjeta(formatearNumeroTarjeta(texto)); setErrorPago(''); }}
                        nombreTarjeta={nombreTarjeta}
                        onCambiarNombreTarjeta={(valor) => { setNombreTarjeta(valor); setErrorPago(''); }}
                        fechaVencimiento={fechaVencimiento}
                        onCambiarFechaVencimiento={(texto) => { setFechaVencimiento(formatearFechaVencimiento(texto)); setErrorPago(''); }}
                        cvv={cvv}
                        onCambiarCvv={(texto) => { setCvv(obtenerSoloDigitos(texto).slice(0, 3)); setErrorPago(''); }}
                        marcaTarjeta={marcaTarjeta}
                        telefonoSinpe={telefonoSinpe}
                        onCambiarTelefonoSinpe={(texto) => { setTelefonoSinpe(formatearTelefonoSinpe(texto)); setErrorPago(''); }}
                        error={errorPago}
                        onVolver={() => setPaso('entrega')}
                        onContinuar={avanzarAConfirmacion}
                    />
                )}

                {paso === 'confirmacion' && (
                    <PasoConfirmacion
                        usuario={usuario}
                        telefono={telefono}
                        items={items}
                        entregaResumen={entregaResumen}
                        pagoResumen={pagoResumen}
                        onEditarEntrega={() => setPaso('entrega')}
                        onEditarPago={() => setPaso('pago')}
                        codigoCupon={codigoCupon}
                        onCambiarCupon={manejarCambioCupon}
                        onAplicarCupon={aplicarCupon}
                        estaValidandoCupon={estaValidandoCupon}
                        mensajeCupon={mensajeCupon}
                        errorCupon={errorCupon}
                        cuponAplicado={resumenCompra?.cupon ?? null}
                        subtotal={subtotalMostrado}
                        descuento={descuentoMostrado}
                        impuesto={impuestoMostrado}
                        total={totalMostrado}
                        tipoCambioVenta={tipoCambioVenta}
                        errorTipoCambio={errorTipoCambio}
                        totalDolares={totalDolares}
                        error={errorConfirmacion}
                        estaProcesando={estaProcesando}
                        onConfirmar={confirmarCompra}
                    />
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingBottom: 24,
    },
});
