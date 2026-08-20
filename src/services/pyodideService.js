// Pyodide WebAssembly dynamic runtime loader and executor for Python
let pyodideInstance = null;
let pyodideLoadingPromise = null;

/**
 * Carga diferida (lazy load) del CDN de Pyodide solo cuando se ejecuta código Python.
 * No penaliza el bundle inicial de Vite/React.
 */
export async function getPyodide(onStatusUpdate) {
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
    return pyodideInstance;
  })();

  return pyodideLoadingPromise;
}

/**
 * Ejecuta código Python en el navegador usando Pyodide con captura de stdout/stderr y medición de tiempo.
 */
export async function runPythonCode(code, onStatusUpdate) {
  const pyodide = await getPyodide(onStatusUpdate);
  
  const stdoutLogs = [];
  const stderrLogs = [];

  pyodide.setStdout({
    batched: (text) => {
      stdoutLogs.push(text);
    }
  });

  pyodide.setStderr({
    batched: (text) => {
      stderrLogs.push(text);
    }
  });

  const startTime = performance.now();
  try {
    const result = await pyodide.runPythonAsync(code);
    const duration = ((performance.now() - startTime) / 1000).toFixed(3);
    
    let outputText = stdoutLogs.join('\n');
    if (!outputText && result !== undefined && result !== null) {
      outputText = String(result);
    }

    return {
      success: true,
      output: `[Python 3.12 (Pyodide Wasm Runtime)]\n${outputText || '(Código ejecutado sin salida en consola stdout)'}\n\n--- Ejecución completada en ${duration}s ---`,
      error: null,
      isUserError: false,
      isSystemError: false
    };
  } catch (err) {
    const duration = ((performance.now() - startTime) / 1000).toFixed(3);
    const errMsg = err.message || String(err);
    return {
      success: false,
      output: stdoutLogs.join('\n'),
      error: `[Error de Ejecución Python (${duration}s)]:\n${errMsg}`,
      isUserError: true, // Error de sintaxis o runtime del usuario
      isSystemError: false
    };
  }
}