import type { PasoOnboarding } from '../types/onboarding';

// Debe coincidir en orden y cantidad con los Tabs.Screen de src/app/(tabs)/_layout.tsx.
export const PASOS_ONBOARDING: readonly PasoOnboarding[] = [
    { ruta: 'index', claveNav: 'home' },
    { ruta: 'restaurante', claveNav: 'restaurant' },
    { ruta: 'vivero', claveNav: 'nursery' },
    { ruta: 'productos', claveNav: 'products' },
    { ruta: 'jardin', claveNav: 'garden' },
    { ruta: 'perfil', claveNav: 'profile' },
];

// Debe coincidir con la altura base usada en el tabBarStyle de (tabs)/_layout.tsx
// (72 + insets.bottom). Se comparte aquí para que el spotlight del onboarding
// calcule el mismo rectángulo del tab bar sin medir el árbol nativo.
export const ALTURA_BASE_TAB_BAR = 72;
