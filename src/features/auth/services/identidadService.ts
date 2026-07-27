import axios from 'axios';

const IDENTIDAD_BASE_URL = process.env.EXPO_PUBLIC_IDENTIDAD_API_URL ?? '';

export type PersonaIdentidad = {
    id: number;
    cedula: string;
    primerNombre: string;
    apellidos: string;
};

export async function consultarPersonaPorCedula(cedula: string): Promise<PersonaIdentidad | null> {
    if (!IDENTIDAD_BASE_URL) {
        return null;
    }

    try {
        const respuesta = await axios.get<PersonaIdentidad>(`${IDENTIDAD_BASE_URL}/consulta`, {
            params: { cedula },
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' },
        });

        return respuesta.data;
    } catch {
        return null;
    }
}
