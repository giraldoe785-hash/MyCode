/**
 * ApacheCommonsMathSimulationService
 * =========================================================================
 * SIMULADOR EDUCATIVO DE APACHE COMMONS MATH 3 (100% FRONTEND)
 * =========================================================================
 * NO ejecuta la librería JAR real. NO requiere JVM.
 * Simula pedagógicamente un subconjunto educativo de la API.
 *
 * SUBCONJUNTO SOPORTADO:
 * - StatUtils.mean(double[])
 * - StatUtils.variance(double[])
 * - StatUtils.max(double[])
 * - StatUtils.min(double[])
 * - Math.sqrt() (ya nativo en JS, no requiere simulación)
 * - MatrixUtils.createRealMatrix(double[][])
 * - RealMatrix.add(RealMatrix)
 * - RealMatrix.multiply(RealMatrix)
 * - RealMatrix.transpose()
 * - RealMatrix.getData() → double[][]
 *
 * NO SOPORTADO (requiere JVM real):
 * - Distribuciones de probabilidad (Normal, Poisson, Binomial...)
 * - Integración numérica
 * - Optimización multivariada
 * - ODE solvers
 * =========================================================================
 */

import I18nRuntime from './i18nRuntime.js';
import { JavaExecutionService } from './JavaExecutionService.js';

// Helper seguro para envolver flotantes cuando __javaDouble esté en el scope
function _wrapDouble(v) {
  if (typeof __javaDouble === 'function') {
    return __javaDouble(v);
  }
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
}

/**
 * Emulación de RealMatrix de org.apache.commons.math3.linear.RealMatrix
 */
export class RealMatrix {
  constructor(data2D) {
    if (!data2D || !Array.isArray(data2D) || data2D.length === 0) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.empty_matrix'));
    }
    const numCols = Array.isArray(data2D[0]) ? data2D[0].length : 0;
    if (numCols === 0) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.empty_matrix'));
    }
    this.data = data2D.map(row => {
      if (!Array.isArray(row) || row.length !== numCols) {
        throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.non_rectangular'));
      }
      return row.map(v => (v !== null && typeof v === 'object') ? v.valueOf() : Number(v));
    });
  }

  getData() {
    return this.data.map(row => row.map(v => _wrapDouble(v)));
  }

  getRowDimension() {
    return this.data.length;
  }

  getColumnDimension() {
    return this.data[0].length;
  }

  getEntry(row, column) {
    if (row < 0 || row >= this.getRowDimension() || column < 0 || column >= this.getColumnDimension()) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.out_of_bounds', { row, column }));
    }
    return _wrapDouble(this.data[row][column]);
  }

  setEntry(row, column, value) {
    if (row < 0 || row >= this.getRowDimension() || column < 0 || column >= this.getColumnDimension()) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.out_of_bounds', { row, column }));
    }
    const n = (value !== null && typeof value === 'object') ? value.valueOf() : Number(value);
    this.data[row][column] = n;
  }

  add(otherMatrix) {
    if (!otherMatrix || typeof otherMatrix.getData !== 'function') {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.invalid_matrix'));
    }
    if (this.getRowDimension() !== otherMatrix.getRowDimension() ||
        this.getColumnDimension() !== otherMatrix.getColumnDimension()) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.matrix_dim_mismatch', {
        r1: this.getRowDimension(),
        c1: this.getColumnDimension(),
        r2: otherMatrix.getRowDimension(),
        c2: otherMatrix.getColumnDimension()
      }));
    }
    const otherData = otherMatrix.getData();
    const result = this.data.map((row, r) =>
      row.map((val, c) => {
        const oVal = (otherData[r][c] !== null && typeof otherData[r][c] === 'object')
          ? otherData[r][c].valueOf() : Number(otherData[r][c]);
        return val + oVal;
      })
    );
    return new RealMatrix(result);
  }

  multiply(otherMatrix) {
    if (!otherMatrix || typeof otherMatrix.getData !== 'function') {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.invalid_matrix'));
    }
    if (this.getColumnDimension() !== otherMatrix.getRowDimension()) {
      throw new Error(I18nRuntime.getMessage('sandbox.cmath.error.matrix_mult_dim_mismatch', {
        c1: this.getColumnDimension(),
        r2: otherMatrix.getRowDimension()
      }));
    }
    const rows = this.getRowDimension();
    const cols = otherMatrix.getColumnDimension();
    const common = this.getColumnDimension();
    const a = this.data;
    const b = otherMatrix.getData();
    const result = Array.from({ length: rows }, () => new Array(cols).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let sum = 0;
        for (let k = 0; k < common; k++) {
          const bVal = (b[k][j] !== null && typeof b[k][j] === 'object') ? b[k][j].valueOf() : Number(b[k][j]);
          sum += a[i][k] * bVal;
        }
        result[i][j] = sum;
      }
    }
    return new RealMatrix(result);
  }

  transpose() {
    const rows = this.getRowDimension();
    const cols = this.getColumnDimension();
    const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = this.data[i][j];
      }
    }
    return new RealMatrix(result);
  }
}

