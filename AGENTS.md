# AGENTS.md

Este archivo contiene las reglas y guías de trabajo para agentes de IA que ayuden a desarrollar este proyecto.

El proyecto es una aplicación móvil creada con **Expo** y **React Native**. Está pensado como un proyecto académico y de aprendizaje, por lo que el código debe ser claro, simple y fácil de entender para una persona que está empezando con React Native.

No sobreingenierizar.

No crear soluciones complejas para problemas que el proyecto todavía no tiene.

---

# 1. Principios generales

Al trabajar en este proyecto, priorizar siempre:

1. Simplicidad.
2. Claridad.
3. Código fácil de leer.
4. Archivos pequeños.
5. Nombres descriptivos.
6. Reutilización solo cuando sea necesaria.
7. Soluciones prácticas antes que arquitecturas complejas.
8. Código adecuado para una persona que está aprendiendo React Native.

Evitar patrones avanzados si no son necesarios.

---

# 2. Stack tecnológico

El proyecto debe usar el siguiente stack:

```txt
Expo
React Native
TypeScript
Expo Router
gluestack-ui
Axios
React Context cuando sea necesario
```

La plataforma objetivo inicial es **mobile Android**.

No agregar nuevas librerías importantes sin aprobación explícita.

No usar:

```txt
Redux
Zustand
TanStack Query
React Native Paper
NativeWind
React Native Reusables
React Navigation directamente
```

A menos que se solicite explícitamente más adelante.

---

# 3. Plataforma objetivo

La aplicación está pensada únicamente para **mobile Android**.

No diseñar ni implementar pensando en web o iOS, a menos que se solicite explícitamente más adelante.

Priorizar patrones, componentes y comportamientos adecuados para Android.

No agregar lógica específica para web.

No agregar compatibilidad con Expo Web.

No agregar configuraciones específicas para iOS si no son necesarias.

---

# 4. Filosofía de arquitectura

El proyecto debe usar una arquitectura simple basada en funcionalidades, manteniendo una estructura similar al proyecto default de Expo.

Cada funcionalidad debe tener sus propios archivos relacionados, como componentes, hooks, servicios y tipos.

Usar este flujo general:

```txt
Screen
→ Hook
→ Service
→ apiClient
→ Backend API
```

Ejemplo:

```txt
pantalla de productos
→ useProductos()
→ obtenerProductos()
→ apiClient.get('/productos')
```

Las pantallas no deben llamar directamente a Axios.

Las pantallas deben enfocarse en mostrar UI y responder a acciones del usuario.

---

# 5. Estructura recomendada del proyecto

El proyecto debe seguir una estructura similar al proyecto default de Expo.

No usar `src/` como carpeta principal a menos que el proyecto ya haya sido creado así.

Mantener las carpetas principales en la raíz del proyecto.

Estructura recomendada:

```txt
app/
├── _layout.tsx
├── index.tsx
├── +not-found.tsx
└── (tabs)/
    ├── _layout.tsx
    └── index.tsx

assets/
├── images/
└── fonts/

components/
├── ui/
└── layout/

constants/

hooks/

features/
├── autenticacion/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
│
├── productos/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
│
└── ejemplo/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/

services/
└── apiClient.ts

context/

types/

utils/

scripts/
```

Esta estructura mantiene una base parecida a Expo, pero permite organizar funcionalidades usando `features/`.

No crear carpetas vacías para funcionalidades futuras.

Crear carpetas solamente cuando sean necesarias.

---

# 6. Navegación

Usar **Expo Router** para la navegación de la aplicación.

No usar React Navigation directamente salvo que Expo Router lo requiera internamente.

La navegación debe manejarse mediante archivos y carpetas dentro de `app/`.

Ejemplos válidos:

```txt
app/
├── _layout.tsx
├── index.tsx
├── +not-found.tsx
└── (tabs)/
    ├── _layout.tsx
    └── index.tsx
```

Usar grupos de rutas de Expo Router cuando ayuden a organizar la navegación.

Ejemplos:

```txt
(auth)
(tabs)
(app)
```

Los nombres de grupos de rutas pueden mantenerse en inglés porque son parte de una convención técnica.

Las pantallas dentro de `app/` deben ser simples.

Si una pantalla crece demasiado, mover su lógica, componentes y hooks a `features/`.

