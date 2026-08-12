// El ritual de bienvenida elige un mensaje al azar de un pool fijo.
// Los textos viven en src/i18n (welcome.messages) para poder mostrarse en
// español o inglés; aquí solo se decide qué índice mostrar.
export function elegirIndiceMensajeBienvenida(cantidadMensajes: number): number {
    return Math.floor(Math.random() * cantidadMensajes);
}
