// Debe reflejar exactamente las rutas reales de src/app/(tabs)/_layout.tsx.
export type RutaTabOnboarding = 'index' | 'restaurante' | 'vivero' | 'productos' | 'jardin' | 'perfil';

export type ClaveNavOnboarding = 'home' | 'restaurant' | 'nursery' | 'products' | 'garden' | 'profile';

export type PasoOnboarding = {
    ruta: RutaTabOnboarding;
    claveNav: ClaveNavOnboarding;
};

export type RectanguloTab = {
    x: number;
    y: number;
    width: number;
    height: number;
};
