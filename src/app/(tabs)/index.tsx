import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, ActivityIndicator, ImageBackground, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';
import RestauranteIcono from '@/assets/icons/bottomBar/restaurante.svg';
import ViveroIcono from '@/assets/icons/bottomBar/vivero.svg';
import JardinIcono from '@/assets/icons/bottomBar/mi-jardin.svg';
import PerfilIcono from '@/assets/icons/bottomBar/perfil.svg';
import ProductosIcono from '@/assets/icons/bottomBar/productos.svg';
import { useInicio } from '../../features/inicio/hooks/useInicio';
import { urlImagen } from '../../utils/urlImagen';
import { useCarrito } from '../../context/CarritoContext';
import { useUsuario } from '../../context/UsuarioContext';
import type { Reservacion } from '../../features/reservaciones/types/reservacion';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatearFechaReserva(fechaISO: string, hora: string): string {
    const [, mes, dia] = fechaISO.split('-');
    return `${parseInt(dia)} ${MESES[parseInt(mes) - 1]} · ${hora} Hrs`;
}

const ESTADO_COLOR: Record<string, { fondo: string; texto: string }> = {
    Pendiente:  { fondo: '#fff3cd', texto: '#856404' },
    Confirmada: { fondo: '#d1e7dd', texto: '#0a3622' },
    Completada: { fondo: '#e5e2dc', texto: '#434843' },
    Cancelada:  { fondo: '#f8d7da', texto: '#842029' },
};

const SECCIONES = [
    { titulo: 'Restaurante', ruta: '/(tabs)/restaurante', Icono: RestauranteIcono },
    { titulo: 'Vivero',      ruta: '/(tabs)/vivero',      Icono: ViveroIcono      },
    { titulo: 'Mi Jardín',   ruta: '/(tabs)/jardin',      Icono: JardinIcono      },
    { titulo: 'Mi Perfil',   ruta: '/(tabs)/perfil',      Icono: PerfilIcono      },
    { titulo: 'Productos',    ruta: '/(tabs)/productos',    Icono: ProductosIcono },
];

