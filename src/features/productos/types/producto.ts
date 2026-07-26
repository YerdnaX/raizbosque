export type Producto = {
    IdProducto: number;
    IdProductoProvedorVivero: number | null;
    Nombre: string;
    Descripcion: string | null;
    Precio: number;
    Imagen: string | null;
    Stock: number;
    NombreCategoria: string;
    Provedor: {
        cantidadDisponible: number;
        tiempoReposicionDias: number;
        estado: string;
    } | null;
};
