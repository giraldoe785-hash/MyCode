/**
 * JavaExecutionService
 * 
 * =========================================================================
 * SIMULADOR EDUCATIVO DE JAVA (100% FRONTEND)
 * =========================================================================
 * 
 * Principio de Honestidad Arquitectónica:
 * - NO afirma ejecutar una JVM real, ni OpenJDK, ni compilar mediante `javac`,
 *   ni verificar bytecode.
 * - Es un motor de interpretación y transpilación en frontend diseñado para
 *   aprender programación básica y resolver ejercicios algorítmicos.
 * - Clasifica y reporta de forma transparente cuando una característica
 *   avanzada requiere una JVM real con Backend.
 * 
 * -------------------------------------------------------------------------
 * SUBCONJUNTO DE JAVA SOPORTADO:
 * -------------------------------------------------------------------------
 * 1. Tipos de datos primitivos y alias:
 *    - int, double, float, long, short, byte, char, boolean, String, var
 * 2. Variables y constantes:
 *    - Declaración e inicialización: int x = 10; double d = 19.5;
 *    - Asignación y reasignación: x = 20;
 *    - Constantes: final int MAX = 100;
 * 3. Operadores:
 *    - Aritméticos: +, -, *, /, % (con división tipada y excepción por cero solo en enteros)
 *    - Relacionales: >, <, >=, <=, ==, !=
 *    - Lógicos: &&, ||, !
 *    - Incremento/Decremento: ++, --, +=, -=, *=, /=
 * 4. Salida por consola:
 *    - System.out.println(...) / System.out.print(...)
 * 5. Estructuras de control de flujo: if/else, for, while, do-while
 * 6. Arrays unidimensionales
 * 7. Métodos auxiliares estáticos
 * 8. Métodos básicos de String: s.length(), s.equals(...), s.equalsIgnoreCase(...)
 * 9. Conversión de tipos (Casting): (int) 19.5 -> 19, (double) 5 -> 5.0
 * 
 * -------------------------------------------------------------------------
 * CARACTERÍSTICAS NO SOPORTADAS (Requieren Backend JVM):
 * -------------------------------------------------------------------------
 * - Scanner(System.in) / Entrada interactiva por consola.
 * - Multihilo (Thread, Runnable, ExecutorService).
 * - I/O de Archivos (java.io.*, java.nio.*).
 * - Red y Sockets (java.net.*, Socket, HttpClient).
 * - Reflection API (Class.forName, introspección).
 * - Herencia compleja, interfaces y clases anidadas múltiples.
 * - Colecciones complejas del JDK (HashMap, LinkedList).
 */
import I18nRuntime from './i18nRuntime.js';


// Polyfills seguros para emular métodos estándar de Java en Strings
// Polyfill getMessage para emular excepciones de Java
if (!Error.prototype.getMessage) {
  Error.prototype.getMessage = function () {
    return this.message ? this.message.replace(/^Error:\s*/, '') : '';
  };
}

if (!String.prototype.equals) {
  String.prototype.equals = function (other) {
    return this.valueOf() === String(other);
  };
}

if (!String.prototype.equalsIgnoreCase) {
  String.prototype.equalsIgnoreCase = function (other) {
    return this.toLowerCase() === String(other).toLowerCase();
  };
}

if (!String.prototype.isEmpty) {
  String.prototype.isEmpty = function () {
    return this.length === 0;
  };
}

