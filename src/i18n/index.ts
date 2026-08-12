import es from './es';
import en from './en';
import { IDIOMAS, IDIOMA_RESPALDO, type Idioma } from './types';

export { IDIOMAS, IDIOMA_RESPALDO };
export type { Idioma };

export const TRADUCCIONES = { es, en };

// Genera la unión de todas las rutas "punto" de claves de es.ts (ej. 'cart.checkout').
// Se mantiene simple a propósito: solo sirve para autocompletado, t() acepta cualquier string.
type RutasDeClaves<T, Prefijo extends string = ''> = T extends string | readonly string[]
    ? Prefijo
    : { [K in keyof T & string]: RutasDeClaves<T[K], `${Prefijo}${Prefijo extends '' ? '' : '.'}${K}`> }[keyof T & string];

export type ClaveTraduccion = RutasDeClaves<typeof es>;

type Parametros = Record<string, string | number>;

function obtenerValor(objeto: unknown, ruta: string): unknown {
    return ruta.split('.').reduce<unknown>((actual, parte) => {
        if (actual == null || typeof actual !== 'object') return undefined;
        return (actual as Record<string, unknown>)[parte];
    }, objeto);
}

function interpolar(texto: string, parametros?: Parametros): string {
    if (!parametros) return texto;
    return texto.replace(/\{\{(\w+)\}\}/g, (coincidencia, nombre) => {
        const valor = parametros[nombre];
        return valor === undefined ? coincidencia : String(valor);
    });
}

function resolverClave(idioma: Idioma, clave: string): string | undefined {
    const valor = obtenerValor(TRADUCCIONES[idioma], clave);
    if (typeof valor === 'string') return valor;
    if (idioma !== IDIOMA_RESPALDO) {
        const valorRespaldo = obtenerValor(TRADUCCIONES[IDIOMA_RESPALDO], clave);
        if (typeof valorRespaldo === 'string') return valorRespaldo;
    }
    return undefined;
}

/**
 * Crea las funciones de traducción para un idioma dado.
 * - t(clave, parametros?): traduce e interpola {{variables}}.
 * - tn(clave, cantidad, parametros?): igual que t, pero elige la forma
 *   "clave_one" / "clave_other" según `cantidad` (pluralización simple,
 *   suficiente para español e inglés que solo distinguen singular/plural).
 */
export function crearTraductor(idioma: Idioma) {
    function t(clave: ClaveTraduccion | (string & {}), parametros?: Parametros): string {
        const resuelto = resolverClave(idioma, clave as string);
        if (resuelto === undefined) {
            if (__DEV__) console.warn(`[i18n] Falta traducción para "${clave}" (${idioma})`);
            return clave as string;
        }
        return interpolar(resuelto, parametros);
    }

    function tn(clave: ClaveTraduccion | (string & {}), cantidad: number, parametros?: Parametros): string {
        const sufijo = cantidad === 1 ? 'one' : 'other';
        return t(`${clave as string}_${sufijo}`, { count: cantidad, ...parametros });
    }

    return { t, tn };
}
