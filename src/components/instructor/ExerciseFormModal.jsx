import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CodeEditor } from '../code/CodeEditor';
import { Code2, BookOpen, Layers, Check, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

const PYTHON_TEMPLATE_DEFAULT = `# Escribe aquí la plantilla inicial para el alumno
def resolver():
    # Tu código aquí
    pass
`;

const JAVA_TEMPLATE_DEFAULT = `// Plantilla inicial para el alumno
public class Solution {
    public static void main(String[] args) {
        // Tu código aquí
    }
}
`;

export function ExerciseFormModal({ isOpen, onClose, exercise = null, courses = [], onSaved, user }) {
  const [titulo, setTitulo] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [lenguaje, setLenguaje] = useState('python');
  const [cursoId, setCursoId] = useState(courses[0]?.id || '');
  const [seccionId, setSeccionId] = useState('');
  const [codigoInicial, setCodigoInicial] = useState(PYTHON_TEMPLATE_DEFAULT);
  const [solucionReferencia, setSolucionReferencia] = useState('');
  const [criterios, setCriterios] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Secciones del curso seleccionado
  const selectedCourseObj = courses.find(c => c.id === cursoId);
  const secciones = selectedCourseObj?.secciones || [];

  useEffect(() => {
    if (exercise) {
      setTitulo(exercise.titulo || exercise.title || '');
      setEnunciado(exercise.enunciado || exercise.content || '');
      const lang = (exercise.lenguaje || exercise.language || 'python').toLowerCase();
      setLenguaje(lang);
      setCursoId(exercise.cursoId || exercise.courseId || courses[0]?.id || '');
      setSeccionId(exercise.seccionId || exercise.moduleId || '');
      setCodigoInicial(exercise.codigoInicial || exercise.initialCode || (lang === 'java' ? JAVA_TEMPLATE_DEFAULT : PYTHON_TEMPLATE_DEFAULT));
      setSolucionReferencia(exercise.solucionReferencia || '');
      setCriterios(exercise.criterios || '');
    } else {
      setTitulo('');
      setEnunciado('');
      setLenguaje('python');
      const defaultCourse = courses[0]?.id || '';
      setCursoId(defaultCourse);
      const defaultCourseObj = courses.find(c => c.id === defaultCourse);
      setSeccionId(defaultCourseObj?.secciones?.[0]?.id || '');
      setCodigoInicial(PYTHON_TEMPLATE_DEFAULT);
      setSolucionReferencia('');
      setCriterios('1. Sintaxis correcta.\n2. Lógica óptima.\n3. Salida acorde a los requerimientos.');
    }
    setErrors({});
  }, [exercise, isOpen, courses]);

  // Si cambia el lenguaje en nuevo ejercicio, adaptar la plantilla si no ha sido modificada sustancialmente
  const handleLanguageChange = (newLang) => {
    setLenguaje(newLang);
    if (!exercise) {
      setCodigoInicial(newLang === 'java' ? JAVA_TEMPLATE_DEFAULT : PYTHON_TEMPLATE_DEFAULT);
    }
  };

  // Si cambia el curso, actualizar la sección predeterminada
  const handleCourseChange = (newCourseId) => {
    setCursoId(newCourseId);
    const cObj = courses.find(c => c.id === newCourseId);
    setSeccionId(cObj?.secciones?.[0]?.id || '');
  };

  const validate = () => {
    const newErrors = {};
    if (!titulo.trim()) newErrors.titulo = 'El título del ejercicio es obligatorio.';
    if (!enunciado.trim()) newErrors.enunciado = 'El enunciado/descripción es obligatorio.';
    if (!cursoId) newErrors.cursoId = 'Debe asociar el ejercicio a un curso.';
    if (!codigoInicial.trim()) newErrors.codigoInicial = 'Debe proporcionar una plantilla o código inicial.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const exerciseData = {
      titulo: titulo.trim(),
      enunciado: enunciado.trim(),
      lenguaje,
      cursoId,
      seccionId,
      codigoInicial,
      solucionReferencia: solucionReferencia.trim(),
      criterios: criterios.trim()
    };

    try {
      const { api } = await import('../../services/api');
      if (exercise?.id) {
        const res = await api.exercises.updateExercise(exercise.id, exerciseData);
        if (res.success && onSaved) onSaved(res.exercise);
      } else {
        const res = await api.exercises.createExercise(exerciseData, user);
        if (res.success && onSaved) onSaved(res.exercise);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: 'Error al guardar el ejercicio: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise ? 'Editar Ejercicio Práctico' : 'Crear Nuevo Ejercicio Práctico'}
      maxWidth="850px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '82vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {errors.submit && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {errors.submit}
          </div>
        )}

        {/* Título */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Título del Ejercicio *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Inversión de Cadenas y Análisis de Complejidad"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          {errors.titulo && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.titulo}</span>}
        </div>

        {/* Curso y Módulo en Cascada + Lenguaje */}
        <div className="grid-3" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Curso Asociado *</label>
            <select
              className="form-input"
              value={cursoId}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.titulo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Módulo / Sección</label>
            <select
              className="form-input"
              value={seccionId}
              onChange={(e) => setSeccionId(e.target.value)}
            >
              <option value="">-- Módulo General del Curso --</option>
              {secciones.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.titulo}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Lenguaje del Sandbox</label>
            <select
              className="form-input"
              value={lenguaje}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="python">Python 3.12 (Pyodide Wasm)</option>
              <option value="java">Java (Simulador Frontend)</option>
            </select>
          </div>
        </div>

        {/* Enunciado / Descripción */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Enunciado del Ejercicio / Instrucciones para el Alumno *</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Describe claramente los requisitos, datos de entrada, formato de salida esperado y restricciones..."
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          {errors.enunciado && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.enunciado}</span>}
        </div>

        {/* Editor de Plantilla / Código Inicial (Reutiliza CodeEditor sin cobro de tokens ni botón de run) */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
              Código Inicial / Plantilla que verá el Alumno *
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Modo Plantilla (Sin ejecución ni cobro de tokens)
            </span>
          </div>

          <CodeEditor
            initialCode={codigoInicial}
            language={lenguaje}
            filename={lenguaje === 'java' ? 'Solution.java' : 'solution.py'}
            tokenCost={0}
            height="220px"
            hideRunButton={true}
            onChange={(newCode) => setCodigoInicial(newCode)}
          />
          {errors.codigoInicial && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.codigoInicial}</span>}
        </div>

        {/* Solución de Referencia (Solo visible para el profesor) */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} /> Solución de Referencia (Privada — Solo para el Instructor)
          </label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="// Pega aquí la solución de referencia o algoritmo óptimo para guiar tus revisiones posteriores..."
            value={solucionReferencia}
            onChange={(e) => setSolucionReferencia(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Criterios de Evaluación */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Criterios y Rúbrica de Evaluación (Para calificación manual)</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Ej. 1. Manejo de excepciones (30pts) 2. Complejidad temporal O(n) (40pts) 3. Buenas prácticas (30pts)"
            value={criterios}
            onChange={(e) => setCriterios(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Check size={16} /> {loading ? 'Guardando...' : (exercise ? 'Guardar Cambios' : 'Publicar Ejercicio')}
          </button>
        </div>
      </form>
    </Modal>
  );
}