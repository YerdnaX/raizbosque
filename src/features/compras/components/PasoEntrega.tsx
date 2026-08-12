import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { COLORES } from '@/constants/colores';
import SelectorUbicacion from '../../ubicaciones/components/SelectorUbicacion';
import type { Usuario } from '../../auth/types/usuario';
import type { MetodoEntrega, SeleccionUbicacion } from '../types/checkoutEstado';

type Props = {
    usuario: Usuario;
    metodoEntrega: MetodoEntrega;
    onCambiarMetodoEntrega: (metodo: MetodoEntrega) => void;
    telefono: string;
    onCambiarTelefono: (telefono: string) => void;
    telefonoYaRegistrado: boolean;
    usarDireccionGuardada: boolean;
    onCambiarUsarDireccionGuardada: (usar: boolean) => void;
    ubicacionSeleccion: SeleccionUbicacion;
    onCambiarUbicacion: (seleccion: SeleccionUbicacion) => void;
    direccionExacta: string;
    onCambiarDireccionExacta: (direccion: string) => void;
    error: string;
    onContinuar: () => void;
};

export function PasoEntrega({
    usuario,
    metodoEntrega,
    onCambiarMetodoEntrega,
    telefono,
    onCambiarTelefono,
    telefonoYaRegistrado,
    usarDireccionGuardada,
    onCambiarUsarDireccionGuardada,
    ubicacionSeleccion,
    onCambiarUbicacion,
    direccionExacta,
    onCambiarDireccionExacta,
    error,
    onContinuar,
}: Props) {
    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.pregunta}>¿Cómo querés recibir tu pedido?</Text>

            <Pressable
                style={[estilos.opcion, metodoEntrega === 'Tienda' && estilos.opcionActiva]}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={() => onCambiarMetodoEntrega('Tienda')}
            >
                <View style={estilos.opcionIzq}>
                    <SymbolView name="storefront.fill" size={22} tintColor={metodoEntrega === 'Tienda' ? COLORES.esmeraldaTinta : '#737973'} />
                    <View>
                        <Text style={[estilos.opcionNombre, metodoEntrega === 'Tienda' && estilos.opcionNombreActivo]}>
                            Retiro en tienda
                        </Text>
                        <Text style={estilos.opcionDetalle}>Recogelo en RaízBosque · listo en 1 hora</Text>
                    </View>
                </View>
                <View style={[estilos.radio, metodoEntrega === 'Tienda' && estilos.radioActivo]}>
                    {metodoEntrega === 'Tienda' && <View style={estilos.radioPunto} />}
                </View>
            </Pressable>

            <Pressable
                style={[estilos.opcion, metodoEntrega === 'Domicilio' && estilos.opcionActiva]}
                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                onPress={() => onCambiarMetodoEntrega('Domicilio')}
            >
                <View style={estilos.opcionIzq}>
                    <SymbolView name="truck.box.fill" size={22} tintColor={metodoEntrega === 'Domicilio' ? COLORES.esmeraldaTinta : '#737973'} />
                    <View>
                        <Text style={[estilos.opcionNombre, metodoEntrega === 'Domicilio' && estilos.opcionNombreActivo]}>
                            Envío a domicilio
                        </Text>
                        <Text style={estilos.opcionDetalle}>Lo llevamos hasta vos</Text>
                    </View>
                </View>
                <View style={[estilos.radio, metodoEntrega === 'Domicilio' && estilos.radioActivo]}>
                    {metodoEntrega === 'Domicilio' && <View style={estilos.radioPunto} />}
                </View>
            </Pressable>

            {metodoEntrega === 'Domicilio' && (
                <View style={estilos.seccionDireccion}>
                    <Text style={estilos.subpregunta}>¿Dónde lo entregamos?</Text>
                    {usuario.Direccion ? (
                        <>
                            <Pressable
                                style={estilos.opcionDireccion}
                                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                onPress={() => onCambiarUsarDireccionGuardada(true)}
                            >
                                <View style={[estilos.radio, usarDireccionGuardada && estilos.radioActivo]}>
                                    {usarDireccionGuardada && <View style={estilos.radioPunto} />}
                                </View>
                                <View style={estilos.opcionDireccionInfo}>
                                    <Text style={estilos.opcionDireccionTitulo}>Tu dirección guardada</Text>
                                    <Text style={estilos.opcionDireccionTexto}>{usuario.Direccion}</Text>
                                </View>
                            </Pressable>

                            <Pressable
                                style={estilos.opcionDireccion}
                                android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                                onPress={() => onCambiarUsarDireccionGuardada(false)}
                            >
                                <View style={[estilos.radio, !usarDireccionGuardada && estilos.radioActivo]}>
                                    {!usarDireccionGuardada && <View style={estilos.radioPunto} />}
                                </View>
                                <Text style={estilos.opcionDireccionTitulo}>Usar otra dirección</Text>
                            </Pressable>

                            {!usarDireccionGuardada && (
                                <View style={{ marginTop: 8, gap: 10 }}>
                                    <SelectorUbicacion onCambio={onCambiarUbicacion} />
                                    {ubicacionSeleccion.completo && (
                                        <View style={estilos.campo}>
                                            <Text style={estilos.etiqueta}>Dirección exacta</Text>
                                            <TextInput
                                                style={estilos.inputContenedor}
                                                value={direccionExacta}
                                                onChangeText={onCambiarDireccionExacta}
                                                placeholder="Ej. 200 metros norte de la iglesia"
                                                placeholderTextColor="#b0b0a8"
                                                multiline
                                            />
                                        </View>
                                    )}
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={{ gap: 10 }}>
                            <SelectorUbicacion onCambio={onCambiarUbicacion} />
                            {ubicacionSeleccion.completo && (
                                <View style={estilos.campo}>
                                    <Text style={estilos.etiqueta}>Dirección exacta</Text>
                                    <TextInput
                                        style={estilos.inputContenedor}
                                        value={direccionExacta}
                                        onChangeText={onCambiarDireccionExacta}
                                        placeholder="Ej. 200 metros norte de la iglesia"
                                        placeholderTextColor="#b0b0a8"
                                        multiline
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}

            {!telefonoYaRegistrado && (
                <View style={estilos.campo}>
                    <Text style={estilos.etiqueta}>¿A qué número te contactamos?</Text>
                    <TextInput
                        style={estilos.inputContenedor}
                        value={telefono}
                        onChangeText={onCambiarTelefono}
                        placeholder="Ej. 8888-8888"
                        placeholderTextColor="#b0b0a8"
                        keyboardType="phone-pad"
                    />
                </View>
            )}

            {!!error && (
                <View style={estilos.error}>
                    <Text style={estilos.errorTexto}>{error}</Text>
                </View>
            )}

            <Pressable
                style={estilos.botonContinuar}
                android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                onPress={onContinuar}
            >
                <Text style={estilos.botonContinuarTexto}>Continuar al pago</Text>
            </Pressable>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { padding: 20, gap: 14 },
    pregunta: { fontSize: 18, fontWeight: '700', color: '#1c1c18', marginBottom: 2 },
    subpregunta: { fontSize: 14, fontWeight: '600', color: '#1c1c18' },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#c3c8c1',
        borderRadius: 12,
        padding: 14,
        gap: 12,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
    },
    opcionActiva: {
        borderColor: COLORES.esmeraldaTinta,
        backgroundColor: '#f0f5ee',
    },
    opcionIzq: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    opcionNombre: { fontSize: 15, fontWeight: '600', color: '#737973' },
    opcionNombreActivo: { color: COLORES.esmeraldaTinta },
    opcionDetalle: { fontSize: 12, color: '#9ca09a', marginTop: 2 },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: '#c3c8c1', justifyContent: 'center', alignItems: 'center',
    },
    radioActivo: { borderColor: COLORES.esmeraldaTinta },
    radioPunto: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORES.esmeraldaTinta },
    seccionDireccion: {
        gap: 10,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e2dc',
        padding: 14,
    },
    opcionDireccion: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
    opcionDireccionInfo: { flex: 1, gap: 2 },
    opcionDireccionTitulo: { fontSize: 13, fontWeight: '600', color: '#1c1c18' },
    opcionDireccionTexto: { fontSize: 12, color: '#737973', lineHeight: 17 },
    campo: { gap: 6 },
    etiqueta: { fontSize: 12, color: '#737973', fontWeight: '500' },
    inputContenedor: {
        borderWidth: 1, borderColor: '#c3c8c1', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1c1c18', backgroundColor: '#ffffff',
    },
    error: {
        backgroundColor: '#ffdad6',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ba1a1a',
    },
    errorTexto: { fontSize: 13, color: '#93000a', fontWeight: '600' },
    botonContinuar: {
        backgroundColor: COLORES.esmeraldaTinta,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
        overflow: 'hidden',
    },
    botonContinuarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
