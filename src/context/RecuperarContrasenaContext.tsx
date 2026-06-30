import React, { createContext, useContext, useState } from 'react';

type EstadoRecuperacion = {
    correo: string;
    token: string;
    metodo: 'CORREO' | 'PREGUNTAS' | '';
};

type RecuperarContrasenaContextType = {
    datos: EstadoRecuperacion;
    setCorreo: (v: string) => void;
    setToken:  (v: string) => void;
    setMetodo: (v: 'CORREO' | 'PREGUNTAS') => void;
    reiniciar: () => void;
};

const estadoInicial: EstadoRecuperacion = { correo: '', token: '', metodo: '' };
const RecuperarContrasenaContext = createContext<RecuperarContrasenaContextType | null>(null);

export function RecuperarContrasenaProvider({ children }: { children: React.ReactNode }) {
    const [datos, setDatos] = useState<EstadoRecuperacion>(estadoInicial);

    const set = (campo: keyof EstadoRecuperacion) => (valor: any) =>
        setDatos(prev => ({ ...prev, [campo]: valor }));

    return (
        <RecuperarContrasenaContext.Provider value={{
            datos,
            setCorreo: set('correo'),
            setToken:  set('token'),
            setMetodo: set('metodo'),
            reiniciar: () => setDatos(estadoInicial),
        }}>
            {children}
        </RecuperarContrasenaContext.Provider>
    );
}

export function useRecuperarContrasena() {
    const ctx = useContext(RecuperarContrasenaContext);
    if (!ctx) throw new Error('useRecuperarContrasena debe usarse dentro de RecuperarContrasenaProvider');
    return ctx;
}
