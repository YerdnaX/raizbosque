import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORES } from '@/constants/colores';
import { useIdioma } from '@/context/IdiomaContext';
import InicioIcono from '@/assets/icons/bottomBar/inicio.svg';
import RestauranteIcono from '@/assets/icons/bottomBar/restaurante.svg';
import ViveroIcono from '@/assets/icons/bottomBar/vivero.svg';
import ProductosIcono from '@/assets/icons/bottomBar/productos.svg';
import JardinIcono from '@/assets/icons/bottomBar/mi-jardin.svg';
import PerfilIcono from '@/assets/icons/bottomBar/perfil.svg';

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const { t } = useIdioma();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORES.esmeraldaTinta,
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
                    title: t('nav.home'),
                    tabBarIcon: ({ color, size }) => (
                        <InicioIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="restaurante"
                options={{
                    title: t('nav.restaurant'),
                    tabBarIcon: ({ color, size }) => (
                        <RestauranteIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vivero"
                options={{
                    title: t('nav.nursery'),
                    tabBarIcon: ({ color, size }) => (
                        <ViveroIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="productos"
                options={{
                    title: t('nav.products'),
                    tabBarIcon: ({ color, size }) => (
                        <ProductosIcono width={size} height={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jardin"
                options={{
                    title: t('nav.garden'),
                    tabBarIcon: ({ color, size }) => (
                        <JardinIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: t('nav.profile'),
                    tabBarIcon: ({ color, size }) => (
                        <PerfilIcono width={size} height={size} fill={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
