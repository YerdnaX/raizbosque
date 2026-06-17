import {
    View, Text, Pressable, ScrollView, StyleSheet,
    ActivityIndicator, ImageBackground, Alert,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import AtrasIcono from '@/assets/icons/atras.svg';
import { useUsuario } from '../context/UsuarioContext';
import {
    obtenerReservaciones,
    cancelarReservacion,
} from '../features/reservaciones/services/reservacionService';
import type { Reservacion } from '../features/reservaciones/types/reservacion';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatearFecha(fechaISO: string): string {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${parseInt(dia)} ${MESES[parseInt(mes) - 1]}, ${anio}`;
}

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
            setError('No se pudo cargar las reservaciones.');
        } finally {
            setEstaCargando(false);
        }
    }

    async function manejarCancelar(idReservacion: number) {
        Alert.alert(
            'Cancelar Reserva',
            '¿Estás seguro de que deseas cancelar esta reservación?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await cancelarReservacion(idReservacion);
                            await cargarReservaciones();
                        } catch {
                            Alert.alert('Error', 'No se pudo cancelar la reservación.');
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
                <Pressable style={estilos.botonAtras} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Reservaciones</Text>
                <Pressable
                    style={estilos.botonNueva}
                    android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                    onPress={() => router.push('/nueva-reservacion')}
                >
                    <SymbolView name="plus" size={20} tintColor="#ffffff" />
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
                        <Text style={estilos.botonReintentarTexto}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : reservaciones.length === 0 ? (
                <View style={estilos.centrado}>
                    <SymbolView name="calendar.badge.clock" size={52} tintColor="#c3c8c1" />
                    <Text style={estilos.vacioTitulo}>Sin reservaciones</Text>
                    <Text style={estilos.vacioSubtitulo}>Aún no tienes reservaciones.</Text>
                    <Pressable
                        style={estilos.botonCrearVacio}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={() => router.push('/nueva-reservacion')}
                    >
                        <Text style={estilos.botonCrearVacioTexto}>Crear Reservación</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
                    {proximas.length > 0 && (
                        <View style={estilos.seccion}>
                            <Text style={estilos.seccionTitulo}>Próximas</Text>
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
                            <Text style={estilos.seccionTitulo}>Pasadas</Text>
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
    const config = ESTADO_CONFIG[reservacion.Estado] ?? { color: '#434843', fondo: '#e5e2dc' };
    const esPasada = !puedeCancel;

    return (
        <View style={[estilos.tarjeta, esPasada && estilos.tarjetaPasada]}>
            <View style={estilos.tarjetaEncabezado}>
                <View style={[estilos.badge, { backgroundColor: config.fondo }]}>
                    <Text style={[estilos.badgeTexto, { color: config.color }]}>
                        {reservacion.Estado}
                    </Text>
                </View>
            </View>

            <View style={estilos.tarjetaFila}>
                <SymbolView name="calendar" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {formatearFecha(reservacion.FechaReservacion)}
                </Text>
            </View>
            <View style={estilos.tarjetaFila}>
                <SymbolView name="clock" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {reservacion.HoraReservacion} Hrs
                </Text>
            </View>
            <View style={estilos.tarjetaFila}>
                <SymbolView name="person.2" size={16} tintColor={esPasada ? '#9ca09a' : '#434843'} />
                <Text style={[estilos.tarjetaTexto, esPasada && estilos.tarjetaTextoPasado]}>
                    {reservacion.CantidadPersonas} Persona{reservacion.CantidadPersonas !== 1 ? 's' : ''}
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
                    <Text style={estilos.botonCancelarTexto}>Cancelar Reserva</Text>
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
    botonAtras: { padding: 4 },
    fondoAtras: {
        backgroundColor: '#6b7068',
        borderRadius: 999,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 0.5,
    },
    botonNueva: {
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
