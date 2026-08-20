import { JUnitSimulationService } from './src/services/execution/JUnitSimulationService.js';
import { JavaExecutionService } from './src/services/execution/JavaExecutionService.js';
import { ExecutionService } from './src/services/execution/ExecutionService.js';

console.log('==================================================================');
console.log('🚀 INICIANDO PRUEBAS UNITARIAS: JUNIT SIMULATION & REQUESTS CORS');
console.log('==================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, extra = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName} ${extra ? `(${extra})` : ''}`);
  }
}

async function runTests() {
  // ----------------------------------------------------
  // TEST 1: JUnit Simulation - Todos los tests pasan
  // ----------------------------------------------------
  console.log('\n--- 1. Pruebas de Simulación JUnit: Casos Exitosos ---');
  const codeSuccess = `
    public class CalculadoraTest {
        public static int sumar(int a, int b) {
            return a + b;
        }

        public static int restar(int a, int b) {
            return a - b;
        }

        @Test
        public void sumaDebeFuncionar() {
            assertEquals(10, sumar(4, 6));
        }

        @Test
        public void restaDebeFuncionar() {
            assertEquals(4, restar(10, 6));
        }
    }
  `;

  const res1 = await JUnitSimulationService.execute(codeSuccess);
  assert(res1.success === true, 'Ejecución exitosa cuando todos los asserts pasan');
  assert(res1.isTestRun === true, 'Marca isTestRun = true');
  assert(res1.totalTests === 2 && res1.passedTests === 2 && res1.failedTests === 0, '2/2 tests aprobados');
  assert(res1.output.includes('sumaDebeFuncionar -> PASÓ'), 'Salida formatea sumaDebeFuncionar como PASÓ');

  // ----------------------------------------------------
  // TEST 2: JUnit Simulation - Test con fallo (Esperado vs Obtenido)
  // ----------------------------------------------------
  console.log('\n--- 2. Pruebas de Simulación JUnit: Detección de Fallos ---');
  const codeFailure = `
    public class CalculadoraTest {
        public static int sumar(int a, int b) {
            return a + b;
        }

        @Test
        public void sumaDebeFallar() {
            assertEquals(15, sumar(4, 6));
        }
    }
  `;

  const res2 = await JUnitSimulationService.execute(codeFailure);
  assert(res2.success === false, 'Detecta fallo de aserción correctamente (success = false)');
  assert(res2.failedTests === 1 && res2.passedTests === 0, '1 test fallido registrado');
  assert(res2.tests[0].passed === false, 'Test sumaDebeFallar marcado como no pasado');
  assert(res2.tests[0].failureReason.includes('Esperado: 15'), 'Reporta valor esperado (15)');
  assert(res2.tests[0].failureReason.includes('Obtenido: 10'), 'Reporta valor obtenido (10)');

  // ----------------------------------------------------
  // TEST 3: JUnit Simulation - assertTrue, assertFalse, assertNotNull, assertThrows
  // ----------------------------------------------------
  console.log('\n--- 3. Pruebas de Simulación JUnit: Otras Aserciones ---');
  const codeMixedAsserts = `
    public class AssertionsTest {
        public static int dividir(int a, int b) {
            return a / b;
        }

        @Test
        public void pruebaBooleanos() {
            assertTrue(10 > 5);
            assertFalse(5 > 10);
            assertNotNull("texto no nulo");
        }

        @Test
        public void pruebaExcepcion() {
            assertThrows(ArithmeticException.class, () -> {
                dividir(10, 0);
            });
        }
    }
  `;

  const res3 = await JUnitSimulationService.execute(codeMixedAsserts);
  assert(res3.success === true, 'Soporta assertTrue, assertFalse, assertNotNull y assertThrows');
  assert(res3.passedTests === 2, '2/2 tests avanzados aprobados');

  // ----------------------------------------------------
  // TEST 4: Routing en ExecutionService para Java
  // ----------------------------------------------------
  console.log('\n--- 4. Pruebas de Enrutamiento Automático en ExecutionService ---');
  // 4a. Con @Test -> Enruta a JUnitSimulationService
  const resExecWithTest = await ExecutionService.execute(codeSuccess, 'java');
  assert(resExecWithTest.isTestRun === true, 'ExecutionService detecta @Test y enruta a JUnitSimulationService');

  // 4b. Sin @Test (main normal) -> Enruta a JavaExecutionService
  const codeMainNormal = `
    public class Main {
        public static void main(String[] args) {
            System.out.println("Hola Programa Principal");
        }
    }
  `;
  const resExecNormal = await ExecutionService.execute(codeMainNormal, 'java');
  assert(!resExecNormal.isTestRun && resExecNormal.output.includes('Hola Programa Principal'), 'ExecutionService enruta programas main normales a JavaExecutionService');

  // ----------------------------------------------------
  // TEST 5: Detección y formato educativo de CORS en Requests
  // ----------------------------------------------------
  console.log('\n--- 5. Pruebas de Detección y Manejo Educativo de CORS ---');
  const mockCorsErrorMessage = 'Failed to fetch: TypeError at https://api.privada.com/data';
  const isCors = /(?:Failed to fetch|NetworkError|CORS|ConnectionError|MaxRetryError|ProtocolError|Cannot connect to proxy)/i.test(mockCorsErrorMessage);
  assert(isCors === true, 'RegEx de CORS identifica Failed to fetch / ConnectionError');

  // Resumen Final
  console.log('\n==================================================================');
  console.log(`🎯 RESULTADOS FINALES: ${passedTests}/${totalTests} pruebas superadas (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('==================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
