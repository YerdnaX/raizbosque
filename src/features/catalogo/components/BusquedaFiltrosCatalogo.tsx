import { useState } from 'react';
import {
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useIdioma } from '../../../context/IdiomaContext';
import type { ElementoCatalogo } from '../hooks/useBusquedaCatalogo';

type Props<T extends ElementoCatalogo> = {
    placeholder: string;
    busqueda: string;
    onCambiarBusqueda: (valor: string) => void;
    categoriaActiva: string | null;
    onCambiarCategoria: (categoria: string | null) => void;
    soloDisponibles: boolean;
    onCambiarDisponibles: (activo: boolean) => void;
    onMostrarTodos: () => void;
    categorias: string[];
    sugerencias: T[];
};

export function BusquedaFiltrosCatalogo<T extends ElementoCatalogo>({
    placeholder,
    busqueda,
    onCambiarBusqueda,
    categoriaActiva,
    onCambiarCategoria,
    soloDisponibles,
    onCambiarDisponibles,
    onMostrarTodos,
    categorias,
    sugerencias,
}: Props<T>) {
    const { t } = useIdioma();
    const [tieneFoco, setTieneFoco] = useState(false);
    const todosActivos = categoriaActiva === null && !soloDisponibles;

    function seleccionarSugerencia(nombre: string) {
        onCambiarBusqueda(nombre);
        setTieneFoco(false);
        Keyboard.dismiss();
    }

    return (
        <View style={estilos.contenedor}>
            <View style={[estilos.barraBusqueda, tieneFoco && estilos.barraBusquedaActiva]}>
                <SymbolView name="magnifyingglass" size={18} tintColor="#737973" />
                <TextInput
                    style={estilos.inputBusqueda}
                    placeholder={placeholder}
                    placeholderTextColor="#737973"
                    value={busqueda}
                    onChangeText={onCambiarBusqueda}
                    onFocus={() => setTieneFoco(true)}
                    onBlur={() => setTimeout(() => setTieneFoco(false), 120)}
                    accessibilityLabel={placeholder}
                    returnKeyType="search"
                />
                {busqueda.length > 0 && (
                    <Pressable
                        style={estilos.botonLimpiar}
                        onPress={() => onCambiarBusqueda('')}
                        accessibilityRole="button"
                        accessibilityLabel={t('shop.clearSearch')}
                        hitSlop={8}
                    >
                        <SymbolView name="xmark.circle.fill" size={20} tintColor="#526349" />
                    </Pressable>
                )}
            </View>

            {tieneFoco && busqueda.trim().length > 0 && sugerencias.length > 0 && (
                <View style={estilos.sugerencias} accessibilityLabel={t('shop.suggestions')}>
                    {sugerencias.map(item => (
                        <Pressable
                            key={item.IdProducto}
                            style={estilos.sugerencia}
                            onPress={() => seleccionarSugerencia(item.Nombre)}
                            accessibilityRole="button"
                            accessibilityLabel={item.Nombre}
                        >
                            <SymbolView name="magnifyingglass" size={15} tintColor="#526349" />
                            <View style={estilos.sugerenciaTextos}>
                                <Text style={estilos.sugerenciaNombre}>{item.Nombre}</Text>
                                <Text style={estilos.sugerenciaCategoria}>{item.NombreCategoria}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            )}

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={estilos.filtros}
                keyboardShouldPersistTaps="handled"
            >
                <ChipFiltro
                    etiqueta={t('shop.allFilter')}
                    seleccionado={todosActivos}
                    onPress={onMostrarTodos}
                />
                {categorias.map(categoria => (
                    <ChipFiltro
                        key={categoria}
                        etiqueta={categoria}
                        seleccionado={categoriaActiva === categoria}
                        onPress={() => onCambiarCategoria(categoria)}
                    />
                ))}
                <ChipFiltro
                    etiqueta={t('shop.availableFilter')}
                    seleccionado={soloDisponibles}
                    onPress={() => onCambiarDisponibles(!soloDisponibles)}
                />
            </ScrollView>
        </View>
    );
}

function ChipFiltro({ etiqueta, seleccionado, onPress }: {
    etiqueta: string;
    seleccionado: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={[estilos.chip, seleccionado && estilos.chipActivo]}
            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={etiqueta}
            accessibilityState={{ selected: seleccionado }}
        >
            {seleccionado && <SymbolView name="checkmark" size={12} tintColor="#ffffff" />}
            <Text style={[estilos.chipTexto, seleccionado && estilos.chipTextoActivo]}>{etiqueta}</Text>
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 10,
        zIndex: 2,
    },
    barraBusqueda: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e5e2dc',
        paddingHorizontal: 14,
        gap: 10,
    },
    barraBusquedaActiva: {
        borderColor: '#064E3B',
    },
    inputBusqueda: {
        flex: 1,
        fontSize: 15,
        color: '#1c1c18',
        paddingVertical: 8,
    },
    botonLimpiar: {
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sugerencias: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e5e2dc',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
    },
    sugerencia: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e5e2dc',
    },
    sugerenciaTextos: { flex: 1 },
    sugerenciaNombre: { color: '#1c1c18', fontSize: 14, fontWeight: '600' },
    sugerenciaCategoria: { color: '#737973', fontSize: 12, marginTop: 2 },
    filtros: {
        gap: 8,
        paddingRight: 16,
    },
    chip: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: '#8da082',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 7,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    chipActivo: {
        backgroundColor: '#064E3B',
        borderColor: '#064E3B',
    },
    chipTexto: {
        fontSize: 13,
        color: '#434843',
        fontWeight: '600',
    },
    chipTextoActivo: { color: '#ffffff' },
});
