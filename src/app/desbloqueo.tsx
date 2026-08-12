import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useUsuario } from '../context/UsuarioContext';
import { useIdioma } from '../context/IdiomaContext';
import { useBiometria } from '../features/auth/hooks/useBiometria';
import { SimboloBrote } from '../features/bienvenida/components/SimboloBrote';
import { COLORES } from '../constants/colores';

// Puerta de reingreso rápido: se muestra en vez de entrar en silencio cuando
// el usuario activó biometría. Nunca reemplaza el login normal: si falla,
// se cancela, o el dispositivo ya no soporta biometría, cae a /login.
export default function Desbloqueo() {
    const insets = useSafeAreaInsets();
    const { usuario, estaHidratando } = useUsuario();
    const { t } = useIdioma();
    const bio = useBiometria();
    const [intentando, setIntentando] = useState(false);
    const [fallo, setFallo] = useState(false);
    const yaIntento = useRef(false);

    function irALogin() {
        router.replace('/login');
    }

    async function intentar() {
        setIntentando(true);
        setFallo(false);
        const exito = await bio.autenticar();
        setIntentando(false);
        if (exito) {
            router.replace('/bienvenida');
        } else {
            setFallo(true);
        }
    }

    useEffect(() => {
        if (bio.cargando || estaHidratando) return;

        // Si ya no hay sesión o el dispositivo dejó de soportar biometría,
        // no tiene sentido mostrar esta pantalla: al login normal, sin errores.
        if (!usuario || !bio.listaParaUsar) {
            irALogin();
            return;
        }

        if (!yaIntento.current) {
            yaIntento.current = true;
            intentar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bio.cargando, bio.listaParaUsar, estaHidratando, usuario]);

    return (
        <View style={[estilos.contenedor, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <SimboloBrote tamano={64} color={COLORES.champan} />

            <Text style={estilos.titulo}>{t('biometria.desbloqueoTitulo')}</Text>
            <Text style={estilos.subtitulo}>{t('biometria.desbloqueoSubtitulo')}</Text>

            {intentando ? (
                <ActivityIndicator color={COLORES.champan} style={{ marginTop: 28 }} />
            ) : fallo ? (
                <View style={estilos.falloBloque}>
                    <Text style={estilos.falloTitulo}>{t('biometria.fallidoTitulo')}</Text>
                    <Text style={estilos.falloTexto}>{t('biometria.fallidoMensaje')}</Text>

                    <Pressable style={estilos.botonPrincipal} onPress={intentar}>
                        <SymbolView name="lock.shield" size={18} tintColor={COLORES.esmeraldaTinta} />
                        <Text style={estilos.botonPrincipalTexto}>{bio.etiqueta}</Text>
                    </Pressable>

                    <Pressable style={estilos.botonSecundario} onPress={irALogin}>
                        <Text style={estilos.botonSecundarioTexto}>{t('biometria.usarContrasena')}</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable style={estilos.botonSecundario} onPress={irALogin}>
                    <Text style={estilos.botonSecundarioTexto}>{t('biometria.usarContrasena')}</Text>
                </Pressable>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: COLORES.esmeraldaTinta,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 8,
    },
    titulo: {
        marginTop: 24,
        fontSize: 22,
        fontWeight: '700',
        color: COLORES.champan,
        textAlign: 'center',
    },
    subtitulo: {
        fontSize: 14,
        color: COLORES.champan,
        opacity: 0.85,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },
    falloBloque: {
        alignItems: 'center',
        marginTop: 20,
        gap: 10,
        width: '100%',
    },
    falloTitulo: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORES.champan,
        textAlign: 'center',
    },
    falloTexto: {
        fontSize: 13,
        color: COLORES.champan,
        opacity: 0.85,
        textAlign: 'center',
        marginBottom: 8,
    },
    botonPrincipal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: COLORES.champan,
        borderRadius: 999,
        paddingVertical: 14,
        paddingHorizontal: 28,
        width: '100%',
    },
    botonPrincipalTexto: {
        color: COLORES.esmeraldaTinta,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    botonSecundario: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    botonSecundarioTexto: {
        color: COLORES.champan,
        fontSize: 13,
        fontWeight: '500',
        textDecorationLine: 'underline',
        opacity: 0.9,
    },
});
