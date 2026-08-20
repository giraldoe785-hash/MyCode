// src/services/execution/i18nRuntime.js
// Modulo singleton de i18n para servicios que no son componentes React.

let currentLocale = 'es';

/**
 * I18nRuntime: traducciones para servicios de ejecucion (Java, JUnit, Pyodide, Apache Commons Math, JSON).
 * Uso: I18nRuntime.getMessage('clave', { param: valor })
 */
class I18nRuntime {
    static setLocale(locale) {
        if (locale === 'es' || locale === 'en') currentLocale = locale;
    }
    static getLocale() { return currentLocale; }

    static getMessage(key, params) {
        const msgs = MESSAGES[currentLocale] || MESSAGES.es;
        const fb   = MESSAGES.es;
        let msg = (msgs && key in msgs) ? msgs[key] : ((fb && key in fb) ? fb[key] : key);
        if (params && typeof params === 'object') {
            for (const [k, v] of Object.entries(params)) {
                msg = msg.replaceAll('{' + k + '}', String(v == null ? '' : v));
            }
        }
        return msg;
    }
}

const MESSAGES = {
    es: {
        'sandbox.java.banner':                    'Java — Simulación',
        'sandbox.java.banner.frontend':           'Java — Simulación Frontend',
        'sandbox.simulation.banner_commons_math': 'Apache Commons Math — Simulación Educativa',
        'sandbox.java.empty_editor':              'El editor está vacío. Ingrese código Java para ejecutar.',
        'sandbox.java.unsupported':               'Característica no soportada: {name}\n{reason}\n\nNota: Esta funcionalidad se ejecutará nativamente cuando se conecte el Backend JVM de MyCode Pro.',
        'sandbox.java.no_main':                   'Error: No se encontró el método principal:\npublic static void main(String[] args)',
        'sandbox.java.exec_complete':             '--- Ejecución completada ---',
        'sandbox.java.error.generic':             'Error de ejecución: {message}',
        'sandbox.java.error.arithmetic':          'Error de ejecución:\njava.lang.ArithmeticException: / by zero (División entera por cero).',
        'sandbox.java.error.undefined':           "Error: Variable no declarada ('{name}').\n\nRecomendación: En Java todas las variables deben declararse con su tipo antes de usarse (ej. int {name} = 0;).",
        'sandbox.java.error.undefined.novar':     'Error: Variable no declarada.\n\nRecomendación: En Java todas las variables deben declararse con su tipo antes de usarse.',
        'sandbox.java.error.timeout':             'Error de ejecución:\n{message}',
        'sandbox.java.error.syntax':              'Error de sintaxis:\nNo se pudo interpretar una de las expresiones o estructuras.\n\nDetalle: {detail}\nRecomendación: Verifique que la sintaxis pertenezca al subconjunto básico de Java (tipos primitivos, if/else, for/while, arrays o métodos estáticos).',
        'sandbox.runtime.tick.iterations':        'Límite de iteraciones excedido (50.000): Posible bucle infinito detectado.',
        'sandbox.runtime.tick.timeout':           'Tiempo máximo de ejecución alcanzado (2s): Posible bucle infinito detectado.',
        'sandbox.runtime.output_limit':           '[Output truncado: se alcanzó el límite de 150 líneas para proteger el rendimiento]',
        'sandbox.junit.banner':                   'Resultados de Tests — Simulación Educativa JUnit',
        'sandbox.junit.banner.cmath':             'Resultados de Tests (con Apache Commons Math)',
        'sandbox.junit.empty_editor':             'El editor está vacío. Ingrese tests con @Test para ejecutar.',
        'sandbox.junit.unsupported':              'Característica no soportada en tests: {name}\n{reason}\n\nNota: La ejecución de tests complejos con mocks o concurrencia se habilitará con el backend JVM.',
        'sandbox.junit.no_tests':                 'No se encontraron métodos anotados con @Test.\nEjemplo:\n@Test\npublic void sumaDebeFuncionar() {\n    assertEquals(10, sumar(4, 6));\n}',
        'sandbox.junit.passed':                   'PASÓ',
        'sandbox.junit.failed':                   'FALLÓ',
        'sandbox.junit.detail':                   'Detalle:',
        'sandbox.junit.summary':                  'Resumen: {passed}/{total} tests aprobados ({percent}% éxito) [{duration}s]',
        'sandbox.junit.honesty_note':             '[Nota de Honestidad: Simulación educativa frontend de @Test y aserciones. No requiere JVM]',
        'sandbox.junit.cmath_note':               '[Apache Commons Math 3 — Subconjunto educativo frontend]',
        // ── Apache Commons Math Errores ─────────────────────────────────────
        'sandbox.cmath.error.empty_matrix':       'Error en RealMatrix: La matriz no puede estar vacía.',
        'sandbox.cmath.error.non_rectangular':    'Error en RealMatrix: Todas las filas deben tener la misma dimensión.',
        'sandbox.cmath.error.out_of_bounds':      'Índice ({row}, {column}) fuera de rango.',
        'sandbox.cmath.error.invalid_matrix':     'Se esperaba una instancia válida de RealMatrix.',
        'sandbox.cmath.error.matrix_dim_mismatch': 'Las dimensiones de las matrices deben coincidir ({r1}x{c1} vs {r2}x{c2}).',
        'sandbox.cmath.error.matrix_mult_dim_mismatch': 'Para multiplicar matrices, las columnas de la primera ({c1}) deben coincidir con las filas de la segunda ({r2}).',

    },
    en: {
        'sandbox.java.banner':                    'Java — Simulation',
        'sandbox.java.banner.frontend':           'Java — Frontend Simulation',
        'sandbox.simulation.banner_commons_math': 'Apache Commons Math — Educational Simulation',
        'sandbox.java.empty_editor':              'The editor is empty. Enter Java code to execute.',
        'sandbox.java.unsupported':               'Unsupported feature: {name}\n{reason}\n\nNote: This functionality will run natively when the MyCode Pro JVM Backend is connected.',
        'sandbox.java.no_main':                   'Error: Main method not found:\npublic static void main(String[] args)',
        'sandbox.java.exec_complete':             '--- Execution complete ---',
        'sandbox.java.error.generic':             'Execution error: {message}',
        'sandbox.java.error.arithmetic':          'Execution error:\njava.lang.ArithmeticException: / by zero (Integer division by zero).',
        'sandbox.java.error.undefined':           "Error: Undeclared variable ('{name}').\n\nRecommendation: In Java, all variables must be declared with their type before use (e.g. int {name} = 0;).",
        'sandbox.java.error.undefined.novar':     'Error: Undeclared variable.\n\nRecommendation: In Java, all variables must be declared with their type before use.',
        'sandbox.java.error.timeout':             'Execution error:\n{message}',
        'sandbox.java.error.syntax':              'Syntax error:\nCould not interpret one of the expressions or structures.\n\nDetail: {detail}\nRecommendation: Verify that the syntax belongs to the basic Java subset (primitive types, if/else, for/while, arrays or static methods).',
        'sandbox.runtime.tick.iterations':        'Iteration limit exceeded (50,000): Possible infinite loop detected.',
        'sandbox.runtime.tick.timeout':           'Maximum execution time reached (2s): Possible infinite loop detected.',
        'sandbox.runtime.output_limit':           '[Output truncated: 150 line limit reached to protect performance]',
        'sandbox.junit.banner':                   'Test Results — JUnit Educational Simulation',
        'sandbox.junit.banner.cmath':             'Test Results (with Apache Commons Math)',
        'sandbox.junit.empty_editor':             'The editor is empty. Enter @Test tests to execute.',
        'sandbox.junit.unsupported':              'Unsupported feature in tests: {name}\n{reason}\n\nNote: Complex tests with mocks or concurrency will be enabled with the JVM backend.',
        'sandbox.junit.no_tests':                 'No methods annotated with @Test were found.\nExample:\n@Test\npublic void sumShouldWork() {\n    assertEquals(10, sum(4, 6));\n}',
        'sandbox.junit.passed':                   'PASSED',
        'sandbox.junit.failed':                   'FAILED',
        'sandbox.junit.detail':                   'Detail:',
        'sandbox.junit.summary':                  'Summary: {passed}/{total} tests passed ({percent}% success) [{duration}s]',
        'sandbox.junit.honesty_note':             '[Honesty Note: Educational frontend simulation of @Test and assertions. No JVM required]',
        'sandbox.junit.cmath_note':               '[Apache Commons Math 3 — Educational frontend subset]',
        // ── Apache Commons Math Errors ─────────────────────────────────────
        'sandbox.cmath.error.empty_matrix':       'RealMatrix error: Matrix cannot be empty.',
        'sandbox.cmath.error.non_rectangular':    'RealMatrix error: All rows must have the same dimension.',
        'sandbox.cmath.error.out_of_bounds':      'Index ({row}, {column}) out of bounds.',
        'sandbox.cmath.error.invalid_matrix':     'Expected a valid RealMatrix instance.',
        'sandbox.cmath.error.matrix_dim_mismatch': 'Matrix dimensions must match ({r1}x{c1} vs {r2}x{c2}).',
        'sandbox.cmath.error.matrix_mult_dim_mismatch': 'Matrix multiplication error: First matrix columns ({c1}) must match second matrix rows ({r2}).',

    }
};

export default I18nRuntime;
