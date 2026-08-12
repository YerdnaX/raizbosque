// Clave del borrador de checkout, aislada por usuario para que un cambio de
// cuenta en el mismo dispositivo nunca restaure el progreso de otra persona.
export function claveBorradorCheckout(idUsuario: number): string {
    return `checkout-progreso:${idUsuario}`;
}
