import React, { createContext, useContext, useState } from 'react';

type EstadoRecuperarUsuario = { correo: string };
type RecuperarUsuarioContextType = {
    datos: EstadoRecuperarUsuario;
    setCorreo: (v: string) => void;
    reiniciar: () => void;
};

const RecuperarUsuarioContext = createContext<RecuperarUsuarioContextType | null>(null);

export function RecuperarUsuarioProvider({ children }: { children: React.ReactNode }) {
    const [datos, setDatos] = useState<EstadoRecuperarUsuario>({ correo: '' });

    return (
        <RecuperarUsuarioContext.Provider value={{
            datos,
            setCorreo: (v) => setDatos({ correo: v }),
            reiniciar: () => setDatos({ correo: '' }),
        }}>
            {children}
        </RecuperarUsuarioContext.Provider>
    );
}

export function useRecuperarUsuario() {
    const ctx = useContext(RecuperarUsuarioContext);
    if (!ctx) throw new Error('useRecuperarUsuario debe usarse dentro de RecuperarUsuarioProvider');
    return ctx;
}
