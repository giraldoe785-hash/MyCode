// Pyodide Execution Service with AST Async Input Transformation
let pyodideInstance = null;
let pyodideLoadingPromise = null;
let currentCancelReject = null;
const loadedPackages = new Set();

const PYTHON_TRANSFORMER_SCRIPT = `
import ast

class AsyncInputTransformer(ast.NodeTransformer):
    def __init__(self):
        super().__init__()
        self.has_input = False
        self.async_funcs = set()

    def visit_Call(self, node):
        self.generic_visit(node)
        if isinstance(node.func, ast.Name) and node.func.id == 'input':
            self.has_input = True
            return ast.Await(
                value=ast.Call(
                    func=ast.Name(id='__mycode_async_input__', ctx=ast.Load()),
                    args=node.args,
                    keywords=node.keywords
                )
            )
        elif isinstance(node.func, ast.Name) and node.func.id in self.async_funcs:
            return ast.Await(value=node)
        return node

    def visit_FunctionDef(self, node):
        old_has = self.has_input
        self.has_input = False
        new_body = [self.visit(stmt) for stmt in node.body]
        func_has = self.has_input
        self.has_input = old_has or func_has
        
        if func_has:
            self.async_funcs.add(node.name)
            return ast.AsyncFunctionDef(
                name=node.name,
                args=node.args,
                body=new_body,
                decorator_list=node.decorator_list,
                returns=node.returns,
                type_comment=node.type_comment
            )
        node.body = new_body
        return node

def transform_code(code_str):
    try:
        tree = ast.parse(code_str)
    except Exception:
        return code_str, False
    
    transformer = AsyncInputTransformer()
    new_tree = transformer.visit(tree)
    ast.fix_missing_locations(new_tree)
    
    if transformer.has_input:
        async_func = ast.AsyncFunctionDef(
            name='__mycode_main__',
            args=ast.arguments(posonlyargs=[], args=[], vararg=None, kwonlyargs=[], kw_defaults=[], kwarg=None, defaults=[]),
            body=new_tree.body,
            decorator_list=[],
            returns=None,
            type_comment=None
        )
        module = ast.Module(
            body=[
                async_func,
                ast.Expr(value=ast.Await(value=ast.Call(func=ast.Name(id='__mycode_main__', ctx=ast.Load()), args=[], keywords=[])))
            ],
            type_ignores=[]
        )
        ast.fix_missing_locations(module)
        return ast.unparse(module), True
    return code_str, False
`;

export class PyodideExecutionService {
  /**
   * Carga diferida de Pyodide (WebAssembly) en el navegador.
   */
  static async getPyodide(onStatusUpdate) {
    if (pyodideInstance) return pyodideInstance;
    if (pyodideLoadingPromise) return pyodideLoadingPromise;

    pyodideLoadingPromise = (async () => {
      if (typeof window === 'undefined') return null;

      if (!window.loadPyodide) {
        if (onStatusUpdate) onStatusUpdate('Descargando motor Python WebAssembly (Pyodide)...');
        await new Promise((resolve, reject) => {
          const existingScript = document.getElementById('pyodide-cdn-script');
          if (existingScript) {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
            return;
          }
          const script = document.createElement('script');
          script.id = 'pyodide-cdn-script';
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('No se pudo descargar el script de Pyodide desde CDN.'));
          document.head.appendChild(script);
        });
      }

      if (onStatusUpdate) onStatusUpdate('Inicializando entorno Python en navegador...');
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
      });

