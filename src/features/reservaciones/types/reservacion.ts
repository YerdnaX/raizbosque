export type Reservacion = {
    IdReservacion: number;
    FechaReservacion: string;   // "YYYY-MM-DD"
    HoraReservacion: string;    // "HH:MM"
    CantidadPersonas: number;
    Estado: string;
    Comentarios: string | null;
    FechaRegistro: string;
};
