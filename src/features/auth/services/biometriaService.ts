import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

// Preferencia local (por dispositivo) de si el usuario activó el reingreso
// biométrico. Nunca guarda credenciales: solo un booleano.
const CLAVE_BIOMETRIA_HABILITADA = 'biometria-habilitada';
const CLAVE_BIOMETRIA_PREGUNTADA = 'biometria-preguntada';

export type TipoBiometria = 'huella' | 'facial' | 'iris' | 'generico';

export async function hayHardwareBiometrico(): Promise<boolean> {
    try {
        return await LocalAuthentication.hasHardwareAsync();
    } catch {
        return false;
    }
}

export async function biometriaConfigurada(): Promise<boolean> {
    try {
        return await LocalAuthentication.isEnrolledAsync();
    } catch {
        return false;
    }
}

export async function obtenerTipoBiometria(): Promise<TipoBiometria> {
    try {
        const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'facial';
        if (tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'huella';
        if (tipos.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
        return 'generico';
    } catch {
        return 'generico';
    }
}

export async function biometriaHabilitada(): Promise<boolean> {
    return (await AsyncStorage.getItem(CLAVE_BIOMETRIA_HABILITADA)) === 'true';
}

export async function establecerBiometriaHabilitada(habilitada: boolean): Promise<void> {
    if (habilitada) {
        await AsyncStorage.setItem(CLAVE_BIOMETRIA_HABILITADA, 'true');
    } else {
        await AsyncStorage.removeItem(CLAVE_BIOMETRIA_HABILITADA);
    }
}

export async function biometriaYaPreguntada(): Promise<boolean> {
    return (await AsyncStorage.getItem(CLAVE_BIOMETRIA_PREGUNTADA)) === 'true';
}

export async function marcarBiometriaPreguntada(): Promise<void> {
    await AsyncStorage.setItem(CLAVE_BIOMETRIA_PREGUNTADA, 'true');
}

/** Limpia toda preferencia biométrica local (usado en logout). */
export async function limpiarPreferenciaBiometrica(): Promise<void> {
    await AsyncStorage.multiRemove([CLAVE_BIOMETRIA_HABILITADA, CLAVE_BIOMETRIA_PREGUNTADA]);
}

export async function autenticarConBiometria(mensaje: string, textoCancelar: string): Promise<boolean> {
    try {
        const resultado = await LocalAuthentication.authenticateAsync({
            promptMessage: mensaje,
            cancelLabel: textoCancelar,
        });
        return resultado.success;
    } catch {
        return false;
    }
}
