import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";

type ItemCafe = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
};

const ITEMS_CAFE: ItemCafe[] = [
    { id: '1',  nombre: 'Café Americano',          descripcion: 'Caliente · 240ml',  precio: 3.50, categoria: 'Bebidas'  },
    { id: '2',  nombre: 'Cappuccino',               descripcion: 'Caliente · 180ml',  precio: 4.50, categoria: 'Bebidas'  },
    { id: '3',  nombre: 'Latte Helado',             descripcion: 'Frío · 350ml',      precio: 5.00, categoria: 'Bebidas'  },
    { id: '4',  nombre: 'Té de Hierbas',            descripcion: 'Caliente · 240ml',  precio: 3.00, categoria: 'Bebidas'  },
    { id: '5',  nombre: 'Brownie de Chocolate',     descripcion: 'Porción individual', precio: 5.00, categoria: 'Postres'  },
    { id: '6',  nombre: 'Cheesecake',               descripcion: 'Con frutos rojos',  precio: 6.00, categoria: 'Postres'  },
    { id: '7',  nombre: 'Tostadas con Aguacate',    descripcion: 'Pan artesanal',     precio: 8.00, categoria: 'Platos'   },
    { id: '8',  nombre: 'Granola Bowl',             descripcion: 'Con yogur y miel',  precio: 7.50, categoria: 'Platos'   },
    { id: '9',  nombre: 'Sándwich de Pavo',         descripcion: 'Con ensalada',      precio: 9.00, categoria: 'Platos'   },
];

const FILTROS = ['Todos', 'Bebidas', 'Postres', 'Platos'];

export default function Restaurante() {
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('Todos');

    const itemsFiltrados = ITEMS_CAFE.filter(item => {
        const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideFiltro = filtroActivo === 'Todos' || item.categoria === filtroActivo;
        return coincideBusqueda && coincideFiltro;
    });

    return (
        <SafeAreaView style={estilos.contenedor} edges={['top']}>
            <View style={estilos.encabezado}>
                <Pressable style={estilos.botonEncabezado}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1c1c18" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>RAÍCES</Text>
                <Pressable style={estilos.botonEncabezado}>
                    <SymbolView name="cart" size={24} tintColor="#1c1c18" />
                </Pressable>
            </View>

            <FlatList
                data={itemsFiltrados}
                keyExtractor={item => item.id}
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
                            {FILTROS.map(filtro => (
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
                    <Text style={estilos.vacio}>No se encontraron plantas :c.</Text>
                }
                renderItem={({ item }) => (
                    <View style={estilos.tarjeta}>
                        <View style={estilos.imagenPlaceholder}>
                            <SymbolView name="photo" size={32} tintColor="#b0b0a8" />
                        </View>
                        <Text style={estilos.nombreItem} numberOfLines={2}>{item.nombre}</Text>
                        <Text style={estilos.descripcion} numberOfLines={1}>{item.descripcion}</Text>
                        <View style={estilos.precioFila}>
                            <Text style={estilos.precio}>${item.precio.toFixed(2)}</Text>
                            <Pressable style={estilos.botonAgregar}>
                                <Text style={estilos.botonAgregarTexto}>+</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />
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
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e2dc',
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
        aspectRatio: 1,
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
        color: '#1c1c18',
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
});
