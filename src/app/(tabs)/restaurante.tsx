import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ActivityIndicator, ImageBackground, Image } from "react-native";
import { useState, useMemo } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import { useRestaurante } from '../../features/restaurante/hooks/useRestaurante';

export default function Restaurante() {
    const { items, estaCargando, error } = useRestaurante();
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('Todos');

    const categorias = useMemo(
        () => ['Todos', ...Array.from(new Set(items.map(i => i.NombreCategoria)))],
        [items],
    );

    const itemsFiltrados = items.filter(item => {
        const coincideBusqueda = item.Nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideFiltro = filtroActivo === 'Todos' || item.NombreCategoria === filtroActivo;
        return coincideBusqueda && coincideFiltro;
    });

    return (
        <SafeAreaView style={estilos.contenedor} edges={['top']}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={estilos.encabezado}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonEncabezado}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1b3022" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Restaurante</Text>
                <Pressable style={estilos.botonEncabezado}>
                    <CarritoIcono width={30} height={30} fill="#1b3022" />
                </Pressable>
            </ImageBackground>

            {estaCargando ? (
                <View style={estilos.centrado}>
                    <ActivityIndicator size="large" color="#1b3022" />
                </View>
            ) : error ? (
                <View style={estilos.centrado}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={itemsFiltrados}
                    keyExtractor={item => item.IdProducto.toString()}
                    numColumns={2}
                    contentContainerStyle={estilos.lista}
                    columnWrapperStyle={estilos.fila}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={estilos.cabecera}>
                            <View style={estilos.barraBusqueda}>
                                <SymbolView name="magnifyingglass" size={18} tintColor="#737973" />
                                <TextInput
                                    style={estilos.inputBusqueda}
                                    placeholder="Buscar en el menú..."
                                    placeholderTextColor="#b0b0a8"
                                    value={busqueda}
                                    onChangeText={setBusqueda}
                                />
                            </View>
                            <View style={estilos.filtros}>
                                {categorias.map(filtro => (
                                    <Pressable
                                        key={filtro}
                                        style={[estilos.chip, filtroActivo === filtro && estilos.chipActivo]}
                                        onPress={() => setFiltroActivo(filtro)}
                                    >
                                        <Text style={[estilos.chipTexto, filtroActivo === filtro && estilos.chipTextoActivo]}>
                                            {filtro}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text style={estilos.vacio}>No se encontraron items.</Text>
                    }
                    renderItem={({ item }) => (
                        <Pressable
                            style={estilos.tarjeta}
                            onPress={() => router.push(`/plato/${item.IdProducto}` as any)}
                        >
                            <View style={estilos.imagenPlaceholder}>
                                {item.Imagen && (
                                    <Image source={{ uri: item.Imagen }} style={estilos.imagen} />
                                )}
                            </View>
                            <Text style={estilos.nombreItem} numberOfLines={2}>{item.Nombre}</Text>
                            {item.Descripcion && (
                                <Text style={estilos.descripcion} numberOfLines={1}>{item.Descripcion}</Text>
                            )}
                            <View style={estilos.precioFila}>
                                <Text style={estilos.precio}>₡{item.Precio.toLocaleString('es-CR')}</Text>
                                <View style={estilos.botonAgregar}>
                                    <Text style={estilos.botonAgregarTexto}>+</Text>
                                </View>
                            </View>
                        </Pressable>
                    )}
                />
            )}
        </SafeAreaView>
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
    botonEncabezado: {
        padding: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 1,
    },
    centrado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    cabecera: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 12,
    },
    barraBusqueda: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    inputBusqueda: {
        flex: 1,
        fontSize: 15,
        color: '#1c1c18',
    },
    filtros: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    chip: {
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: '#ffffff',
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
    lista: {
        paddingBottom: 16,
    },
    fila: {
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 12,
    },
    tarjeta: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    imagenPlaceholder: {
        backgroundColor: '#e5e2dc',
        borderRadius: 8,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    nombreItem: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c18',
        marginBottom: 2,
    },
    descripcion: {
        fontSize: 12,
        color: '#737973',
        marginBottom: 8,
    },
    precioFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    precio: {
        fontSize: 16,
        fontWeight: '700',
        color: '#526349',
    },
    botonAgregar: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#c3c8c1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    botonAgregarTexto: {
        fontSize: 18,
        color: '#1c1c18',
        lineHeight: 22,
    },
    vacio: {
        textAlign: 'center',
        color: '#737973',
        fontSize: 14,
        marginTop: 40,
    },
    imagen: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        },
});
