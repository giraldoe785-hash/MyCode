import assert from 'assert';
import { JavaExecutionService } from './src/services/execution/JavaExecutionService.js';

async function runTests() {
  console.log('==================================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS DE SIMULACIÓN JAVA (TESTS 1 - 14)');
  console.log('==================================================================');

  let passed = 0;
  let total = 14;

  // TEST 1 — Exception genérica
  console.log('\n--- TEST 1: Exception genérica ---');
  const t1 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        try {
          int numero = 10 / 0;
        } catch (Exception e) {
          System.out.println("Error controlado");
        }
      }
    }
  `);
  assert(t1.success, 'TEST 1 debe tener success = true');
  assert(t1.output.includes('Error controlado'), 'TEST 1 debe imprimir "Error controlado"');
  console.log('✅ [PASS] TEST 1: Exception genérica');
  passed++;

  // TEST 2 — NumberFormatException
  console.log('\n--- TEST 2: NumberFormatException ---');
  const t2 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        try {
          int numero = Integer.parseInt("abc");
        } catch (NumberFormatException e) {
          System.out.println("Número inválido");
        }
      }
    }
  `);
  assert(t2.success, 'TEST 2 debe tener success = true');
  assert(t2.output.includes('Número inválido'), 'TEST 2 debe imprimir "Número inválido"');
  console.log('✅ [PASS] TEST 2: NumberFormatException');
  passed++;

  // TEST 3 — Uso de la variable de excepción
  console.log('\n--- TEST 3: Uso de la variable de excepción ---');
  const t3 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        try {
          int numero = 10 / 0;
        } catch (Exception e) {
          System.out.println(e);
        }
      }
    }
  `);
  assert(t3.success, 'TEST 3 debe tener success = true');
  assert(t3.output.includes('ArithmeticException'), 'TEST 3 debe imprimir información de la excepción');
  console.log('✅ [PASS] TEST 3: Uso de la variable de excepción');
  passed++;

  // TEST 4 — Código sin excepciones
  console.log('\n--- TEST 4: Código sin excepciones ---');
  const t4 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        int a = 10;
        int b = 20;
        System.out.println(a + b);
      }
    }
  `);
  assert(t4.success, 'TEST 4 debe tener success = true');
  assert(t4.output.includes('30'), 'TEST 4 debe imprimir "30"');
  console.log('✅ [PASS] TEST 4: Código sin excepciones');
  passed++;

  // TEST 5 — JOptionPane showInputDialog
  console.log('\n--- TEST 5: JOptionPane ---');
  const t5 = await JavaExecutionService.execute(`
    import javax.swing.JOptionPane;

    public class Main {
      public static void main(String[] args) {
        String nombre = JOptionPane.showInputDialog(
          null,
          "¿Cuál es tu nombre?"
        );
        System.out.println("Nombre: " + nombre);
      }
    }
  `, {
    onDialogRequest: async (cfg) => {
      assert.strictEqual(cfg.type, 'input');
      return 'Carlos';
    }
  });
  assert(t5.success, 'TEST 5 debe tener success = true');
  assert(t5.output.includes('Nombre: Carlos'), 'TEST 5 debe imprimir "Nombre: Carlos"');
  console.log('✅ [PASS] TEST 5: JOptionPane');
  passed++;

  // TEST 6 — Código original reportado con showConfirmDialog y catch(NumberFormatException)
  console.log('\n--- TEST 6: Código original reportado con JOptionPane y confirmDialog ---');
  const t6Code = `
    import javax.swing.JOptionPane;

    public class Main {
      public static void main(String[] args) {
        String inputPrecio = JOptionPane.showInputDialog(
          null,
          "Ingresa el precio del producto:",
          "Cálculo de Descuento",
          JOptionPane.QUESTION_MESSAGE
        );

        if (inputPrecio != null) {
          try {
            double precioOriginal = Double.parseDouble(inputPrecio);
            double descuento = precioOriginal * 0.15;
            double precioFinal = precioOriginal - descuento;

            String mensaje = "Precio original: $" + precioOriginal +
                             "\\nDescuento (15%): -$" + descuento +
                             "\\nTotal a pagar: $" + precioFinal +
                             "\\n\\n¿Deseas confirmar la compra?";

            int opcion = JOptionPane.showConfirmDialog(
              null,
              mensaje,
              "Confirmar Compra",
              JOptionPane.YES_NO_OPTION
            );

            if (opcion == JOptionPane.YES_OPTION) {
              JOptionPane.showMessageDialog(
                null,
                "¡Compra realizada con éxito!",
                "Éxito",
                JOptionPane.INFORMATION_MESSAGE
              );
            } else {
              JOptionPane.showMessageDialog(
                null,
                "Compra cancelada.",
                "Cancelado",
                JOptionPane.WARNING_MESSAGE
              );
            }

          } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(
              null,
              "Error: Debes ingresar un número válido.",
              "Error de Formato",
              JOptionPane.ERROR_MESSAGE
            );
          }
        }
      }
    }
  `;

  let dialogMessages6 = [];
  const t6 = await JavaExecutionService.execute(t6Code, {
    onDialogRequest: async (cfg) => {
      if (cfg.type === 'input') return '100.0';
      if (cfg.type === 'confirm') return 0; // YES_OPTION
      if (cfg.type === 'message') {
        dialogMessages6.push(cfg.message);
        return true;
      }
    }
  });
  assert(t6.success, 'TEST 6 debe tener success = true');
  assert(dialogMessages6.some(m => m.includes('¡Compra realizada con éxito!')), 'TEST 6 debe mostrar mensaje de éxito');
  console.log('✅ [PASS] TEST 6: Código original reportado');
  passed++;

  // TEST 7 — JOptionPane + showOptionDialog + while + arrays + try/catch
  console.log('\n--- TEST 7: showOptionDialog + while + arrays + try/catch ---');
  const t7Code = `
    import javax.swing.JOptionPane;

    public class Main {
      public static void main(String[] args) {
        String[] opciones = {"USD a EUR", "EUR a USD", "Salir"};
        double tasaUsdEur = 0.92;
        boolean continuar = true;

        while (continuar) {
          int seleccion = JOptionPane.showOptionDialog(
            null,
            "Selecciona el tipo de conversión:",
            "Conversor de Divisas",
            JOptionPane.DEFAULT_OPTION,
            JOptionPane.PLAIN_MESSAGE,
            null,
            opciones,
            opciones[0]
          );

          // Si elige Salir o cierra la ventana
          if (seleccion == 2 || seleccion == JOptionPane.CLOSED_OPTION) {
            continuar = false;
            JOptionPane.showMessageDialog(
              null,
              "Gracias por usar el conversor.",
              "Fin",
              JOptionPane.INFORMATION_MESSAGE
            );
            break;
          }

          String inputMonto = JOptionPane.showInputDialog(
            null,
            "Ingresa la cantidad a convertir:",
            "Monto",
            JOptionPane.QUESTION_MESSAGE
          );

          if (inputMonto != null) {
            try {
              double monto = Double.parseDouble(inputMonto);
              double resultado = 0.0;

              if (seleccion == 0) {
                // USD a EUR
                resultado = monto * tasaUsdEur;

                JOptionPane.showMessageDialog(
                  null,
                  monto + " USD equivalen a " + resultado + " EUR",
                  "Resultado",
                  JOptionPane.INFORMATION_MESSAGE
                );

              } else if (seleccion == 1) {
                // EUR a USD
                resultado = monto / tasaUsdEur;

                JOptionPane.showMessageDialog(
                  null,
                  monto + " EUR equivalen a " + resultado + " USD",
                  "Resultado",
                  JOptionPane.INFORMATION_MESSAGE
                );
              }

            } catch (NumberFormatException e) {
              JOptionPane.showMessageDialog(
                null,
                "Ingresa un monto numérico válido.",
                "Error",
                JOptionPane.ERROR_MESSAGE
              );
            }
          }
        }
      }
    }
  `;

  let loopStep = 0;
  let dialogMessages7 = [];
  const t7 = await JavaExecutionService.execute(t7Code, {
    onDialogRequest: async (cfg) => {
      if (cfg.type === 'option') {
        loopStep++;
        if (loopStep === 1) return 0; // USD a EUR
        if (loopStep === 2) return 1; // EUR a USD
        if (loopStep === 3) return 0; // NumberFormatException test
        return 2; // Salir
      }
      if (cfg.type === 'input') {
        if (loopStep === 1) return '100';
        if (loopStep === 2) return '100';
        if (loopStep === 3) return 'abc';
      }
      if (cfg.type === 'message') {
        dialogMessages7.push(cfg.message);
        return true;
      }
    }
  });

  assert(t7.success, 'TEST 7 debe tener success = true');
  assert(dialogMessages7.some(m => m.includes('USD equivalen a') && m.includes('92')), 'TEST 7 debe convertir USD a EUR correctamente');
  assert(dialogMessages7.some(m => m.includes('EUR equivalen a') && m.includes('USD')), 'TEST 7 debe convertir EUR a USD correctamente');
  assert(dialogMessages7.some(m => m.includes('Ingresa un monto numérico válido.')), 'TEST 7 debe capturar NumberFormatException');
  assert(dialogMessages7.some(m => m.includes('Gracias por usar el conversor.')), 'TEST 7 debe mostrar mensaje de despedida');
  console.log('✅ [PASS] TEST 7: showOptionDialog + while + arrays + try/catch');
  passed++;

  // TEST 8 — String.isEmpty() con cadena vacía
  console.log('\n--- TEST 8: String.isEmpty() con cadena vacía ---');
  const t8 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = "";
        if (texto.isEmpty()) {
          System.out.println("VACIO");
        }
      }
    }
  `);
  assert(t8.success && t8.output.includes('VACIO'), 'TEST 8 debe imprimir VACIO');
  console.log('✅ [PASS] TEST 8: String.isEmpty() cadena vacía');
  passed++;

  // TEST 9 — String.isEmpty() con texto no vacío
  console.log('\n--- TEST 9: String.isEmpty() con texto no vacío ---');
  const t9 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = "Hola";
        if (!texto.isEmpty()) {
          System.out.println("NO VACIO");
        }
      }
    }
  `);
  assert(t9.success && t9.output.includes('NO VACIO'), 'TEST 9 debe imprimir NO VACIO');
  console.log('✅ [PASS] TEST 9: String.isEmpty() con texto');
  passed++;

  // TEST 10 — String.isEmpty() con espacios
  console.log('\n--- TEST 10: String.isEmpty() con espacios ---');
  const t10 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = "   ";
        if (!texto.isEmpty()) {
          System.out.println("ESPACIOS NO ESTAN VACIOS");
        }
      }
    }
  `);
  assert(t10.success && t10.output.includes('ESPACIOS NO ESTAN VACIOS'), 'TEST 10 debe imprimir ESPACIOS NO ESTAN VACIOS');
  console.log('✅ [PASS] TEST 10: String.isEmpty() con espacios');
  passed++;

  // TEST 11 — String.trim().isEmpty() con espacios
  console.log('\n--- TEST 11: String.trim().isEmpty() con espacios ---');
  const t11 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = "   ";
        if (texto.trim().isEmpty()) {
          System.out.println("VACIO DESPUES DE TRIM");
        }
      }
    }
  `);
  assert(t11.success && t11.output.includes('VACIO DESPUES DE TRIM'), 'TEST 11 debe imprimir VACIO DESPUES DE TRIM');
  console.log('✅ [PASS] TEST 11: String.trim().isEmpty() con espacios');
  passed++;

  // TEST 12 — String.trim().isEmpty() con texto
  console.log('\n--- TEST 12: String.trim().isEmpty() con texto ---');
  const t12 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = "MyCode";
        if (texto.trim().isEmpty()) {
          System.out.println("ERROR");
        } else {
          System.out.println("CORRECTO");
        }
      }
    }
  `);
  assert(t12.success && t12.output.includes('CORRECTO'), 'TEST 12 debe imprimir CORRECTO');
  console.log('✅ [PASS] TEST 12: String.trim().isEmpty() con texto');
  passed++;

  // TEST 13 — Short-circuit null con texto.trim().isEmpty()
  console.log('\n--- TEST 13: Short-circuit null con texto.trim().isEmpty() ---');
  const t13 = await JavaExecutionService.execute(`
    public class Main {
      public static void main(String[] args) {
        String texto = null;
        if (texto == null || texto.trim().isEmpty()) {
          System.out.println("ENTRADA VACIA");
        }
      }
    }
  `);
  assert(t13.success && t13.output.includes('ENTRADA VACIA'), 'TEST 13 debe imprimir ENTRADA VACIA');
  console.log('✅ [PASS] TEST 13: Short-circuit null con texto.trim().isEmpty()');
  passed++;

  // TEST 14 — Bug real reportado con JOptionPane y trim().isEmpty()
  console.log('\n--- TEST 14: Bug real reportado con JOptionPane y trim().isEmpty() ---');
  const bugCode = `
    import javax.swing.JOptionPane;

    public class Main {
      public static void main(String[] args) {
        String nombre = JOptionPane.showInputDialog(
          null,
          "¿Cuál es tu nombre?",
          "Registro",
          JOptionPane.QUESTION_MESSAGE
        );

        if (nombre != null && !nombre.trim().isEmpty()) {
          JOptionPane.showMessageDialog(
            null,
            "¡Bienvenido a MyCode Pro, " + nombre + "!",
            "Saludo",
            JOptionPane.INFORMATION_MESSAGE
          );
        }
      }
    }
  `;

  let welcomeMsg = null;
  const t14 = await JavaExecutionService.execute(bugCode, {
    onDialogRequest: async (cfg) => {
      if (cfg.type === 'input') return 'Esteban';
      if (cfg.type === 'message') {
        welcomeMsg = cfg.message;
        return true;
      }
    }
  });
  assert(t14.success && welcomeMsg === '¡Bienvenido a MyCode Pro, Esteban!', 'TEST 14 debe saludar a Esteban');
  console.log('✅ [PASS] TEST 14: Bug real reportado con JOptionPane y trim().isEmpty()');
  passed++;

  console.log('\n==================================================================');
  console.log(`🎯 RESULTADOS FINALES: ${passed}/${total} pruebas superadas (${Math.round((passed / total) * 100)}%)`);
  console.log('==================================================================\n');
}

runTests();
