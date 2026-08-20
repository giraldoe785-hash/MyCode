/**
 * FutureBackendExecutionService
 * 
 * Estructura modular preparada para la integración futura de un motor de ejecución
 * remoto en el Backend (ej. Docker Sandbox / gRPC / WebSockets / Kubernetes Runner).
 * 
 * Cuando el backend esté listo, se implementará la comunicación vía WebSocket o SSE
 * para el streaming de stdout/stderr y el intercambio interactivo de stdin/input.
 */
export class FutureBackendExecutionService {
  static async execute(code, { language = 'python', onOutput, onInputRequest, onStatusUpdate } = {}) {
    throw new Error(
      'FutureBackendExecutionService: El backend de ejecución remota aún no está disponible. ' +
      'Utilice PyodideExecutionService para la ejecución local en el navegador.'
    );
  }

  static cancel() {
    return false;
  }
}