import { Stack } from 'expo-router';
import { StatusBar, Dimensions } from 'react-native';
import { useEffect } from 'react';
import { UsuarioProvider } from '../context/UsuarioContext';
import { CarritoProvider } from '../context/CarritoContext';
import { RegistroProvider } from '../context/RegistroContext';
import { RecuperarContrasenaProvider } from '../context/RecuperarContrasenaContext';
import { RecuperarUsuarioProvider } from '../context/RecuperarUsuarioContext';

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
            <CarritoProvider>
                <RegistroProvider>
                    <RecuperarContrasenaProvider>
                        <RecuperarUsuarioProvider>
                            <Stack screenOptions={{ headerShown: false }} />
                        </RecuperarUsuarioProvider>
                    </RecuperarContrasenaProvider>
                </RegistroProvider>
            </CarritoProvider>
        </UsuarioProvider>
    );
}
