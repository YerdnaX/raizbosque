import {
    View, Text, Pressable, ScrollView, TextInput,
    StyleSheet, ActivityIndicator, ImageBackground, Alert, Modal,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import AtrasIcono from '@/assets/icons/atras.svg';
import { useUsuario } from '../context/UsuarioContext';
import {
    obtenerDisponibilidad,
    crearReservacion,
} from '../features/reservaciones/services/reservacionService';

const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MESES_NOMBRE = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const PERIODOS = {
    manana: { label: 'Mañana', horas: ['07:00','08:00','09:00','10:00','11:00'] },
    tarde:  { label: 'Tarde',  horas: ['12:00','13:00','14:00','15:00','16:00','17:00','18:00'] },
    noche:  { label: 'Noche',  horas: ['19:00','20:00','21:00','22:00'] },
} as const;

type Periodo = keyof typeof PERIODOS;

function buildFechaStr(anio: number, mes: number, dia: number): string {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function hoy(): { anio: number; mes: number; dia: number } {
    const d = new Date();
    return { anio: d.getFullYear(), mes: d.getMonth(), dia: d.getDate() };
}

export default function NuevaReservacion() {
    const insets = useSafeAreaInsets();
    const { usuario } = useUsuario();

    const { anio: anioHoy, mes: mesHoy, dia: diaHoy } = hoy();

    const [personas, setPersonas] = useState(2);
    const [mesActual, setMesActual] = useState(mesHoy);
    const [anioActual, setAnioActual] = useState(anioHoy);
    const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
    const [comentarios, setComentarios] = useState('');
    const [disponibilidad, setDisponibilidad] = useState<Record<string, number>>({});
    const [cargandoDisp, setCargandoDisp] = useState(false);
    const [estaProcesando, setEstaProcesando] = useState(false);
    const [mostrarHorario, setMostrarHorario] = useState(false);
    const [periodoActivo, setPeriodoActivo] = useState<Periodo>('manana');

    function diasDelMes(): (number | null)[] {
        const primerDia = new Date(anioActual, mesActual, 1).getDay();
        const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();
        const dias: (number | null)[] = Array(primerDia).fill(null);
        for (let i = 1; i <= totalDias; i++) dias.push(i);
        while (dias.length % 7 !== 0) dias.push(null);
        return dias;
    }

    function esDiaDeshabilitado(dia: number): boolean {
        const fecha = new Date(anioActual, mesActual, dia);
        const inicioHoy = new Date(anioHoy, mesHoy, diaHoy);
        if (fecha < inicioHoy) return true;
        if (fecha.getDay() === 1) return true; // lunes cerrado
        return false;
    }

    function mesAnterior() {
        if (mesActual === mesHoy && anioActual === anioHoy) return;
        if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
        else setMesActual(m => m - 1);
        setDiaSeleccionado(null);
        setHoraSeleccionada(null);
        setDisponibilidad({});
    }

    function mesSiguiente() {
        const mesesDesdeHoy = (anioActual - anioHoy) * 12 + (mesActual - mesHoy);
        if (mesesDesdeHoy >= 3) return;
        if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
        else setMesActual(m => m + 1);
        setDiaSeleccionado(null);
        setHoraSeleccionada(null);
        setDisponibilidad({});
    }

    async function seleccionarDia(dia: number) {
        if (esDiaDeshabilitado(dia)) return;
        setDiaSeleccionado(dia);
        setHoraSeleccionada(null);
        const fecha = buildFechaStr(anioActual, mesActual, dia);
        setCargandoDisp(true);
        try {
            const data = await obtenerDisponibilidad(fecha);
            setDisponibilidad(data);
            setMostrarHorario(true);
        } catch {
            setDisponibilidad({});
        } finally {
            setCargandoDisp(false);
        }
    }

    function estadoHora(hora: string): 'disponible' | 'casi-lleno' | 'no-disponible' {
        if (!diaSeleccionado) return 'no-disponible';
        const count = disponibilidad[hora] ?? 0;
        if (count >= 10) return 'no-disponible';
        const esHoy = diaSeleccionado === diaHoy && mesActual === mesHoy && anioActual === anioHoy;
        if (esHoy) {
            const [h] = hora.split(':').map(Number);
            if (h <= new Date().getHours()) return 'no-disponible';
        }
        if (count >= 7) return 'casi-lleno';
        return 'disponible';
    }

    async function confirmar() {
        if (!usuario) return;
        if (!diaSeleccionado) { Alert.alert('Falta la fecha', 'Selecciona un día en el calendario.'); return; }
        if (!horaSeleccionada) { Alert.alert('Falta la hora', 'Selecciona un horario disponible.'); return; }

        const fecha = buildFechaStr(anioActual, mesActual, diaSeleccionado);
        setEstaProcesando(true);
        try {
            await crearReservacion({
                idUsuario: usuario.IdUsuario,
                fecha,
                hora: horaSeleccionada,
                cantidadPersonas: personas,
                comentarios: comentarios.trim() || undefined,
            });
            Alert.alert(
                '¡Reservación confirmada!',
                `Tu reservación para el ${fecha} a las ${horaSeleccionada} Hrs ha sido registrada.`,
                [{ text: 'Ver mis reservaciones', onPress: () => router.replace('/reservaciones') }],
            );
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? 'No se pudo crear la reservación. Intenta de nuevo.';
            Alert.alert('Error', msg);
        } finally {
            setEstaProcesando(false);
        }
    }

    const dias = diasDelMes();
    const puedeMesAnterior = !(mesActual === mesHoy && anioActual === anioHoy);
    const mesesDesdeHoy = (anioActual - anioHoy) * 12 + (mesActual - mesHoy);
    const puedeMesSiguiente = mesesDesdeHoy < 3;

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonAtras} onPress={() => router.back()}>
                    <View style={estilos.fondoAtras}>
                        <AtrasIcono width={24} height={24} fill="#ffffff" />
                    </View>
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Nueva Reservación</Text>
                <View style={estilos.espaciador} />
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Número de personas */}
                <View style={estilos.seccion}>
                    <Text style={estilos.etiqueta}>NÚMERO DE PERSONAS</Text>
                    <View style={estilos.contador}>
                        <Pressable
                            style={[estilos.botonContador, personas <= 1 && estilos.botonContadorDesactivado]}
                            onPress={() => setPersonas(p => Math.max(1, p - 1))}
                            disabled={personas <= 1}
                        >
                            <Text style={estilos.botonContadorTexto}>−</Text>
                        </Pressable>
                        <View style={estilos.contadorValor}>
                            <Text style={estilos.contadorTexto}>{personas}</Text>
                        </View>
                        <Pressable
                            style={[estilos.botonContador, personas >= 20 && estilos.botonContadorDesactivado]}
                            onPress={() => setPersonas(p => Math.min(20, p + 1))}
                            disabled={personas >= 20}
                        >
                            <Text style={estilos.botonContadorTexto}>+</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Calendario */}
                <View style={estilos.seccion}>
                    <Text style={estilos.etiqueta}>FECHA</Text>
                    <View style={estilos.calendario}>
                        <View style={estilos.calMesHeader}>
                            <Pressable
                                onPress={mesAnterior}
                                style={[estilos.calNavBtn, !puedeMesAnterior && estilos.calNavBtnDesactivado]}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                android_ripple={{ color: '#1b3022', borderless: true, radius: 22 }}
                                disabled={!puedeMesAnterior}
                            >
                                <SymbolView name="chevron.left" size={20} tintColor={puedeMesAnterior ? '#1c1c18' : '#c3c8c1'} />
                            </Pressable>
                            <Text style={estilos.calMesTitulo}>
                                {MESES_NOMBRE[mesActual].toUpperCase()} {anioActual}
                            </Text>
                            <Pressable
                                onPress={mesSiguiente}
                                style={[estilos.calNavBtn, !puedeMesSiguiente && estilos.calNavBtnDesactivado]}
                                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                android_ripple={{ color: '#1b3022', borderless: true, radius: 22 }}
                                disabled={!puedeMesSiguiente}
                            >
                                <SymbolView name="chevron.right" size={20} tintColor={puedeMesSiguiente ? '#1c1c18' : '#c3c8c1'} />
                            </Pressable>
                        </View>

                        <View style={estilos.calSeparador} />

                        <View style={estilos.calSemana}>
                            {DIAS_SEMANA.map((d, i) => (
                                <Text key={i} style={[estilos.calDiaNombre, i === 1 && estilos.calLunesNombre]}>
                                    {d}
                                </Text>
                            ))}
                        </View>

                        <View style={estilos.calGrid}>
                            {dias.map((dia, idx) => {
                                if (dia === null) return <View key={idx} style={estilos.calCelda} />;
                                const deshabilitado = esDiaDeshabilitado(dia);
                                const seleccionado = diaSeleccionado === dia;
                                return (
                                    <Pressable
                                        key={idx}
                                        style={estilos.calCelda}
                                        onPress={() => seleccionarDia(dia)}
                                        disabled={deshabilitado}
                                    >
                                        <View style={[
                                            estilos.calDiaCirculo,
                                            seleccionado && estilos.calDiaCirculoSeleccionado,
                                        ]}>
                                            <Text style={[
                                                estilos.calDiaTexto,
                                                deshabilitado && estilos.calDiaDeshabilitado,
                                                seleccionado && estilos.calDiaSeleccionado,
                                            ]}>
                                                {dia}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                    {diaSeleccionado === null && (
                        <Text style={estilos.ayuda}>
                            Lunes no disponible · Días pasados no disponibles
                        </Text>
                    )}
                </View>

                {/* Selector de hora */}
                <View style={estilos.seccion}>
                    <Text style={estilos.etiqueta}>HORA</Text>
                    <Pressable
                        style={[estilos.selectorHora, !diaSeleccionado && estilos.selectorHoraDesactivado]}
                        onPress={() => diaSeleccionado && setMostrarHorario(true)}
                        disabled={!diaSeleccionado}
                        android_ripple={{ color: '#e5e2dc' }}
                    >
                        {cargandoDisp ? (
                            <ActivityIndicator size="small" color="#1b3022" style={{ flex: 1 }} />
                        ) : (
                            <>
                                <SymbolView
                                    name="clock"
                                    size={18}
                                    tintColor={horaSeleccionada ? '#1b3022' : (diaSeleccionado ? '#737973' : '#c3c8c1')}
                                />
                                <Text style={[estilos.selectorHoraTexto, !horaSeleccionada && estilos.selectorHoraPlaceholder]}>
                                    {horaSeleccionada
                                        ? `${horaSeleccionada} Hrs`
                                        : diaSeleccionado
                                            ? 'Seleccionar horario'
                                            : 'Selecciona una fecha primero'}
                                </Text>
                                <SymbolView name="chevron.right" size={14} tintColor={diaSeleccionado ? '#9ca09a' : '#c3c8c1'} />
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Notas */}
                <View style={estilos.seccion}>
                    <Text style={estilos.etiqueta}>NOTAS ESPECIALES (OPCIONAL)</Text>
                    <TextInput
                        style={estilos.textArea}
                        value={comentarios}
                        onChangeText={setComentarios}
                        placeholder="Alergias, solicitudes de ubicación, celebraciones..."
                        placeholderTextColor="#b0b0a8"
                        multiline
                        numberOfLines={3}
                        maxLength={300}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botón confirmar */}
            <View style={estilos.pie}>
                <Pressable
                    style={[estilos.botonConfirmar, estaProcesando && estilos.botonConfirmarDesactivado]}
                    onPress={confirmar}
                    disabled={estaProcesando}
                >
                    {estaProcesando
                        ? <ActivityIndicator color="#ffffff" />
                        : <Text style={estilos.botonConfirmarTexto}>CONFIRMAR RESERVACIÓN</Text>
                    }
                </Pressable>
            </View>

            {/* Bottom sheet: selector de horario */}
            <Modal
                visible={mostrarHorario}
                transparent
                animationType="slide"
                onRequestClose={() => setMostrarHorario(false)}
            >
                <View style={estilos.modalContenedor}>
                    {/* Backdrop para cerrar al tocar afuera */}
                    <Pressable style={estilos.backdrop} onPress={() => setMostrarHorario(false)} />

                    <View style={[estilos.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                        {/* Handle visual */}
                        <View style={estilos.sheetHandle} />

                        {/* Encabezado */}
                        <View style={estilos.sheetEncabezado}>
                            <Text style={estilos.sheetTitulo}>Seleccionar Horario</Text>
                            <Pressable
                                onPress={() => setMostrarHorario(false)}
                                hitSlop={14}
                                android_ripple={{ color: '#e5e2dc', borderless: true, radius: 20 }}
                            >
                                <SymbolView name="xmark" size={18} tintColor="#737973" />
                            </Pressable>
                        </View>

                        {/* Segmentos de período */}
                        <View style={estilos.segmentos}>
                            {(Object.keys(PERIODOS) as Periodo[]).map(p => (
                                <Pressable
                                    key={p}
                                    style={[estilos.segmentoBtn, periodoActivo === p && estilos.segmentoBtnActivo]}
                                    onPress={() => setPeriodoActivo(p)}
                                    android_ripple={{ color: '#c3c8c1' }}
                                >
                                    <Text style={[estilos.segmentoTexto, periodoActivo === p && estilos.segmentoTextoActivo]}>
                                        {PERIODOS[p].label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Grid de horas */}
                        <View style={estilos.horasGrid}>
                            {PERIODOS[periodoActivo].horas.map(hora => {
                                const estado = estadoHora(hora);
                                const seleccionado = horaSeleccionada === hora;
                                const lleno = (disponibilidad[hora] ?? 0) >= 10;
                                return (
                                    <Pressable
                                        key={hora}
                                        style={[
                                            estilos.chipHora,
                                            !seleccionado && estado === 'disponible'  && estilos.chipDisponible,
                                            !seleccionado && estado === 'casi-lleno'  && estilos.chipCasiLleno,
                                            estado === 'no-disponible'                && estilos.chipNoDisponible,
                                            seleccionado                              && estilos.chipSeleccionado,
                                        ]}
                                        onPress={() => estado !== 'no-disponible' && setHoraSeleccionada(hora)}
                                        disabled={estado === 'no-disponible'}
                                    >
                                        <Text style={[
                                            estilos.chipTexto,
                                            !seleccionado && estado === 'casi-lleno'  && estilos.chipTextoCasi,
                                            estado === 'no-disponible'                && estilos.chipTextoNoDisp,
                                            seleccionado                              && estilos.chipTextoSel,
                                        ]}>
                                            {hora}
                                        </Text>
                                        {lleno && (
                                            <Text style={estilos.chipEtiquetaLleno}>Lleno</Text>
                                        )}
                                        {estado === 'casi-lleno' && !seleccionado && (
                                            <Text style={estilos.chipEtiquetaCasi}>Casi lleno</Text>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Leyenda */}
                        <View style={estilos.leyenda}>
                            <View style={estilos.leyendaItem}>
                                <View style={[estilos.leyendaPunto, estilos.leyendaDisp]} />
                                <Text style={estilos.leyendaTexto}>Disponible</Text>
                            </View>
                            <View style={estilos.leyendaItem}>
                                <View style={[estilos.leyendaPunto, estilos.leyendaCasi]} />
                                <Text style={estilos.leyendaTexto}>Casi lleno</Text>
                            </View>
                            <View style={estilos.leyendaItem}>
                                <View style={[estilos.leyendaPunto, estilos.leyendaNoDisp]} />
                                <Text style={estilos.leyendaTexto}>No disponible</Text>
                            </View>
                        </View>

                        {/* Continuar */}
                        <Pressable
                            style={[estilos.botonContinuar, !horaSeleccionada && estilos.botonContinuarDesactivado]}
                            onPress={() => horaSeleccionada && setMostrarHorario(false)}
                            disabled={!horaSeleccionada}
                        >
                            <Text style={estilos.botonContinuarTexto}>Continuar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    encabezadoTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18', letterSpacing: 0.5 },
    espaciador: { width: 52 },
    scroll: { padding: 20, gap: 24 },
    seccion: { gap: 10 },
    etiqueta: { fontSize: 12, fontWeight: '700', color: '#737973', letterSpacing: 0.8 },
    ayuda: { fontSize: 12, color: '#9ca09a' },

    // Contador personas
    contador: { flexDirection: 'row', alignItems: 'center' },
    botonContador: {
        width: 52,
        height: 52,
        borderWidth: 1,
        borderColor: '#c3c8c1',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    botonContadorDesactivado: { borderColor: '#e5e2dc', backgroundColor: '#f8f7f4' },
    botonContadorTexto: { fontSize: 22, color: '#1c1c18', lineHeight: 28 },
    contadorValor: {
        width: 64,
        height: 52,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#c3c8c1',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contadorTexto: { fontSize: 18, fontWeight: '700', color: '#1c1c18' },

    // Calendario
    calendario: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e2dc',
        overflow: 'hidden',
        paddingBottom: 8,
    },
    calMesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    calNavBtn: { padding: 8 },
    calNavBtnDesactivado: { opacity: 0.3 },
    calMesTitulo: { fontSize: 14, fontWeight: '700', color: '#1c1c18', letterSpacing: 0.5 },
    calSeparador: { height: 1, backgroundColor: '#f0eee8', marginBottom: 8 },
    calSemana: { flexDirection: 'row', paddingHorizontal: 4 },
    calDiaNombre: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#737973',
        paddingBottom: 6,
    },
    calLunesNombre: { color: '#c3c8c1' },
    calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
    calCelda: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    calDiaCirculo: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calDiaCirculoSeleccionado: { backgroundColor: '#1b3022' },
    calDiaTexto: { fontSize: 14, fontWeight: '500', color: '#1c1c18' },
    calDiaDeshabilitado: { color: '#d0cec8' },
    calDiaSeleccionado: { color: '#ffffff', fontWeight: '700' },

    // Selector de hora (fila en el formulario principal)
    selectorHora: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 15,
        overflow: 'hidden',
    },
    selectorHoraDesactivado: { backgroundColor: '#f8f7f4', borderColor: '#e5e2dc' },
    selectorHoraTexto: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1c1c18' },
    selectorHoraPlaceholder: { color: '#9ca09a', fontWeight: '400' },

    // Notas
    textArea: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#1c1c18',
        minHeight: 90,
        textAlignVertical: 'top',
    },

    // Pie de página
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
    },
    botonConfirmar: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    botonConfirmarDesactivado: { backgroundColor: '#8da082' },
    botonConfirmarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

    // Modal / bottom sheet
    modalContenedor: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        gap: 16,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#d0cec8',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 4,
    },
    sheetEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetTitulo: { fontSize: 16, fontWeight: '700', color: '#1c1c18' },

    // Segmentos Mañana / Tarde / Noche
    segmentos: {
        flexDirection: 'row',
        backgroundColor: '#f0eee8',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    segmentoBtn: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: 'center',
    },
    segmentoBtnActivo: {
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    segmentoTexto: { fontSize: 14, fontWeight: '600', color: '#9ca09a' },
    segmentoTextoActivo: { color: '#1b3022' },

    // Grid de horas (dentro del sheet)
    horasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chipHora: {
        width: '22%',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        minHeight: 58,
    },
    chipDisponible:    { backgroundColor: '#ffffff',  borderColor: '#c3c8c1' },
    chipCasiLleno:     { backgroundColor: '#fffbe6',  borderColor: '#e5a000' },
    chipNoDisponible:  { backgroundColor: '#f5f3ef',  borderColor: '#e5e2dc' },
    chipSeleccionado:  { backgroundColor: '#1b3022',  borderColor: '#1b3022' },
    chipTexto:         { fontSize: 14, fontWeight: '700', color: '#1c1c18' },
    chipTextoCasi:     { color: '#7a5000' },
    chipTextoNoDisp:   { color: '#c3c8c1' },
    chipTextoSel:      { color: '#ffffff' },
    chipEtiquetaLleno: { fontSize: 9,  fontWeight: '700', color: '#ba1a1a' },
    chipEtiquetaCasi:  { fontSize: 9,  fontWeight: '600', color: '#7a5000' },

    // Leyenda
    leyenda: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 4,
    },
    leyendaItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
    leyendaPunto:  { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
    leyendaDisp:   { backgroundColor: '#ffffff',  borderColor: '#c3c8c1' },
    leyendaCasi:   { backgroundColor: '#fffbe6',  borderColor: '#e5a000' },
    leyendaNoDisp: { backgroundColor: '#f5f3ef',  borderColor: '#e5e2dc' },
    leyendaTexto:  { fontSize: 11, color: '#737973' },

    // Botón Continuar (dentro del sheet)
    botonContinuar: {
        backgroundColor: '#1b3022',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    botonContinuarDesactivado: { backgroundColor: '#8da082' },
    botonContinuarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