export default function Inicio() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;
    const { plantaDelMes, platoDelDia, proximasReservaciones, estaCargando, error } = useInicio();
    const { totalItems } = useCarrito();
    const { usuario } = useUsuario();

    return (
        <View style={estilos.contenedor}>
            <ImageBackground
                source={require('@/assets/images/login/topBar.png')}
                style={[estilos.encabezado, { paddingTop: insets.top }]}
                resizeMode="cover"
            >
                <Pressable style={estilos.botonEncabezado} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}>
                    <SymbolView name="line.3.horizontal" size={24} tintColor="#1b3022" />
                </Pressable>
                <Text style={estilos.encabezadoTitulo}>Inicio</Text>
                <Pressable style={estilos.botonCarrito} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.push('/carrito')}>
                    <View>
                        <CarritoIcono width={30} height={30} fill="#1b3022" />
                        {totalItems > 0 && (
                            <View style={estilos.badge}>
                                <Text style={estilos.badgeTexto}>{totalItems > 9 ? '9+' : totalItems}</Text>
                            </View>
                        )}
                    </View>
                </Pressable>
            </ImageBackground>

            <ScrollView
                contentContainerStyle={estilos.scroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.saludoSeccion}>
                    <Text style={[estilos.saludoTitulo, esHorizontal && { fontSize: 20 }]}>
                        {usuario ? `¡Hola, ${usuario.Nombre}!` : '¡Bienvenido!'}
                    </Text>
                    <Text style={estilos.saludoSubtitulo}>Descubre lo que Raíces tiene para vos hoy.</Text>
                </View>

                {/* Planta del Mes */}
                <View style={estilos.seccion}>
                    <Text style={estilos.seccionTitulo}>🌿 Planta del Mes 🌿</Text>
                    {estaCargando ? (
                        <View style={estilos.tarjetaCargando}>
                            <ActivityIndicator size="large" color="#1b3022" />
                        </View>
                    ) : error || !plantaDelMes ? (
                        <View style={estilos.tarjetaCargando}>
                            <Text style={estilos.errorTexto}>
                                {error ?? 'No hay planta del mes disponible.'}
                            </Text>
                        </View>
                    ) : (
                        <View style={estilos.tarjetaPlanta}>
                            <View style={[estilos.imagenDestacada, esHorizontal && { height: 110 }]}>
                                {urlImagen(plantaDelMes.Imagen) ? (
                                    <Image source={{ uri: urlImagen(plantaDelMes.Imagen)! }} style={estilos.imagen} />
                                ) : null}
                            </View>
                            <View style={estilos.infoPlanta}>
                                <Text style={estilos.nombrePlanta}>{plantaDelMes.Nombre}</Text>
                                {plantaDelMes.Descripcion && (
                                    <Text style={estilos.descripcionPlanta}>{plantaDelMes.Descripcion}</Text>
                                )}
                                {plantaDelMes.FrecuenciaRiego && (
                                    <View style={estilos.riegoFila}>
                                        <SymbolView name="drop.fill" size={13} tintColor="#526349" />
                                        <Text style={estilos.riegoTexto}>Riego {plantaDelMes.FrecuenciaRiego}</Text>
                                    </View>
                                )}
                                <View style={estilos.precioFila}>
                                    <Text style={estilos.precio}>₡{plantaDelMes.Precio.toLocaleString('es-CR')}</Text>
                                    <Pressable
                                        style={estilos.botonVerMas}
                                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                        onPress={() => router.navigate('/(tabs)/vivero')}
                                    >
                                        <Text style={estilos.botonVerMasTexto}>Ver en Vivero</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Plato del Día */}
                <View style={estilos.seccion}>
                    <Text style={estilos.seccionTitulo}>🍽️ Plato del Día</Text>
                    {estaCargando ? (
                        <View style={estilos.tarjetaCargando}>
                            <ActivityIndicator size="large" color="#1b3022" />
                        </View>
                    ) : !platoDelDia ? (
                        <View style={estilos.tarjetaCargando}>
                            <Text style={estilos.errorTexto}>No hay plato del día disponible.</Text>
                        </View>
                    ) : (
                        <View style={estilos.tarjetaPlato}>
                            <View style={[estilos.imagenDestacada, esHorizontal && { height: 110 }]}>
                                {urlImagen(platoDelDia.Imagen) ? (
                                    <Image source={{ uri: urlImagen(platoDelDia.Imagen)! }} style={estilos.imagen} />
                                ) : null}
                            </View>
                            <View style={estilos.infoPlanta}>
                                <View style={estilos.tagCategoria}>
                                    <Text style={estilos.tagCategoriaTexto}>{platoDelDia.NombreCategoria}</Text>
                                </View>
                                <Text style={estilos.nombrePlanta}>{platoDelDia.Nombre}</Text>
                                {platoDelDia.Descripcion && (
                                    <Text style={estilos.descripcionPlanta} numberOfLines={2}>
                                        {platoDelDia.Descripcion}
                                    </Text>
                                )}
                                <View style={estilos.precioFila}>
                                    <Text style={estilos.precio}>₡{platoDelDia.Precio.toLocaleString('es-CR')}</Text>
                                    <Pressable
                                        style={[estilos.botonVerMas, { backgroundColor: '#526349' }]}
                                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                        onPress={() => router.navigate('/(tabs)/restaurante')}
                                    >
                                        <Text style={estilos.botonVerMasTexto}>Ver Menú</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Próximas Reservaciones */}
                {usuario && (
                    <View style={estilos.seccion}>
                        <View style={estilos.seccionEncabezado}>
                            <Text style={estilos.seccionTitulo}>📅 Próximas Reservaciones</Text>
                            <Pressable
                                android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                                onPress={() => router.push('/reservaciones')}
                            >
                                <Text style={estilos.verTodas}>Ver todas</Text>
                            </Pressable>
                        </View>

                        {proximasReservaciones.length === 0 ? (
                            <Pressable
                                style={estilos.tarjetaVaciaReserva}
                                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                onPress={() => router.push('/nueva-reservacion')}
                            >
                                <SymbolView name="calendar.badge.plus" size={28} tintColor="#9ca09a" />
                                <Text style={estilos.reservaVaciaTexto}>Sin reservaciones próximas</Text>
                                <Text style={estilos.reservaVaciaSubtexto}>Toca para crear una</Text>
                            </Pressable>
                        ) : (
                            <View style={estilos.listaReservas}>
                                {proximasReservaciones.map(r => (
                                    <TarjetaReserva key={r.IdReservacion} reservacion={r} />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Explorar */}
                <View style={estilos.seccion}>
                    <Text style={estilos.seccionTitulo}>Explorar</Text>
                    <View style={estilos.cuadricula}>
                        {SECCIONES.map((seccion) => (
                            <Pressable
                                key={seccion.titulo}
                                style={[estilos.celdaCuadricula, esHorizontal && { width: '23%', aspectRatio: 1.2 }]}
                                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                onPress={() => router.navigate(seccion.ruta as any)}
                            >
                                <seccion.Icono width="100%" height="100%" fill="#1b3022" />
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function TarjetaReserva({ reservacion }: { reservacion: Reservacion }) {
    const config = ESTADO_COLOR[reservacion.Estado] ?? { fondo: '#e5e2dc', texto: '#434843' };
    return (
        <View style={estilos.tarjetaReserva}>
            <View style={estilos.reservaFila}>
                <SymbolView name="calendar" size={16} tintColor="#526349" />
                <Text style={estilos.reservaFechaTexto}>
                    {formatearFechaReserva(reservacion.FechaReservacion, reservacion.HoraReservacion)}
                </Text>
            </View>
            <View style={estilos.reservaFila}>
                <SymbolView name="person.2" size={16} tintColor="#526349" />
                <Text style={estilos.reservaPersonasTexto}>
                    {reservacion.CantidadPersonas} persona{reservacion.CantidadPersonas !== 1 ? 's' : ''}
                </Text>
                <View style={[estilos.estadoBadge, { backgroundColor: config.fondo }]}>
                    <Text style={[estilos.estadoBadgeTexto, { color: config.texto }]}>
                        {reservacion.Estado}
                    </Text>
                </View>
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
    botonEncabezado: {
        padding: 4,
    },
    encabezadoTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
        letterSpacing: 1,
    },
    botonCarrito: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#1b3022',
        borderRadius: 999,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    badgeTexto: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
        lineHeight: 12,
    },
    scroll: {
        padding: 20,
        gap: 24,
    },
    saludoSeccion: {
        gap: 4,
    },
    saludoTitulo: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1c1c18',
    },
    saludoSubtitulo: {
        fontSize: 14,
        color: '#737973',
    },
    seccion: {
        gap: 12,
    },
    seccionEncabezado: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    seccionTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
    },
    verTodas: {
        fontSize: 13,
        color: '#526349',
        fontWeight: '600',
    },
    tarjetaCargando: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    errorTexto: {
        fontSize: 14,
        color: '#737973',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    tarjetaPlanta: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    tarjetaPlato: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    imagenDestacada: {
        backgroundColor: '#e5e2dc',
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoPlanta: {
        padding: 16,
        gap: 8,
    },
    tagCategoria: {
        alignSelf: 'flex-start',
        backgroundColor: '#e8f0e5',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    tagCategoriaTexto: {
        fontSize: 12,
        color: '#526349',
        fontWeight: '600',
    },
    nombrePlanta: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1c1c18',
    },
    descripcionPlanta: {
        fontSize: 13,
        color: '#737973',
        lineHeight: 18,
    },
    riegoFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    riegoTexto: {
        fontSize: 13,
        color: '#526349',
    },
    precioFila: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    precio: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1c1c18',
    },
    botonVerMas: {
        backgroundColor: '#1b3022',
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 20,
        overflow: 'hidden',
    },
    botonVerMasTexto: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
    },
    // Reservaciones
    listaReservas: {
        gap: 10,
    },
    tarjetaReserva: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        gap: 8,
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    reservaFila: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reservaFechaTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1c1c18',
        flex: 1,
    },
    reservaPersonasTexto: {
        fontSize: 13,
        color: '#434843',
        flex: 1,
    },
    estadoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    estadoBadgeTexto: {
        fontSize: 11,
        fontWeight: '600',
    },
    tarjetaVaciaReserva: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        gap: 6,
        overflow: 'hidden',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    reservaVaciaTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#434843',
    },
    reservaVaciaSubtexto: {
        fontSize: 12,
        color: '#9ca09a',
    },
    // Explorar
    cuadricula: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    celdaCuadricula: {
        width: '47.5%',
        aspectRatio: 1,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        padding: 35,
    },
    imagen: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
});