Ejemplo:

```txt
app/(tabs)/index.tsx
→ usa componentes y hooks desde features/productos/
```

No crear sistemas propios de navegación.

No crear archivos de rutas manuales si Expo Router ya puede resolverlo con la estructura de archivos.

No usar navegación imperativa innecesariamente si se puede resolver con `Link` o rutas de Expo Router.

Ejemplo permitido:

```tsx
import { Link } from 'expo-router'

<Link href="/detalle-producto">
  Ver detalle
</Link>
```

Ejemplo permitido cuando se necesita lógica antes de navegar:

```tsx
import { router } from 'expo-router'

router.push('/detalle-producto')
```

---

# 7. Responsabilidad de carpetas

## `app/`

Contiene las rutas de Expo Router.

Los archivos dentro de `app/` deben ser simples.

Deben usarse principalmente para:

```txt
Layouts
Rutas
Composición de pantallas
Redirecciones básicas
```

Evitar lógica compleja dentro de `app/`.

Si una pantalla crece demasiado, mover la lógica y los componentes a `features/`.

---

## `assets/`

Contiene archivos estáticos del proyecto.

Ejemplos:

```txt
Imágenes
Íconos
Fuentes
Logos
```

No colocar lógica de código en esta carpeta.

---

## `features/`

Contiene las funcionalidades principales de la aplicación.

Cada funcionalidad debe agrupar su propio código.

Ejemplo:

```txt
features/productos/
├── components/
│   └── TarjetaProducto.tsx
├── hooks/
│   └── useProductos.ts
├── services/
│   └── productoService.ts
└── types/
    └── producto.ts
```

Cada feature debe ser lo más independiente posible, pero sin crear abstracciones innecesarias.

No crear features vacías.

Crear una feature solo cuando exista código real que pertenezca a esa funcionalidad.

---

## `components/`

Contiene componentes compartidos por varias funcionalidades.

Usar esta carpeta únicamente para componentes realmente reutilizables.

Ejemplos:

```txt
components/ui/BotonPrincipal.tsx
components/ui/CampoTexto.tsx
components/ui/TarjetaBase.tsx
components/layout/Pantalla.tsx
components/layout/Contenedor.tsx
```

No mover un componente aquí si solo se usa en una funcionalidad.

Si un componente solo pertenece a una feature, dejarlo dentro de esa feature.

---

## `hooks/`

Contiene hooks compartidos por varias funcionalidades.

Ejemplos:

```txt
hooks/useDebounce.ts
hooks/useFormulario.ts
```

Si un hook solo pertenece a una feature, debe quedarse dentro de la feature.

Ejemplo:

```txt
features/productos/hooks/useProductos.ts
```

---

## `services/`

Contiene servicios globales.

El archivo principal debe ser:

```txt
services/apiClient.ts
```

Este archivo debe centralizar la configuración de Axios.

No crear servicios globales para todo.

Preferir servicios dentro de cada feature.

---

## `context/`

Contiene React Context únicamente cuando se necesita estado global local.

Ejemplos válidos:

```txt
Carrito global
Sesión de usuario
Tema visual
```

No usar Context para todo.

No usar Context para datos que solo pertenecen a una pantalla.

---

## `constants/`

Contiene constantes globales.

Ejemplos:

```txt
Colores base
Rutas
Valores de configuración
Mensajes comunes
```

No colocar lógica compleja en esta carpeta.

---

## `types/`

Contiene tipos compartidos entre múltiples features.

Si un tipo solo pertenece a una feature, debe quedarse dentro de la feature.

Ejemplo correcto:

```txt
features/productos/types/producto.ts
```

Ejemplo para tipos globales:

```txt
types/api.ts
types/navegacion.ts
```

---

## `utils/`

Contiene funciones utilitarias pequeñas y reutilizables.

Ejemplos:

```txt
formatearPrecio()
formatearFecha()
validarCorreo()
```

No poner lógica de negocio compleja aquí.

No usar `utils` como carpeta para todo.

---

## `scripts/`

Contiene scripts auxiliares del proyecto.

No colocar código de la aplicación móvil en esta carpeta.

---

# 8. Convención de idioma

El proyecto debe usar español para el código propio de la aplicación.

Esto aplica para:

```txt
Componentes propios
Funciones propias
Variables propias
Tipos propios
Archivos propios
Textos visibles para el usuario
```