export class JavaExecutionService {
  /**
   * Limpia comentarios manteniendo la estructura de líneas para depuración
   */
  static cleanComments(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/\/\/.*/g, '');
  }

  /**
   * Detecta características fuera del subconjunto educativo soportado
   */
  static detectUnsupportedFeatures(code) {
    const checks = [
      {
        pattern: /\bScanner\b|\bSystem\.in\b/,
        name: 'Scanner / System.in (Entrada estándar)',
        reason: 'La lectura interactiva por consola requiere un runtime Java con backend.'
      },
      {
        pattern: /\b(Thread|Runnable|ExecutorService|synchronized)\b/,
        name: 'Multihilo y Concurrencia (Threads)',
        reason: 'El control de hilos nativos requiere una JVM real en backend.'
      },
      {
        pattern: /\b(File|FileInputStream|FileOutputStream|FileReader|FileWriter|Path|Files)\b/,
        name: 'I/O de Archivos del Sistema (java.io / java.nio)',
        reason: 'El acceso al disco local está restringido por seguridad en el navegador.'
      },
      {
        pattern: /\b(Socket|ServerSocket|HttpURLConnection|HttpClient)\b/,
        name: 'Red y Conexiones Sockets (java.net)',
        reason: 'Las conexiones de red TCP directas requieren un entorno de servidor.'
      },
      {
        pattern: /\b(reflection|Class\.forName|getDeclaredMethods)\b/,
        name: 'Reflection API e Introspección',
        reason: 'La introspección dinámica de clases requiere el compilador JVM completo.'
      },
      {
        pattern: /\b(interface|implements|abstract\s+class)\b/,
        name: 'Interfaces y Clases Abstractas',
        reason: 'El polimorfismo avanzado estará habilitado con la integración del backend JVM.'
      }
    ];

    for (const check of checks) {
      if (check.pattern.test(code)) {
        return check;
      }
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // TYPE TRACKER — Extrae mapa estático de tipos de variable del código Java.
  // Devuelve un Map<nombreVar, 'int'|'long'|'float'|'double'|'boolean'|'String'|...>
  // -------------------------------------------------------------------------
  static buildTypeEnv(code) {
    const typeEnv = new Map();
    // Captura: int a = 7;  double x = 0.0;  float f = 3.0f; etc.
    const declRegex = /\b(int|long|short|byte|float|double|boolean|char|String|var)\s+(\w+)\s*(?:=|;)/g;
    let m;
    while ((m = declRegex.exec(code)) !== null) {
      typeEnv.set(m[2], m[1]);
    }
    // También captura parámetros de método: "int a, double b"
    const paramRegex = /\b(int|long|short|byte|float|double|boolean|char|String)\s+(\w+)\s*(?:,|\))/g;
    while ((m = paramRegex.exec(code)) !== null) {
      if (!typeEnv.has(m[2])) typeEnv.set(m[2], m[1]);
    }
    return typeEnv;
  }

  // -------------------------------------------------------------------------
  // Determina si un operando de una expresión de división es de tipo flotante.
  // Devuelve true si es int/long (división entera), false si es float/double.
  // Cuando no puede determinarse con certeza → falla seguro = false (flotante).
  // -------------------------------------------------------------------------
  static _isIntegerOperand(operand, typeEnv) {
    const trimmed = operand.trim();

    // 1. Es un literal decimal explícito (7.0, 3.14, 2.5f, 2.5d)?
    if (/\d+\.\d*[fFdD]?$/.test(trimmed) || /\d+[fFdD]$/.test(trimmed)) return false;

    // 2. Está precedido de un cast flotante? → __javaDouble(x) o Number(x)
    if (/^__javaDouble\(/.test(trimmed)) return false;
    if (/^Number\(/.test(trimmed)) return false;

    // 3. Es un literal entero puro (sin punto decimal)?
    if (/^\d+[lL]?$/.test(trimmed)) return true;

    // 4. Es una variable registrada en el TypeEnv?
    // Extraer nombre base (sin indexación ni llamadas)
    const varName = trimmed.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    if (typeEnv.has(varName)) {
      const t = typeEnv.get(varName);
      return t === 'int' || t === 'long' || t === 'short' || t === 'byte';
    }

    // 5. No se puede determinar → falla seguro = flotante
    return false;
  }

  // -------------------------------------------------------------------------
  // NORMALIZADOR DE LOOPS — convierte bucles sin llaves a bucles con llaves.
  // Maneja: for(...) stmt;  while(...) stmt;  do stmt; while(...);
  // NO usa regex simple sobre el texto completo; recorre caracter a caracter
  // ignorando strings y comentarios.
  // -------------------------------------------------------------------------
  static normalizeLoopBraces(code) {
    // Tokenizador de estado mínimo
    let result = '';
    let i = 0;
    const len = code.length;

    const peek = (offset = 1) => (i + offset < len ? code[i + offset] : '');

    while (i < len) {
      // Saltar strings dobles
      if (code[i] === '"') {
        result += code[i++];
        while (i < len && code[i] !== '"') {
          if (code[i] === '\\') result += code[i++]; // escape
          result += code[i++];
        }
        if (i < len) result += code[i++]; // closing "
        continue;
      }
      // Saltar strings simples (char)
      if (code[i] === "'") {
        result += code[i++];
        while (i < len && code[i] !== "'") {
          if (code[i] === '\\') result += code[i++];
          result += code[i++];
        }
        if (i < len) result += code[i++];
        continue;
      }
      // Comentario de línea
      if (code[i] === '/' && peek() === '/') {
        while (i < len && code[i] !== '\n') result += code[i++];
        continue;
      }
      // Comentario de bloque
      if (code[i] === '/' && peek() === '*') {
        result += code[i++]; result += code[i++];
        while (i < len && !(code[i] === '*' && peek() === '/')) result += code[i++];
        if (i < len) { result += code[i++]; result += code[i++]; }
        continue;
      }

      // Detección de keywords de loop (solo si no es parte de un identificador)
      const isWordStart = i === 0 || /[\s{;(]/.test(code[i - 1]);

      if (isWordStart) {
        // while
        const whileMatch = code.slice(i).match(/^while\s*\(/);
        if (whileMatch) {
          // Capturar condición
          const kw = 'while';
          let j = i + kw.length;
          while (j < len && /\s/.test(code[j])) j++; // skip space
          // j ahora apunta a '('
          const { end: condEnd, text: condText } = this._extractBalancedParen(code, j);
          let k = condEnd + 1;
          while (k < len && /\s/.test(code[k])) k++;
          // Si el siguiente char NO es '{', envolver la siguiente sentencia
          if (k < len && code[k] !== '{') {
            const { end: stmtEnd, text: stmtText } = this._extractNextStatement(code, k);
            result += `while (${condText}) {\n${stmtText}\n}`;
            i = stmtEnd + 1;
            continue;
          } else {
            result += 'while';
            i += kw.length;
            continue;
          }
        }

        // for
        const forMatch = code.slice(i).match(/^for\s*\(/);
        if (forMatch) {
          const kw = 'for';
          let j = i + kw.length;
          while (j < len && /\s/.test(code[j])) j++;
          const { end: condEnd, text: condText } = this._extractBalancedParen(code, j);
          let k = condEnd + 1;
          while (k < len && /\s/.test(code[k])) k++;
          if (k < len && code[k] !== '{') {
            const { end: stmtEnd, text: stmtText } = this._extractNextStatement(code, k);
            result += `for (${condText}) {\n${stmtText}\n}`;
            i = stmtEnd + 1;
            continue;
          } else {
            result += 'for';
            i += kw.length;
            continue;
          }
        }

        // do
        const doMatch = code.slice(i).match(/^do\b/);
        if (doMatch) {
          let j = i + 2;
          while (j < len && /\s/.test(code[j])) j++;
          if (j < len && code[j] !== '{') {
            const { end: stmtEnd, text: stmtText } = this._extractNextStatement(code, j);
            // after stmt comes while(...)
            let k = stmtEnd + 1;
            while (k < len && /\s/.test(code[k])) k++;
            // expect 'while'
            const tail = code.slice(k);
            const whileOfDo = tail.match(/^while\s*\(/);
            if (whileOfDo) {
              let w = k + whileOfDo[0].indexOf('(');
              const { end: wEnd, text: wCond } = this._extractBalancedParen(code, w);
              result += `do {\n${stmtText}\n} while (${wCond});`;
              // skip trailing ;
              i = wEnd + 1;
              while (i < len && /[\s;]/.test(code[i])) i++;
              continue;
            }
          }
          result += 'do';
          i += 2;
          continue;
        }
      }

      result += code[i++];
    }

    return result;
  }

  // Extrae contenido entre paréntesis balanceados, empezando en el índice del '('
  static _extractBalancedParen(code, start) {
    let depth = 0;
    let i = start;
    let text = '';
    while (i < code.length) {
      if (code[i] === '(') { if (depth > 0) text += code[i]; depth++; }
      else if (code[i] === ')') { depth--; if (depth === 0) break; text += code[i]; }
      else text += code[i];
      i++;
    }
    return { end: i, text };
  }

  // Extrae la siguiente sentencia (hasta ';') o bloque (hasta '}' balanceado)
  static _extractNextStatement(code, start) {
    let i = start;
    if (code[i] === '{') {
      // bloque ya tiene llaves
      let depth = 0;
      let text = '';
      while (i < code.length) {
        if (code[i] === '{') depth++;
        else if (code[i] === '}') { depth--; text += code[i]; i++; if (depth === 0) break; continue; }
        text += code[i++];
      }
      return { end: i - 1, text: text.slice(1, -1).trim() }; // sin las llaves externas
    }
    // Sentencia simple: hasta ';'
    let text = '';
    while (i < code.length && code[i] !== ';') {
      text += code[i++];
    }
    return { end: i, text: text.trim() + ';' };
  }

  // -------------------------------------------------------------------------
  // CONVERSOR DE ARRAYS LITERALES JAVA A JAVASCRIPT
  // Convierte new double[][]{{1,2},{3,4}} y = {1, 2} a arreglos JS [...]
  // -------------------------------------------------------------------------
  static convertJavaArrayLiterals(code) {
    let result = '';
    let i = 0;
    while (i < code.length) {
      const newArrayMatch = code.slice(i).match(/^new\s+[\w<>]+(?:\[\s*\])+\s*\{/);
      if (newArrayMatch) {
        const matchLen = newArrayMatch[0].length;
        let startBrace = i + matchLen - 1;
        let depth = 1;
        let j = startBrace + 1;
        while (j < code.length && depth > 0) {
          if (code[j] === '{') depth++;
          else if (code[j] === '}') depth--;
          j++;
        }
        const rawBlock = code.substring(startBrace, j);
        result += rawBlock.replace(/\{/g, '[').replace(/\}/g, ']');
        i = j;
        continue;
      }

      const assignArrayMatch = code.slice(i).match(/^=\s*\{/);
      if (assignArrayMatch) {
        const matchLen = assignArrayMatch[0].length;
        let startBrace = i + matchLen - 1;
        let depth = 1;
        let j = startBrace + 1;
        while (j < code.length && depth > 0) {
          if (code[j] === '{') depth++;
          else if (code[j] === '}') depth--;
          j++;
        }
        const rawBlock = code.substring(startBrace, j);
        result += '= ' + rawBlock.replace(/\{/g, '[').replace(/\}/g, ']');
        i = j;
        continue;
      }

      result += code[i];
      i++;
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // TRANSPILADOR PRINCIPAL — Pipeline de Transpilación con Expression Tokenizer
  // -------------------------------------------------------------------------
  static transformJavaBlock(blockText, typeEnv) {
    // typeEnv puede ser undefined cuando se llama desde contextos legacy (JUnit helper fns)
    const env = typeEnv || new Map();
    const withArraysConverted = this.convertJavaArrayLiterals(blockText);

    return withArraysConverted
      // 0. Eliminar imports residuales si existieran dentro del bloque
      .replace(/^\s*import\s+[^;]+;\s*/gm, '')
      // 1. Sufijos numéricos de Java (100L, 3.14f, 2.5d) -> valores JS
      .replace(/\b(\d+(?:\.\d+)?)[fFdDlL]\b/g, '$1')

      // 2. Casting numérico explícito ANTES de la transpilación de divisiones
      //    (int) x / (long) x -> Math.trunc(x)   — resultado = entero
      //    (double) x / (float) x -> Number(x)   — resultado = flotante
      .replace(/\(\s*int\s*\)\s*(\w+|\([^)]+\)|\d+(?:\.\d+)?)/g, 'Math.trunc($1)')
      .replace(/\(\s*long\s*\)\s*(\w+|\([^)]+\)|\d+(?:\.\d+)?)/g, 'Math.trunc($1)')
      .replace(/\(\s*(?:double|float)\s*\)\s*(\w+|\([^)]+\)|\d+(?:\.\d+)?)/g, '__javaDouble($1)')

      // 2b. Wrap double/float declaraciones con valor — preserva tipo en salida
      //     final double x = expr;  =>  const x = __javaDouble(expr);
      //     double x = expr;        =>  let x   = __javaDouble(expr);
      .replace(/\bfinal\s+(?:double|float)\s+(\w+)\s*=\s*([^;\n]+);/g, 'const $1 = __javaDouble($2);')
      .replace(/\b(?:double|float)\s+(\w+)\s*=\s*([^;\n]+);/g, 'let $1 = __javaDouble($2);')

      // 3. Bucle for-each: for (int x : lista) -> for (let x of lista)
      .replace(/\bfor\s*\(\s*(?:final\s+)?(?:[a-zA-Z_]\w*(?:\[\s*\])*)\s+([a-zA-Z_]\w*)\s*:\s*([^)]+)\)/g, 'for (let $1 of $2)')

      // 4. Inicializadores de Arrays estilo Java
      .replace(/=\s*\{([^}]*)\}/g, '= [$1]')
      .replace(/new\s+\w+\[\]\s*\{([^}]*)\}/g, '[$1]')
      .replace(/new\s+\w+\[\s*(\d+|\w+)\s*\]/g, 'new Array($1).fill(0)')

      // 5. Métodos de String: str.length() -> str.length
      .replace(/(\w+(?:\([^)]*\))?)\.length\(\)/g, '$1.length')

      // 6. Emisión de salidas estándar (antes de quitar tipos, para que no colisione)
      .replace(/System\.out\.println\s*\(([\s\S]*?)\)\s*;/g, '__println($1);')
      .replace(/System\.out\.println\s*\(\s*\)\s*;/g, '__println("");')
      .replace(/System\.out\.print\s*\(([\s\S]*?)\)\s*;/g, '__print($1);')

      // 6b. Declaraciones de tipos de objetos / clases (ej. RealMatrix m = ...)
      .replace(/\bfinal\s+(?:RealMatrix|[A-Z]\w*(?:\[\s*\])*)\s+([a-zA-Z_]\w*)\s*=/g, 'const $1 =')
      .replace(/\b(?:RealMatrix|[A-Z]\w*(?:\[\s*\])*)\s+([a-zA-Z_]\w*)\s*=/g, 'let $1 =')

      // 7. final para tipos primitivos y arrays (1D y multidimensionales) -> const
      .replace(/\bfinal\s+(?:int|long|short|byte|char|boolean|String|var|double|float)(?:\[\s*\])*\s+(\w+)/g, 'const $1')

      // 8. Declaraciones de tipos primitivos y arrays (1D y multidimensionales) a 'let'
      .replace(/\b(?:int|long|short|byte|char|boolean|String|var|double|float)(?:\[\s*\])+\s+(\w+)/g, 'let $1')
      .replace(/\b(?:int|long|short|byte|char|boolean|String|var|double|float)\s+(\w+)/g, 'let $1')

      // 8b. Bloques catch tipados de Java -> catch (variable) en JavaScript
      //     Soporta: catch (NumberFormatException e), catch (Exception e), catch (final Exception err), catch (Type1 | Type2 e)
      .replace(/\bcatch\s*\(\s*(?:final\s+)?(?:(?:[a-zA-Z_]\w*\.)*[a-zA-Z_]\w*(?:\s*\|\s*(?:[a-zA-Z_]\w*\.)*[a-zA-Z_]\w*)*)\s+([a-zA-Z_]\w*)\s*\)/g, 'catch ($1)')

      // 9. Métodos de utilidad auxiliares
      .replace(/Arrays\.toString\((.*?)\)/g, 'JSON.stringify($1)')
      .replace(/List\.of\((.*?)\)/g, '[$1]')
      // 10. JOptionPane (Swing Simulado Asíncrono)
      .replace(/(?<!await\s+)JOptionPane\.(showMessageDialog|showInputDialog|showConfirmDialog|showOptionDialog)/g, 'await JOptionPane.$1');

    // NOTA: La inyección de __tick y Number__javaDiv se hace en la fase de normalización y
    // en buildFullScript, no con regex simple, para respetar precedencia y tipos.
  }

  // -------------------------------------------------------------------------
  // DIVISIÓN TIPADA — Reemplaza `/` por llamadas a Number__javaDiv con tipo inferido.
  // Opera DESPUÉS de que los casts ya fueron transformados (Number() / Math.trunc()).
  // -------------------------------------------------------------------------
  static injectTypedDivisions(code, typeEnv) {
    // Regex que captura: operand / operand
    // Operandos: __javaDouble(...), Number(...), Math.trunc(...), identificador, literal
    const OPERAND = String.raw`(?:__javaDouble|Number|Math\.trunc)\([^)]*\)|\w+(?:\.\w+)*(?:\[[^\]]*\])?|\d+(?:\.\d+)?[fFdD]?`;
    const divRe = new RegExp(`(${OPERAND})\\s*/\\s*(${OPERAND})`, 'g');
    return code.replace(
      divRe,
      (match, left, right) => {
        const leftIsInt = this._isIntegerOperand(left, typeEnv);
        const rightIsInt = this._isIntegerOperand(right, typeEnv);
        const isIntDiv = leftIsInt && rightIsInt;
        return `Number__javaDiv(${left.trim()}, ${right.trim()}, ${isIntDiv})`;
      }
    );
  }

  // -------------------------------------------------------------------------
  // INYECCIÓN DE __tick — opera sobre código ya con llaves normalizadas.
  // -------------------------------------------------------------------------
  static injectTickGuard(code) {
    // Inyecta __tick(); justo después de { en for/while/do
    return code
      .replace(/\b(for\s*\([^)]*\))\s*\{/g, '$1 { __tick();')
      .replace(/\b(while\s*\([^)]*\))\s*\{/g, '$1 { __tick();')
      .replace(/\bdo\s*\{/g, 'do { __tick();');
  }

  // -------------------------------------------------------------------------
  // CONSTRUYE EL SCRIPT COMPLETO A EJECUTAR
  // -------------------------------------------------------------------------
  static buildFullScript(mainBody, helperFunctions, typeEnv) {
    // Pipeline: normalizar loops → transpilar → divisiones tipadas → __tick
    const normalizedMain = this.normalizeLoopBraces(mainBody);
    const transpiledMain = this.transformJavaBlock(normalizedMain, typeEnv);
    const dividedMain = this.injectTypedDivisions(transpiledMain, typeEnv);
    const guardedMain = this.injectTickGuard(dividedMain);

    const processedHelpers = helperFunctions.map(({ name, params, body }) => {
      const normalizedBody = this.normalizeLoopBraces(body);
      const transpiledBody = this.transformJavaBlock(normalizedBody, typeEnv);
      const dividedBody = this.injectTypedDivisions(transpiledBody, typeEnv);
      const guardedBody = this.injectTickGuard(dividedBody);
      return `function ${name}(${params}) {\n${guardedBody}\n}`;
    });

    return `${processedHelpers.join('\n\n')}\n\n${guardedMain}`;
  }

  /**
   * Ejecuta el código Java dentro del simulador educativo frontend.
   */
  static async execute(rawCode, { onOutput, onInputRequest, onDialogRequest, cMathHelpers = null, isCommonsMath = false } = {}) {
    await new Promise(r => setTimeout(r, 60));
    const code = (rawCode || '').trim();

    if (!code) {
      return {
        success: false,
        isUserError: true,
        status: 'error',
        error: `[${I18nRuntime.getMessage('sandbox.java.banner')}]\n${I18nRuntime.getMessage('sandbox.java.empty_editor')}`,
        output: ''
      };
    }

    // 1. Verificación de características no soportadas
    const unsupported = this.detectUnsupportedFeatures(code);
    if (unsupported) {
      const unsupportedMsg = `[${I18nRuntime.getMessage('sandbox.java.banner.frontend')}]\n\n${I18nRuntime.getMessage('sandbox.java.unsupported', { name: unsupported.name, reason: unsupported.reason })}`;
      if (onOutput) onOutput(unsupportedMsg);
      return {
        success: false,
        isUnsupported: true,
        status: 'unsupported',
        error: unsupportedMsg,
        output: ''
      };
    }

    // 2. Limpieza de comentarios
    const cleanCode = this.cleanComments(code);

    // 3. Construir el Type Environment estático
    const typeEnv = this.buildTypeEnv(cleanCode);

    let mainBody = '';
    const helperFunctions = [];

    // 4. Extracción de métodos estáticos auxiliares y método main
    const methodRegex = /(?:public\s+|private\s+|protected\s+)?static\s+[\w<>\[\]]+\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
    let match;
    const methodsFound = [];

    while ((match = methodRegex.exec(cleanCode)) !== null) {
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

      const methodBody = cleanCode.substring(openBrace + 1, pos);
      methodsFound.push({
        name: methodName,
        params: paramsStr.split(',').map(p => p.trim().split(/\s+/).pop()).filter(Boolean).join(', '),
        body: methodBody
      });
    }

    const mainMethod = methodsFound.find(m => m.name === 'main');
    const otherMethods = methodsFound.filter(m => m.name !== 'main');

    if (mainMethod) {
      mainBody = mainMethod.body;
    } else {
      const classIdx = cleanCode.indexOf('class ');
      if (classIdx === -1) {
        mainBody = cleanCode;
      } else {
        return {
          success: false,
          isUserError: true,
          status: 'error',
          error: `[${I18nRuntime.getMessage('sandbox.java.banner')}]\n${I18nRuntime.getMessage('sandbox.java.no_main')}`,
          output: ''
        };
      }
    }

    for (const m of otherMethods) {
      helperFunctions.push({ name: m.name, params: m.params, body: m.body });
    }

    // 5. Construir script ejecutable completo
    const fullExecutableJs = this.buildFullScript(mainBody, helperFunctions, typeEnv);

    // 6. Output Buffer Guard: 150 líneas de usuario + 1 aviso = 151 elementos máximos
    const stdout = [];
    const MAX_OUTPUT_LINES = 150;
    let outputSealed = false;

    // ── __javaDouble: wrapper de valor flotante que preserva el tipo Java ──────
    // - valueOf()          → número primitivo para aritmética (+, -, *, /)
    // - toString()         → representación Java-fiel ('3.0' en vez de '3')
    // - Symbol.toPrimitive → 'string'/'default' hint → toString(); 'number' → n
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

    const __println = (...args) => {
      if (outputSealed) return;
      if (stdout.length >= MAX_OUTPUT_LINES) {
        stdout.push(I18nRuntime.getMessage('sandbox.runtime.output_limit'));
        outputSealed = true;
        return;
      }
      // String(obj) llama toString() → para __javaDouble wrappers preserva el tipo
      const line = args.map(a => {
        if (a === null)      return 'null';
        if (a === undefined) return 'undefined';
        if (a instanceof Error) {
          return a.message ? a.message.replace(/^Error:\s*/, '') : a.toString();
        }
        return String(a);
      }).join(' ');
      stdout.push(line);
      if (onOutput) onOutput(line);
    };

    const __print = (...args) => {
      if (outputSealed) return;
      const str = args.map(a => String(a)).join(' ');
      if (stdout.length > 0) {
        stdout[stdout.length - 1] += str;
      } else {
        stdout.push(str);
      }
      if (onOutput) onOutput(str);
    };

    // 7. Guardián de iteraciones con medición de tiempo (mensajes i18n)
    let ticks = 0;
    const MAX_TICKS = 50000;
    const startTime = performance.now();
    const MAX_MS = 2000;

    const __tick = () => {
      ticks++;
      if (ticks > MAX_TICKS) {
        throw new Error(I18nRuntime.getMessage('sandbox.runtime.tick.iterations'));
      }
      if (ticks % 1000 === 0 && (performance.now() - startTime) > MAX_MS) {
        throw new Error(I18nRuntime.getMessage('sandbox.runtime.tick.timeout'));
      }
    };

    // 8. Number__javaDiv — parámetro explícito del runner + whitelist del analizador
    // Cuando isIntDiv=false devuelve __javaDouble para preservar semántica flotante
    const Number__javaDiv = (a, b, isIntDiv) => {
      const aVal = (a !== null && typeof a === 'object') ? a.valueOf() : Number(a);
      const bVal = (b !== null && typeof b === 'object') ? b.valueOf() : Number(b);
      if (bVal === 0) {
        if (isIntDiv) throw new Error('java.lang.ArithmeticException: / by zero');
        return __javaDouble(aVal / bVal); // IEEE 754: Infinity / -Infinity / NaN como double
      }
      const result = aVal / bVal;
      return isIntDiv ? Math.trunc(result) : __javaDouble(result);
    };

    // Helper pedagógico para Integer (parseInt, valueOf)
    const Integer = {
      parseInt(str) {
        if (str === null || str === undefined) {
          throw new Error('java.lang.NullPointerException');
        }
        const trimmed = String(str).trim();
        const n = Number(trimmed);
        if (isNaN(n) || trimmed === '' || !/^-?\d+$/.test(trimmed)) {
          throw new Error(`java.lang.NumberFormatException: For input string: "${str}"`);
        }
        return Math.trunc(n);
      },
      valueOf(str) {
        return Integer.parseInt(str);
      }
    };

    // Helper pedagógico para Double (parseDouble, valueOf)
    const Double = {
      parseDouble(str) {
        if (str === null || str === undefined) {
          throw new Error('java.lang.NullPointerException');
        }
        const trimmed = String(str).trim();
        const n = Number(trimmed);
        if (isNaN(n) || trimmed === '') {
          throw new Error(`java.lang.NumberFormatException: For input string: "${str}"`);
        }
        return __javaDouble(n);
      },
      valueOf(str) {
        return Double.parseDouble(str);
      }
    };

    // Helper pedagógico para JOptionPane (Swing Simulado Asíncrono)
    const JOptionPane = {
      DEFAULT_OPTION: -1,
      YES_NO_OPTION: 0,
      YES_NO_CANCEL_OPTION: 1,
      OK_CANCEL_OPTION: 2,
      YES_OPTION: 0,
      NO_OPTION: 1,
      CANCEL_OPTION: 2,
      OK_OPTION: 0,
      CLOSED_OPTION: -1,
      ERROR_MESSAGE: 0,
      INFORMATION_MESSAGE: 1,
      WARNING_MESSAGE: 2,
      QUESTION_MESSAGE: 3,
      PLAIN_MESSAGE: -1,

      async showMessageDialog(parent, message, title = 'Mensaje', messageType = 1) {
        const msg = (message !== null && message !== undefined && typeof message === 'object' && '__javaType' in message)
          ? message.toString()
          : (message === null ? 'null' : (message instanceof Error ? message.message : String(message)));

        const dialogTitle = (title !== null && title !== undefined) ? String(title) : 'Mensaje';

        if (onDialogRequest) {
          await onDialogRequest({
            type: 'message',
            title: dialogTitle,
            message: msg,
            messageType
          });
        } else {
          __println(msg);
        }
      },

      async showInputDialog(parentOrMessage, messageOrTitle, titleOrType, messageType = 3) {
        let promptMsg = '';
        let dialogTitle = 'Entrada requerida';

        if (arguments.length === 1) {
          promptMsg = parentOrMessage === null ? 'null' : String(parentOrMessage);
        } else if (arguments.length === 2 && parentOrMessage === null) {
          promptMsg = messageOrTitle === null ? 'null' : String(messageOrTitle);
        } else if (arguments.length >= 3 && parentOrMessage === null) {
          promptMsg = messageOrTitle === null ? 'null' : String(messageOrTitle);
          dialogTitle = titleOrType !== undefined ? String(titleOrType) : 'Entrada requerida';
        } else {
          promptMsg = parentOrMessage === null ? (messageOrTitle !== undefined ? String(messageOrTitle) : 'null') : String(parentOrMessage);
          if (messageOrTitle !== undefined) dialogTitle = String(messageOrTitle);
        }

        if (onDialogRequest) {
          const result = await onDialogRequest({
            type: 'input',
            title: dialogTitle,
            message: promptMsg,
            messageType
          });
          return (result === null || result === undefined) ? null : String(result);
        } else if (onInputRequest) {
          const result = await onInputRequest(promptMsg);
          return (result === null || result === undefined) ? null : String(result);
        } else {
          return null;
        }
      },

      async showConfirmDialog(parent, message, title = 'Confirmar', optionType = 0, messageType = 3) {
        const msg = (message !== null && message !== undefined && typeof message === 'object' && '__javaType' in message)
          ? message.toString()
          : (message === null ? 'null' : (message instanceof Error ? message.message : String(message)));
        const dialogTitle = title !== undefined ? String(title) : 'Confirmar';

        if (onDialogRequest) {
          const result = await onDialogRequest({
            type: 'confirm',
            title: dialogTitle,
            message: msg,
            optionType,
            messageType
          });
          return (typeof result === 'number') ? result : (result === false ? 1 : result === null ? -1 : 0);
        } else {
          return 0;
        }
      },

      async showOptionDialog(parent, message, title, optionType, messageType, icon, options, initialValue) {
        const msg = (message !== null && message !== undefined && typeof message === 'object' && '__javaType' in message)
          ? message.toString()
          : (message === null ? 'null' : (message instanceof Error ? message.message : String(message)));
        const dialogTitle = title !== undefined ? String(title) : 'Seleccionar opción';
        const opts = Array.isArray(options) ? options.map(o => String(o)) : ['Aceptar'];

        if (onDialogRequest) {
          const result = await onDialogRequest({
            type: 'option',
            title: dialogTitle,
            message: msg,
            options: opts,
            initialValue: initialValue !== undefined ? String(initialValue) : opts[0],
            optionType,
            messageType
          });
          return (typeof result === 'number') ? result : -1;
        } else {
          return 0;
        }
      }
    };

    // 9. Scope inyectado explícitamente en AsyncFunction
    const scope = {
      __println,
      __print,
      __tick,
      Number__javaDiv,
      __javaDouble,
      Integer,
      Double,
      JOptionPane,
      Math,
      JSON,
      ...(cMathHelpers || {})
    };

    const banner = isCommonsMath
      ? I18nRuntime.getMessage('sandbox.simulation.banner_commons_math')
      : I18nRuntime.getMessage('sandbox.java.banner');

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(...Object.keys(scope), fullExecutableJs);
      await fn(...Object.values(scope));

      const formattedOutput = `[${banner}]\n${stdout.join('\n')}\n\n${I18nRuntime.getMessage('sandbox.java.exec_complete')}`;
      return {
        success: true,
        isSimulation: true,
        status: 'success',
        output: formattedOutput,
        error: null,
        isUserError: false,
        isSystemError: false
      };
    } catch (err) {
      const isArith   = err.message && (err.message.includes('/ by zero') || err.message.includes('ArithmeticException'));
      const isUndef   = err instanceof ReferenceError;
      const isTimeout = err.message && (
        err.message.includes('Iteration limit') ||
        err.message.includes('Maximum execution') ||
        err.message.includes('iteraciones excedido') ||
        err.message.includes('máximo de ejecución')
      );

      let userErrMsg;
      if (isArith) {
        userErrMsg = `[${banner}]\n${I18nRuntime.getMessage('sandbox.java.error.arithmetic')}`;
      } else if (isUndef) {
        const varMatch = err.message.match(/(\w+) is not defined/);
        const varName  = varMatch ? varMatch[1] : '';
        userErrMsg = `[${banner}]\n` + (varName
          ? I18nRuntime.getMessage('sandbox.java.error.undefined',  { name: varName })
          : I18nRuntime.getMessage('sandbox.java.error.undefined.novar'));
      } else if (isTimeout) {
        userErrMsg = `[${banner}]\n${I18nRuntime.getMessage('sandbox.java.error.timeout', { message: err.message })}`;
      } else if (err instanceof SyntaxError) {
        userErrMsg = `[${banner}]\n${I18nRuntime.getMessage('sandbox.java.error.syntax', { detail: err.message })}`;
      } else {
        userErrMsg = `[${banner}]\n${I18nRuntime.getMessage('sandbox.java.error.generic', { message: err.message })}`;
      }

      return {
        success: false,
        isUserError: true,
        isSimulation: true,
        status: 'error',
        output: stdout.join('\n'),
        error: userErrMsg
      };
    }
  }

  static cancel() {
    return false;
  }
}
