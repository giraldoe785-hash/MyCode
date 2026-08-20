import { PyodideExecutionService } from './PyodideExecutionService.js';

/**
 * PythonExecutionService
 * Wrapper de ejecución de Python 3.12 en navegador mediante Pyodide WebAssembly
 */
export class PythonExecutionService {
  static async execute(code, callbacks = {}) {
    return await PyodideExecutionService.execute(code, callbacks);
  }

  static cancel() {
    return PyodideExecutionService.cancel();
  }
}