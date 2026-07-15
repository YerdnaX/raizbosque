export type Ubicacion = {
    IdUbicacion: number;
    Nombre: string;
    Nivel?: number;
};

export type NivelConfiguracion = {
    nivel: number;
    etiqueta: string;
};

export type ConfiguracionPais = {
    idPais: number;
    nombrePais: string;
    niveles: NivelConfiguracion[];
};
