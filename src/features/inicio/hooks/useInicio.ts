import { useState, useEffect } from 'react';
import { obtenerPlantaDelMes, obtenerPlatoDelDia, type PlantaDelMes, type PlatoDelDia } from '../services/inicioService';
import { obtenerReservaciones } from '../../reservaciones/services/reservacionService';
import type { Reservacion } from '../../reservaciones/types/reservacion';
import { useUsuario } from '../../../context/UsuarioContext';

function esProxima(r: Reservacion): boolean {
    if (r.Estado === 'Cancelada') return false;
    const [anio, mes, dia] = r.FechaReservacion.split('-').map(Number);
    const [hora, min] = r.HoraReservacion.split(':').map(Number);
    return new Date(anio, mes - 1, dia, hora, min) > new Date();
}

export function useInicio() {
    const { usuario } = useUsuario();
    const [plantaDelMes, setPlantaDelMes] = useState<PlantaDelMes | null>(null);
    const [platoDelDia, setPlatoDelDia] = useState<PlatoDelDia | null>(null);
    const [proximasReservaciones, setProximasReservaciones] = useState<Reservacion[]>([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            obtenerPlantaDelMes().catch(() => null),
            obtenerPlatoDelDia().catch(() => null),
        ]).then(([planta, plato]) => {
            setPlantaDelMes(planta);
            setPlatoDelDia(plato);
        }).catch(() => {
            setError('No se pudo cargar la información.');
        }).finally(() => setEstaCargando(false));
    }, []);

    useEffect(() => {
        if (!usuario) {
            setProximasReservaciones([]);
            return;
        }
        obtenerReservaciones(usuario.IdUsuario)
            .then(data => setProximasReservaciones(data.filter(esProxima).slice(0, 2)))
            .catch(() => setProximasReservaciones([]));
    }, [usuario]);

    return { plantaDelMes, platoDelDia, proximasReservaciones, estaCargando, error };
}
