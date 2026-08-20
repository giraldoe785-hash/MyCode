import assert from 'assert';
import { JavaExecutionService } from './src/services/execution/JavaExecutionService.js';

async function runOptionDialogTests() {
  console.log('==================================================================');
  console.log('🧪 SUITE DE VALIDACIÓN OBLIGATORIA: JOptionPane.showOptionDialog');
  console.log('==================================================================');

  const sampleJavaCode = `
import javax.swing.JOptionPane;

public class Main {
    public static void main(String[] args) {
        String[] opciones = {
            "Calcular descuento",
            "Conversor USD → EUR",
            "Conversor EUR → USD",
            "Probar error",
            "Salir"
        };

        int seleccion = JOptionPane.showOptionDialog(
            null,
            "Selecciona una operación:",
            "MyCode - Centro de Operaciones Java",
            JOptionPane.DEFAULT_OPTION,
            JOptionPane.QUESTION_MESSAGE,
            null,
            opciones,
            opciones[0]
        );

        System.out.println("SELECCION_RESULTADO:" + seleccion);
    }
}
`;

  const expectedOptions = [
    "Calcular descuento",
    "Conversor USD → EUR",
    "Conversor EUR → USD",
    "Probar error",
    "Salir"
  ];

  // Test selecting Option 0..4
  for (let optIdx = 0; optIdx < 5; optIdx++) {
    let capturedOptions = null;
    let capturedTitle = '';
    let capturedMessage = '';

    const res = await JavaExecutionService.execute(sampleJavaCode, {
      onDialogRequest: async (cfg) => {
        assert.strictEqual(cfg.type, 'option', 'Dialog type must be option');
        capturedOptions = cfg.options;
        capturedTitle = cfg.title;
        capturedMessage = cfg.message;
        // User clicks option optIdx
        return optIdx;
      }
    });

    assert(res.success, `Execution for option ${optIdx} must succeed`);
    assert.deepStrictEqual(capturedOptions, expectedOptions, `Options array must match exactly 5 items for option ${optIdx}`);
    assert.strictEqual(capturedTitle, 'MyCode - Centro de Operaciones Java');
    assert.strictEqual(capturedMessage, 'Selecciona una operación:');
    assert(res.output.includes(`SELECCION_RESULTADO:${optIdx}`), `Output must reflect index ${optIdx}`);
    console.log(`✅ [PASS] Opción ${optIdx} ("${expectedOptions[optIdx]}") → resultado ${optIdx}`);
  }

  // Test closing with X (CLOSED_OPTION = -1)
  console.log('\n--- Test Cerrar con X (CLOSED_OPTION) ---');
  let capturedCloseOptions = null;
  const resClose = await JavaExecutionService.execute(sampleJavaCode, {
    onDialogRequest: async (cfg) => {
      assert.strictEqual(cfg.type, 'option');
      capturedCloseOptions = cfg.options;
      // User clicks X / cancel -> returns -1
      return -1;
    }
  });

  assert(resClose.success, 'Execution when closing with X must succeed');
  assert.deepStrictEqual(capturedCloseOptions, expectedOptions);
  assert(resClose.output.includes('SELECCION_RESULTADO:-1'), 'Output must reflect CLOSED_OPTION = -1');
  console.log('✅ [PASS] Cerrar modal con botón X → resultado -1 (JOptionPane.CLOSED_OPTION)');

  // Test Other Dialog Types: showMessageDialog, showInputDialog, showConfirmDialog
  console.log('\n--- Verificación de No Regresión en Otros Diálogos ---');

  // 1. showMessageDialog
  let messageSeen = false;
  const resMsg = await JavaExecutionService.execute(`
    import javax.swing.JOptionPane;
    public class Main {
      public static void main(String[] args) {
        JOptionPane.showMessageDialog(null, "Operación completada con éxito", "Éxito", JOptionPane.INFORMATION_MESSAGE);
      }
    }
  `, {
    onDialogRequest: async (cfg) => {
      assert.strictEqual(cfg.type, 'message');
      assert.strictEqual(cfg.message, 'Operación completada con éxito');
      assert.strictEqual(cfg.title, 'Éxito');
      messageSeen = true;
      return true;
    }
  });
  assert(resMsg.success && messageSeen, 'showMessageDialog debe funcionar');
  console.log('✅ [PASS] showMessageDialog');

  // 2. showInputDialog
  let inputSeen = false;
  const resInput = await JavaExecutionService.execute(`
    import javax.swing.JOptionPane;
    public class Main {
      public static void main(String[] args) {
        String res = JOptionPane.showInputDialog(null, "Ingresa tu email:", "Registro", JOptionPane.QUESTION_MESSAGE);
        System.out.println("Email: " + res);
      }
    }
  `, {
    onDialogRequest: async (cfg) => {
      assert.strictEqual(cfg.type, 'input');
      assert.strictEqual(cfg.message, 'Ingresa tu email:');
      inputSeen = true;
      return 'user@mycode.pro';
    }
  });
  assert(resInput.success && inputSeen && resInput.output.includes('Email: user@mycode.pro'), 'showInputDialog debe funcionar');
  console.log('✅ [PASS] showInputDialog');

  // 3. showConfirmDialog (YES = 0, NO = 1, CANCEL = 2, CLOSE = -1)
  let confirmSeen = false;
  const resConfirm = await JavaExecutionService.execute(`
    import javax.swing.JOptionPane;
    public class Main {
      public static void main(String[] args) {
        int opt = JOptionPane.showConfirmDialog(null, "¿Deseas guardar los cambios?", "Guardar", JOptionPane.YES_NO_OPTION);
        System.out.println("Confirm: " + opt);
      }
    }
  `, {
    onDialogRequest: async (cfg) => {
      assert.strictEqual(cfg.type, 'confirm');
      assert.strictEqual(cfg.message, '¿Deseas guardar los cambios?');
      confirmSeen = true;
      return 0; // YES
    }
  });
  assert(resConfirm.success && confirmSeen && resConfirm.output.includes('Confirm: 0'), 'showConfirmDialog debe funcionar');
  console.log('✅ [PASS] showConfirmDialog');

  console.log('\n==================================================================');
  console.log('🎯 TODAS LAS VALIDACIONES DE JOptionPane COMPLETADAS AL 100%');
  console.log('==================================================================\n');
}

runOptionDialogTests();