      // Inicializar el AST transformer de Python
      pyodideInstance.runPython(PYTHON_TRANSFORMER_SCRIPT);
      return pyodideInstance;
    })();

    return pyodideLoadingPromise;
  }

  /**
   * Ejecuta código Python con soporte interactivo de input().
   * @param {string} code - Código fuente Python
   * @param {Object} options - Opciones y callbacks:
   *   - onOutput: (line: string) => void
   *   - onInputRequest: (promptText: string) => Promise<string>
   *   - onStatusUpdate: (statusText: string) => void
   */
  static async execute(code, { onOutput, onInputRequest, onStatusUpdate } = {}) {
    const pyodide = await this.getPyodide(onStatusUpdate);
    const stdoutLogs = [];

    // Captura de stdout y stderr en tiempo real
    pyodide.setStdout({
      batched: (text) => {
        stdoutLogs.push(text);
        if (onOutput) onOutput(text);
      }
    });

    pyodide.setStderr({
      batched: (text) => {
        stdoutLogs.push(text);
        if (onOutput) onOutput(text);
      }
    });

    
    // 0. Carga dinámica y cacheada de paquetes nativos de Pyodide (ej. requests y pyodide-http)
    const hasRequests = /(?:^|\n)\s*(?:import\s+requests|from\s+requests\b)/m.test(code);
    if (hasRequests && !loadedPackages.has('requests')) {
      if (onStatusUpdate) onStatusUpdate('Cargando librería requests (Pyodide Wasm)...');
      if (onOutput) onOutput('[Pyodide] Cargando librería requests...');
      try {
        await pyodide.loadPackage(['requests', 'pyodide-http']);
        await pyodide.runPythonAsync(`
import pyodide_http
pyodide_http.patch_all()
`);
        loadedPackages.add('requests');
      } catch (pkgErr) {
        console.error('[Pyodide Package Load Error]', pkgErr);
      }
    }

    // 1. Transformación AST para detectar y convertir input() a async/await
    let codeToExecute = code;
    let hasInput = false;

    try {
      const transformResult = pyodide.globals.get('transform_code')(code);
      const [transformed, inputDetected] = transformResult.toJs();
      codeToExecute = transformed;
      hasInput = inputDetected;
    } catch (e) {
      console.warn('[AST Transform Fallback]', e);
      codeToExecute = code;
    }

    // 2. Vincular el puente de input asíncrono con la interfaz React
    pyodide.globals.set('__mycode_async_input__', async (promptText = '') => {
      const pText = promptText !== null && promptText !== undefined ? String(promptText) : '';
      if (pText) {
        stdoutLogs.push(pText);
        if (onOutput) onOutput(pText);
      }

      if (onInputRequest) {
        return new Promise((resolve, reject) => {
          currentCancelReject = reject;
          onInputRequest(pText)
            .then((userInput) => {
              const val = String(userInput ?? '');
              stdoutLogs.push(`> ${val}`);
              if (onOutput) onOutput(`> ${val}`);
              currentCancelReject = null;
              resolve(val);
            })
            .catch((err) => {
              currentCancelReject = null;
              reject(err);
            });
        });
      }

      // Si no se proveyó callback de input, fallback seguro
      return '';
    });

    const startTime = performance.now();

    try {
      let result;
      if (hasInput) {
        result = await pyodide.runPythonAsync(codeToExecute);
      } else {
        result = await pyodide.runPythonAsync(code);
      }

      const duration = ((performance.now() - startTime) / 1000).toFixed(3);
      let fullOutput = stdoutLogs.join('\n');
      if (!fullOutput && result !== undefined && result !== null) {
        fullOutput = String(result);
      }

      return {
        success: true,
        output: fullOutput || '(Código ejecutado sin salida en consola stdout)',
        error: null,
        duration: `${duration}s`,
        isUserError: false,
        isSystemError: false
      };
    } catch (err) {
      const duration = ((performance.now() - startTime) / 1000).toFixed(3);
      const errMsg = err.message || String(err);

      // Si fue cancelado manualmente por el usuario
      if (errMsg.includes('Ejecución cancelada') || errMsg.includes('Cancelled')) {
        return {
          success: false,
          output: stdoutLogs.join('\n'),
          error: '[Ejecución detenida por el usuario]',
          duration: `${duration}s`,
          isUserError: false,
          isSystemError: false,
          isCancelled: true
        };
      }


      // Detección específica de bloqueo CORS / Restricción de red en navegador
      const isCorsError = /(?:Failed to fetch|NetworkError|CORS|ConnectionError|MaxRetryError|ProtocolError|Cannot connect to proxy)/i.test(errMsg);
      if (isCorsError) {
        return {
          success: false,
          output: stdoutLogs.join('\n'),
          error: `[Restricción de Red / Política CORS en Navegador]:\nEsta petición fue bloqueada por la política CORS del servidor de destino. Esto es una restricción de seguridad del navegador, no un error en tu código.\n\nSugerencia educativa: Prueba con un endpoint que permita solicitudes CORS desde el navegador, por ejemplo:\n  • https://jsonplaceholder.typicode.com/todos/1\n  • https://httpbin.org/get`,
          duration: `${duration}s`,
          isUserError: false,
          isCorsError: true
        };
      }

      return {
        success: false,
        output: stdoutLogs.join('\n'),
        error: `[Error de Ejecución Python (${duration}s)]:\n${errMsg}`,
        duration: `${duration}s`,
        isUserError: true, // Errores de sintaxis/ValueError/TypeError del usuario
        isSystemError: false
      };
    } finally {
      currentCancelReject = null;
    }
  }

  /**
   * Cancela la ejecución si se encuentra esperando input.
   */
  static cancel() {
    if (currentCancelReject) {
      currentCancelReject(new Error('Ejecución cancelada por el usuario.'));
      currentCancelReject = null;
      return true;
    }
    return false;
  }
}