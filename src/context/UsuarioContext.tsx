import React, { createContext, useContext, useState } from 'react';
import type { Usuario } from '../features/auth/types/usuario';

type UsuarioContextType = {
    usuario: Usuario | null;
    guardarUsuario: (u: Usuario) => void;
    cerrarSesion: () => void;
};

const UsuarioContext = createContext<UsuarioContextType | null>(null);

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    function guardarUsuario(u: Usuario) {
        setUsuario(u);
    }

    function cerrarSesion() {
        setUsuario(null);
    }

    return (
        <UsuarioContext.Provider value={{ usuario, guardarUsuario, cerrarSesion }}>
            {children}
        </UsuarioContext.Provider>
    );
}

export function useUsuario() {
    const ctx = useContext(UsuarioContext);
    if (!ctx) throw new Error('useUsuario debe usarse dentro de UsuarioProvider');
    return ctx;
}
