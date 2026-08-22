# MyCode Pro — Plataforma Educativa y Sandbox Interactivo

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pyodide](https://img.shields.io/badge/Pyodide-0.26.2-FFD43B?logo=python&logoColor=blue)](https://pyodide.org/)
[![Tests](https://img.shields.io/badge/Tests-83%2F83%20Passing%20(100%25)-10B981)](#-suites-de-pruebas-y-calidad-qa)
[![i18n](https://img.shields.io/badge/i18n-ES%20%7C%20EN%20(Symmetric)-8B5CF6)](#-internacionalización-i18n)
[![Architecture](https://img.shields.io/badge/Architecture-Frontend--First%20%2F%20Educational%20Simulator-EC4899)](#-principio-de-honestidad-arquitectónica)

---

## 📌 Tabla de Contenidos

1. [Información General](#-información-general)
2. [Principio de Honestidad Arquitectónica](#-principio-de-honestidad-arquitectónica)
3. [Estado de las Características](#-estado-de-las-características)
4. [Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [Java Sandbox (Motor de Simulación Educativa)](#-java-sandbox-motor-de-simulación-educativa)
6. [Simulador de JUnit 5](#-simulador-de-junit-5)
7. [Simulador de Apache Commons Math 3](#-simulador-de-apache-commons-math-3)
8. [Python Sandbox (Pyodide WebAssembly)](#-python-sandbox-pyodide-webassembly)
9. [Simulación de Diálogos Gráficos JOptionPane](#-simulación-de-diálogos-gráficos-joptionpane)
10. [Módulos y Características de la Plataforma](#-módulos-y-características-de-la-plataforma)
11. [Ejemplos de Código Soportados](#-ejemplos-de-código-soportados)
12. [Estructura del Repositorio](#-estructura-del-repositorio)
13. [Guía de Instalación y Ejecución](#-guía-de-instalación-y-ejecución)
14. [Suites de Pruebas y Calidad (QA)](#-suites-de-pruebas-y-calidad-qa)

---

## 📖 Información General

**MyCode Pro** es una plataforma educativa integral y entorno de desarrollo interactivo (IDE ligero en navegador) orientada al aprendizaje práctico de programación, estructuras de datos, algoritmos y pensamiento computacional.

### Propósito y Enfoque Educativo
El aprendizaje tradicional de lenguajes como Java y Python a menudo impone barreras iniciales complejas: instalación de JDKs, configuración de variables de entorno (`JAVA_HOME`, `PATH`), dependencias de compilación y servidores de ejecución. MyCode Pro elimina estas fricciones ejecutando un **entorno 100% en el navegador**, permitiendo a estudiantes y docentes concentrarse en la lógica algorítmica desde el primer segundo.

### Componentes Clave del Ecosistema
- **Catálogo de Cursos & Reproductor de Video:** Contenido estructurado en módulos y lecciones con seguimiento persistente de progreso.
- **Exercise Solver:** Entorno de resolución de ejercicios algorítmicos con verificación interactiva y retroalimentación inmediata.
- **Playground Multilenguaje:** Sandbox independiente para experimentar con código Java (simulado) y Python (WebAssembly).
- **Centro de Autoría Docente (Instructor Hub):** Gestión del ciclo de vida de cursos, publicación/despublicación, métricas analíticas y evaluación de entregas.
- **Economía Educativa de Tokens:** Sistema pedagógico de saldo y transacciones para controlar el uso de compilaciones.

---

## 🏛️ Principio de Honestidad Arquitectónica

Este proyecto implementa una distinción estricta y transparente entre las tecnologías ejecutadas y sus mecanismos subyacentes:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLASIFICACIÓN ARQUITECTÓNICA                       │
├───────────────────────┬───────────────────────────┬─────────────────────────┤
│    ✅ IMPLEMENTADO    │     🚧 EN DESARROLLO      │   🔮 PLANEADO / FUTURO  │
├───────────────────────┼───────────────────────────┼─────────────────────────┤
│ • SPA React 18 + Vite │ • Persistencia Mock Local │ • Backend JVM real      │
│ • Transpilador Java   │ • Sala Live Streaming     │ • Base de datos SQL     │
│ • Pyodide Python Wasm │ • Envío simulado de email │ • WebSockets en vivo    │
│ • Diálogos Swing UI   │ • Catálogo de compras     │ • OAuth2 / JWT Remoto   │
│ • JUnit / Math Sim    │ • Métricas agregadas      │ • Evaluador JVM remoto  │
└───────────────────────┴───────────────────────────┴─────────────────────────┘
```

> [!IMPORTANT]
> **Aclaración Técnica Fundamental:**
> 1. **No existe una Máquina Virtual Java (JVM) ni compilador `javac` en el backend.** El Sandbox de Java transpila y ejecuta un subconjunto pedagógico directamente en el motor JavaScript de V8/navegador.
> 2. **No existe un servidor backend activo.** Todas las operaciones de autenticación, cursos, progreso, billetera y métricas se gestionan mediante una capa de servicio reactiva respaldada por `localStorage` y memoria.
> 3. **Python se ejecuta en el navegador mediante WebAssembly (Pyodide).**

---

## 📊 Estado de las Características

| Característica | Estado | Detalle Técnico |
| :--- | :---: | :--- |
| **Frontend SPA** | `IMPLEMENTADO` | React 18.3, Vite 5.4, React Router 6.26, CSS Custom Properties |
| **Internacionalización (i18n)** | `IMPLEMENTADO` | Contexto reactivo ES/EN, 540+ claves simétricas, formato de fechas dinámico |
| **Java Execution Sandbox** | `IMPLEMENTADO` | Motor de transpilación frontend con Type Environment y guardianes de bucle |
| **JUnit 5 Simulator** | `IMPLEMENTADO` | Extracción y evaluación de `@Test`, `assertEquals`, `assertThrows`, etc. |
| **Apache Commons Math Sim** | `IMPLEMENTADO` | Subconjunto de `StatUtils`, `MatrixUtils`, `RealMatrix`, `FastMath`, `ArithmeticUtils` |
| **Python Sandbox** | `IMPLEMENTADO` | Runtime Pyodide 0.26.2 (Wasm) con transformación AST para `input()` asíncrono |
| **JOptionPane (Swing UI)** | `IMPLEMENTADO` | Modales interactivos para `showMessage`, `showInput`, `showConfirm`, `showOption` |
| **Control de Acceso (RBAC)** | `IMPLEMENTADO` | Roles `estudiante` / `instructor` con guardas en interfaz y capa de API |
| **Bloqueo tras 6 Intentos** | `IMPLEMENTADO` | Bloqueo de 4 horas tras 6 contraseñas erróneas y registro de alerta de seguridad |
| **Cursos y Reproductor** | `IMPLEMENTADO` | Navegación de módulos, control de video y almacenamiento de progreso |
| **Analítica de Cursos** | `IMPLEMENTADO` | Cálculo de retención, tasa de abandono por lección y promedio de notas |
| **Paquetes de Tokens & Carrito** | `IMPLEMENTADO` | 4 paquetes de tokens, carrito interactivo con persistencia local y checkout mock |
| **Identidad Dorada (Modo Claro)** | `IMPLEMENTADO` | Paleta dorada secundaria para modo claro calibrada con alto contraste (WCAG AA/AAA) |
| **Live Streaming** | `EN DESARROLLO` | Interfaz de estudio docente con credenciales OBS/RTMP y sala simulada |
| **Backend Remoto** | `PLANEADO` | Microservicios para persistencia centralizada y compilación Java en contenedor |

---

## 📐 Arquitectura del Sistema

### 1. Flujo de Ejecución de Java

```text
┌────────────────────────────────────────────────────────┐
│                   Código Fuente Java                   │
└───────────────────────────┬────────────────────────────┘
                            │
                  [detectJavaMode.js]
                 /                     \
        (Contiene @Test)        (Main / Scripts)
               /                         \
┌─────────────────────────────┐ ┌────────────────────────────────────┐
│   JUnitSimulationService    │ │        JavaExecutionService        │
└──────────────┬──────────────┘ └─────────────────┬──────────────────┘
               │                                  │
               │   • Limpieza de comentarios      │
               │   • buildTypeEnv (Inferencia)    │
               │   • transformJavaBlock (AST/Re)  │
               │   • injectTypedDivisions         │
               │   • injectTickGuard (__tick)     │
               │                                  ▼
               │                ┌────────────────────────────────────┐
               └───────────────>│   AsyncFunction Sandbox Runner     │
                                └─────────────────┬──────────────────┘
                                                  │
                                                  ├─► onDialogRequest (JOptionPane UI)
                                                  │
                                                  ▼
                                ┌────────────────────────────────────┐
                                │   TerminalConsole / Stdout Logs    │
                                └────────────────────────────────────┘
```

### 2. Flujo de Ejecución de Python (Pyodide Wasm)

```text
┌────────────────────────────────────────────────────────┐
│                  Código Fuente Python                  │
└───────────────────────────┬────────────────────────────┘
                            │
               [PyodideExecutionService]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  [Descarga Pyodide Wasm]       [Transformador AST: input()]
  (CDN jsDelivr cacheado)       (input -> await __mycode_async_input__)
            │                               │
            └───────────────┬───────────────┘
                            │
             ¿Importa la librería requests?
              ├── SÍ ──► [Carga pyodide-http y aplica patch]
              └── NO ──► [Ejecuta runPythonAsync]
                            │
                            ▼
          ┌───────────────────────────────────┐
          │  Captura Stdout / Stderr en vivo  │
          │  + Detección de Políticas CORS    │
          └─────────────────┬─────────────────┘
                            ▼
          ┌───────────────────────────────────┐
          │   TerminalConsole / UI de React   │
          └───────────────────────────────────┘
```

---

## ☕ Java Sandbox (Motor de Simulación Educativa)

El servicio `JavaExecutionService` emula la ejecución de código Java transformándolo de manera segura en JavaScript moderno asíncrono.

### Subconjunto de Sintaxis Soportado
- **Tipos Primitivos y Alias:** `int`, `long`, `short`, `byte`, `float`, `double`, `boolean`, `char`, `String`, `var`.
- **Estructuras de Control:** `if`, `else if`, `else`, `for`, `for-each`, `while`, `do-while`.
- **Manejo de Excepciones:** `try / catch` tipado (`catch (Exception e)`, `catch (NumberFormatException e)`, `catch (final Type e)`).
- **Arreglos Unidimensionales y Matrices:** Inicializadores de array Java (`int[] a = {1, 2};`, `new double[][]{{1,2},{3,4}}`).
- **Métodos Auxiliares Estáticos:** Declaración y llamada a funciones `public static Tipo nombre(...)`.
- **Salida Estándar:** `System.out.println(...)` y `System.out.print(...)`.
- **Métodos de `java.lang.String`:**
  - `.length()`
  - `.equals(other)`
  - `.equalsIgnoreCase(other)`
  - `.trim()`
  - `.isEmpty()`
  - `.toUpperCase()`, `.toLowerCase()`, `.substring()`, `.charAt()`, `.contains()`
- **Parsing Numérico:**
  - `Integer.parseInt(str)` / `Integer.valueOf(str)`
  - `Double.parseDouble(str)` / `Double.valueOf(str)`
- **Aritmética y Precisión Tipada:**
  - División entera (`int / int`) lanza `ArithmeticException: / by zero` en división por cero.
  - División flotante (`double / double`) respeta la semántica IEEE 754 (`Infinity`, `-Infinity`, `NaN`).
  - Preservación de formato decimal Java (`3.0` vs `3`) mediante wrapper `__javaDouble`.
- **Protección contra Bucles Infinitos:** Inyección automática del guardián `__tick()` con límite de 50,000 iteraciones o 2,000 ms.

### Características No Soportadas en Frontend (Requieren Backend JVM)
- Entrada por consola interactiva `Scanner(System.in)`.
- Concurrencia y multihilo (`Thread`, `Runnable`, `ExecutorService`).
- Acceso a archivos locales (`java.io.*`, `java.nio.*`).
- Conexiones de red directas por sockets (`java.net.*`).
- Reflection API avanzada (`Class.forName`, introspección dinámica).

---

## 🧪 Simulador de JUnit 5

El servicio `JUnitSimulationService` detecta métodos con la anotación `@Test` y ejecuta una suite de pruebas unitarias emulada.

> [!NOTE]
> Las pruebas unitarias no se ejecutan mediante un runner de JUnit real ni una JVM en el servidor. El evaluador extrae los métodos anotados con `@Test`, transpila las aserciones y genera un informe estructurado de aprobados/fallidos.

### Aserciones Soportadas

| Aserción Java | Comportamiento en Simulación |
| :--- | :--- |
| `assertEquals(expected, actual)` | Compara valores primitivos, cadenas y arreglos por valor. |
| `assertEquals(expected, actual, delta)` | Compara números de coma flotante permitiendo un margen de tolerancia `delta`. |
| `assertTrue(condition)` | Verifica que la expresión booleana sea estrictamente `true`. |
| `assertFalse(condition)` | Verifica que la expresión booleana sea estrictamente `false`. |
| `assertNotNull(object)` | Verifica que la referencia no sea `null` ni `undefined`. |
| `assertNull(object)` | Verifica que la referencia sea estrictamente `null`. |
| `assertThrows(Class, executable)` | Verifica que la lambda o bloque lance la excepción especificada. |

---

## 📐 Simulador de Apache Commons Math 3

El módulo `ApacheCommonsMathSimulationService` provee una implementación pedagógica de las clases más frecuentes de Apache Commons Math 3.

### Matriz de Compatibilidad de APIs

| Clase | Método / API | Estado | Detalle |
| :--- | :--- | :---: | :--- |
| **`StatUtils`** | `mean(double[])` | ✅ **Soportado** | Media aritmética |
| **`StatUtils`** | `variance(double[])` | ✅ **Soportado** | Varianza muestral |
| **`StatUtils`** | `max(double[])` / `min(double[])` | ✅ **Soportado** | Máximo y mínimo |
| **`StatUtils`** | `sum(double[])` / `product(double[])` | ✅ **Soportado** | Sumatoria y productoria |
| **`StatUtils`** | `percentile(double[], p)` | ✅ **Soportado** | Percentil con interpolación lineal |
| **`MatrixUtils`** | `createRealMatrix(double[][])` | ✅ **Soportado** | Instancia de matriz 2D |
| **`RealMatrix`** | `getData()` | ✅ **Soportado** | Retorna arreglo nativo `double[][]` |
| **`RealMatrix`** | `getRowDimension()` / `getColumnDimension()` | ✅ **Soportado** | Dimensiones de filas y columnas |
| **`RealMatrix`** | `getEntry(r, c)` / `setEntry(r, c, v)` | ✅ **Soportado** | Lectura/escritura con bounds check |
| **`RealMatrix`** | `add(RealMatrix)` | ✅ **Soportado** | Suma matricial con validación dimensional |
| **`RealMatrix`** | `multiply(RealMatrix)` | ✅ **Soportado** | Multiplicación matricial estándar |
| **`RealMatrix`** | `transpose()` | ✅ **Soportado** | Transposición de matriz |
| **`RealMatrix`** | `getDeterminant()` | ❌ **No soportado** | Requiere descomposición LU en JVM |
| **`FastMath`** | `abs`, `ceil`, `floor`, `pow`, `sqrt`, `log`, `log10`, `round`, `signum` | ✅ **Soportado** | Funciones matemáticas optimizadas |
| **`ArithmeticUtils`** | `gcd(a, b)`, `lcm(a, b)`, `factorial(n)` | ✅ **Soportado** | Operaciones aritméticas y combinatorias |
| **Distribuciones** | `NormalDistribution`, `PoissonDistribution` | ❌ **No soportado** | Planeado para backend JVM |
| **Optimización** | `MultivariateOptimizer`, `ODEIntegrator` | ❌ **No soportado** | Requiere JVM completa |

---

## 🐍 Python Sandbox (Pyodide WebAssembly)

El servicio `PyodideExecutionService` ejecuta Python 3.11+ directamente en el hilo del navegador utilizando Pyodide compilado a WebAssembly.

### Características
- **Ejecución Completa de Python:** Listas, tuplas, diccionarios, conjuntos, list comprehensions, funciones generadoras, clases y manejo de excepciones (`try/except`).
- **Transformación AST para `input()` Asíncrono:** Reescribe las llamadas a `input(prompt)` como operaciones asíncronas (`await __mycode_async_input__`) integradas con el modal y la consola de React.
- **Soporte de `requests` & `pyodide-http`:** Carga dinámica de la librería `requests` con emulación HTTP sobre la API `fetch` del navegador.
- **Diagnóstico Educativo de CORS:** Si un servidor de destino bloquea la solicitud por políticas de Same-Origin, el motor detecta el error de red y muestra una explicación clara con sugerencias de endpoints educativos compatibles (ej. `httpbin.org`, `jsonplaceholder.typicode.com`).

---

## 💬 Simulación de Diálogos Gráficos JOptionPane

El simulador incluye una implementación de los diálogos de `javax.swing.JOptionPane` mediante modales de React con diseño opaco, accesibilidad de teclado y retorno asíncrono de valores:

```java
// Tipos de Diálogos Soportados:
JOptionPane.showMessageDialog(null, "Operación exitosa", "Título", JOptionPane.INFORMATION_MESSAGE);
String nombre = JOptionPane.showInputDialog(null, "¿Tu nombre?", "Entrada", JOptionPane.QUESTION_MESSAGE);
int confirm = JOptionPane.showConfirmDialog(null, "¿Deseas continuar?", "Confirmar", JOptionPane.YES_NO_OPTION);
int opcion = JOptionPane.showOptionDialog(null, "Elige:", "Opciones", JOptionPane.DEFAULT_OPTION, JOptionPane.PLAIN_MESSAGE, null, opcionesArray, opcionesArray[0]);
```

### Constantes Swing Soportadas
- **Opciones de Diálogo:** `DEFAULT_OPTION (-1)`, `YES_NO_OPTION (0)`, `YES_NO_CANCEL_OPTION (1)`, `OK_CANCEL_OPTION (2)`.
- **Respuestas de Usuario:** `YES_OPTION (0)`, `NO_OPTION (1)`, `CANCEL_OPTION (2)`, `OK_OPTION (0)`, `CLOSED_OPTION (-1)`.
- **Tipos de Mensaje:** `ERROR_MESSAGE (0)`, `INFORMATION_MESSAGE (1)`, `WARNING_MESSAGE (2)`, `QUESTION_MESSAGE (3)`, `PLAIN_MESSAGE (-1)`.

---

## 🎛️ Módulos y Características de la Plataforma

### 1. Sistema de Autenticación y Seguridad
- **Inicio de sesión y Registro:** Validación de credenciales contra almacén local (`localStorage`).
- **Protección contra Fuerza Bruta (A.3):** Bloqueo automático de 4 horas tras 6 intentos consecutivos fallidos de contraseña.
- **Simulación de Notificación por Correo:** Emisión de alerta de seguridad en `mycode_security_emails`.
- **Control de Acceso basado en Roles (RBAC):** Restricción de rutas y acciones (`/instructor`, analítica de cursos, edición) exclusivas para usuarios con rol `instructor`.

### 2. Catálogo de Cursos & Reproductor Interactivo
- **Catálogo Filtrable:** Búsqueda por nivel, categoría y título.
- **Visor de Lecciones:** Reproducción de video con almacenamiento de progreso por lección y marcado automático de cursos completados.
- **Gestión de Ciclo de Vida (A.2):** Los instructores pueden publicar, despublicar y actualizar el estado de sus cursos en tiempo real.

### 3. Centro de Autoría Docente y Analítica (A.4)
- **Panel de Instructor:** Vista centralizada de cursos creados, alumnos inscritos y entregas pendientes.
- **Métricas Analíticas:** Tasa de finalización de curso, promedio de calificaciones de alumnos y cálculo de la lección con mayor tasa de abandono.
- **Anti-Spam de Notificaciones (A.1):** Agrupación inteligente de entregas no leídas para evitar saturación del panel de alertas.

### 4. Billetera, Paquetes de Tokens y Carrito de Compra (Frontend / Mock)
- **4 Paquetes Estructurados:** "Puñado de Tokens" (100 tk), "Balde de Tokens" (500 tk), "Vagón de Tokens" (1.500 tk, Destacado/Popular) y "Montaña de Tokens" (5.000 tk).
- **Carrito de Compras:** Drawer lateral interactivo con selección de cantidades, eliminación, subtotal, cálculo de tokens acumulados y persistencia en `localStorage`.
- **Flujo de Checkout Prototipo:** Modal informativo que notifica el estado de prototipo educativo frontend sin cobros monetarios reales.
- **Acceso desde Navbar:** Botón de carrito con badge numérico en tiempo real en cabecera desktop y menú móvil.
- **Saldo e Historial:** Control de consumo de tokens por compilación y registro de transacciones con soporte multiidioma.

### 5. Internacionalización Reactiva (i18n)
- **Cambio Dinámico ES ↔ EN:** Transición instantánea sin recarga de página mediante `LanguageContext`.
- **Simetría Total de Diccionarios:** 540+ claves idénticas sincronizadas entre `src/translations/es.json` y `src/translations/en.json`.

---

## 💻 Ejemplos de Código Soportados

### 1. Java: Control de Flujo, Métodos y Try/Catch

```java
public class Main {
    public static void main(String[] args) {
        try {
            int resultado = calcularFactorial(5);
            System.out.println("Factorial de 5: " + resultado);
            
            int error = Integer.parseInt("no_es_numero");
        } catch (NumberFormatException e) {
            System.out.println("Excepción capturada con éxito: " + e);
        }
    }

    public static int calcularFactorial(int n) {
        int fact = 1;
        for (int i = 1; i <= n; i++) {
            fact *= i;
        }
        return fact;
    }
}
```

### 2. Java: JOptionPane Interactivo con showOptionDialog

```java
import javax.swing.JOptionPane;

public class Main {
    public static void main(String[] args) {
        String[] opciones = {"USD a EUR", "EUR a USD", "Salir"};
        
        int seleccion = JOptionPane.showOptionDialog(
            null,
            "Selecciona la operación:",
            "Conversor de Divisas",
            JOptionPane.DEFAULT_OPTION,
            JOptionPane.QUESTION_MESSAGE,
            null,
            opciones,
            opciones[0]
        );

        if (seleccion == 0) {
            JOptionPane.showMessageDialog(null, "Seleccionaste USD a EUR", "Info", JOptionPane.INFORMATION_MESSAGE);
        } else if (seleccion == JOptionPane.CLOSED_OPTION) {
            JOptionPane.showMessageDialog(null, "Diálogo cancelado", "Aviso", JOptionPane.WARNING_MESSAGE);
        }
    }
}
```

### 3. Java: Pruebas Unitarias con JUnit 5

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CalculadoraTest {
    @Test
    public void testOperacionesBasicas() {
        int suma = 10 + 20;
        assertEquals(30, suma);
        assertTrue(suma > 0);
        assertNotNull("MyCode");
    }

    @Test
    public void testDivisionPorCero() {
        assertThrows(ArithmeticException.class, () -> {
            int x = 10 / 0;
        });
    }
}
```

### 4. Java: Apache Commons Math (Matrices y Estadísticas)

```java
import org.apache.commons.math3.stat.StatUtils;
import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;

public class Main {
    public static void main(String[] args) {
        double[] datos = {12.5, 18.2, 24.1, 30.0, 15.8};
        System.out.println("Media: " + StatUtils.mean(datos));
        System.out.println("Varianza: " + StatUtils.variance(datos));

        double[][] matrizA = {{1.0, 2.0}, {3.0, 4.0}};
        double[][] matrizB = {{2.0, 0.0}, {1.0, 2.0}};
        
        RealMatrix m1 = MatrixUtils.createRealMatrix(matrizA);
        RealMatrix m2 = MatrixUtils.createRealMatrix(matrizB);
        RealMatrix producto = m1.multiply(m2);

        System.out.println("Producto m1 x m2 [0,0]: " + producto.getEntry(0, 0));
    }
}
```

### 5. Python: Entrada Interactiva y Peticiones HTTP

```python
import json
import requests

# Entrada interactiva mediante modal React
usuario = input("Ingresa tu nombre de usuario: ")
print(f"Bienvenido, {usuario}!")

# Solicitud HTTP con pyodide-http
respuesta = requests.get("https://jsonplaceholder.typicode.com/todos/1")
if respuesta.status_code == 200:
    datos = respuesta.json()
    print("Tarea obtenida:", datos.get("title"))
```

---

## 📁 Estructura del Repositorio

```text
mycode/
├── README.md                    # Documentación principal de la plataforma
├── index.html                   # Entrypoint HTML de la aplicación Vite
├── package.json                 # Metadatos del proyecto y dependencias
├── vite.config.js               # Configuración de compilación Vite
├── scripts/
│   ├── build.js                 # Script de compilación programática
│   ├── dev.js                   # Servidor de desarrollo local
│   └── preview.js               # Servidor de previsualización de producción
├── src/
│   ├── main.jsx                 # Punto de entrada React (DOM Mounting)
│   ├── App.jsx                  # Enrutador principal y proveedores de contexto
│   ├── index.css                # Estilos globales y variables de tema
│   ├── components/
│   │   ├── code/                # Componentes del editor Monaco y Terminal
│   │   │   ├── CodeEditor.jsx   # Editor con gestión de modales JOptionPane
│   │   │   └── TerminalConsole.jsx # Consola con soporte de entrada interactiva
│   │   ├── common/              # Modales, botones, ErrorBoundary, tarjetas
│   │   ├── instructor/          # Modales de nuevo curso, streaming y ejercicios
│   │   ├── layout/              # Navbar, Footer y contenedores principales
│   │   └── video/               # Reproductor de video interactivo con progreso
│   ├── context/                 # Estado global (Auth, Wallet, Theme, i18n, Stream)
│   ├── services/
│   │   ├── api.js               # Capa de servicios con almacenamiento reactivo
│   │   ├── mockData.js          # Datos iniciales (usuarios, cursos, ejercicios)
│   │   └── execution/           # Motores de ejecución frontend
│   │       ├── ExecutionService.js # Enrutador maestro según lenguaje/modo
│   │       ├── JavaExecutionService.js # Transpilador y simulador Java
│   │       ├── JUnitSimulationService.js # Simulador de pruebas @Test
│   │       ├── ApacheCommonsMathSimulationService.js # Emulación de Commons Math
│   │       ├── PyodideExecutionService.js # Motor Python WebAssembly
│   │       ├── detectJavaMode.js # Detección automática (main vs JUnit vs CMath)
│   │       └── i18nRuntime.js   # Mensajes de error traducidos del runtime
│   ├── translations/
│   │   ├── es.json              # Diccionario en Español (540+ claves)
│   │   └── en.json              # Diccionario en Inglés (540+ claves)
│   └── views/                   # Pantallas principales de la plataforma
└── tests/ (Archivos raíz)
    ├── test_java_suite.mjs      # Suite de simulación Java (14 pruebas)
    ├── test_option_dialog_suite.mjs # Suite de JOptionPane.showOptionDialog (6 pruebas)
    ├── test_joptionpane.mjs     # Suite de diálogos Swing (6 pruebas)
    ├── test_requests_and_junit.mjs # Suite de JUnit, requests y CORS (14 pruebas)
    └── test_block_a_b.mjs       # Suite de auditoría Bloque A & B (30 pruebas)
```

---

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
- **Node.js:** Versión 18.0.0 o superior instalada.
- **NPM:** Gestor de paquetes incluido con Node.js.

### Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/mycode.git
   cd mycode
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

### Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Hot Module Replacement (HMR). |
| `npm run build` | Compila los assets optimizados para producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción generado. |
| `npm test` | Ejecuta la suite principal de pruebas automatizadas del simulador Java. |

---

## 🛡️ Suites de Pruebas y Calidad (QA)

El proyecto cuenta con suites de pruebas unitarias y de integración end-to-end (100% de cobertura funcional sin dependencias externas):

```bash
# 1. Suite Integral de Simulación Java (14 pruebas)
node test_java_suite.mjs

# 2. Suite de Diálogos JOptionPane.showOptionDialog (6 pruebas)
node test_option_dialog_suite.mjs

# 3. Suite General de Diálogos JOptionPane (6 pruebas)
node test_joptionpane.mjs

# 4. Suite de JUnit 5, Enrutamiento y Diagnóstico CORS (14 pruebas)
node test_requests_and_junit.mjs

# 5. Suite de Auditoría de Negocio (Bloque A) y Simetría i18n (Bloque B) (30 pruebas)
node test_block_a_b.mjs

# 6. Suite del Sistema de Tokens, Carrito e Integridad de Paquetes (6 pruebas)
node test_cart_and_tokens_suite.mjs

# 7. Suite de Generador de Claves, Microinteracciones de Navbar y Theme Toggle (7 pruebas)
node test_ui_improvements_suite.mjs
```

### Resumen de Resultados QA:
- **Total de pruebas automatizadas:** 83 pruebas.
- **Tasa de éxito:** 100% (83/83 pruebas aprobadas).
- **Estado de Compilación:** `vite build` completa en ~15s con 0 errores y 0 warnings.