Ejemplos correctos:

```txt
TarjetaProducto.tsx
FormularioInicioSesion.tsx
useProductos.ts
useCarrito.ts
productoService.ts
autenticacionService.ts
producto.ts
carrito.ts
```

Ejemplos correctos de código:

```ts
export type Producto = {
  id: string
  nombre: string
  precio: number
}

export async function obtenerProductos() {}

export function useProductos() {}
```

---

# 9. Carpetas técnicas en inglés

Aunque el código propio debe estar en español, los nombres técnicos de carpetas deben mantenerse en inglés.

Usar:

```txt
app
assets
components
features
hooks
services
context
types
constants
utils
scripts
layout
ui
```

No usar:

```txt
aplicacion
recursos
componentes
funcionalidades
servicios
contexto
tipos
constantes
utilidades
```

Esto mantiene el proyecto más cercano a las convenciones comunes de Expo y React Native.

---

# 10. Excepciones de idioma

No traducir palabras reservadas, APIs oficiales ni convenciones importantes de React, React Native, Expo o TypeScript.

Mantener como están:

```ts
useState
useEffect
useMemo
useReducer
useContext
props
children
import
export
default
type
interface
ReactNode
Promise
string
number
boolean
```

La palabra `use` debe mantenerse en hooks personalizados porque es una convención importante de React.

Correcto:

```ts
useProductos()
useCarrito()
useAutenticacion()
```

Incorrecto:

```ts
usarProductos()
usarCarrito()
usarAutenticacion()
```

---

# 11. Convenciones de nombres

Usar `PascalCase` para componentes.

Correcto:

```txt
TarjetaProducto.tsx
FormularioInicioSesion.tsx
BotonPrincipal.tsx
```

Incorrecto:

```txt
tarjetaProducto.tsx
product-card.tsx
ProductCard.tsx
```

Usar `camelCase` para funciones y variables.

Correcto:

```ts
obtenerProductos()
iniciarSesion()
estaCargando
nombreUsuario
```

Usar nombres descriptivos.

Evitar abreviaciones innecesarias.

Incorrecto:

```ts
prod
usr
cfg
tmp
```

Correcto:

```ts
producto
usuario
configuracion
temporal
```

---

# 12. Componentes

Usar **gluestack-ui** para la UI.

Preferir componentes de gluestack-ui antes de crear componentes desde cero.

Los estilos, colores, tamaños y variantes deben seguir `DESIGN.md`.

Ejemplo:

```tsx
import { Button, ButtonText } from '@/components/ui/button'

<Button>
  <ButtonText>Guardar</ButtonText>
</Button>
```

No mezclar múltiples librerías de UI.

No agregar otra librería visual sin aprobación.

No usar React Native Paper.

---

# 13. Guía visual y estilos

Todos los estilos visuales del proyecto deben seguir el archivo `DESIGN.md`.

Antes de crear o modificar componentes visuales, revisar `DESIGN.md`.

El archivo `DESIGN.md` es la fuente principal para:

```txt
Colores
Tipografías
Espaciados
Bordes
Sombras
Radios
Tamaños
Variantes visuales
Estilo general de la aplicación
```

gluestack-ui debe usarse como librería de componentes, pero no debe decidir por sí solo el estilo visual final.

Si `DESIGN.md` contradice el estilo por defecto de gluestack-ui, debe priorizarse `DESIGN.md`.

No inventar colores, tamaños, sombras, variantes ni estilos nuevos si no están definidos o alineados con `DESIGN.md`.

Si un estilo no existe en `DESIGN.md`, usar una solución simple y consistente con lo que ya está definido.

No crear un nuevo sistema visual dentro del código sin aprobación.

---

# 14. Componentes personalizados

Crear componentes personalizados solo cuando ayuden a reducir repetición o mejorar la lectura.

Ejemplos válidos:

```txt
BotonPrincipal
CampoTexto
TarjetaBase
EstadoCarga
EstadoError
EstadoVacio
Pantalla
```

Evitar componentes demasiado abstractos.

No crear:

```txt
ComponentFactory
UniversalRenderer
DynamicScreenBuilder
AbstractBaseScreen
```

Regla importante:

```txt
Si un componente solo se usa una vez, puede quedarse local.
Si se usa varias veces, puede extraerse.
```

