import { useCallback, useEffect, useState } from 'react';
import { useIdioma } from '../../../context/IdiomaContext';
import {
    autenticarConBiometria,
    biometriaConfigurada,
    biometriaHabilitada,
    biometriaYaPreguntada,
    establecerBiometriaHabilitada,
    hayHardwareBiometrico,
    marcarBiometriaPreguntada,
    obtenerTipoBiometria,
    type TipoBiometria,
} from '../services/biometriaService';

/**
 * Estado y acciones de biometría para reingreso rápido.
 * `disponible` = hardware + enrolamiento del dispositivo.
 * `listaParaUsar` = disponible además de habilitada por el usuario en RaízBosque.
 */
export function useBiometria() {
    const { t } = useIdioma();
    const [tipo, setTipo] = useState<TipoBiometria>('generico');
    const [hayHardware, setHayHardware] = useState(false);
    const [configurada, setConfigurada] = useState(false);
    const [habilitada, setHabilitadaState] = useState(false);
    const [yaPreguntada, setYaPreguntada] = useState(true);
    const [cargando, setCargando] = useState(true);

    const revisarEstado = useCallback(async () => {
        setCargando(true);
        const [hw, cfg, hab, preguntada, tipoDetectado] = await Promise.all([
            hayHardwareBiometrico(),
            biometriaConfigurada(),
            biometriaHabilitada(),
            biometriaYaPreguntada(),
            obtenerTipoBiometria(),
        ]);
        setHayHardware(hw);
        setConfigurada(cfg);
        setHabilitadaState(hab);
        setYaPreguntada(preguntada);
        setTipo(tipoDetectado);
        setCargando(false);
    }, []);

    useEffect(() => {
        revisarEstado();
    }, [revisarEstado]);

    const disponible = hayHardware && configurada;
    const listaParaUsar = disponible && habilitada;

    const etiqueta = tipo === 'huella'
        ? t('biometria.entrarHuella')
        : tipo === 'facial'
            ? t('biometria.entrarFacial')
            : tipo === 'iris'
                ? t('biometria.entrarIris')
                : t('biometria.entrarGenerico');

    async function habilitar() {
        await establecerBiometriaHabilitada(true);
        await marcarBiometriaPreguntada();
        setHabilitadaState(true);
        setYaPreguntada(true);
    }

    async function deshabilitar() {
        await establecerBiometriaHabilitada(false);
        setHabilitadaState(false);
    }

    async function declinarPregunta() {
        await marcarBiometriaPreguntada();
        setYaPreguntada(true);
    }

    async function autenticar(): Promise<boolean> {
        return autenticarConBiometria(t('biometria.promptMensaje'), t('biometria.promptCancelar'));
    }

    return {
        cargando,
        hayHardware,
        disponible,
        habilitada,
        listaParaUsar,
        yaPreguntada,
        etiqueta,
        habilitar,
        deshabilitar,
        declinarPregunta,
        autenticar,
        revisarEstado,
    };
}
