import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { BookOpen, Image, Zap, AlertCircle, Upload, Check, AlertTriangle, ShieldAlert } from 'lucide-react';

const LANGUAGE_OPTIONS = ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Rust', 'Go'];
const LEVEL_OPTIONS = ['Básico', 'Intermedio', 'Avanzado'];
const STATUS_OPTIONS = [
  { value: 'publicado', label: 'Publicado (Visible en catálogo)' },
  { value: 'borrador', label: 'Borrador (Solo visible para instructor)' },
  { value: 'despublicado', label: 'Despublicado (Oculto para nuevos alumnos)' }
];

export function CourseFormModal({ isOpen, onClose, course = null, onSaved, user }) {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [descripcionLarga, setDescripcionLarga] = useState('');
  const [lenguaje, setLenguaje] = useState('Python');
  const [nivel, setNivel] = useState('Básico');
  const [estado, setEstado] = useState('publicado');
  const [costoTokens, setCostoTokens] = useState(25);
  const [miniatura, setMiniatura] = useState('');
  const [previewImg, setPreviewImg] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);

  useEffect(() => {
    if (course) {
      setTitulo(course.titulo || '');
      setSubtitulo(course.subtitulo || course.descripcionCorta || '');
      setDescripcionLarga(course.descripcionLarga || '');
      setLenguaje(course.lenguaje || 'Python');
      setNivel(course.nivel || 'Básico');
      setEstado(course.estado || 'publicado');
      setCostoTokens(course.costoTokens !== undefined ? course.costoTokens : 25);
      setMiniatura(course.miniatura || '');
      setPreviewImg(course.miniatura || '');
    } else {
      setTitulo('');
      setSubtitulo('');
      setDescripcionLarga('');
      setLenguaje('Python');
      setNivel('Básico');
      setEstado('publicado');
      setCostoTokens(25);
      setMiniatura('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80');
      setPreviewImg('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80');
    }
    setErrors({});
    setShowImpactModal(false);
  }, [course, isOpen]);

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, miniatura: 'El archivo seleccionado debe ser una imagen (PNG, JPG, WebP).' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setMiniatura(base64);
        setPreviewImg(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!titulo.trim()) newErrors.titulo = 'El título del curso es obligatorio.';
    if (!subtitulo.trim()) newErrors.subtitulo = 'La descripción corta es obligatoria.';
    if (isNaN(costoTokens) || Number(costoTokens) < 0) newErrors.costoTokens = 'El costo en tokens debe ser un número mayor o igual a 0.';
    if (!lenguaje) newErrors.lenguaje = 'Debe seleccionar al menos un lenguaje principal.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeSave = async () => {
    setLoading(true);
    const courseData = {
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim(),
      descripcionLarga: descripcionLarga.trim(),
      lenguaje,
      nivel,
      estado,
      costoTokens: parseInt(costoTokens, 10),
      miniatura: miniatura || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
    };

    try {
      const { api } = await import('../../services/api');
      if (course?.id) {
        const res = await api.courses.updateCourse(course.id, courseData);
        if (res.success && onSaved) onSaved(res.course);
      } else {
        const res = await api.courses.createCourse(courseData, user);
        if (res.success && onSaved) onSaved(res.course);
      }
      setShowImpactModal(false);
      onClose();
    } catch (err) {
      setErrors({ submit: 'Error al guardar el curso: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Si es edición de un curso publicado con alumnos activos, pedir confirmación de impacto
    if (course?.id && (course.estudiantes || 0) > 0) {
      setShowImpactModal(true);
    } else {
      executeSave();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={course ? 'Editar Curso' : 'Crear Nuevo Curso'}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errors.submit && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> {errors.submit}
            </div>
          )}

          {/* Título */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Título del Curso *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Arquitectura Backend con Java & Spring Boot 3"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {errors.titulo && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.titulo}</span>}
          </div>

          {/* Descripción Corta */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Subtítulo / Resumen Corto *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. Domina microservicios, JPA y seguridad desde cero a producción."
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
            />
            {errors.subtitulo && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.subtitulo}</span>}
          </div>

          {/* Descripción Larga */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Descripción Detallada y Temario</label>
            <textarea
              rows={3}
              className="form-input"
              placeholder="Describe los módulos, requerimientos previos y objetivos de aprendizaje..."
              value={descripcionLarga}
              onChange={(e) => setDescripcionLarga(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Estado del Curso & Costo en Tokens */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Estado del Curso</label>
              <select
                className="form-input"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Costo en Tokens (0 = Gratuito)</label>
              <div style={{ position: 'relative' }}>
                <Zap size={16} color="#F59E0B" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="number"
                  min="0"
                  max="500"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={costoTokens}
                  onChange={(e) => setCostoTokens(e.target.value)}
                />
              </div>
              {errors.costoTokens && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.costoTokens}</span>}
            </div>
          </div>

          {/* Lenguaje & Nivel */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Lenguaje Principal *</label>
              <select
                className="form-input"
                value={lenguaje}
                onChange={(e) => setLenguaje(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Nivel de Dificultad</label>
              <select
                className="form-input"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
              >
                {LEVEL_OPTIONS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Miniatura / Portada */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Imagen de Portada (Miniatura)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '50px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                {previewImg ? (
                  <img src={previewImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <Image size={18} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={14} /> Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Formatos recomendados: PNG, JPG, WebP (16:9)
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (course ? 'Guardar Cambios' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Impacto en Alumnos Activos (A.2) */}
      {showImpactModal && (
        <Modal
          isOpen={showImpactModal}
          onClose={() => setShowImpactModal(false)}
          title="⚠️ Confirmación de Impacto en Alumnos"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: '#F59E0B' }}>
              <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                Este curso tiene <strong>{course?.estudiantes || 0} alumnos inscritos</strong> actualmente.
                <br />
                Modificar el título, el costo en tokens o el estado del curso puede afectar el avance y la experiencia de los estudiantes que ya están cursando este contenido.
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              ¿Estás seguro de que deseas aplicar estas modificaciones al curso publicado?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowImpactModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Volver a Revisar
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={loading}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}
              >
                {loading ? 'Aplicando...' : 'Confirmar y Guardar Cambios'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