No extraer componentes prematuramente.

---

# 15. Pantallas

Las pantallas deben:

```txt
Mostrar UI
Usar hooks
Mostrar estados de carga
Mostrar estados de error
Responder a acciones del usuario
```

Las pantallas no deben:

```txt
Llamar Axios directamente
Contener lógica grande de API
Contener lógica de transformación compleja
Tener demasiadas responsabilidades
```

Ejemplo incorrecto:

```tsx
const respuesta = await axios.get('http://localhost:3000/productos')
```

Ejemplo correcto:

```tsx
const { productos, estaCargando, error } = useProductos()
```

---

# 15.1. Rotación y scroll en pantallas

Toda pantalla cuyo contenido pueda superar la altura disponible (especialmente en orientación horizontal) debe envolver su contenido en un `ScrollView`.

Usar `ImageBackground` como contenedor raíz cuando la pantalla tenga imagen de fondo, con `flex: 1`.

Usar `ScrollView` con `contentContainerStyle` para el centrado y padding, no con `style`.

Usar `flexGrow: 1` en `contentContainerStyle` para que el contenido se centre en portrait y pueda hacer scroll en landscape.

Patrón correcto para pantallas con imagen de fondo:

```tsx
<ImageBackground source={require('...')} style={estilos.fondo} resizeMode="cover">
    <ScrollView
        contentContainerStyle={estilos.contenedor}
        keyboardShouldPersistTaps="handled"
    >
        {/* contenido */}
    </ScrollView>
</ImageBackground>
```

```ts
fondo: {
    flex: 1,
},
contenedor: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
},
```

Agregar siempre `keyboardShouldPersistTaps="handled"` en pantallas con formularios para que el teclado no bloquee los botones.

---

# 16. Hooks

Usar hooks para encapsular lógica reutilizable.

Los hooks propios deben iniciar con `use`.

Ejemplos:

```txt
useProductos
useAutenticacion
useCarrito
useFormulario
```

Un hook debe tener una responsabilidad clara.

Ejemplo:

```ts
export function useProductos() {
  // cargar productos
  // manejar carga
  // manejar error
}
```

No crear hooks demasiado genéricos si no son necesarios.

Si el hook pertenece solo a una feature, colocarlo dentro de esa feature.

Ejemplo:

```txt
features/productos/hooks/useProductos.ts
```

Si el hook se comparte entre varias features, colocarlo en:

```txt
hooks/
```

---

# 17. Servicios

Los servicios deben encargarse de comunicarse con la API.

Cada feature puede tener su propio service.

Ejemplo:

```txt
features/productos/services/productoService.ts
```

Ejemplo:

```ts
import { apiClient } from '../../../services/apiClient'
import type { Producto } from '../types/producto'

export async function obtenerProductos(): Promise<Producto[]> {
  const respuesta = await apiClient.get<Producto[]>('/productos')
  return respuesta.data
}
```

Los servicios no deben contener lógica de UI.

Los servicios no deben depender de componentes.

---

# 18. Axios

Usar un solo cliente Axios compartido.

Archivo recomendado:

```txt
services/apiClient.ts
```

Ejemplo:

```ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

Todas las peticiones HTTP deben usar `apiClient`.

Correcto:

```ts
const respuesta = await apiClient.get('/productos')
```

Incorrecto:

```ts
const respuesta = await axios.get('http://localhost:3000/productos')
```

No hardcodear URLs en pantallas.

---

# 19. Backend y base de datos

Toda la conexión con la base de datos se maneja mediante un proyecto backend llamado `raizbosquebackend`.

El proyecto backend está ubicado en una carpeta al mismo nivel que el proyecto principal de la app móvil.

Estructura esperada:

```txt
/
├── raizbosqueapp/
└── raizbosquebackend/
```

La aplicación móvil no debe conectarse directamente a la base de datos.

La aplicación móvil solo debe comunicarse con la base de datos mediante el API expuesto por `raizbosquebackend`.

El backend `raizbosquebackend` se encarga de conectarse a una base de datos SQL en línea.

Antes de crear, modificar o consumir endpoints desde la app móvil, el agente debe revisar el proyecto `raizbosquebackend` para entender:

```txt
Rutas disponibles
Métodos HTTP
Estructura de requests
Estructura de responses
Nombres reales de endpoints
Modelos usados por el backend
Reglas de autenticación si existen
```

No inventar endpoints si no existen en `raizbosquebackend`.

No asumir nombres de rutas.

No asumir estructura de datos.

No crear conexión SQL desde la app móvil.

No agregar credenciales de base de datos en la app móvil.

La app móvil debe usar `services/apiClient.ts` para comunicarse con el API.

Flujo correcto:

```txt
App móvil
→ apiClient
→ API de raizbosquebackend
→ Base de datos SQL en línea
```

Flujo incorrecto:

```txt
App móvil
→ Base de datos SQL
```

---

# 20. Variables de entorno

Usar variables de entorno públicas de Expo para configuración que necesita la app.

Ejemplo:

```txt
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

