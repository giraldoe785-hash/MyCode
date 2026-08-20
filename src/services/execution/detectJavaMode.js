// src/services/execution/detectJavaMode.js
import { JavaExecutionService } from './JavaExecutionService.js';

/**
 * Determina el modo de ejecucion de codigo Java estaticamente.
 * Fuente UNICA de verdad para la deteccion del modo de ejecucion Java.
 *
 * @param {string} code - Codigo fuente Java a analizar.
 * @returns {'java'|'junit'|'commons_math'|'junit_commons_math'} Modo detectado.
 * @throws {Error} Si el codigo usa clases no soportadas.
 */
export function detectJavaExecutionMode(code) {
    const cleanCode = JavaExecutionService.cleanComments(code);

    const unsupportedCheck = JavaExecutionService.detectUnsupportedFeatures(cleanCode);
    if (unsupportedCheck) {
        const errorMsg = 'Funcionalidad no soportada en el simulador: ' + unsupportedCheck.name + '\n' + unsupportedCheck.reason;
        const err = new Error(errorMsg);
        err.name = 'UnsupportedFeatureError';
        throw err;
    }

    const hasJUnit = /@Test\b/.test(cleanCode) || /import\s+org\.junit\./.test(cleanCode);
    const hasCMath = /\b(StatUtils|MatrixUtils|RealMatrix|FastMath|ArithmeticUtils|CombinatoricsUtils|MathArrays|Precision)\b/.test(cleanCode) || /import\s+org\.apache\.commons\.math3\./.test(cleanCode);

    if (hasJUnit && hasCMath) return 'junit_commons_math';
    if (hasJUnit) return 'junit';
    if (hasCMath) return 'commons_math';
    return 'java';
}
