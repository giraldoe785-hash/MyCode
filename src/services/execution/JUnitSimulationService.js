/**
 * JUnitSimulationService
 * 
 * =========================================================================
 * SIMULADOR EDUCATIVO DE JUNIT 5 (100% FRONTEND)
 * =========================================================================
 * 
 * Principio de Honestidad Arquitectónica:
 * - NO ejecuta JUnit real sobre una máquina virtual Java (JVM), ni requiere javac.
 * - Simula de forma pedagógica y transparente la experiencia de escribir y
 *   evaluar pruebas unitarias (@Test y aserciones comunes).
 * 
 * -------------------------------------------------------------------------
 * SUBCONJUNTO DE JUNIT SOPORTADO:
 * -------------------------------------------------------------------------
 * 1. Anotación: @Test
 * 2. Aserciones estándar:
 *    - assertEquals(expected, actual) / assertEquals(expected, actual, delta)
 *    - assertTrue(condition) / assertFalse(condition)
 *    - assertNotNull(object)
 *    - assertThrows(Exception.class, () -> { ... })
 * 3. Integración con Apache Commons Math (via cMathHelpers)
 * 4. Number__javaDiv y __tick inyectados explícitamente en el scope del runner
 * 
 * -------------------------------------------------------------------------
 * CARACTERÍSTICAS NO SOPORTADAS (Requieren Backend JVM):
 * -------------------------------------------------------------------------
 * - @BeforeEach, @AfterEach, @BeforeAll, @AfterAll
 * - @ParameterizedTest, @ValueSource, @CsvSource
 * - @ExtendWith, SpringBootTest, MockitoExtension
 * - Mocks e Inyección de dependencias (Mockito, @Mock, @InjectMocks)
 * - Pruebas multihilo con timeouts de concurrencia
 * =========================================================================
 */

import { JavaExecutionService } from './JavaExecutionService.js';
import I18nRuntime from './i18nRuntime.js';

export class JUnitSimulationService {
  /**
   * Determina si el código contiene anotaciones de prueba @Test
   */
  static hasTests(code = '') {
    return /@Test\b/.test(code);
  }

