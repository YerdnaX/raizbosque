import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { crearTraductor, IDIOMA_RESPALDO, IDIOMAS, TRADUCCIONES, type Idioma } from '../i18n';

const CLAVE_IDIOMA = 'idioma';

type IdiomaContextType = {
    idioma: Idioma;
    estaHidratando: boolean;
    cambiarIdioma: (idioma: Idioma) => void;
    t: ReturnType<typeof crearTraductor>['t'];
    tn: ReturnType<typeof crearTraductor>['tn'];
    strings: (typeof TRADUCCIONES)['es'];
};

const IdiomaContext = createContext<IdiomaContextType | null>(null);

function detectarIdiomaDispositivo(): Idioma {
    try {
        const codigo = Localization.getLocales()[0]?.languageCode ?? '';
        return (IDIOMAS as string[]).includes(codigo) ? (codigo as Idioma) : IDIOMA_RESPALDO;
    } catch {
        return IDIOMA_RESPALDO;
    }
}

export function IdiomaProvider({ children }: { children: React.ReactNode }) {
    const [idioma, setIdioma] = useState<Idioma>(IDIOMA_RESPALDO);
    const [estaHidratando, setEstaHidratando] = useState(true);

    useEffect(() => {
        async function cargarIdiomaGuardado() {
            try {
                const guardado = await AsyncStorage.getItem(CLAVE_IDIOMA);
                if (guardado === 'es' || guardado === 'en') {
                    setIdioma(guardado);
                } else {
                    setIdioma(detectarIdiomaDispositivo());
                }
            } catch {
                setIdioma(detectarIdiomaDispositivo());
            } finally {
                setEstaHidratando(false);
            }
        }

        cargarIdiomaGuardado();
    }, []);

    function cambiarIdioma(nuevoIdioma: Idioma) {
        setIdioma(nuevoIdioma);
        AsyncStorage.setItem(CLAVE_IDIOMA, nuevoIdioma);
    }

    const { t, tn } = useMemo(() => crearTraductor(idioma), [idioma]);
    const strings = TRADUCCIONES[idioma];

    return (
        <IdiomaContext.Provider value={{ idioma, estaHidratando, cambiarIdioma, t, tn, strings }}>
            {children}
        </IdiomaContext.Provider>
    );
}

export function useIdioma() {
    const ctx = useContext(IdiomaContext);
    if (!ctx) throw new Error('useIdioma debe usarse dentro de IdiomaProvider');
    return ctx;
}
