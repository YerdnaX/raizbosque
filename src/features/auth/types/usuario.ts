export type Usuario = {
    IdUsuario: number;
    Nombre: string;
    Apellidos: string;
    Correo: string;
    NombreUsuario: string | null;
    Telefono: string;
    Direccion: string | null;
    Estado: number;
    IdRol: number;
    NombreRol: string;
    TieneTotp2FA?: boolean;
    MetodoTotp2FA?: string | null;
};
