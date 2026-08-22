import assert from 'assert';
import { JUnitSimulationService } from './src/services/execution/JUnitSimulationService.js';
import { ExecutionService } from './src/services/execution/ExecutionService.js';
import { ApacheCommonsMathSimulationService } from './src/services/execution/ApacheCommonsMathSimulationService.js';

console.log('==================================================================');
console.log('🧪 VERIFICACIÓN OBLIGATORIA: JUNIT + JOPTIONPANE + COMMONS MATH');
console.log('==================================================================\n');

async function runAllIntegrationTests() {
  // TEST 1 — JUnit puro
  console.log('--- TEST 1: JUnit puro ---');
  const code1 = `
    import org.junit.Test;
    import static org.junit.Assert.assertEquals;
    public class Test1 {
      @Test
      public void testBasico() {
        assertEquals(10, 10);
      }
    }
  `;
  const res1 = await JUnitSimulationService.execute(code1);
  assert.strictEqual(res1.success, true, 'TEST 1 debe pasar');
  assert.strictEqual(res1.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 1: JUnit puro aprobado');

  // TEST 2 — JUnit + isEmpty()
  console.log('\n--- TEST 2: JUnit + isEmpty() ---');
  const code2 = `
    import org.junit.Test;
    import static org.junit.Assert.assertFalse;
    public class Test2 {
      @Test
      public void testString() {
        String texto = "Hola";
        assertFalse(texto.isEmpty());
      }
    }
  `;
  const res2 = await JUnitSimulationService.execute(code2);
  assert.strictEqual(res2.success, true, 'TEST 2 debe pasar');
  assert.strictEqual(res2.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 2: JUnit + isEmpty() aprobado');

  // TEST 3 — JUnit + JOptionPane.showInputDialog
  console.log('\n--- TEST 3: JUnit + JOptionPane.showInputDialog ---');
  const code3 = `
    import javax.swing.JOptionPane;
    import org.junit.Test;
    import static org.junit.Assert.assertTrue;
    public class Test3 {
      @Test
      public void testDialogo() {
        String nombre = JOptionPane.showInputDialog(
          null,
          "Nombre:"
        );
        assertTrue(nombre != null);
      }
    }
  `;
  let dialogRequested = false;
  const res3 = await JUnitSimulationService.execute(code3, {
    onDialogRequest: async (req) => {
      dialogRequested = true;
      assert.strictEqual(req.type, 'input');
      return 'Esteban';
    }
  });
  assert.strictEqual(dialogRequested, true, 'Debe llamar onDialogRequest');
  assert.strictEqual(res3.success, true, 'TEST 3 debe pasar');
  assert.strictEqual(res3.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 3: JUnit + JOptionPane.showInputDialog aprobado');

  // TEST 4 — JUnit + JOptionPane + isEmpty()
  console.log('\n--- TEST 4: JUnit + JOptionPane + isEmpty() ---');
  const code4 = `
    import javax.swing.JOptionPane;
    import org.junit.Test;
    import static org.junit.Assert.assertTrue;
    public class Test4 {
      @Test
      public void testDialogoString() {
        String nombre = JOptionPane.showInputDialog(
          null,
          "Nombre:"
        );
        assertTrue(
          nombre != null &&
          !nombre.trim().isEmpty()
        );
      }
    }
  `;
  const res4 = await JUnitSimulationService.execute(code4, {
    onDialogRequest: async () => '   Esteban   '
  });
  assert.strictEqual(res4.success, true, 'TEST 4 debe pasar');
  assert.strictEqual(res4.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 4: JUnit + JOptionPane + isEmpty() aprobado');

  // TEST 5 — JUnit + showMessageDialog
  console.log('\n--- TEST 5: JUnit + showMessageDialog ---');
  const code5 = `
    import javax.swing.JOptionPane;
    import org.junit.Test;
    import static org.junit.Assert.assertTrue;
    public class Test5 {
      @Test
      public void testMensaje() {
        JOptionPane.showMessageDialog(
          null,
          "Hola desde JUnit"
        );
        assertTrue(true);
      }
    }
  `;
  let messageRequested = false;
  const res5 = await JUnitSimulationService.execute(code5, {
    onDialogRequest: async (req) => {
      messageRequested = true;
      assert.strictEqual(req.type, 'message');
      assert.strictEqual(req.message, 'Hola desde JUnit');
    }
  });
  assert.strictEqual(messageRequested, true, 'Debe solicitar mensaje');
  assert.strictEqual(res5.success, true, 'TEST 5 debe pasar');
  assert.strictEqual(res5.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 5: JUnit + showMessageDialog aprobado');

  // TEST 6 — JUnit + Commons Math
  console.log('\n--- TEST 6: JUnit + Commons Math ---');
  const code6 = `
    import org.apache.commons.math3.stat.StatUtils;
    import org.junit.Test;
    import static org.junit.Assert.assertEquals;
    public class Test6 {
      @Test
      public void testCommonsMath() {
        double[] datos = {10, 20, 30};
        assertEquals(
          20.0,
          StatUtils.mean(datos),
          0.001
        );
      }
    }
  `;
  const cMathHelpers = ApacheCommonsMathSimulationService.getHelperFunctions();
  const res6 = await JUnitSimulationService.execute(code6, {
    cMathHelpers,
    mode: 'junit_commons_math'
  });
  assert.strictEqual(res6.success, true, 'TEST 6 debe pasar');
  assert.strictEqual(res6.passedTests, 1, '1/1 test pasado');
  console.log('✅ [PASS] TEST 6: JUnit + Commons Math aprobado');

  // TEST 7 — El test exacto del reporte de bug: IntegracionTest
  console.log('\n--- TEST 7: IntegracionTest completo (Bug original) ---');
  const bugCode = `
    import javax.swing.JOptionPane;
    import org.junit.Test;
    import static org.junit.Assert.assertTrue;
    import static org.junit.Assert.assertFalse;

    public class IntegracionTest {

        @Test
        public void validarNombre() {
            String nombre = "Esteban";

            assertFalse(nombre.isEmpty());
            assertFalse(nombre.trim().isEmpty());
        }

        @Test
        public void nombreVacio() {
            String nombre = "   ";

            assertTrue(nombre.trim().isEmpty());
        }

        @Test
        public void dialogo() {

            String nombre = JOptionPane.showInputDialog(
                null,
                "Ingresa tu nombre:",
                "Prueba JUnit + JOptionPane",
                JOptionPane.QUESTION_MESSAGE
            );

            if (nombre != null && !nombre.trim().isEmpty()) {

                JOptionPane.showMessageDialog(
                    null,
                    "Bienvenido, " + nombre,
                    "Resultado",
                    JOptionPane.INFORMATION_MESSAGE
                );
            }
        }
    }
  `;
  const dialogFlow = [];
  const resBug = await ExecutionService.execute(bugCode, 'java', {
    onDialogRequest: async (req) => {
      dialogFlow.push(req.type);
      if (req.type === 'input') return 'Esteban';
      return null;
    }
  });

  assert.strictEqual(resBug.success, true, 'IntegracionTest debe pasar al 100%');
  assert.strictEqual(resBug.passedTests, 3, '3/3 tests pasados');
  assert.deepStrictEqual(dialogFlow, ['input', 'message'], 'Flujo completo de input y message');
  console.log('✅ [PASS] TEST 7: IntegracionTest ejecutado exitosamente con 3/3 tests pasados y diálogos interactivos');

  // TEST 8 — Desempaquetado de Wrappers Numéricos en assertEquals (int vs double, con y sin delta)
  console.log('\n--- TEST 8: Comparación tipada en assertEquals (int vs double, wrappers vs primitivos) ---');
  const codeUnwrap = `
    import org.junit.Test;
    import static org.junit.Assert.assertEquals;

    public class NumericUnwrapTest {
        @Test
        public void intVsDoubleSinDelta() {
            double resultado = 100 / 4;
            assertEquals(25, resultado);
        }

        @Test
        public void doubleVsDoubleSinDelta() {
            double resultado = 25.0;
            assertEquals(25.0, resultado);
        }

        @Test
        public void doubleVsIntSinDelta() {
            double resultado = 50.0;
            assertEquals(50, resultado);
        }
    }
  `;
  const resUnwrap = await JUnitSimulationService.execute(codeUnwrap);
  assert.strictEqual(resUnwrap.success, true, 'NumericUnwrapTest debe pasar al 100%');
  assert.strictEqual(resUnwrap.passedTests, 3, '3/3 tests pasados');
  console.log('✅ [PASS] TEST 8: Comparación de wrappers int/double sin delta aprobada al 100%');

  // TEST 9 — Formato limpio del detalle en fallo de assertion (sin serialización JSON de wrapper)
  console.log('\n--- TEST 9: Formato limpio de mensaje de fallo en assertEquals ---');
  const codeFailFormat = `
    import org.junit.Test;
    import static org.junit.Assert.assertEquals;

    public class FailFormatTest {
        @Test
        public void falloControlado() {
            double resultado = 7 * 7;
            assertEquals(50, resultado);
        }
    }
  `;
  const resFailFormat = await JUnitSimulationService.execute(codeFailFormat);
  assert.strictEqual(resFailFormat.success, false, 'Fallo debe ser detectado');
  assert.strictEqual(resFailFormat.tests[0].failureReason, 'Esperado: 50, Obtenido: 49.0', 'Formato legible sin wrapper JSON');
  console.log('✅ [PASS] TEST 9: Mensaje de fallo limpio verificado: "Esperado: 50, Obtenido: 49.0"');

  console.log('\n==================================================================');
  console.log('🎯 TODOS LOS CASOS DE PRUEBA OBLIGATORIOS PASARON AL 100%');
  console.log('==================================================================\n');
}

runAllIntegrationTests();
