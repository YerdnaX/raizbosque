import {
    View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, ImageBackground,
    Modal, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useUsuario } from "../../context/UsuarioContext";
import { useCarrito } from "../../context/CarritoContext";
import { useIdioma } from "../../context/IdiomaContext";
import { SelectorIdiomaFila } from "../../components/ui/SelectorIdioma";
import {
    iniciarConfiguracion2FA,
    verificarActivacion2FA,
    desactivar2FA,
} from "../../features/auth/services/authService";
import CarritoIcono from '@/assets/icons/bottomBar/carritocompra.svg';

type Opcion = { titulo: string; icono: string; ruta?: string };

type Fase =
    | null
    | 'elegir-metodo'        // selección: Google Auth o Personal
    | 'google-qr'            // muestra QR + clave manual + campo código
    | 'personal-instruccion' // instrucciones para abrir raizbosqueotp
    | 'desactivar';          // desactivar 2FA activo

export default function Perfil() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();
    const esHorizontal = width > height;
    const { usuario, cerrarSesion, actualizarTotp2FA } = useUsuario();
    const { totalItems } = useCarrito();
    const { t } = useIdioma();

    const opcionesExtras: Opcion[] = [
        { titulo: t('profile.changePassword'), icono: 'lock',     ruta: '/cambiar-contrasena' },
        { titulo: t('profile.reservations'),   icono: 'calendar', ruta: '/reservaciones' },
        { titulo: t('profile.purchaseHistory'), icono: 'bag',     ruta: '/historial' },
    ];

    // Modal 2FA
    const [fase, setFase] = useState<Fase>(null);
    const [qrImagen, setQrImagen] = useState('');
    const [claveManual, setClaveManual] = useState('');
    const [codigo, setCodigo] = useState('');
    const [contrasena2FA, setContrasena2FA] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [mostrarSelectorIdioma, setMostrarSelectorIdioma] = useState(false);

    const nombreCompleto = usuario ? [usuario.Nombre, usuario.Apellidos].filter(Boolean).join(' ') : '';
    const primeraLetra   = usuario?.Nombre?.[0]?.toUpperCase() ?? '?';
    const tieneTotp2FA   = usuario?.TieneTotp2FA ?? false;
    const metodo2FA      = usuario?.MetodoTotp2FA ?? null;

    function cerrarModal() {
        setFase(null); setQrImagen(''); setClaveManual('');
        setCodigo(''); setContrasena2FA(''); setError(''); setExito('');
    }

    function resetearEstado() {
        setCodigo(''); setContrasena2FA(''); setError(''); setExito('');
    }

    function manejarCerrarSesion() { cerrarSesion(); router.replace('/login'); }

    // ─── Activar 2FA ──────────────────────────────────────────────────────────

    async function elegirGoogleAuth() {
        resetearEstado();
        setCargando(true);
        try {
            const { qrImage, manualKey } = await iniciarConfiguracion2FA(usuario!.IdUsuario, 'GOOGLE_AUTHENTICATOR');
            setQrImagen(qrImage ?? '');
            setClaveManual(manualKey ?? '');
            setFase('google-qr');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === '2FA_YA_ACTIVO') setError(t('profile.twoFactorModal.errors.alreadyActive'));
            else setError(t('profile.twoFactorModal.errors.startFailed'));
            setFase('elegir-metodo');
        } finally { setCargando(false); }
    }

    async function elegirPersonalAuth() {
        resetearEstado();
        setCargando(true);
        try {
            await iniciarConfiguracion2FA(usuario!.IdUsuario, 'PERSONAL_AUTHENTICATOR');
            setFase('personal-instruccion');
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === '2FA_YA_ACTIVO') setError(t('profile.twoFactorModal.errors.alreadyActive'));
            else setError(t('profile.twoFactorModal.errors.startFailed'));
            setFase('elegir-metodo');
        } finally { setCargando(false); }
    }

    async function manejarVerificarActivacion() {
        setError('');
        if (!codigo || codigo.length !== 6) { setError(t('profile.twoFactorModal.errors.codeRequired')); return; }
        setCargando(true);
        try {
            await verificarActivacion2FA(usuario!.IdUsuario, codigo);
            actualizarTotp2FA(true);
            setExito(t('profile.twoFactorModal.activatedSuccess'));
            setTimeout(cerrarModal, 1800);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_2FA_CODE') setError(t('profile.twoFactorModal.errors.invalidCode'));
            else setError(t('profile.twoFactorModal.errors.activateFailed'));
        } finally { setCargando(false); }
    }

    // ─── Desactivar 2FA ───────────────────────────────────────────────────────

    async function manejarDesactivar() {
        setError('');
        if (!contrasena2FA) { setError(t('profile.twoFactorModal.errors.passwordRequired')); return; }
        if (!codigo || codigo.length !== 6) { setError(t('profile.twoFactorModal.errors.authCodeRequired')); return; }
        setCargando(true);
        try {
            await desactivar2FA(usuario!.IdUsuario, contrasena2FA, codigo);
            actualizarTotp2FA(false);
            setExito(t('profile.twoFactorModal.deactivatedSuccess'));
            setTimeout(cerrarModal, 1800);
        } catch (e: any) {
            const cod = e?.response?.data?.codigo;
            if (cod === 'INVALID_2FA_CODE') setError(t('profile.twoFactorModal.errors.invalidOtpCode'));
            else if (cod === 'INVALID_CREDENTIALS') setError(t('profile.twoFactorModal.errors.wrongPassword'));
            else setError(t('profile.twoFactorModal.errors.deactivateFailed'));
        } finally { setCargando(false); }
    }

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
                <Text style={estilos.encabezadoTitulo}>{t('profile.headerTitle')}</Text>
                <Pressable style={estilos.botonEncabezado} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.push('/carrito')}>
                    <View>
                        <CarritoIcono width={30} height={30} fill="#1b3022" />
                        {totalItems > 0 && (
                            <View style={estilos.badge}><Text style={estilos.badgeTexto}>{totalItems > 9 ? '9+' : totalItems}</Text></View>
                        )}
                    </View>
                </Pressable>
            </ImageBackground>

            <ScrollView contentContainerStyle={estilos.scroll} showsVerticalScrollIndicator={false}>
                {/* ── Tarjeta de usuario ── */}
                <View style={estilos.tarjetaUsuario}>
                    <ImageBackground
                        source={require('@/assets/images/fotoperfil.png')}
                        style={[estilos.avatar, esHorizontal && { width: 64, height: 64 }]}
                        imageStyle={estilos.avatarImagen}
                        resizeMode="cover"
                    >
                        <Text style={[estilos.avatarLetra, esHorizontal && { fontSize: 26 }]}>{primeraLetra}</Text>
                    </ImageBackground>
                    <Text style={estilos.nombre}>{nombreCompleto}</Text>
                    <Text style={estilos.correo}>{usuario?.Correo ?? ''}</Text>
                    <Pressable style={estilos.botonEditar} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={() => router.push('/editar-perfil')}>
                        <Text style={estilos.botonEditarTexto}>{t('profile.editProfile')}</Text>
                    </Pressable>
                </View>

                {/* ── Opciones ── */}
                <View style={estilos.listaOpciones}>
                    {opcionesExtras.map((opcion) => (
                        <View key={opcion.titulo}>
                            <Pressable style={estilos.opcion} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={() => opcion.ruta ? router.push(opcion.ruta as any) : undefined}>
                                <SymbolView name={opcion.icono as any} size={22} tintColor="#434843" />
                                <Text style={estilos.opcionTexto}>{opcion.titulo}</Text>
                                <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                            </Pressable>
                            <View style={estilos.divisor} />
                        </View>
                    ))}

                    {/* Seguridad – 2FA */}
                    <Pressable
                        style={estilos.opcion}
                        android_ripple={{ color: 'rgba(0,0,0,0.10)' }}
                        onPress={() => { resetearEstado(); setFase(tieneTotp2FA ? 'desactivar' : 'elegir-metodo'); }}
                    >
                        <SymbolView name="lock.shield" size={22} tintColor="#434843" />
                        <View style={estilos.opcionConEstado}>
                            <Text style={estilos.opcionTexto}>{t('profile.twoFactor')}</Text>
                            <Text style={tieneTotp2FA ? estilos.estadoActivo : estilos.estadoInactivo}>
                                {tieneTotp2FA
                                    ? (metodo2FA === 'PERSONAL_AUTHENTICATOR' ? t('profile.twoFactorActivePersonal') : t('profile.twoFactorActiveGoogle'))
                                    : t('profile.twoFactorInactive')}
                            </Text>
                        </View>
                        <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                    </Pressable>
                    <View style={estilos.divisor} />

                    {/* Idioma */}
                    <SelectorIdiomaFila
                        visible={mostrarSelectorIdioma}
                        onAbrir={() => setMostrarSelectorIdioma(true)}
                        onCerrar={() => setMostrarSelectorIdioma(false)}
                    />
                </View>

                <Pressable style={estilos.botonCerrarSesion} android_ripple={{ color: 'rgba(0,0,0,0.10)' }} onPress={manejarCerrarSesion}>
                    <SymbolView name="rectangle.portrait.and.arrow.right" size={20} tintColor="#ba1a1a" />
                    <Text style={estilos.cerrarSesionTexto}>{t('profile.logout')}</Text>
                </Pressable>

                <Pressable style={estilos.botonAcercaDe} android_ripple={{ color: 'rgba(0,0,0,0.10)', borderless: true }} onPress={() => router.push('/acerca-de')}>
                    <Text style={estilos.acercaDeTexto}>{t('profile.madeWith')}</Text>
                </Pressable>
            </ScrollView>

            {/* ════════════════════ MODAL 2FA ════════════════════ */}
            <Modal visible={fase !== null} transparent animationType="slide" onRequestClose={cerrarModal}>
                <KeyboardAvoidingView style={estilos.modalFondo} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={estilos.modalTarjeta}>

                        {/* ─ Elegir método ─ */}
                        {fase === 'elegir-metodo' && (
                            <>
                                <Text style={estilos.modalTitulo}>{t('profile.twoFactorModal.chooseTitle')}</Text>
                                <Text style={estilos.modalSubtitulo}>{t('profile.twoFactorModal.chooseSubtitle')}</Text>
                                {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}

                                <Pressable
                                    style={[estilos.opcionMetodo, cargando && { opacity: 0.6 }]}
                                    android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                                    onPress={elegirGoogleAuth}
                                    disabled={cargando}
                                >
                                    <SymbolView name="qrcode" size={28} tintColor="#1b3022" />
                                    <View style={estilos.opcionMetodoTextos}>
                                        <Text style={estilos.opcionMetodoTitulo}>{t('profile.twoFactorModal.googleTitle')}</Text>
                                        <Text style={estilos.opcionMetodoSub}>{t('profile.twoFactorModal.googleSub')}</Text>
                                    </View>
                                    {cargando ? <ActivityIndicator color="#1b3022" size="small" /> : <SymbolView name="chevron.right" size={16} tintColor="#737973" />}
                                </Pressable>

                                <View style={estilos.divisor} />

                                <Pressable
                                    style={[estilos.opcionMetodo, cargando && { opacity: 0.6 }]}
                                    android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                                    onPress={elegirPersonalAuth}
                                    disabled={cargando}
                                >
                                    <SymbolView name="shield.checkered" size={28} tintColor="#1b3022" />
                                    <View style={estilos.opcionMetodoTextos}>
                                        <Text style={estilos.opcionMetodoTitulo}>{t('profile.twoFactorModal.personalTitle')}</Text>
                                        <Text style={estilos.opcionMetodoSub}>{t('profile.twoFactorModal.personalSub')}</Text>
                                    </View>
                                    <SymbolView name="chevron.right" size={16} tintColor="#737973" />
                                </Pressable>
                            </>
                        )}

                        {/* ─ QR de Google Auth ─ */}
                        {fase === 'google-qr' && (
                            <>
                                <Text style={estilos.modalTitulo}>{t('profile.twoFactorModal.googleSetupTitle')}</Text>
                                <Text style={estilos.modalSubtitulo}>
                                    {t('profile.twoFactorModal.googleSetupSubtitle')}
                                </Text>
                                {qrImagen ? (
                                    <View style={estilos.qrContenedor}>
                                        <Image source={{ uri: qrImagen }} style={estilos.qrImagen} resizeMode="contain" />
                                    </View>
                                ) : null}
                                {claveManual ? (
                                    <View style={estilos.claveManualContenedor}>
                                        <Text style={estilos.claveManualLabel}>{t('profile.twoFactorModal.manualKeyLabel')}</Text>
                                        <Text style={estilos.claveManualValor} selectable>{claveManual}</Text>
                                    </View>
                                ) : null}
                                {!exito && (
                                    <>
                                        <Text style={estilos.modalEtiqueta}>{t('profile.twoFactorModal.codeLabel')}</Text>
                                        <TextInput
                                            style={[estilos.inputCodigo, error ? estilos.inputCodigoError : null]}
                                            value={codigo}
                                            onChangeText={v => { setCodigo(v.replace(/\D/g, '')); setError(''); }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            placeholder={t('common.codePlaceholder')}
                                            placeholderTextColor="#b0b0a8"
                                        />
                                        {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}
                                        <Pressable
                                            style={[estilos.botonPrincipal, cargando && { opacity: 0.7 }]}
                                            android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                            onPress={manejarVerificarActivacion}
                                            disabled={cargando}
                                        >
                                            {cargando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={estilos.botonPrincipalTexto}>{t('profile.twoFactorModal.verifyAndActivate')}</Text>}
                                        </Pressable>
                                    </>
                                )}
                                {exito ? <Text style={estilos.textoExito}>{exito}</Text> : null}
                            </>
                        )}

                        {/* ─ Instrucciones Personal Auth ─ */}
                        {fase === 'personal-instruccion' && (
                            <>
                                <Text style={estilos.modalTitulo}>{t('profile.twoFactorModal.personalInstructionsTitle')}</Text>
                                <Text style={estilos.modalSubtitulo}>
                                    {t('profile.twoFactorModal.personalInstructionsSubtitle')}
                                </Text>
                                <View style={estilos.pasosList}>
                                    <Text style={estilos.paso}>{'1.'} {t('profile.twoFactorModal.step1', { app: t('profile.twoFactorModal.step1App') })}</Text>
                                    <Text style={estilos.paso}>{'2.'} {t('profile.twoFactorModal.step2')}</Text>
                                    <Text style={estilos.paso}>{'3.'} {t('profile.twoFactorModal.step3', { action: t('profile.twoFactorModal.step3Action') })}</Text>
                                    <Text style={estilos.paso}>{'4.'} {t('profile.twoFactorModal.step4')}</Text>
                                </View>
                            </>
                        )}

                        {/* ─ Desactivar ─ */}
                        {fase === 'desactivar' && (
                            <>
                                <Text style={estilos.modalTitulo}>{t('profile.twoFactorModal.deactivateTitle')}</Text>
                                <Text style={estilos.modalSubtitulo}>
                                    {t('profile.twoFactorModal.deactivateSubtitle')}
                                </Text>
                                {!exito && (
                                    <>
                                        <Text style={estilos.modalEtiqueta}>{t('profile.twoFactorModal.currentPasswordLabel')}</Text>
                                        <TextInput
                                            style={[estilos.inputContrasena, error ? estilos.inputCodigoError : null]}
                                            value={contrasena2FA}
                                            onChangeText={v => { setContrasena2FA(v); setError(''); }}
                                            secureTextEntry
                                            placeholder={t('profile.twoFactorModal.currentPasswordPlaceholder')}
                                            placeholderTextColor="#b0b0a8"
                                        />
                                        <Text style={[estilos.modalEtiqueta, { marginTop: 12 }]}>{t('profile.twoFactorModal.authenticatorCodeLabel')}</Text>
                                        <TextInput
                                            style={[estilos.inputCodigo, error ? estilos.inputCodigoError : null]}
                                            value={codigo}
                                            onChangeText={v => { setCodigo(v.replace(/\D/g, '')); setError(''); }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            placeholder={t('common.codePlaceholder')}
                                            placeholderTextColor="#b0b0a8"
                                        />
                                        {error ? <Text style={estilos.mensajeError}>{error}</Text> : null}
                                        <Pressable
                                            style={[estilos.botonDesactivar, cargando && { opacity: 0.7 }]}
                                            android_ripple={{ color: 'rgba(255,255,255,0.25)', foreground: true }}
                                            onPress={manejarDesactivar}
                                            disabled={cargando}
                                        >
                                            {cargando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={estilos.botonPrincipalTexto}>{t('profile.twoFactorModal.deactivate')}</Text>}
                                        </Pressable>
                                    </>
                                )}
                                {exito ? <Text style={estilos.textoExito}>{exito}</Text> : null}
                            </>
                        )}

                        {/* Cancelar siempre disponible */}
                        {!exito && (
                            <Pressable style={estilos.botonCancelarModal} android_ripple={{ color: 'rgba(0,0,0,0.08)' }} onPress={cerrarModal}>
                                <Text style={estilos.botonCancelarModalTexto}>{t('profile.twoFactorModal.cancel')}</Text>
                            </Pressable>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f0eee8' },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#c8d4c0' },
    botonEncabezado: { padding: 4 },
    encabezadoTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18', letterSpacing: 1 },
    scroll: { padding: 20, gap: 16 },
    tarjetaUsuario: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, shadowColor: '#1b3022', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    avatar: { width: 100, height: 100, borderRadius: 16, marginBottom: 4, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImagen: { borderRadius: 16 },
    avatarLetra: { fontSize: 42, fontWeight: '700', color: '#1b3022' },
    nombre: { fontSize: 18, fontWeight: '700', color: '#1c1c18', textAlign: 'center' },
    correo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 8 },
    botonEditar: { borderWidth: 1, borderColor: '#c3c8c1', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, overflow: 'hidden' },
    botonEditarTexto: { fontSize: 13, fontWeight: '600', color: '#1c1c18', letterSpacing: 0.5 },
    listaOpciones: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', shadowColor: '#1b3022', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    opcion: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 16 },
    opcionTexto: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1c1c18' },
    opcionConEstado: { flex: 1, gap: 2 },
    estadoActivo: { fontSize: 12, color: '#526349', fontWeight: '500' },
    estadoInactivo: { fontSize: 12, color: '#737973' },
    divisor: { height: 1, backgroundColor: '#f0eee8', marginLeft: 58 },
    botonCerrarSesion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#c3c8c1', borderRadius: 8, paddingVertical: 14, gap: 10, backgroundColor: '#ffffff', overflow: 'hidden' },
    cerrarSesionTexto: { fontSize: 15, fontWeight: '600', color: '#ba1a1a' },
    badge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#1b3022', borderRadius: 999, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3 },
    badgeTexto: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
    botonAcercaDe: { alignItems: 'center', paddingVertical: 8 },
    acercaDeTexto: { fontSize: 12, color: '#9ca09a' },
    // Modal
    modalFondo: { flex: 1, backgroundColor: 'rgba(27,48,34,0.55)', justifyContent: 'flex-end' },
    modalTarjeta: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 36, shadowColor: '#1b3022', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 12 },
    modalTitulo: { fontSize: 18, fontWeight: '700', color: '#1c1c18', textAlign: 'center', marginBottom: 10 },
    modalSubtitulo: { fontSize: 14, color: '#737973', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
    modalEtiqueta: { fontSize: 14, fontWeight: '500', color: '#434843', marginBottom: 8 },
    // Opciones de método
    opcionMetodo: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
    opcionMetodoTextos: { flex: 1 },
    opcionMetodoTitulo: { fontSize: 15, fontWeight: '600', color: '#1c1c18' },
    opcionMetodoSub: { fontSize: 12, color: '#737973', marginTop: 2, lineHeight: 16 },
    // QR
    qrContenedor: { alignItems: 'center', marginBottom: 12 },
    qrImagen: { width: 190, height: 190, borderRadius: 8 },
    claveManualContenedor: { backgroundColor: '#f0eee8', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center' },
    claveManualLabel: { fontSize: 11, color: '#737973', marginBottom: 4 },
    claveManualValor: { fontSize: 14, fontWeight: '700', color: '#1b3022', letterSpacing: 2 },
    // Inputs
    inputCodigo: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, fontSize: 24, color: '#1c1c18', textAlign: 'center', letterSpacing: 6, marginBottom: 8 },
    inputContrasena: { backgroundColor: '#fefcf8', borderColor: '#8da082', borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1c1c18', marginBottom: 8 },
    inputCodigoError: { borderColor: '#ba1a1a' },
    // Mensajes
    mensajeError: { fontSize: 13, color: '#ba1a1a', marginBottom: 12, textAlign: 'center' },
    textoExito: { fontSize: 15, color: '#526349', fontWeight: '600', textAlign: 'center', marginVertical: 16 },
    // Pasos instrucción
    pasosList: { gap: 10, marginBottom: 16 },
    paso: { fontSize: 14, color: '#434843', lineHeight: 20 },
    pasoNegrita: { fontWeight: '700', color: '#1c1c18' },
    // Botones modal
    botonPrincipal: { backgroundColor: '#1b3022', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonDesactivar: { backgroundColor: '#ba1a1a', borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
    botonPrincipalTexto: { color: '#ffffff', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
    botonCancelarModal: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', overflow: 'hidden' },
    botonCancelarModalTexto: { fontSize: 14, color: '#737973', fontWeight: '500' },
});
