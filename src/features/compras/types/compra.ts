export type ItemCompra = {
    IdProducto: number;
    Nombre: string;
    Imagen: string | null;
    Cantidad: number;
    PrecioUnitario: number;
    Subtotal: number;
};

export type Compra = {
    IdCompra: number;
    FechaCompra: string;
    Subtotal: number;
    Impuesto: number;
    Total: number;
    MetodoEntrega: string;
    DireccionEntrega: string | null;
    EstadoCompra: string;
    items: ItemCompra[];
};
