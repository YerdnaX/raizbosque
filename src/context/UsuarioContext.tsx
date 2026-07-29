import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Usuario } from '../features/auth/types/usuario';

const CLAVE_USUARIO = 'usuario';

type UsuarioContextType = {
    usuario: Usuario | null;
    estaHidratando: boolean;
    guardarUsuario: (u: Usuario) => void;
    cerrarSesion: () => void;
    actualizarTotp2FA: (activo: boolean) => void;
};

const UsuarioContext = createContext<UsuarioContextType | null>(null);

export function UsuarioProvider({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [estaHidratando, setEstaHidratando] = useState(true);

    useEffect(() => {
        async function cargarUsuarioGuardado() {
            try {
                const guardado = await AsyncStorage.getItem(CLAVE_USUARIO);
                if (guardado) {
                    setUsuario(JSON.parse(guardado));
                }
            } catch {
                // Si el dato guardado esta corrupto, simplemente se ignora y se pide login de nuevo.
            } finally {
                setEstaHidratando(false);
            }
        }

        cargarUsuarioGuardado();
    }, []);

    function guardarUsuario(u: Usuario) {
        setUsuario(u);
        AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(u));
    }

    function cerrarSesion() {
        setUsuario(null);
        AsyncStorage.removeItem(CLAVE_USUARIO);
    }

    function actualizarTotp2FA(activo: boolean) {
        setUsuario(prev => {
            if (!prev) return prev;
            const actualizado = { ...prev, TieneTotp2FA: activo };
            AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(actualizado));
            return actualizado;
        });
    }

    return (
        <UsuarioContext.Provider value={{ usuario, estaHidratando, guardarUsuario, cerrarSesion, actualizarTotp2FA }}>
            {children}
        </UsuarioContext.Provider>
    );
}

export function useUsuario() {
    const ctx = useContext(UsuarioContext);
    if (!ctx) throw new Error('useUsuario debe usarse dentro de UsuarioProvider');
    return ctx;
}
