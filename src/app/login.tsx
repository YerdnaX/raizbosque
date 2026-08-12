import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { login, verificarCodigo2FALogin } from "../features/auth/services/authService";
import { useUsuario } from "../context/UsuarioContext";
import { useIdioma } from "../context/IdiomaContext";
import { useBiometria } from "../features/auth/hooks/useBiometria";
import { COLORES } from "../constants/colores";
import type { Usuario } from "../features/auth/types/usuario";

export default function Login() {
    const { t } = useIdioma();
    const [identificador, setIdentificador] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [estaCargando, setEstaCargando] = useState(false);
    const [error, setError] = useState('');
    const insets = useSafeAreaInsets();
    const { usuario, guardarUsuario } = useUsuario();
    const bio = useBiometria();
    const [entrandoConBiometria, setEntrandoConBiometria] = useState(false);
    const [mostrarActivarBiometria, setMostrarActivarBiometria] = useState(false);

    // Estado para el paso de 2FA
    const [userId2FA, setUserId2FA] = useState<number | null>(null);
    const [codigo2FA, setCodigo2FA] = useState('');
    const [cargando2FA, setCargando2FA] = useState(false);
    const [error2FA, setError2FA] = useState('');

    // Tras un login normal exitoso: si el dispositivo soporta biometría y el
    // usuario nunca respondió, ofrecerla antes de continuar a Home.
    function completarLogin(usuarioLogueado: Usuario) {
        guardarUsuario(usuarioLogueado);
        if (bio.disponible && !bio.habilitada && !bio.yaPreguntada) {
            setMostrarActivarBiometria(true);
            return;
        }
        router.replace('/bienvenida' as any);
    }

    async function confirmarActivarBiometria() {
        await bio.habilitar();
        setMostrarActivarBiometria(false);
        router.replace('/bienvenida' as any);
    }

    async function declinarActivarBiometria() {
        await bio.declinarPregunta();
        setMostrarActivarBiometria(false);
        router.replace('/bienvenida' as any);
    }

    async function manejarLoginBiometrico() {
        setError('');
        setEntrandoConBiometria(true);
        const exito = await bio.autenticar();
        setEntrandoConBiometria(false);
        if (exito) {
            router.replace('/bienvenida' as any);
        } else {
            setError(t('biometria.fallidoMensaje'));
        }
    }

    async function manejarLogin() {
        setError('');
        if (!identificador || !contrasena) {
            setError(t('auth.login.errors.incompleteFields'));
            return;
        }

        setEstaCargando(true);
        try {
            const resultado = await login(identificador, contrasena);
            if (resultado.requires2FA) {
                setUserId2FA(resultado.userId);
            } else {
                completarLogin(resultado.usuario);
            }
        } catch (error: any) {
            const cod = error?.response?.data?.codigo;
            const status = error?.response?.status;
            if (cod === 'ACCOUNT_LOCKED') {
                router.push('/cuenta-bloqueada' as any);
            } else if (cod === 'PASSWORD_EXPIRED') {
                const correo = error?.response?.data?.correo ?? '';
                router.push({ pathname: '/contrasena-vencida' as any, params: { correo } });
            } else if (status === 401 || cod === 'INVALID_CREDENTIALS') {
                setError(t('auth.login.errors.invalidCredentials'));
            } else {
                setError(t('auth.login.errors.generic'));
            }
        } finally {
            setEstaCargando(false);
        }
    }

    async function manejarVerificar2FA() {
        setError2FA('');
        if (!codigo2FA || codigo2FA.length !== 6) {
            setError2FA(t('auth.login.errors.codeRequired'));
            return;
        }
        setCargando2FA(true);
        try {
            const usuarioVerificado = await verificarCodigo2FALogin(userId2FA!, codigo2FA);
            setUserId2FA(null);
            completarLogin(usuarioVerificado);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_2FA_CODE') {
                setError2FA(t('auth.login.errors.invalidCode'));
            } else {
                setError2FA(t('auth.login.errors.verifyGeneric'));
            }
        } finally {
            setCargando2FA(false);
        }
    }

    function cancelar2FA() {
        setUserId2FA(null);
        setCodigo2FA('');
        setError2FA('');
    }

    return (
        <ImageBackground
            source={require('@/assets/images/login/inicio.png')}
            style={estilos.fondo}
            resizeMode="cover"
        >
            <ScrollView
                contentContainerStyle={[estilos.contenedor, { paddingTop: Math.max(20, insets.top) }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={estilos.tarjeta}>
                    <Text style={estilos.titulo}>RAÍCES BOSQUE</Text>
                    <Text style={estilos.subtitulo}>{t('auth.login.title')}</Text>

                    {bio.listaParaUsar && usuario && (
                        <>
                            <Pressable
                                style={[estilos.botonBiometria, entrandoConBiometria && { opacity: 0.7 }]}
                                android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                onPress={manejarLoginBiometrico}
                                disabled={entrandoConBiometria}
                                accessibilityRole="button"
                                accessibilityLabel={bio.etiqueta}
                            >
                                {entrandoConBiometria
                                    ? <ActivityIndicator color={COLORES.esmeraldaTinta} />
                                    : (
                                        <>
                                            <SymbolView name="lock.shield" size={18} tintColor={COLORES.esmeraldaTinta} />
                                            <Text style={estilos.botonBiometriaTexto}>{bio.etiqueta}</Text>
                                        </>
                                    )}
                            </Pressable>
                            <View style={estilos.separadorFila}>
                                <View style={estilos.separadorLinea} />
                                <Text style={estilos.separadorTexto}>{t('common.or')}</Text>
                                <View style={estilos.separadorLinea} />
                            </View>
                        </>
                    )}

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.login.emailOrUsernameLabel')}</Text>
                        <TextInput
                            style={[estilos.input, error ? estilos.inputError : null]}
                            value={identificador}
                            onChangeText={v => { setIdentificador(v); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder={t('auth.login.emailOrUsernamePlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>{t('auth.login.passwordLabel')}</Text>
                        <View style={[estilos.inputContrasena, error ? estilos.inputError : null]}>
                            <TextInput
                                style={estilos.inputDentro}
                                value={contrasena}
                                onChangeText={v => { setContrasena(v); setError(''); }}
                                secureTextEntry={!mostrarContrasena}
                                placeholderTextColor="#b0b0a8"
                            />
                            <Pressable android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                                <Text style={estilos.toggleContrasena}>
                                    {mostrarContrasena ? t('common.hide') : t('common.show')}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                    <View style={estilos.enlaces}>
                        <Pressable
                            android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                            onPress={() => router.push('/recuperar-contrasena' as any)}
                        >
                            <Text style={estilos.enlaceTexto}>{t('auth.login.forgotPassword')}</Text>
                        </Pressable>
                        <Pressable
                            android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }}
                            onPress={() => router.push('/recuperar-usuario' as any)}
                        >
                            <Text style={estilos.enlaceTexto}>{t('auth.login.forgotUsername')}</Text>
                        </Pressable>
                    </View>

                    <Pressable
                        style={[estilos.botonEntrar, estaCargando && { opacity: 0.7 }]}
                        android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                        onPress={manejarLogin}
                        disabled={estaCargando}
                    >
                        {estaCargando
                            ? <ActivityIndicator color="#ffffff" />
                            : <Text style={estilos.botonEntrarTexto}>{t('auth.login.submit')}</Text>
                        }
                    </Pressable>

                    <Pressable
                        style={estilos.botonRegistrarse}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => router.push('/registro' as any)}
                    >
                        <Text style={estilos.botonRegistrarseTexto}>{t('auth.login.registerCta')}</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modal de verificación 2FA */}
            <Modal
                visible={userId2FA !== null}
                transparent
                animationType="fade"
                onRequestClose={cancelar2FA}
            >
                <KeyboardAvoidingView
                    style={estilos.modalFondo}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={estilos.modalTarjeta}>
                        <Text style={estilos.modalTitulo}>{t('auth.login.twoFactorTitle')}</Text>
                        <Text style={estilos.modalSubtitulo}>
                            {t('auth.login.twoFactorSubtitle')}
                        </Text>

                        <TextInput
                            style={[estilos.input, estilos.inputCodigo, error2FA ? estilos.inputError : null]}
                            value={codigo2FA}
                            onChangeText={v => { setCodigo2FA(v.replace(/\D/g, '')); setError2FA(''); }}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder={t('common.codePlaceholder')}
                            placeholderTextColor="#b0b0a8"
                        />

                        {error2FA ? <Text style={estilos.mensajeError}>{error2FA}</Text> : null}

                        <Pressable
                            style={[estilos.botonEntrar, cargando2FA && { opacity: 0.7 }]}
                            android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                            onPress={manejarVerificar2FA}
                            disabled={cargando2FA}
                        >
                            {cargando2FA
                                ? <ActivityIndicator color="#ffffff" />
                                : <Text style={estilos.botonEntrarTexto}>{t('auth.login.twoFactorVerify')}</Text>
                            }
                        </Pressable>

                        <Pressable
                            style={estilos.botonRegistrarse}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                            onPress={cancelar2FA}
                        >
                            <Text style={estilos.botonRegistrarseTexto}>{t('auth.login.twoFactorCancel')}</Text>
                        </Pressable>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Oferta discreta de activar biometría tras el primer login exitoso */}
            <Modal
                visible={mostrarActivarBiometria}
                transparent
                animationType="fade"
                onRequestClose={declinarActivarBiometria}
            >
                <View style={estilos.modalFondo}>
                    <View style={estilos.modalTarjeta}>
                        <SymbolView name="lock.shield" size={28} tintColor={COLORES.esmeraldaTinta} style={{ alignSelf: 'center', marginBottom: 12 }} />
                        <Text style={estilos.modalTitulo}>{t('biometria.activarPreguntaTitulo')}</Text>

                        <Pressable
                            style={estilos.botonEntrar}
                            android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                            onPress={confirmarActivarBiometria}
                        >
                            <Text style={estilos.botonEntrarTexto}>{t('biometria.activar')}</Text>
                        </Pressable>

                        <Pressable
                            style={estilos.botonRegistrarse}
                            android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                            onPress={declinarActivarBiometria}
                        >
                            <Text style={estilos.botonRegistrarseTexto}>{t('biometria.ahoraNo')}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const estilos = StyleSheet.create({
    fondo: { flex: 1 },
    contenedor: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 30,
        width: '85%',
        shadowColor: '#1b3022',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    titulo: { fontSize: 32, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 20 },
    subtitulo: { fontSize: 18, fontWeight: '600', color: '#1c1c18', textAlign: 'center', marginBottom: 20 },
    campo: { marginBottom: 16 },
    etiqueta: { alignSelf: 'center', fontSize: 16, fontWeight: '500', color: '#434843', marginBottom: 8 },
    input: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1c1c18' },
    inputCodigo: { textAlign: 'center', letterSpacing: 4, fontSize: 22, marginBottom: 8 },
    inputError: { borderColor: '#ba1a1a' },
    inputContrasena: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12 },
    inputDentro: { flex: 1, fontSize: 16, color: '#1c1c18', paddingVertical: 0 },
    toggleContrasena: { fontSize: 13, color: '#737973' },
    mensajeError: { fontSize: 13, color: '#ba1a1a', marginBottom: 8, textAlign: 'center' },
    enlaces: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
    enlaceTexto: { fontSize: 12, color: '#526349', textDecorationLine: 'underline' },
    botonEntrar: { backgroundColor: COLORES.esmeraldaTinta, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonEntrarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    botonRegistrarse: { borderWidth: 1.5, borderColor: COLORES.esmeraldaTinta, borderRadius: 999, paddingVertical: 16, alignItems: 'center', overflow: 'hidden' },
    botonRegistrarseTexto: { color: COLORES.esmeraldaTinta, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
    botonBiometria: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1.5, borderColor: COLORES.esmeraldaTinta, borderRadius: 999,
        paddingVertical: 14, marginBottom: 16, overflow: 'hidden',
    },
    botonBiometriaTexto: { color: COLORES.esmeraldaTinta, fontSize: 14, fontWeight: '600' },
    separadorFila: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    separadorLinea: { flex: 1, height: 1, backgroundColor: '#e5e2dc' },
    separadorTexto: { fontSize: 12, color: '#9ca09a' },
    // Modal 2FA
    modalFondo: { flex: 1, backgroundColor: 'rgba(27,48,34,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalTarjeta: { backgroundColor: '#ffffff', borderRadius: 24, padding: 28, width: '100%', shadowColor: '#1b3022', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
    modalTitulo: { fontSize: 20, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 10 },
    modalSubtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
});
