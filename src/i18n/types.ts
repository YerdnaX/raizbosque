// Idiomas soportados por RaízBosque. Español es el idioma de respaldo:
// si un dispositivo reporta un idioma no soportado, la app cae en español.
export type Idioma = 'es' | 'en';

export const IDIOMAS: Idioma[] = ['es', 'en'];

export const IDIOMA_RESPALDO: Idioma = 'es';
