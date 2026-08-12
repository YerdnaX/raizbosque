import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRegistro } from '../../context/RegistroContext';
import { useIdioma } from '../../context/IdiomaContext';
import { BotonAtras } from '../../components/ui/BotonAtras';

export default function RegistroContacto() {
    const insets = useSafeAreaInsets();
    const { datos, setTelefono, setDireccion } = useRegistro();
    const { t } = useIdioma();
    const [telefono, setTelefonoLocal] = useState(datos.telefono);
    const [direccion, setDireccionLocal] = useState(datos.direccion);
    const [error, setError] = useState('');

    function manejarSiguiente() {
        setError('');
        if (!telefono) { setError(t('auth.register.contact.errors.phoneRequired')); return; }
        if (!/^\d{8}$/.test(telefono)) { setError(t('auth.register.contact.errors.phoneInvalid')); return; }
        setTelefono(telefono);
        setDireccion(direccion);
        router.push('/registro/contrasena');
    }

    return (
        <ImageBackground source={require('@/assets/images/login/inicio.png')} style={estilos.fondo} resizeMode="cover">
            <ScrollView contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]} keyboardShouldPersistTaps="handled">
                <View style={estilos.tarjeta}>
                    <Text style={estilos.paso}>{t('auth.register.step', { current: 6, total: 7 })}</Text>
                    <Text style={estilos.titulo}>{t('auth.register.contact.title')}</Text>
                    <Text style={estilos.subtitulo}>{t('auth.register.contact.subtitle')}</Text>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.register.contact.phoneLabel')} <Text style={estilos.req}>*</Text></Text>
                        <TextInput
                            style={estilos.input}
                            value={telefono}
                            onChangeText={v => { setTelefonoLocal(v.replace(/[^0-9]/g, '')); setError(''); }}
                            keyboardType="numeric"
                            maxLength={8}
                            placeholder={t('auth.register.contact.phonePlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.register.contact.addressLabel')}</Text>
                        <TextInput
                            style={[estilos.input, estilos.inputMultilinea]}
                            value={direccion}
                            onChangeText={setDireccionLocal}
                            multiline
                            numberOfLines={2}
                            placeholder={t('auth.register.contact.addressPlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <Pressable
                        style={estilos.boton}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarSiguiente}
                    >
                        <Text style={estilos.botonTexto}>{t('common.continue')}</Text>
                    </Pressable>

                    <BotonAtras variante="enlace" />
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: { backgroundColor: '#fff', borderRadius: 24, padding: 30, width: '85%', elevation: 4 },
    paso: { fontSize: 12, color: '#8da082', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
    titulo: { fontSize: 28, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 8 },
    subtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    campo: { marginBottom: 16 },
    etiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    req: { color: '#ba1a1a' },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputMultilinea: { borderRadius: 16, textAlignVertical: 'top', minHeight: 72 },
    mensajeError: { fontSize: 12, color: '#ba1a1a', marginBottom: 12 },
    boton: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    enlaceAtras: { alignItems: 'center' },
    enlaceAtrasTexto: { fontSize: 13, color: '#526349', textDecorationLine: 'underline' },
});
