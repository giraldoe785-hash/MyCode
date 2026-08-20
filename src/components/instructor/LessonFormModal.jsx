import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Video, Link, Upload, Clock, Check, Eye, AlertCircle, Sparkles } from 'lucide-react';

export function LessonFormModal({ isOpen, onClose, courseId, sectionId, lesson = null, onSaved }) {
  const [titulo, setTitulo] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('08:00');
  const [tipoOrigen, setTipoOrigen] = useState('url'); // 'url' | 'archivo-local'
  const [videoUrl, setVideoUrl] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const [esVistaPrevia, setEsVistaPrevia] = useState(false);
  const [resumen, setResumen] = useState('');
  const [codigoMuestra, setCodigoMuestra] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitulo(lesson.titulo || '');
      const secs = lesson.duracionSegundos || 480;
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      setDuracionMinutos(`${m}:${s}`);
      setTipoOrigen(lesson.tipoOrigen || 'url');
      setVideoUrl(lesson.videoUrl || '');
      setEsVistaPrevia(Boolean(lesson.esVistaPrevia));
      setResumen(lesson.resumen || '');
      setCodigoMuestra(lesson.codigoMuestra || '');
      setLocalFileName('');
    } else {
      setTitulo('');
      setDuracionMinutos('08:00');
      setTipoOrigen('url');
      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      setLocalFileName('');
      setEsVistaPrevia(false);
      setResumen('');
      setCodigoMuestra('');
    }
    setErrors({});
  }, [lesson, isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setErrors(prev => ({ ...prev, videoUrl: 'El archivo seleccionado debe ser un video (MP4, WebM, MOV).' }));
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setLocalFileName(file.name);
      setErrors(prev => ({ ...prev, videoUrl: null }));
    }
  };

  const parseDurationToSeconds = (durStr) => {
    if (!durStr) return 480;
    if (/^\d+$/.test(durStr)) return parseInt(durStr, 10);
    const parts = durStr.split(':');
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      return m * 60 + s;
    }
    return 480;
  };

  const validate = () => {
    const newErrors = {};
    if (!titulo.trim()) newErrors.titulo = 'El título de la lección es obligatorio.';
    if (!videoUrl.trim()) newErrors.videoUrl = 'Debe indicar una URL de video o seleccionar un archivo local.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const durSecs = parseDurationToSeconds(duracionMinutos);

    const lessonData = {
      titulo: titulo.trim(),
      duracionSegundos: durSecs,
      tipoOrigen,
      videoUrl: videoUrl.trim(),
      esVistaPrevia,
      resumen: resumen.trim(),
      codigoMuestra: codigoMuestra.trim()
    };

    try {
      const { api } = await import('../../services/api');
      if (lesson?.id) {
        const res = await api.courses.updateLesson(courseId, sectionId, lesson.id, lessonData);
        if (res.success && onSaved) onSaved(res.course);
      } else {
        const res = await api.courses.addLesson(courseId, sectionId, lessonData);
        if (res.success && onSaved) onSaved(res.course);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: 'Error al guardar la lección: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? 'Editar Lección' : 'Añadir Nueva Lección con Video'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {errors.submit && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: 'var(--radius-md)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} /> {errors.submit}
          </div>
        )}

        {/* Título de la Lección */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Título de la Lección *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. 1.3 Implementación de Controladores REST con Spring Data"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          {errors.titulo && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.titulo}</span>}
        </div>

        {/* Duración y Vista Previa */}
        <div className="grid-2" style={{ gap: '1rem', alignItems: 'center' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={14} color="var(--accent-cyan)" /> Duración estimada (mm:ss)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="08:30"
              value={duracionMinutos}
              onChange={(e) => setDuracionMinutos(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.2rem' }}>
            <input
              type="checkbox"
              id="esVistaPreviaCheckbox"
              checked={esVistaPrevia}
              onChange={(e) => setEsVistaPrevia(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            <label htmlFor="esVistaPreviaCheckbox" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: esVistaPrevia ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
              Lección de vista previa gratuita (Trailer / Demo)
            </label>
          </div>
        </div>

        {/* Selector de Origen de Video */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Origen y Formato del Video</label>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setTipoOrigen('url')}
              className={`btn btn-sm ${tipoOrigen === 'url' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Link size={14} /> URL Externa (MP4 / YouTube / Vimeo / Cloudflare)
            </button>
            <button
              type="button"
              onClick={() => setTipoOrigen('archivo-local')}
              className={`btn btn-sm ${tipoOrigen === 'archivo-local' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Upload size={14} /> Subida de Archivo Local
            </button>
          </div>

          {tipoOrigen === 'url' ? (
            <div>
              <input
                type="text"
                className="form-input"
                placeholder="https://.../video.mp4 o URL embebida de Cloudflare Stream / Vimeo"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Formatos soportados: Enlaces directos .mp4, WebM, o reproductores HLS compatibles.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Video size={14} /> Seleccionar archivo de video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {localFileName && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    ✓ {localFileName}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <strong>Simulación Demo:</strong> El video se carga como Object URL local para previsualización durante esta sesión. En producción se almacenará en un bucket cloud (S3 / Cloudflare R2).
              </div>
            </div>
          )}
          {errors.videoUrl && <span style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.videoUrl}</span>}
        </div>

        {/* Resumen / Notas de la Lección */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Resumen / Descripción de la Lección</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Breve explicación de los conceptos clave abordados en este video..."
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Código de Muestra / Starter Snippet */}
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Código de Muestra / Snippet de Referencia (Opcional)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="// Código fuente o snippet relevante que acompaña al video..."
            value={codigoMuestra}
            onChange={(e) => setCodigoMuestra(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }}
          />
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Check size={16} /> {loading ? 'Guardando...' : (lesson ? 'Actualizar Lección' : 'Guardar Lección')}
          </button>
        </div>
      </form>
    </Modal>
  );
}