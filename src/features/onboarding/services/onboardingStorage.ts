import AsyncStorage from '@react-native-async-storage/async-storage';

// Versionada por si el recorrido cambia de forma incompatible en el futuro
// (permite mostrarlo de nuevo cambiando el sufijo sin afectar otras claves).
const CLAVE_ONBOARDING_PRINCIPAL = '@raizbosque/onboarding-principal:v1';

export async function estaOnboardingPrincipalCompletado(): Promise<boolean> {
    try {
        const valor = await AsyncStorage.getItem(CLAVE_ONBOARDING_PRINCIPAL);
        return valor === 'true';
    } catch {
        // Si no se puede leer, se evita molestar mostrando el tour de nuevo.
        return true;
    }
}

export async function marcarOnboardingPrincipalCompletado(): Promise<void> {
    try {
        await AsyncStorage.setItem(CLAVE_ONBOARDING_PRINCIPAL, 'true');
    } catch {
        // Si falla el guardado, en el peor caso el tour vuelve a aparecer.
    }
}
