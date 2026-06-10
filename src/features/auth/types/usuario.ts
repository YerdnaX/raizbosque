export type Usuario = {
    IdUsuario: number;
    Nombre: string;
    Apellidos: string;
    Correo: string;
    Telefono: string;
    Direccion: string | null;
    Estado: number;
    IdRol: number;
    NombreRol: string;
};
