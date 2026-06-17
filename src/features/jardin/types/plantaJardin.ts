export type PlantaJardin = {
    IdJardin: number;
    IdProducto: number;
    Nombre: string;
    NombrePersonalizado: string | null;
    Imagen: string | null;
    EstadoPlanta: string;
    FrecuenciaRiego: string | null;
    DiasParaRiego: number | null;
};
