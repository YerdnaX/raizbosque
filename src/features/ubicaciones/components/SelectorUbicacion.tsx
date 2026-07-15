import { useEffect, useState } from 'react';
import {
    View, Text, Pressable, Modal, FlatList,
    StyleSheet, ActivityIndicator,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { obtenerPaises, obtenerHijos, obtenerConfiguracionPais } from '../services/ubicacionService';
import type { Ubicacion, NivelConfiguracion } from '../types/ubicacion';

type Props = {
    onCambio: (seleccion: { idsSeleccionados: number[]; completo: boolean }) => void;
};

export default function SelectorUbicacion({ onCambio }: Props) {
    const [cargandoPaises, setCargandoPaises] = useState(true);
    const [errorPaises, setErrorPaises] = useState(false);

    const [etiquetas, setEtiquetas] = useState<NivelConfiguracion[]>([]);
    const [seleccionados, setSeleccionados] = useState<Ubicacion[]>([]);
    const [opciones, setOpciones] = useState<Ubicacion[][]>([]);
    const [cargandoSiguiente, setCargandoSiguiente] = useState(false);
    const [errorSiguiente, setErrorSiguiente] = useState(false);
    const [completo, setCompleto] = useState(false);
    const [nivelAbierto, setNivelAbierto] = useState<number | null>(null);

    useEffect(() => {
        cargarPaises();
    }, []);

    useEffect(() => {
        onCambio({
            idsSeleccionados: seleccionados.map((ubicacion) => ubicacion.IdUbicacion),
            completo: seleccionados.length > 0 && completo,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seleccionados, completo]);

    async function cargarPaises() {
        setCargandoPaises(true);
        setErrorPaises(false);
        try {
            const paises = await obtenerPaises();
            setOpciones([paises]);
        } catch {
            setErrorPaises(true);
        } finally {
            setCargandoPaises(false);
        }
    }

    async function cargarSiguienteNivel(opcionesHastaAqui: Ubicacion[][], padre: Ubicacion) {
        setCargandoSiguiente(true);
        setErrorSiguiente(false);
        try {
            const hijos = await obtenerHijos(padre.IdUbicacion);
            if (hijos.length > 0) {
                setOpciones([...opcionesHastaAqui, hijos]);
                setCompleto(false);
            } else {
                setCompleto(true);
            }
        } catch {
            setErrorSiguiente(true);
        } finally {
            setCargandoSiguiente(false);
        }
    }

    async function elegir(nivelIndex: number, opcion: Ubicacion) {
        const nuevaSeleccion = [...seleccionados.slice(0, nivelIndex), opcion];
        const nuevasOpciones = opciones.slice(0, nivelIndex + 1);

        setSeleccionados(nuevaSeleccion);
        setOpciones(nuevasOpciones);
        setCompleto(false);
        setNivelAbierto(null);

        if (nivelIndex === 0) {
            try {
                const configuracion = await obtenerConfiguracionPais(opcion.IdUbicacion);
                setEtiquetas(configuracion.niveles);
            } catch {
                setEtiquetas([]);
            }
        }

        await cargarSiguienteNivel(nuevasOpciones, opcion);
    }

    function reintentarSiguienteNivel() {
        const ultimaSeleccion = seleccionados[seleccionados.length - 1];
        if (ultimaSeleccion) {
            cargarSiguienteNivel(opciones, ultimaSeleccion);
        }
    }

    function etiquetaDeNivel(nivelIndex: number): string {
        const configuracion = etiquetas.find((nivel) => nivel.nivel === nivelIndex + 1);
        if (configuracion) return configuracion.etiqueta;
        return nivelIndex === 0 ? 'País' : `Nivel ${nivelIndex + 1}`;
    }

    if (cargandoPaises) {
        return (
            <View style={estilos.estadoCarga}>
                <ActivityIndicator color="#1b3022" />
                <Text style={estilos.estadoTexto}>Cargando países...</Text>
            </View>
        );
    }

    if (errorPaises) {
        return (
            <View style={estilos.estadoCarga}>
                <Text style={estilos.estadoTexto}>No se pudieron cargar los países.</Text>
                <Pressable onPress={cargarPaises}>
                    <Text style={estilos.reintentar}>Reintentar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={estilos.contenedor}>
            {opciones.map((opcionesNivel, nivelIndex) => {
                const seleccionActual = seleccionados[nivelIndex];
                const etiqueta = etiquetaDeNivel(nivelIndex);

                return (
                    <View key={nivelIndex} style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{etiqueta}</Text>
                        <Pressable
                            style={estilos.selector}
                            onPress={() => setNivelAbierto(nivelIndex)}
                        >
                            <Text style={seleccionActual ? estilos.selectorTexto : estilos.selectorPlaceholder}>
                                {seleccionActual ? seleccionActual.Nombre : `Selecciona ${etiqueta.toLowerCase()}`}
                            </Text>
                            <SymbolView name="chevron.down" size={14} tintColor="#737973" />
                        </Pressable>

                        <Modal
                            visible={nivelAbierto === nivelIndex}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setNivelAbierto(null)}
                        >
                            <Pressable style={estilos.backdrop} onPress={() => setNivelAbierto(null)} />
                            <View style={estilos.modalContenedor}>
                                <Text style={estilos.modalTitulo}>{etiqueta}</Text>
                                {opcionesNivel.length === 0 ? (
                                    <Text style={estilos.estadoTexto}>No hay opciones disponibles.</Text>
                                ) : (
                                    <FlatList
                                        data={opcionesNivel}
                                        keyExtractor={(item) => String(item.IdUbicacion)}
                                        renderItem={({ item }) => (
                                            <Pressable
                                                style={estilos.opcionModal}
                                                android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
                                                onPress={() => elegir(nivelIndex, item)}
                                            >
                                                <Text style={estilos.opcionModalTexto}>{item.Nombre}</Text>
                                            </Pressable>
                                        )}
                                    />
                                )}
                            </View>
                        </Modal>
                    </View>
                );
            })}

            {cargandoSiguiente && (
                <View style={estilos.campo}>
                    <View style={estilos.estadoCargaSiguiente}>
                        <ActivityIndicator size="small" color="#1b3022" />
                        <Text style={estilos.estadoTexto}>Cargando opciones...</Text>
                    </View>
                </View>
            )}

            {errorSiguiente && (
                <View style={estilos.campo}>
                    <Text style={estilos.errorTexto}>No se pudieron cargar las siguientes opciones.</Text>
                    <Pressable onPress={reintentarSiguienteNivel}>
                        <Text style={estilos.reintentar}>Reintentar</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        gap: 10,
    },
    campo: {
        gap: 6,
    },
    etiqueta: {
        fontSize: 12,
        color: '#737973',
        fontWeight: '500',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#ffffff',
    },
    selectorTexto: {
        fontSize: 14,
        color: '#1c1c18',
    },
    selectorPlaceholder: {
        fontSize: 14,
        color: '#b0b0a8',
    },
    estadoCarga: {
        gap: 8,
        paddingVertical: 12,
        alignItems: 'flex-start',
    },
    estadoCargaSiguiente: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    estadoTexto: {
        fontSize: 13,
        color: '#737973',
    },
    errorTexto: {
        fontSize: 12,
        color: '#a65d46',
    },
    reintentar: {
        fontSize: 13,
        color: '#1b3022',
        fontWeight: '700',
        marginTop: 2,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(27,48,34,0.35)',
    },
    modalContenedor: {
        maxHeight: '60%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    modalTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1c1c18',
        marginBottom: 8,
    },
    opcionModal: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e2dc',
    },
    opcionModalTexto: {
        fontSize: 14,
        color: '#1c1c18',
    },
});
