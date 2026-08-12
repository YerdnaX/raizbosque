import React, { createContext, useContext, useEffect, useState } from 'react';
import { cargarBorrador, eliminarBorrador } from '../utils/borradores';
import { useGuardadoAutomatico } from '../hooks/useGuardadoAutomatico';

type EstadoRegistro = {
    correo: string;
    token: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    direccion: string;
    nombreUsuario: string;
    contrasena: string;
    respuesta1: string;
    respuesta2: string;
    respuesta3: string;
};

type RegistroContextType = {
    datos: EstadoRegistro;
    setCorreo:        (v: string) => void;
    setToken:         (v: string) => void;
    setNombre:        (v: string) => void;
    setApellidos:     (v: string) => void;
    setTelefono:      (v: string) => void;
    setDireccion:     (v: string) => void;
    setNombreUsuario: (v: string) => void;
    setContrasena:    (v: string) => void;
    setRespuesta1:    (v: string) => void;
    setRespuesta2:    (v: string) => void;
    setRespuesta3:    (v: string) => void;
    reiniciar:        () => void;
};

const estadoInicial: EstadoRegistro = {
    correo: '', token: '', nombre: '', apellidos: '',
    telefono: '', direccion: '', nombreUsuario: '',
    contrasena: '', respuesta1: '', respuesta2: '', respuesta3: '',
};

// El borrador solo guarda campos no sensibles: nunca contraseña, respuestas
// de seguridad (funcionan como credencial alterna) ni el token de verificación.
const CLAVE_BORRADOR = 'registro-progreso';

type DraftRegistro = Pick<EstadoRegistro, 'correo' | 'nombre' | 'apellidos' | 'telefono' | 'direccion' | 'nombreUsuario'>;

function extraerDraft(datos: EstadoRegistro): DraftRegistro {
    const { correo, nombre, apellidos, telefono, direccion, nombreUsuario } = datos;
    return { correo, nombre, apellidos, telefono, direccion, nombreUsuario };
}

const RegistroContext = createContext<RegistroContextType | null>(null);

export function RegistroProvider({ children }: { children: React.ReactNode }) {
    const [datos, setDatos] = useState<EstadoRegistro>(estadoInicial);
    const [hidratado, setHidratado] = useState(false);

    useEffect(() => {
        let activo = true;
        cargarBorrador<DraftRegistro>(CLAVE_BORRADOR).then((draft) => {
            if (activo && draft) {
                setDatos((prev) => ({ ...prev, ...draft }));
            }
            if (activo) setHidratado(true);
        });
        return () => { activo = false; };
    }, []);

    useGuardadoAutomatico(CLAVE_BORRADOR, extraerDraft(datos), hidratado);

    const set = (campo: keyof EstadoRegistro) => (valor: string) =>
        setDatos(prev => ({ ...prev, [campo]: valor }));

    function reiniciar() {
        setDatos(estadoInicial);
        eliminarBorrador(CLAVE_BORRADOR);
    }

    return (
        <RegistroContext.Provider value={{
            datos,
            setCorreo:        set('correo'),
            setToken:         set('token'),
            setNombre:        set('nombre'),
            setApellidos:     set('apellidos'),
            setTelefono:      set('telefono'),
            setDireccion:     set('direccion'),
            setNombreUsuario: set('nombreUsuario'),
            setContrasena:    set('contrasena'),
            setRespuesta1:    set('respuesta1'),
            setRespuesta2:    set('respuesta2'),
            setRespuesta3:    set('respuesta3'),
            reiniciar,
        }}>
            {children}
        </RegistroContext.Provider>
    );
}

export function useRegistro() {
    const ctx = useContext(RegistroContext);
    if (!ctx) throw new Error('useRegistro debe usarse dentro de RegistroProvider');
    return ctx;
}