No colocar URLs directamente dentro de pantallas o componentes.

No subir secretos reales al repositorio.

Para un proyecto académico se permiten valores dummy, pero deben estar organizados.

---

# 21. Estado de la aplicación

Usar el estado más simple posible.

## Estado local de pantalla

Usar `useState` para estado que solo afecta a una pantalla.

Ejemplos:

```txt
texto de un input
modal abierto o cerrado
opción seleccionada
estado temporal visual
```

## Estado global local

Usar React Context solo cuando el estado debe compartirse entre múltiples pantallas.

Ejemplos válidos:

```txt
carrito global
usuario autenticado
tema visual
```

No usar Context si el estado solo se usa en una pantalla.

## Estado de API

Para datos de API, usar:

```txt
Hook personalizado
→ Service
→ apiClient
```

Ejemplo:

```txt
useProductos()
→ obtenerProductos()
→ apiClient.get('/productos')
```

No usar TanStack Query en este proyecto.

---

# 22. TypeScript

Usar TypeScript para todos los archivos nuevos.

Evitar `any`.

Correcto:

```ts
export type Producto = {
  id: string
  nombre: string
  precio: number
}
```

Incorrecto:

```ts
const producto: any = {}
```

Usar tipos simples y explícitos.

No crear tipos genéricos complejos si no son necesarios.

---

# 23. Manejo de carga y errores

Toda pantalla que cargue datos debe manejar:

```txt
Estado de carga
Estado de error
Estado vacío
Estado exitoso
```

Ejemplo:

```tsx
if (estaCargando) {
  return <EstadoCarga />
}

if (error) {
  return <EstadoError mensaje="No se pudo cargar la información" />
}

if (productos.length === 0) {
  return <EstadoVacio mensaje="No hay productos disponibles" />
}
```

Crear componentes simples para estos estados si se reutilizan.

---

# 24. Listas

Usar `FlatList` para listas que puedan crecer.

Correcto:

```tsx
<FlatList
  data={productos}
  keyExtractor={(producto) => producto.id}
  renderItem={({ item }) => <TarjetaProducto producto={item} />}
/>
```

Evitar usar `.map()` para listas grandes.

`.map()` está bien para listas pequeñas y estáticas.

---

# 25. Formularios

Mantener formularios simples.

Usar `useState` para formularios pequeños.

No agregar librerías de formularios sin aprobación.

Ejemplo aceptable:

```ts
const [correo, setCorreo] = useState('')
const [contrasena, setContrasena] = useState('')
```

Validar solo lo necesario para el prototipo.

No crear sistemas dinámicos de formularios.

---

# 26. Comentarios

Escribir comentarios solo cuando expliquen una razón importante.

Buen comentario:

```ts
// El token se agrega aquí para evitar repetir headers en cada service.
```

Mal comentario:

```ts
// Cambia el estado a true
setEstaCargando(true)
```

Evitar comentarios obvios.

---

# 27. Accesibilidad básica

Este proyecto no requiere accesibilidad.

No agregar nada relacionado a accesibilidad.

A menos que se solicite explícitamente.

---

# 28. Rendimiento

No optimizar prematuramente.

Reglas básicas:

```txt
Usar FlatList para listas largas
Evitar lógica pesada dentro del render
Evitar imágenes demasiado grandes
No usar useMemo/useCallback sin una razón clara
```

No agregar optimizaciones complejas sin evidencia de problema.

---

# 29. Pruebas

Este proyecto no requiere pruebas automatizadas.

No agregar:

