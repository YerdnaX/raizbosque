import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUsuario } from '../context/UsuarioContext';

export default function Index() {
    const { usuario, estaHidratando } = useUsuario();

    if (estaHidratando) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    return <Redirect href={usuario ? '/(tabs)/perfil' : '/login'} />;
}
