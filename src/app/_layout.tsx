import { Stack } from 'expo-router';
import { StatusBar, Dimensions } from 'react-native';
import { useEffect } from 'react';
import { UsuarioProvider } from '../context/UsuarioContext';

export default function Layout() {
    useEffect(() => {
        const aplicar = () => {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor('transparent', false);
            StatusBar.setBarStyle('dark-content', false);
        };
        aplicar();
        const sub = Dimensions.addEventListener('change', aplicar);
        return () => sub.remove();
    }, []);

    return (
        <UsuarioProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </UsuarioProvider>
    );
}
