import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InicioIcono from '@/assets/icons/bottomBar/inicio.svg';
import RestauranteIcono from '@/assets/icons/bottomBar/restaurante.svg';
import ViveroIcono from '@/assets/icons/bottomBar/vivero.svg';
import ProductosIcono from '@/assets/icons/bottomBar/productos.svg';
import JardinIcono from '@/assets/icons/bottomBar/mi-jardin.svg';
import PerfilIcono from '@/assets/icons/bottomBar/perfil.svg';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#1b3022',
                tabBarInactiveTintColor: '#8da082',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e5e2dc',
                    borderTopWidth: 1,
                    height: 72 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <InicioIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="restaurante"
                options={{
                    title: 'Restaurante',
                    tabBarIcon: ({ color, size }) => (
                        <RestauranteIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vivero"
                options={{
                    title: 'Vivero',
                    tabBarIcon: ({ color, size }) => (
                        <ViveroIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="productos"
                options={{
                    title: 'Productos',
                    tabBarIcon: ({ color, size }) => (
                        <ProductosIcono width={size} height={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jardin"
                options={{
                    title: 'Mi Jardín',
                    tabBarIcon: ({ color, size }) => (
                        <JardinIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <PerfilIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
