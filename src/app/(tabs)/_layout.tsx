import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                        <SymbolView name="house.fill" size={size} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="restaurante"
                options={{
                    title: 'Restaurante',
                    tabBarIcon: ({ color, size }) => (
                        <SymbolView name="fork.knife" size={size} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="vivero"
                options={{
                    title: 'Vivero',
                    tabBarIcon: ({ color, size }) => (
                        <SymbolView name="leaf.fill" size={size} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="jardin"
                options={{
                    title: 'Mi Jardín',
                    tabBarIcon: ({ color, size }) => (
                        <SymbolView name="tree.fill" size={size} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <SymbolView name="person.fill" size={size} tintColor={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