/**
 * Emulación de StatUtils de org.apache.commons.math3.stat.StatUtils
 */
export const StatUtils = {
  mean: (values) => {
    if (!values || values.length === 0) return NaN;
    const sum = values.reduce((acc, v) => acc + ((v !== null && typeof v === 'object') ? v.valueOf() : Number(v)), 0);
    return sum / values.length;
  },
  variance: (values) => {
    if (!values || values.length < 2) return NaN;
    const m = StatUtils.mean(values);
    const sumSq = values.reduce((acc, v) => {
      const num = (v !== null && typeof v === 'object') ? v.valueOf() : Number(v);
      return acc + (num - m) ** 2;
    }, 0);
    return sumSq / (values.length - 1);
  },
  max: (values) => {
    if (!values || values.length === 0) return NaN;
    const nums = values.map(v => (v !== null && typeof v === 'object') ? v.valueOf() : Number(v));
    return Math.max(...nums);
  },
  min: (values) => {
    if (!values || values.length === 0) return NaN;
    const nums = values.map(v => (v !== null && typeof v === 'object') ? v.valueOf() : Number(v));
    return Math.min(...nums);
  },
  sum: (values) => {
    if (!values || values.length === 0) return 0;
    return values.reduce((acc, v) => acc + ((v !== null && typeof v === 'object') ? v.valueOf() : Number(v)), 0);
  },
  product: (values) => {
    if (!values || values.length === 0) return NaN;
    return values.reduce((acc, v) => acc * ((v !== null && typeof v === 'object') ? v.valueOf() : Number(v)), 1);
  },
  percentile: (arr, p) => {
    if (!arr || arr.length === 0) return NaN;
    const sorted = [...arr].map(v => (v !== null && typeof v === 'object') ? v.valueOf() : Number(v)).sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }
};

/**
 * Emulación de MatrixUtils de org.apache.commons.math3.linear.MatrixUtils
 */
export const MatrixUtils = {
  createRealMatrix: (data2D) => new RealMatrix(data2D)
};

export const FastMath = {
  abs: Math.abs,
  ceil: Math.ceil,
  floor: Math.floor,
  pow: Math.pow,
  sqrt: Math.sqrt,
  log: Math.log,
  log10: Math.log10,
  round: (v) => Math.round((v !== null && typeof v === 'object') ? v.valueOf() : Number(v)),
  signum: (v) => {
    const n = (v !== null && typeof v === 'object') ? v.valueOf() : Number(v);
    return n === 0 ? 0 : n > 0 ? 1 : -1;
  }
};

export const ArithmeticUtils = {
  gcd: (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) { const t = b; b = a % b; a = t; }
    return a;
  },
  lcm: (a, b) => {
    const g = ArithmeticUtils.gcd(a, b);
    return g === 0 ? 0 : Math.abs(a * b) / g;
  },
  factorial: (n) => {
    if (n < 0) throw new Error('ArithmeticException: factorial de negativo');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
  isPrime: (n) => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }
};

export const CombinatoricsUtils = {
  binomialCoefficient: (n, k) => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let r = 1;
    for (let i = 0; i < k; i++) {
      r = r * (n - i) / (i + 1);
    }
    return Math.round(r);
  }
};

export const MathArrays = {
  convolve: (x, h) => {
    const result = new Array(x.length + h.length - 1).fill(0);
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < h.length; j++) {
        result[i + j] += x[i] * h[j];
      }
    }
    return result;
  }
};

export const Precision = {
  round: (v, scale) => {
    const factor = Math.pow(10, scale);
    return Math.round(v * factor) / factor;
  },
  equals: (a, b, delta) => Math.abs(a - b) <= delta
};

/**
 * Servicio de simulación pedagógica de Apache Commons Math 3.
 */
export class ApacheCommonsMathSimulationService {
  /**
   * Devuelve los helpers para inyección en el runner
   * @returns {Object}
   */
  static getHelperFunctions() {
    return {
      StatUtils,
      MatrixUtils,
      RealMatrix,
      FastMath,
      ArithmeticUtils,
      CombinatoricsUtils,
      MathArrays,
      Precision
    };
  }

  /**
   * Devuelve el banner de simulación en el idioma activo
   */
  static getBanner() {
    return I18nRuntime.getMessage('sandbox.simulation.banner_commons_math');
  }

  /**
   * Ejecuta código Java con soporte de Apache Commons Math.
   * @param {string} code - Código Java con llamadas a Commons Math
   * @param {Object} callbacks - Callbacks de interacción y salida
   */
  static async execute(code, callbacks = {}) {
    const cMathHelpers = this.getHelperFunctions();
    return await JavaExecutionService.execute(code, {
      ...callbacks,
      cMathHelpers,
      isCommonsMath: true
    });
  }
}
