import { useCallback, useEffect, useState } from 'react';
import { PASOS_ONBOARDING } from '../constants/pasosOnboarding';
import { estaOnboardingPrincipalCompletado, marcarOnboardingPrincipalCompletado } from '../services/onboardingStorage';

export function useOnboardingPrincipal() {
    const [estaListo, setEstaListo] = useState(false);
    const [debeMostrarse, setDebeMostrarse] = useState(false);
    const [pasoActual, setPasoActual] = useState(0);

    useEffect(() => {
        let cancelado = false;

        estaOnboardingPrincipalCompletado().then((completado) => {
            if (cancelado) return;
            setDebeMostrarse(!completado);
            setEstaListo(true);
        });

        return () => {
            cancelado = true;
        };
    }, []);

    const finalizar = useCallback(() => {
        setDebeMostrarse(false);
        marcarOnboardingPrincipalCompletado();
    }, []);

    const siguiente = useCallback(() => {
        setPasoActual((actual) => {
            if (actual >= PASOS_ONBOARDING.length - 1) {
                finalizar();
                return actual;
            }
            return actual + 1;
        });
    }, [finalizar]);

    const anterior = useCallback(() => {
        setPasoActual((actual) => Math.max(0, actual - 1));
    }, []);

    const omitir = useCallback(() => {
        finalizar();
    }, [finalizar]);

    return {
        estaListo,
        debeMostrarse,
        pasoActual,
        totalPasos: PASOS_ONBOARDING.length,
        siguiente,
        anterior,
        omitir,
    };
}
