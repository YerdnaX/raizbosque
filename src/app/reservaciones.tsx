import {
    View, Text, Pressable, ScrollView, StyleSheet,
    ActivityIndicator, ImageBackground, Alert,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useUsuario } from '../context/UsuarioContext';
import { useIdioma } from '../context/IdiomaContext';
import { BotonAtras } from '../components/ui/BotonAtras';
import {
    obtenerReservaciones,
    cancelarReservacion,
} from '../features/reservaciones/services/reservacionService';
import type { Reservacion } from '../features/reservaciones/types/reservacion';

function formatearFecha(fechaISO: string, meses: readonly string[]): string {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${parseInt(dia)} ${meses[parseInt(mes) - 1]}, ${anio}`;
}

const ESTADO_CLAVE: Record<string, 'pendiente' | 'confirmada' | 'completada' | 'cancelada'> = {
    Pendiente: 'pendiente',
    Confirmada: 'confirmada',
    Completada: 'completada',
    Cancelada: 'cancelada',
};

function esProxima(reservacion: Reservacion): boolean {
    if (reservacion.Estado === 'Cancelada') return false;
    const ahora = new Date();
    const [anio, mes, dia] = reservacion.FechaReservacion.split('-').map(Number);
    const [hora, min] = reservacion.HoraReservacion.split(':').map(Number);
    const fechaRes = new Date(anio, mes - 1, dia, hora, min);
    return fechaRes > ahora;
}

type EstadoConfig = { color: string; fondo: string };
const ESTADO_CONFIG: Record<string, EstadoConfig> = {
    Pendiente:   { color: '#856404', fondo: '#fff3cd' },
    Confirmada:  { color: '#0a3622', fondo: '#d1e7dd' },
    Completada:  { color: '#434843', fondo: '#e5e2dc' },
    Cancelada:   { color: '#842029', fondo: '#f8d7da' },
};

export default function Reservaciones() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();
    const { t, strings } = useIdioma();
    const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            cargarReservaciones();
        }, [])
    );

    async function cargarReservaciones() {
        if (!usuario) return;
        setEstaCargando(true);
        setError(null);
        try {
            const data = await obtenerReservaciones(usuario.IdUsuario);
            setReservaciones(data);
        } catch {
            setError(t('reservations.loadError'));
        } finally {
            setEstaCargando(false);
        }
    }

    async function manejarCancelar(idReservacion: number) {
        Alert.alert(
            t('reservations.cancelConfirmTitle'),
            t('reservations.cancelConfirmMessage'),
            [
                { text: t('reservations.cancelConfirmNo'), style: 'cancel' },
                {
                    text: t('reservations.cancelConfirmYes'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelarReservacion(idReservacion);
                            await cargarReservaciones();
                        } catch {
                            Alert.alert(t('reservations.cancelErrorTitle'), t('reservations.cancelErrorMessage'));
                        }
                    },
                },
            ],
        );
    }

    const proximas = reservaciones.filter(esProxima);
    const pasadas = reservaciones.filter(r => !esProxima(r));

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <BotonAtras />
                <Text style={estilos.encabezadoTitulo}>{t('reservations.headerTitle')}</Text>
                <Pressable
                    style={estilos.botonNueva}
                    android_ripple={{ color: 'rgba(255,255,255,0.22)', foreground: true }}
                    onPress={() => router.push('/nueva-reservacion')}
                >
                    <Text style={estilos.botonNuevaTexto}>+</Text>
                </Pressable>
            </ImageBackground>

            {estaCargando ? (
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                </View>
            ) : error ? (
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                    <Pressable style={estilos.botonReintentar} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={cargarReservaciones}>
                        <Text style={estilos.botonReintentarTexto}>{t('reservations.retry')}</Text>
                    </Pressable>
                </View>
            ) : reservaciones.length === 0 ? (
                <View style={estilos.centrado}>
                    <SymbolView name="calendar.badge.clock" size={52} tintColor="#c3c8c1" />
                    <Text style={estilos.vacioTitulo}>{t('reservations.emptyTitle')}</Text>
                    <Text style={estilos.vacioSubtitulo}>{t('reservations.emptySubtitle')}</Text>
                    <Pressable
                        style={estilos.botonCrearVacio}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={() => router.push('/nueva-reservacion')}
                    >
                        <Text style={estilos.botonCrearVacioTexto}>{t('reservations.createButton')}</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
                    {proximas.length > 0 && (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>{t('reservations.upcoming')}</Text>
                            <View style={estilos.separadorTitulo} />
                            {proximas.map(r => (
                                <TarjetaReservacion
                                    key={r.IdReservacion}
                                    reservacion={r}
                                    onCancelar={() => manejarCancelar(r.IdReservacion)}
                                    puedeCancel
                                />
                            ))}
                        </View>
                    )}

                    {pasadas.length > 0 && (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>{t('reservations.past')}</Text>
                            <View style={estilos.separadorTitulo} />
                            {pasadas.map(r => (
                                <TarjetaReservacion
                                    key={r.IdReservacion}
                                    reservacion={r}
                                    onCancelar={() => {}}
                                    puedeCancel={false}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

type TarjetaProps = {
    reservacion: Reservacion;
    onCancelar: () => void;
    puedeCancel: boolean;
};

function TarjetaReservacion({ reservacion, onCancelar, puedeCancel }: TarjetaProps) {
    const { t, tn, strings } = useIdioma();
    const config = ESTADO_CONFIG[reservacion.Estado] ?? { color: '#434843', fondo: '#e5e2dc' };
    const esPasada = !puedeCancel;
    const claveEstado = ESTADO_CLAVE[reservacion.Estado];
    const estadoTraducido = claveEstado ? strings.reservations.status[claveEstado] : reservacion.Estado;

    return (
        <View style={[estilos.tarjeta, esPasada && estilos.tarjetaPasada]}>
            <View style={estilos.tarjetaEncabezado}>
                <View style={[estilos.badge, { backgroundColor: config.fondo }]}>
                    <Text style={[estilos.badgeTexto, { color: config.color }]}>
                        {estadoTraducido}
                    </Text>
                </View>
            </View>

            <View style={estilos.tarjetaFila}>
                <SymbolView name="calendar" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {formatearFecha(reservacion.FechaReservacion, strings.common.months)}
                </Text>
            </View>
            <View style={estilos.tarjetaFila}>
                <SymbolView name="clock" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {t('reservations.hoursSuffix', { time: reservacion.HoraReservacion })}
                </Text>
            </View>
            <View style={estilos.tarjetaFila}>
                <SymbolView name="person.2" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {tn('reservations.personCount', reservacion.CantidadPersonas)}
                </Text>
            </View>
            {reservacion.Comentarios ? (
                <View style={estilos.tarjetaFila}>
                    <SymbolView name="note.text" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                    <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]} numberOfLines={2}>
                        {reservacion.Comentarios}
                    </Text>
                </View>
            ) : null}

            {puedeCancel && reservacion.Estado !== 'Cancelada' && (
                <Pressable style={estilos.botonCancelar} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={onCancelar}>
                    <Text style={estilos.botonCancelarTexto}>{t('reservations.cancelButton')}</Text>
                </Pressable>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f0eee8' },
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
        letterSpacing: 0.5,
    },
    botonNueva: {
        backgroundColor: 'rgba(27,48,34,0.46)',
        borderRadius: 999,
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.80)',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
    },
    botonNuevaTexto: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 30,
        textAlign: 'center',
        marginTop: -1,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
    },
    errorTexto: { fontSize: 14, color: '#737973', textAlign: 'center' },
    botonReintentar: {
        borderWidth: 1,
        borderColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
        overflow: 'hidden',
    },
    botonReintentarTexto: { color: '#1b3022', fontWeight: '600', fontSize: 14 },
    vacioTitulo: { fontSize: 17, fontWeight: '700', color: '#1c1c18', marginTop: 8 },
    vacioSubtitulo: { fontSize: 13, color: '#737973', textAlign: 'center' },
    botonCrearVacio: {
        marginTop: 4,
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 28,
        overflow: 'hidden',
    },
    botonCrearVacioTexto: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
    scroll: { padding: 16, gap: 24 },
    seccion: { gap: 12 },
    seccionTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18' },
    separadorTitulo: { height: 1, backgroundColor: '#e5e2dc' },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        gap: 10,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    tarjetaPasada: { backgroundColor: '#f8f7f4' },
    tarjetaEncabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeTexto: { fontSize: 12, fontWeight: '600' },
    tarjetaFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    tarjetaTexto: { fontSize: 14, color: '#1c1c18', fontWeight: '500' },
    tarjetaTextoPasado: { color: '#9ca09a' },
    botonCancelar: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingVertical: 11,
        alignItems: 'center',
        overflow: 'hidden',
    },
    botonCancelarTexto: { fontSize: 13, fontWeight: '600', color: '#434843' },
});
