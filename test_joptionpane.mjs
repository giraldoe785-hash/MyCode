import { ExecutionService } from './src/services/execution/ExecutionService.js';

console.log("===============================================================");
console.log("  BATERÍA DE PRUEBAS: JOPTIONPANE INTERACTIVE SIMULATION");
console.log("===============================================================");

let total = 0;
let passed = 0;

async function runTest(id, name, code, handler, validator) {
  total++;
  try {
    const dialogs = [];
    const res = await ExecutionService.execute(code, 'java', {
      onDialogRequest: async (req) => {
        dialogs.push(req);
        return await handler(req);
      }
    });
    const ok = validator(res, dialogs);
    if (ok) {
      passed++;
      console.log(`✅ [PASÓ] Test ${id} — ${name}`);
    } else {
      console.error(`❌ [FALLÓ] Test ${id} — ${name}`);
      console.error("   Dialogs:", dialogs);
      console.error("   Output:", res.output);
      console.error("   Error:", res.error);
    }
  } catch (err) {
    console.error(`❌ [EXCEPCIÓN] Test ${id} — ${name}:`, err);
  }
}

// TEST 1: showMessageDialog simple
await runTest(
  1,
  'JOptionPane.showMessageDialog simple',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          JOptionPane.showMessageDialog(null, "Hola desde MyCode");
      }
  }
  `,
  async (req) => true,
  (res, dialogs) => res.success && dialogs.length === 1 && dialogs[0].message === 'Hola desde MyCode'
);

// TEST 2: showInputDialog simple
await runTest(
  2,
  'JOptionPane.showInputDialog con respuesta de texto',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          String nombre = JOptionPane.showInputDialog("¿Cuál es tu nombre?");
          System.out.println("Nombre: " + nombre);
      }
  }
  `,
  async (req) => "Esteban",
  (res, dialogs) => res.success && res.output.includes('Nombre: Esteban')
);

// TEST 3: Integer.parseInt + showInputDialog condicional
await runTest(
  3,
  'Integer.parseInt con JOptionPane condicional (>= 18)',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          String edadTexto = JOptionPane.showInputDialog("Ingrese su edad:");
          int edad = Integer.parseInt(edadTexto);
          if (edad >= 18) {
              JOptionPane.showMessageDialog(null, "Mayor de edad");
          } else {
              JOptionPane.showMessageDialog(null, "Menor de edad");
          }
      }
  }
  `,
  async (req) => req.type === 'input' ? "21" : true,
  (res, dialogs) => res.success && dialogs.some(d => d.message === 'Mayor de edad')
);

// TEST 4: Concatenación con double
await runTest(
  4,
  'JOptionPane concatenación de tipos (String + double)',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          double precio = 25000.0;
          JOptionPane.showMessageDialog(null, "Precio: " + precio);
      }
  }
  `,
  async (req) => true,
  (res, dialogs) => res.success && dialogs.some(d => d.message.includes('Precio: 25000'))
);

// TEST 5: Múltiples inputs secuenciales
await runTest(
  5,
  'Múltiples JOptionPane.showInputDialog secuenciales',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          String nombre = JOptionPane.showInputDialog("Nombre:");
          String edadTexto = JOptionPane.showInputDialog("Edad:");
          int edad = Integer.parseInt(edadTexto);
          JOptionPane.showMessageDialog(null, nombre + " tiene " + edad + " años.");
      }
  }
  `,
  async (req) => {
    if (req.message === 'Nombre:') return "Esteban";
    if (req.message === 'Edad:') return "21";
    return true;
  },
  (res, dialogs) => res.success && dialogs.some(d => d.message === 'Esteban tiene 21 años.')
);

// TEST 6: Cancelación de input (debe retornar null)
await runTest(
  6,
  'Cancelación de showInputDialog (retorna null en Java)',
  `
  import javax.swing.JOptionPane;
  public class Main {
      public static void main(String[] args) {
          String nombre = JOptionPane.showInputDialog("Ingrese su nombre:");
          if (nombre == null) {
              System.out.println("Operación cancelada");
          }
      }
  }
  `,
  async (req) => null,
  (res, dialogs) => res.success && res.output.includes('Operación cancelada')
);

console.log("\n===============================================================");
console.log(`RESUMEN: ${passed}/${total} pruebas pasadas (${Math.round((passed/total)*100)}% éxito)`);
console.log("===============================================================");

if (passed !== total) process.exit(1);
