import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUsuario } from '../context/UsuarioContext';
import { useBiometria } from '../features/auth/hooks/useBiometria';

export default function Index() {
    const { usuario, estaHidratando } = useUsuario();
    const bio = useBiometria();

    if (estaHidratando || (usuario && bio.cargando)) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!usuario) {
        return <Redirect href="/login" />;
    }

    // Reingreso con sesión ya guardada: si el usuario activó biometría y el
    // dispositivo la sigue soportando, pasa primero por el desbloqueo.
    if (bio.listaParaUsar) {
        return <Redirect href={'/desbloqueo' as any} />;
    }

    return <Redirect href="/(tabs)/perfil" />;
}
