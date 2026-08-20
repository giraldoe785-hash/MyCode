import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { LessonFormModal } from './LessonFormModal';
import {
  FolderPlus,
  Plus,
  Video,
  Eye,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Layers,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function CourseContentManager({ isOpen, onClose, course, onCourseUpdated }) {
  const [activeCourse, setActiveCourse] = useState(course);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  if (!activeCourse) return null;

  const handleOpenAddSection = () => {
    setEditingSectionId(null);
    setSectionTitle(`Módulo ${(activeCourse.secciones || []).length + 1}: `);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec) => {
    setEditingSectionId(sec.id);
    setSectionTitle(sec.titulo);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    const { api } = await import('../../services/api');
    if (editingSectionId) {
      const res = await api.courses.updateSection(activeCourse.id, editingSectionId, { titulo: sectionTitle.trim() });
      if (res.success) {
        setActiveCourse(res.course);
        if (onCourseUpdated) onCourseUpdated(res.course);
      }
    } else {
      const res = await api.courses.addSection(activeCourse.id, { titulo: sectionTitle.trim() });
      if (res.success) {
        setActiveCourse(res.course);
        if (onCourseUpdated) onCourseUpdated(res.course);
      }
    }
    setIsSectionModalOpen(false);
  };

  const handleDeleteSection = async (secId) => {
    const studentCount = activeCourse.estudiantes || 0;
    const warningMsg = studentCount > 0
      ? `⚠️ Este curso tiene ${studentCount} alumnos inscritos. Eliminar este módulo afectará las lecciones activas. ¿Deseas confirmar la eliminación?`
      : '¿Seguro que deseas eliminar este módulo y todas sus lecciones asociadas?';
    if (!window.confirm(warningMsg)) return;
    const { api } = await import('../../services/api');
    const res = await api.courses.deleteSection(activeCourse.id, secId);
    if (res.success) {
      setActiveCourse(res.course);
      if (onCourseUpdated) onCourseUpdated(res.course);
    }
  };

  const handleMoveSection = async (index, direction) => {
    const sections = [...(activeCourse.secciones || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIdx];
    sections[targetIdx] = temp;

    const { api } = await import('../../services/api');
    const res = await api.courses.reorderSections(activeCourse.id, sections);
    if (res.success) {
      setActiveCourse(res.course);
      if (onCourseUpdated) onCourseUpdated(res.course);
    }
  };

  const handleOpenAddLesson = (secId) => {
    setTargetSectionId(secId);
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (secId, les) => {
    setTargetSectionId(secId);
    setEditingLesson(les);
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (secId, lesId) => {
    const studentCount = activeCourse.estudiantes || 0;
    const warningMsg = studentCount > 0
      ? `⚠️ Este curso tiene ${studentCount} alumnos inscritos. Eliminar esta lección conservará el historial de completitud pero cambiará el temario. ¿Deseas eliminarla?`
      : '¿Seguro que deseas eliminar esta lección?';
    if (!window.confirm(warningMsg)) return;
    const { api } = await import('../../services/api');
    const res = await api.courses.deleteLesson(activeCourse.id, secId, lesId);
    if (res.success) {
      setActiveCourse(res.course);
      if (onCourseUpdated) onCourseUpdated(res.course);
    }
  };

  const handleLessonSaved = (updatedCourse) => {
    setActiveCourse(updatedCourse);
    if (onCourseUpdated) onCourseUpdated(updatedCourse);
  };

  const totalLecciones = (activeCourse.secciones || []).reduce((acc, s) => acc + (s.lecciones?.length || 0), 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Gestionar Contenido: ${activeCourse.titulo}`}
        maxWidth="850px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '80vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {/* Header Resumen */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--border-medium)' }}>
                <img src={activeCourse.miniatura} alt="Miniatura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{activeCourse.titulo}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {activeCourse.lenguaje} • {activeCourse.nivel} • {(activeCourse.secciones || []).length} Módulos • {totalLecciones} Lecciones
                </div>
              </div>
            </div>

            <button onClick={handleOpenAddSection} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FolderPlus size={15} /> + Nuevo Módulo / Sección
            </button>
          </div>

          {/* Listado de Secciones */}
          {(activeCourse.secciones || []).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Layers size={36} color="var(--accent-purple)" style={{ margin: '0 auto 1rem', display: 'block' }} />
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Aún no hay módulos en este curso</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Organiza el contenido en módulos temáticos y agrega lecciones con video para tus estudiantes.
              </p>
              <button onClick={handleOpenAddSection} className="btn btn-primary btn-sm">
                <FolderPlus size={15} /> Crear Primer Módulo
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activeCourse.secciones.map((sec, sIdx) => (
                <div
                  key={sec.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Encabezado del Módulo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.2rem', backgroundColor: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                        #{sIdx + 1}
                      </span>
                      <strong style={{ fontSize: '0.95rem' }}>{sec.titulo}</strong>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {(sec.lecciones || []).length} lecciones
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Botones de Reordenación */}
                      <button
                        onClick={() => handleMoveSection(sIdx, 'up')}
                        disabled={sIdx === 0}
                        className="btn-ghost"
                        style={{ padding: '0.25rem 0.4rem', opacity: sIdx === 0 ? 0.3 : 1 }}
                        title="Mover arriba"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveSection(sIdx, 'down')}
                        disabled={sIdx === activeCourse.secciones.length - 1}
                        className="btn-ghost"
                        style={{ padding: '0.25rem 0.4rem', opacity: sIdx === activeCourse.secciones.length - 1 ? 0.3 : 1 }}
                        title="Mover abajo"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        className="btn-ghost"
                        style={{ padding: '0.25rem 0.4rem', color: 'var(--text-secondary)' }}
                        title="Editar nombre del módulo"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        className="btn-ghost"
                        style={{ padding: '0.25rem 0.4rem', color: '#EF4444' }}
                        title="Eliminar módulo"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenAddLesson(sec.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        <Plus size={13} /> Lección
                      </button>
                    </div>
                  </div>

                  {/* Lista de Lecciones del Módulo */}
                  <div style={{ padding: '0.75rem 1rem' }}>
                    {(sec.lecciones || []).length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No hay lecciones en este módulo. Haz clic en <strong>+ Lección</strong> para subir un video.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sec.lecciones.map((les, lIdx) => (
                          <div
                            key={les.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.6rem 0.85rem',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(255,255,255,0.04)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                              <Video size={15} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {les.titulo}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Clock size={11} /> {les.duracionFormato || '08:00'}
                                  </span>
                                  {les.esVistaPrevia && (
                                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                      <Eye size={10} /> Vista Previa Libre
                                    </span>
                                  )}
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {les.tipoOrigen === 'archivo-local' ? '📁 Archivo Local' : '🔗 URL Stream'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <button
                                onClick={() => handleOpenEditLesson(sec.id, les)}
                                className="btn-ghost"
                                style={{ padding: '0.25rem 0.4rem', color: 'var(--text-secondary)' }}
                                title="Editar lección"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(sec.id, les.id)}
                                className="btn-ghost"
                                style={{ padding: '0.25rem 0.4rem', color: '#EF4444' }}
                                title="Eliminar lección"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Cerrar Administrador
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Crear/Editar Sección */}
      {isSectionModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSectionModalOpen(false)}
          title={editingSectionId ? 'Editar Módulo' : 'Nuevo Módulo / Sección'}
          maxWidth="480px"
        >
          <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Título del Módulo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Módulo 3: Autenticación JWT y Spring Security"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button type="button" onClick={() => setIsSectionModalOpen(false)} className="btn btn-secondary btn-sm">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Guardar Módulo
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Crear/Editar Lección */}
      {isLessonModalOpen && (
        <LessonFormModal
          isOpen={true}
          onClose={() => setIsLessonModalOpen(false)}
          courseId={activeCourse.id}
          sectionId={targetSectionId}
          lesson={editingLesson}
          onSaved={handleLessonSaved}
        />
      )}
    </>
  );
}