```txt
Testing libraries
Archivos .test.ts
Archivos .spec.ts
Mocks
Configuración de testing
```

A menos que se solicite explícitamente.

---

# 30. Dependencias

No agregar dependencias nuevas sin aprobación.

Antes de agregar una librería, revisar si se puede resolver con:

```txt
React
React Native
Expo
Expo Router
gluestack-ui
Axios
TypeScript
```

Evitar instalar librerías para problemas pequeños.

No agregar una dependencia solo por conveniencia.

---

# 31. Qué NO hacer

No hacer sobreingeniería.

Evitar:

```txt
Redux
Zustand
TanStack Query
React Native Paper
NativeWind
React Native Reusables
React Navigation directo sin necesidad
Clean Architecture compleja
Repository Pattern innecesario
Dependency Injection
Múltiples librerías de UI
Native modules sin necesidad
Offline-first architecture
Compatibilidad web innecesaria
Configuración iOS innecesaria
Código específico para plataformas no usadas
Sistemas personalizados de navegación
Sistemas dinámicos complejos
Abstracciones para funcionalidades futuras
Testing setup sin solicitud
Conexión directa a SQL desde la app móvil
Credenciales de base de datos en la app móvil
Endpoints inventados sin revisar raizbosquebackend
```

No crear carpetas vacías para funcionalidades futuras.

No crear código que no se usa.

---

# 32. Reglas para agentes de IA

Cuando un agente de IA trabaje en este proyecto, debe:

1. Mantener los cambios pequeños y enfocados.
2. Usar la estructura existente del proyecto.
3. Preferir código simple sobre código “inteligente”.
4. Explicar en qué archivo se debe colocar cada cambio.
5. Dar código completo cuando sea útil.
6. No modificar archivos no relacionados.
7. No agregar dependencias sin permiso.
8. No cambiar la arquitectura sin permiso.
9. No agregar pruebas sin permiso.
10. No introducir librerías nuevas sin permiso.
11. Usar gluestack-ui para UI.
12. Revisar `DESIGN.md` antes de crear o modificar estilos.
13. No inventar colores, tamaños ni estilos fuera de `DESIGN.md`.
14. Priorizar `DESIGN.md` sobre los estilos por defecto de gluestack-ui.
15. Usar Axios únicamente mediante `apiClient`.
16. No llamar Axios directamente desde pantallas.
17. Usar nombres propios en español.
18. Mantener carpetas técnicas en inglés.
19. Escribir código entendible para alguien que aprende React Native.
20. Mantener una estructura similar al proyecto default de Expo.
21. No usar `src/` como carpeta principal salvo que ya exista en el proyecto.
22. Usar Expo Router para navegación.
23. No agregar React Navigation directamente sin aprobación.
24. Priorizar Android como plataforma objetivo.
25. No agregar soporte web o iOS sin solicitud explícita.
26. No conectar la app móvil directamente a SQL.
27. Consultar siempre `raizbosquebackend` antes de consumir o crear endpoints.
28. No inventar rutas, modelos ni respuestas del API.
29. Toda comunicación con datos debe pasar por el API del backend.
30. No agregar credenciales de base de datos en la app móvil.

---

# 33. Estilo de respuesta esperado del agente

Cuando el agente explique cambios, debe usar un formato claro.

Ejemplo:

```txt
Crear este archivo:

features/productos/services/productoService.ts

Agregar este código:

...

Luego actualizar este archivo:

app/(tabs)/index.tsx

Agregar esto:

...
```

Evitar respuestas vagas como:

```txt
Se recomienda desacoplar la lógica y usar una arquitectura escalable.
```

Preferir explicaciones concretas, cortas y aplicables.

---

# 34. Regla de reutilización

No extraer código antes de tiempo.

Regla:

```txt
Si algo se usa una sola vez, puede quedarse local.
Si algo se repite dos o más veces, considerar extraerlo.
Si algo se repite muchas veces, convertirlo en componente, hook o utilidad.
```

No crear abstracciones para casos hipotéticos.

---

# 35. Regla final

Este es un proyecto académico y de aprendizaje.

El objetivo no es construir una arquitectura perfecta.

El objetivo es construir una aplicación clara, funcional y fácil de entender.

Mantener el código simple.

Mantener el proyecto ordenado.

No diseñar para problemas que todavía no existen.