  /**
   * Extrae los métodos anotados con @Test del código Java
   */
  static extractTestMethods(cleanCode) {
    const testMethods = [];
    const testRegex = /@Test\s+(?:public\s+|private\s+|protected\s+)?(?:void\s+)?([a-zA-Z_]\w*)\s*\(\s*\)\s*\{/g;
    let match;

    while ((match = testRegex.exec(cleanCode)) !== null) {
      const methodName = match[1];
      const startIndex = match.index;
      const openBrace = cleanCode.indexOf('{', startIndex);

      let depth = 1;
      let pos = openBrace + 1;
      while (pos < cleanCode.length && depth > 0) {
        if (cleanCode[pos] === '{') depth++;
        else if (cleanCode[pos] === '}') depth--;
        if (depth === 0) break;
        pos++;
      }

      if (depth === 0) {
        const body = cleanCode.substring(openBrace + 1, pos - 1).trim();
        testMethods.push({ name: methodName, body });
      }
    }

    return testMethods;
  }

  /**
   * Transpila el cuerpo de un @Test usando el pipeline completo de JavaExecutionService
   */
  static transformTestBody(body, typeEnv) {
    // Pipeline completo: normalizar loops → transpilar → divisiones tipadas → __tick
    const normalized = JavaExecutionService.normalizeLoopBraces(body);
    let transformed = JavaExecutionService.transformJavaBlock(normalized, typeEnv);
    transformed = JavaExecutionService.injectTypedDivisions(transformed, typeEnv);
    transformed = JavaExecutionService.injectTickGuard(transformed);

    // Transformación de assertThrows
    transformed = transformed.replace(
      /assertThrows\s*\(\s*(\w+)\.class\s*,\s*\(\s*\)\s*->\s*(?:\{([\s\S]*?)\}|([^\n;]+;?))\s*\);/g,
      (match, exc, blockBody, singleBody) => {
        const raw = (blockBody || singleBody || '').trim();
        return `__assertThrows("${exc}", () => { ${raw} });`;
      }
    );

    // Transformación de aserciones JUnit estándar (soporta argumentos multilínea)
    transformed = transformed
      .replace(/\bassertEquals\s*\(([\s\S]*?)\);/g, '__assertEquals($1);')
      .replace(/\bassertTrue\s*\(([\s\S]*?)\);/g, '__assertTrue($1);')
      .replace(/\bassertFalse\s*\(([\s\S]*?)\);/g, '__assertFalse($1);')
      .replace(/\bassertNotNull\s*\(([\s\S]*?)\);/g, '__assertNotNull($1);')
      .replace(/\bassertNull\s*\(([\s\S]*?)\);/g, '__assertNull($1);');

    return transformed;
  }

  /**
   * Ejecuta el conjunto de pruebas unitarias simuladas.
   * @param {string} rawCode - Código fuente Java con @Test
   * @param {Object} options - Callbacks + cMathHelpers (de ApacheCommonsMathSimulationService)
   */
  static async execute(rawCode, { onOutput, cMathHelpers = null, mode = 'junit' } = {}) {
    await new Promise(r => setTimeout(r, 60));
    const code = (rawCode || '').trim();

    if (!code) {
      return {
        success: false,
        isUserError: true,
        status: 'error',
        error: `[${I18nRuntime.getMessage('sandbox.junit.banner')}]\n${I18nRuntime.getMessage('sandbox.junit.empty_editor')}`,
        output: ''
      };
    }

    // 1. Verificación de características avanzadas no soportadas
    const unsupported = JavaExecutionService.detectUnsupportedFeatures(code);
    if (unsupported) {
      const unsupportedMsg = `[${I18nRuntime.getMessage('sandbox.junit.banner')}]\n\n${I18nRuntime.getMessage('sandbox.junit.unsupported', { name: unsupported.name, reason: unsupported.reason })}`;
      if (onOutput) onOutput(unsupportedMsg);
      return {
        success: false,
        isUnsupported: true,
        status: 'unsupported',
        error: unsupportedMsg,
        output: ''
      };
    }

    // 2. Limpieza de comentarios, Type Environment y extracción de tests
    const cleanCode = JavaExecutionService.cleanComments(code);
    const typeEnv = JavaExecutionService.buildTypeEnv(cleanCode);
    const testMethods = this.extractTestMethods(cleanCode);

    if (testMethods.length === 0) {
      return {
        success: false,
        isUserError: true,
        status: 'error',
        error: `[${I18nRuntime.getMessage('sandbox.junit.banner')}]\n${I18nRuntime.getMessage('sandbox.junit.no_tests')}`,
        output: ''
      };
    }

    // 3. Extraer métodos auxiliares (no-@Test, no-main)
    const helperRegex = /(?:public\s+|private\s+|protected\s+)?static\s+[\w<>\[\]]+\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    let match;
    const helperFunctions = [];

    while ((match = helperRegex.exec(cleanCode)) !== null) {
      const methodName = match[1];
      const paramsStr = match[2];
      const startIndex = match.index;
      const openBrace = cleanCode.indexOf('{', startIndex);

      let depth = 1;
      let pos = openBrace + 1;
      while (pos < cleanCode.length && depth > 0) {
        if (cleanCode[pos] === '{') depth++;
        else if (cleanCode[pos] === '}') depth--;
        if (depth === 0) break;
        pos++;
      }

      if (depth === 0) {
        const rawBody = cleanCode.substring(openBrace + 1, pos - 1);
        const jsParams = paramsStr.split(',').map(p => p.trim()).filter(Boolean)
          .map(p => p.split(/\s+/).pop().replace(/\[\]/g, '')).join(', ');

        // Pipeline completo para helpers
        const normalized = JavaExecutionService.normalizeLoopBraces(rawBody);
        const transpiledBody = JavaExecutionService.transformJavaBlock(normalized, typeEnv);
        const dividedBody = JavaExecutionService.injectTypedDivisions(transpiledBody, typeEnv);
        const guardedBody = JavaExecutionService.injectTickGuard(dividedBody);
        helperFunctions.push(`function ${methodName}(${jsParams}) {\n${guardedBody}\n}`);
      }
    }

    // 4. Construir bloque de helpers de Commons Math si aplica
    let cMathBlock = '';
    if (cMathHelpers) {
      // Inyectar cada clase como variable local del runner
      const entries = Object.entries(cMathHelpers);
      cMathBlock = entries.map(([name]) => `const ${name} = __cMathHelpers.${name};`).join('\n');
    }

    // 5. Ejecución secuencial de cada @Test
    const testResults = [];
    const startTime = performance.now();

    // Guardián de iteraciones con tiempo: compartido entre tests
    let ticks = 0;
    const MAX_TICKS = 50000;
    const MAX_MS = 2000;
    const tickStart = performance.now();

    const __tick = () => {
      ticks++;
      if (ticks > MAX_TICKS) {
        throw new Error('Límite de iteraciones excedido (50.000): Posible bucle infinito detectado.');
      }
      if (ticks % 1000 === 0 && (performance.now() - tickStart) > MAX_MS) {
        throw new Error('Tiempo máximo de ejecución alcanzado (2s): Posible bucle infinito detectado.');
      }
    };

    // Number__javaDiv: parámetro explícito del runner + whitelist del analizador
    // Necesita __javaDouble definido en el scope del test individual (passado como arg)
    // Se redefine inline por test para capturar el __javaDouble local de ese test.
    // La definición de __javaDouble se hace dentro del loop para tenerla en scope.
    const _makeDiv = (__jd) => (a, b, isIntDiv) => {
      const aVal = (a !== null && typeof a === 'object') ? a.valueOf() : Number(a);
      const bVal = (b !== null && typeof b === 'object') ? b.valueOf() : Number(b);
      if (bVal === 0) {
        if (isIntDiv) throw new Error('java.lang.ArithmeticException: / by zero');
        return __jd(aVal / bVal);
      }
      const result = aVal / bVal;
      return isIntDiv ? Math.trunc(result) : __jd(result);
    };

    for (const test of testMethods) {
      const assertions = [];

      const transformedBody = this.transformTestBody(test.body, typeEnv);

      const runnerCode = `
        ${helperFunctions.join('\n\n')}

        ${cMathBlock}

        function __println() {}
        function __print() {}

        function assertEquals(expected, actual, deltaOrMsg, msg) {
          __assertEquals(expected, actual, deltaOrMsg, msg);
        }
        function assertTrue(cond, msg) {
          __assertTrue(cond, msg);
        }
        function assertFalse(cond, msg) {
          __assertFalse(cond, msg);
        }
        function assertNotNull(val, msg) {
          __assertNotNull(val, msg);
        }
        function assertNull(val, msg) {
          __assertNull(val, msg);
        }

        function __assertEquals(expected, actual, deltaOrMsg, msg) {
          let pass;
          let message;
          // Soporte de delta: assertEquals(expected, actual, delta) donde delta es número
          if (typeof deltaOrMsg === 'number') {
            pass = Math.abs(expected - actual) <= deltaOrMsg;
            message = msg || ('Esperado: ' + expected + ' ±' + deltaOrMsg + ', Obtenido: ' + actual);
          } else {
            pass = (typeof expected === 'object' || typeof actual === 'object')
              ? JSON.stringify(expected) === JSON.stringify(actual)
              : expected === actual;
            message = deltaOrMsg || ('Esperado: ' + JSON.stringify(expected) + ', Obtenido: ' + JSON.stringify(actual));
          }
          __assertions.push({ type: 'assertEquals', expected, actual, pass, message });
          if (!pass) __testPassedRef.val = false;
        }

        function __assertTrue(cond, msg) {
          const pass = Boolean(cond) === true;
          __assertions.push({
            type: 'assertTrue', expected: true, actual: cond, pass,
            message: msg || ('Esperado: true, Obtenido: ' + JSON.stringify(cond))
          });
          if (!pass) __testPassedRef.val = false;
        }

        function __assertFalse(cond, msg) {
          const pass = Boolean(cond) === false;
          __assertions.push({
            type: 'assertFalse', expected: false, actual: cond, pass,
            message: msg || ('Esperado: false, Obtenido: ' + JSON.stringify(cond))
          });
          if (!pass) __testPassedRef.val = false;
        }

        function __assertNotNull(val, msg) {
          const pass = val !== null && val !== undefined;
          __assertions.push({
            type: 'assertNotNull', expected: 'no nulo', actual: val, pass,
            message: msg || ('Esperado: objeto no nulo, Obtenido: ' + String(val))
          });
          if (!pass) __testPassedRef.val = false;
        }

        function __assertThrows(expectedException, fn) {
          let thrown = null;
          try { fn(); } catch (e) { thrown = e; }
          const pass = thrown !== null;
          __assertions.push({
            type: 'assertThrows', expected: expectedException,
            actual: thrown ? thrown.name || 'Exception' : 'Ninguna excepción', pass,
            message: pass ? ('Lanzó ' + expectedException) : ('No lanzó ' + expectedException)
          });
          if (!pass) __testPassedRef.val = false;
        }

        function __assertNull(val, msg) {
          const pass = val === null || val === undefined;
          __assertions.push({
            type: 'assertNull', expected: 'null', actual: val, pass,
            message: msg || ('Esperado: null, Obtenido: ' + String(val))
          });
          if (!pass) __testPassedRef.val = false;
        }

        try {
          ${transformedBody}
        } catch (err) {
          __testPassedRef.val = false;
          __failureReasonRef.val = err.name ? (err.name + ': ' + err.message) : String(err);
        }
      `;

      try {
        // __javaDouble defined inline here — same logic as JavaExecutionService
        const __javaDouble = (v) => {
          const n = (v !== null && v !== undefined && typeof v === 'object' && '__javaType' in v)
            ? v.valueOf() : Number(v);
          return {
            __javaType: 'double',
            valueOf() { return n; },
            toString() {
              if (isNaN(n))     return 'NaN';
              if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
              return Number.isInteger(n) ? n.toFixed(1) : String(n);
            },
            [Symbol.toPrimitive](hint) {
              if (hint === 'string') {
                if (isNaN(n))     return 'NaN';
                if (!isFinite(n)) return n > 0 ? 'Infinity' : '-Infinity';
                return Number.isInteger(n) ? n.toFixed(1) : String(n);
              }
              return n;
            }
          };
        };

        const executor = new Function(
          '__assertions',
          '__testPassedRef',
          '__failureReasonRef',
          '__tick',
          'Number__javaDiv',
          '__javaDouble',
          '__cMathHelpers',
          'Math',
          'JSON',
          runnerCode
        );

        const testPassedRef = { val: true };
        const failureReasonRef = { val: null };

        // Number__javaDiv per-test: usa __javaDouble local para preservar tipo flotante
        const Number__javaDiv = _makeDiv(__javaDouble);

        executor(
          assertions,
          testPassedRef,
          failureReasonRef,
          __tick,
          Number__javaDiv,
          __javaDouble,
          cMathHelpers || {},
          Math,
          JSON
        );

        const finalPass = testPassedRef.val && !failureReasonRef.val &&
          (assertions.length === 0 || assertions.every(a => a.pass));

        testResults.push({
          name: test.name,
          passed: finalPass,
          assertions,
          failureReason: failureReasonRef.val || (assertions.find(a => !a.pass)?.message || null)
        });
      } catch (evalErr) {
        testResults.push({
          name: test.name,
          passed: false,
          assertions,
          failureReason: 'Error de sintaxis o ejecución en test: ' + (evalErr.message || String(evalErr))
        });
      }
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(3);
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const allPassed = passedTests === totalTests;

    // 6. Banner según modo
    const hasCMath = mode === 'junit_commons_math';
    const bannerTitle = hasCMath
      ? I18nRuntime.getMessage('sandbox.junit.banner.cmath')
      : I18nRuntime.getMessage('sandbox.junit.banner');

    const outputLines = [
      '╔════════════════════════════════════════════════════════════════════╗',
      `║  ${bannerTitle.padEnd(66)}║`,
      '╚════════════════════════════════════════════════════════════════════╝',
      ''
    ];

    testResults.forEach((t) => {
      if (t.passed) {
        outputLines.push(`  ✓ ${t.name} -> ${I18nRuntime.getMessage('sandbox.junit.passed')}`);
      } else {
        outputLines.push(`  ✗ ${t.name} -> ${I18nRuntime.getMessage('sandbox.junit.failed')}`);
        if (t.failureReason) {
          outputLines.push(`     ${I18nRuntime.getMessage('sandbox.junit.detail')} ${t.failureReason}`);
        }
      }
    });

    outputLines.push('');
    outputLines.push('────────────────────────────────────────────────────────────────────');
    outputLines.push(I18nRuntime.getMessage('sandbox.junit.summary', { passed: passedTests, total: totalTests, percent: Math.round((passedTests / totalTests) * 100), duration }));
    outputLines.push(I18nRuntime.getMessage('sandbox.junit.honesty_note'));
    if (hasCMath) {
      outputLines.push(I18nRuntime.getMessage('sandbox.junit.cmath_note'));
    }

    const fullOutput = outputLines.join('\n');
    if (onOutput) onOutput(fullOutput);

    return {
      success: allPassed,
      isTestRun: true,
      totalTests,
      passedTests,
      failedTests,
      tests: testResults,
      output: fullOutput,
      duration: `${duration}s`,
      status: allPassed ? 'success' : 'failed_tests',
      error: allPassed ? null : `Fallaron ${failedTests} de ${totalTests} tests simulados.`
    };
  }
}
