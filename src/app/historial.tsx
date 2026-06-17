import {
    View, Text, Pressable, FlatList, Modal, ScrollView,
    StyleSheet, ActivityIndicator, ImageBackground,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerHistorial } from '../features/compras/services/compraService';
import type { Compra } from '../features/compras/types/compra';

const FILTROS = ['Todos', 'Pendiente', 'Completado'];

type EstadoConfig = { fondo: string; texto: string; icono: string };
const ESTADO_CONFIG: Record<string, EstadoConfig> = {
    Pendiente:   { fondo: '#fff3cd', texto: '#856404', icono: 'clock.fill' },
    Completado:  { fondo: '#d1e7dd', texto: '#0a3622', icono: 'checkmark.circle.fill' },
    'En Camino': { fondo: '#cfe2ff', texto: '#084298', icono: 'truck.box.fill' },
    Cancelado:   { fondo: '#f8d7da', texto: '#842029', icono: 'xmark.circle.fill' },
};

function formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dia = fecha.getDate().toString().padStart(2, '0');
    return `${dia} ${meses[fecha.getMonth()]}, ${fecha.getFullYear()}`;
}

export default function Historial() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const [compras, setCompras] = useState<Compra[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState('Todos');
    const [compraDetalle, setCompraDetalle] = useState<Compra | null>(null);

    useEffect(() => {
        if (!usuario) return;
        cargarHistorial();
    }, []);

    async function cargarHistorial() {
        if (!usuario) return;
        setEstaCargando(true);
        setError(null);
        try {
            const data = await obtenerHistorial(usuario.IdUsuario);
            setCompras(data);
        } catch {
            setError('No se pudo cargar el historial. Intenta de nuevo.');
        } finally {
            setEstaCargando(false);
        }
    }

    const comprasFiltradas = filtro === 'Todos'
        ? compras
        : compras.filter(c => c.EstadoCompra === filtro);

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
                <Text style={estilos.encabezadoTitulo}>Historial de Compras</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            {/* Filtros */}
            <View style={estilos.filtrosContenedor}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filtros}>
                    {FILTROS.map(f => (
                        <Pressable
                            key={f}
                            style={[estilos.chip, filtro === f && estilos.chipActivo]}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                            onPress={() => setFiltro(f)}
                        >
                            <Text style={[estilos.chipTexto, filtro === f && estilos.chipTextoActivo]}>
                                {f === 'Todos' ? 'Todos los Pedidos' : f}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {estaCargando ? (
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                </View>
            ) : error ? (
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                    <Pressable style={estilos.botonReintentar} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={cargarHistorial}>
                        <Text style={estilos.botonReintentarTexto}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : comprasFiltradas.length === 0 ? (
                <View style={estilos.centrado}>
                    <SymbolView name="bag" size={52} tintColor="#c3c8c1" />
                    <Text style={estilos.vacioTitulo}>Sin pedidos</Text>
                    <Text style={estilos.vacioSubtitulo}>
                        {filtro === 'Todos'
                            ? 'Aún no has realizado ninguna compra.'
                            : `No tienes pedidos con estado "${filtro}".`}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={comprasFiltradas}
                    keyExtractor={item => item.IdCompra.toString()}
                    contentContainerStyle={estilos.lista}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TarjetaCompra compra={item} onVerDetalle={() => setCompraDetalle(item)} />
                    )}
                />
            )}

            {/* Modal de detalles */}
            <Modal
                visible={compraDetalle !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setCompraDetalle(null)}
            >
                {compraDetalle && (
                    <View style={estilos.modalFondo}>
                        <View style={estilos.modalContenido}>
                            <View style={estilos.modalEncabezado}>
                                <View>
                                    <Text style={estilos.modalTitulo}>
                                        COMPRA #{String(compraDetalle.IdCompra).padStart(4, '0')}
                                    </Text>
                                    <Text style={estilos.modalFecha}>{formatearFecha(compraDetalle.FechaCompra)}</Text>
                                </View>
                                <Pressable onPress={() => setCompraDetalle(null)} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} style={estilos.modalCerrar}>
                                    <SymbolView name="xmark" size={18} tintColor="#434843" />
                                </Pressable>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={estilos.modalScroll}>
                                <BadgeEstado estado={compraDetalle.EstadoCompra} />

                                <View style={estilos.modalSeccion}>
                                    <Text style={estilos.modalSeccionTitulo}>Entrega</Text>
                                    <Text style={estilos.modalTexto}>
                                        {compraDetalle.MetodoEntrega === 'Tienda'
                                            ? 'Recoger en tienda'
                                            : `Domicilio: ${compraDetalle.DireccionEntrega ?? '—'}`}
                                    </Text>
                                </View>

                                <View style={estilos.separador} />

                                <Text style={estilos.modalSeccionTitulo}>Productos</Text>
                                {compraDetalle.items.map(item => (
                                    <View key={item.IdProducto} style={estilos.modalItem}>
                                        <View style={estilos.modalItemInfo}>
                                            <Text style={estilos.modalItemNombre}>{item.Nombre}</Text>
                                            <Text style={estilos.modalItemCant}>{item.Cantidad} × ₡{item.PrecioUnitario.toLocaleString('es-CR')}</Text>
                                        </View>
                                        <Text style={estilos.modalItemSubtotal}>
                                            ₡{item.Subtotal.toLocaleString('es-CR')}
                                        </Text>
                                    </View>
                                ))}

                                <View style={estilos.separador} />

                                <View style={estilos.modalTotalFila}>
                                    <Text style={estilos.modalTotalEtiqueta}>Subtotal</Text>
                                    <Text style={estilos.modalTotalValor}>₡{compraDetalle.Subtotal.toLocaleString('es-CR')}</Text>
                                </View>
                                <View style={estilos.modalTotalFila}>
                                    <Text style={estilos.modalTotalEtiqueta}>IVA (13%)</Text>
                                    <Text style={estilos.modalTotalValor}>₡{compraDetalle.Impuesto.toLocaleString('es-CR')}</Text>
                                </View>
                                <View style={[estilos.modalTotalFila, estilos.modalTotalFilaFinal]}>
                                    <Text style={estilos.modalTotalFinalEtiqueta}>Total</Text>
                                    <Text style={estilos.modalTotalFinalValor}>
                                        ₡{compraDetalle.Total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </Modal>
        </View>
    );
}

function BadgeEstado({ estado }: { estado: string }) {
    const config = ESTADO_CONFIG[estado] ?? { fondo: '#e5e2dc', texto: '#434843', icono: 'questionmark.circle' };
    return (
        <View style={[estilos.badge, { backgroundColor: config.fondo }]}>
            <SymbolView name={config.icono as any} size={13} tintColor={config.texto} />
            <Text style={[estilos.badgeTexto, { color: config.texto }]}>{estado}</Text>
        </View>
    );
}

function TarjetaCompra({ compra, onVerDetalle }: { compra: Compra; onVerDetalle: () => void }) {
    const nombresProductos = compra.items.map(i => i.Nombre).join(', ');
    const totalItems = compra.items.reduce((s, i) => s + i.Cantidad, 0);

    return (
        <View style={estilos.tarjeta}>
            <View style={estilos.tarjetaEncabezado}>
                <View>
                    <Text style={estilos.tarjetaNumero}>
                        COMPRA #{String(compra.IdCompra).padStart(4, '0')}
                    </Text>
                    <Text style={estilos.tarjetaFecha}>{formatearFecha(compra.FechaCompra)}</Text>
                </View>
                <BadgeEstado estado={compra.EstadoCompra} />
            </View>

            <View style={estilos.separador} />

            <View style={estilos.tarjetaCuerpo}>
                <View style={estilos.tarjetaIconoContenedor}>
                    <SymbolView name="bag.fill" size={28} tintColor="#9ca09a" />
                </View>
                <View style={estilos.tarjetaInfo}>
                    <Text style={estilos.tarjetaProductosTitulo} numberOfLines={1}>
                        {totalItems} producto{totalItems !== 1 ? 's' : ''}
                    </Text>
                    <Text style={estilos.tarjetaProductosLista} numberOfLines={2}>
                        {nombresProductos}
                    </Text>
                </View>
                <Text style={estilos.tarjetaTotal}>
                    ₡{compra.Total.toLocaleString('es-CR')}
                </Text>
            </View>

            <View style={estilos.tarjetaAcciones}>
                <Pressable style={estilos.botonDetalle} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={onVerDetalle}>
                    <Text style={estilos.botonDetalleTexto}>Ver detalles</Text>
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
        fontSize: 17,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 0.5,
    },
    espaciador: { width: 52 },
    filtrosContenedor: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e2dc',
    },
    filtros: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 7,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    chipActivo: {
        backgroundColor: '#1b3022',
        borderColor: '#1b3022',
    },
    chipTexto: {
        fontSize: 13,
        color: '#434843',
        fontWeight: '500',
    },
    chipTextoActivo: {
        color: '#ffffff',
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
    },
    errorTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
    },
    botonReintentar: {
        borderWidth: 1,
        borderColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
        overflow: 'hidden',
    },
    botonReintentarTexto: {
        color: '#1b3022',
        fontWeight: '600',
        fontSize: 14,
    },
    vacioTitulo: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1c1c18',
        marginTop: 8,
    },
    vacioSubtitulo: {
        fontSize: 13,
        color: '#737973',
        textAlign: 'center',
    },
    lista: {
        padding: 16,
        gap: 14,
    },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    tarjetaEncabezado: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 14,
        paddingBottom: 10,
        backgroundColor: '#fafaf8',
        borderBottomWidth: 1,
        borderBottomColor: '#f0eee8',
    },
    tarjetaNumero: {
        fontSize: 11,
        fontWeight: '700',
        color: '#737973',
        letterSpacing: 0.5,
    },
    tarjetaFecha: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1c1c18',
        marginTop: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeTexto: {
        fontSize: 12,
        fontWeight: '600',
    },
    separador: {
        height: 1,
        backgroundColor: '#f0eee8',
    },
    tarjetaCuerpo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    tarjetaIconoContenedor: {
        width: 52,
        height: 52,
        borderRadius: 10,
        backgroundColor: '#f0eee8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tarjetaInfo: {
        flex: 1,
        gap: 3,
    },
    tarjetaProductosTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1c1c18',
    },
    tarjetaProductosLista: {
        fontSize: 12,
        color: '#737973',
        lineHeight: 16,
    },
    tarjetaTotal: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1c1c18',
    },
    tarjetaAcciones: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0eee8',
    },
    botonDetalle: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botonDetalleTexto: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1b3022',
    },
    // Modal
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContenido: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
        paddingBottom: 32,
    },
    modalEncabezado: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0eee8',
    },
    modalTitulo: {
        fontSize: 12,
        fontWeight: '700',
        color: '#737973',
        letterSpacing: 0.5,
    },
    modalFecha: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1c18',
        marginTop: 2,
    },
    modalCerrar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#f0eee8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalScroll: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalSeccion: {
        gap: 4,
        marginBottom: 16,
    },
    modalSeccionTitulo: {
        fontSize: 12,
        fontWeight: '700',
        color: '#737973',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    modalTexto: {
        fontSize: 14,
        color: '#1c1c18',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        gap: 12,
    },
    modalItemInfo: {
        flex: 1,
        gap: 2,
    },
    modalItemNombre: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c18',
    },
    modalItemCant: {
        fontSize: 12,
        color: '#737973',
    },
    modalItemSubtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#526349',
    },
    modalTotalFila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    modalTotalEtiqueta: {
        fontSize: 13,
        color: '#737973',
    },
    modalTotalValor: {
        fontSize: 13,
        color: '#1c1c18',
        fontWeight: '500',
    },
    modalTotalFilaFinal: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e2dc',
    },
    modalTotalFinalEtiqueta: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1c1c18',
    },
    modalTotalFinalValor: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1b3022',
    },
});
