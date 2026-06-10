import { Stack } from 'expo-router';
import { StatusBar, Dimensions } from 'react-native';
import { useEffect } from 'react';

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

    return <Stack screenOptions={{ headerShown: false }} />;
}
