export type ItemCarrito = {
    IdDetalle: number;
    IdProducto: number;
    Nombre: string;
    Imagen: string | null;
    Cantidad: number;
    PrecioUnitario: number;
    Subtotal: number;
};
