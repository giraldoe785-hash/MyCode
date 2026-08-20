import { PyodideExecutionService } from './PyodideExecutionService.js';
import { JavaExecutionService } from './JavaExecutionService.js';
import { JUnitSimulationService } from './JUnitSimulationService.js';
import { ApacheCommonsMathSimulationService } from './ApacheCommonsMathSimulationService.js';
import { FutureBackendExecutionService } from './FutureBackendExecutionService.js';
import { detectJavaExecutionMode } from './detectJavaMode.js';
import I18nRuntime from './i18nRuntime.js';

/**
 * ExecutionService - Fachada principal para el Sandbox
 * 
 * Permite cambiar transparentemente el motor de ejecución entre Pyodide (Frontend Wasm)
 * y un futuro Backend sin alterar los componentes visuales de React.
 * 
 * Enruta usando detectJavaExecutionMode como ÚNICA fuente de verdad para Java.
 */
export class ExecutionService {
  static MODE = 'frontend_wasm'; // 'frontend_wasm' | 'future_backend'

  /**
   * Sincroniza el idioma del runtime con el contexto de i18n.
   * Debe llamarse desde LanguageContext cuando cambia el idioma.
   * @param {string} locale - 'es' | 'en'
   */
  static setLocale(locale) {
    I18nRuntime.setLocale(locale);
  }

  /**
   * Ejecuta código en el entorno configurado.
   * @param {string} code - Código a ejecutar
   * @param {string} language - Lenguaje ('python' | 'java')
   * @param {Object} callbacks - Callbacks de interacción y streaming
   */
  static async execute(code, language = 'python', callbacks = {}) {

    if (language === 'python') {
      if (this.MODE === 'frontend_wasm') {
        return await PyodideExecutionService.execute(code, callbacks);
      } else {
        return await FutureBackendExecutionService.execute(code, { language, ...callbacks });
      }
    }

    if (language === 'java') {
      if (this.MODE === 'frontend_wasm') {
        // Usar detectJavaExecutionMode como ÚNICA fuente de verdad
        let mode;
        try {
          mode = detectJavaExecutionMode(code);
        } catch (err) {
          // UnsupportedFeatureError u otro error de análisis
          return {
            success: false,
            isUnsupported: true,
            status: 'unsupported',
            error: `[Java — Simulación Frontend]\n\n${err.message}`,
            output: ''
          };
        }

        // Obtener helpers de Commons Math si aplica
        const cMathHelpers = (mode === 'commons_math' || mode === 'junit_commons_math')
          ? ApacheCommonsMathSimulationService.getHelperFunctions()
          : null;

        if (mode === 'junit' || mode === 'junit_commons_math') {
          return await JUnitSimulationService.execute(code, { ...callbacks, cMathHelpers, mode });
        }

        if (mode === 'commons_math') {
          return await ApacheCommonsMathSimulationService.execute(code, callbacks);
        }

        // mode === 'java' (plain)
        return await JavaExecutionService.execute(code, callbacks);
      } else {
        return await FutureBackendExecutionService.execute(code, { language, ...callbacks });
      }
    }

    return {
      success: true,
      output: 'Código procesado correctamente.',
      error: null,
      isUserError: false,
      isSystemError: false
    };
  }

  /**
   * Cancela la ejecución activa (si está esperando entrada o en proceso).
   */
  static cancel() {
    if (this.MODE === 'frontend_wasm') {
      return PyodideExecutionService.cancel();
    }
    return FutureBackendExecutionService.cancel();
  }
}
