export type Planta = {
    IdProducto: number;
    Nombre: string;
    Descripcion: string | null;
    Precio: number;
    Imagen: string | null;
    Stock: number;
    NombreCategoria: string;
    FrecuenciaRiego: string | null;
    NivelLuz: string | null;
    TamanoAproximado: string | null;
    NivelDificultad: string | null;
    TipoClima: string | null;
    CuidadosEspeciales: string | null;
    TemperaturaRecomendada: string | null;
    TipoSuelo: string | null;
};
