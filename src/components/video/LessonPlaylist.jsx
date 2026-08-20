import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Lock,
  Clock,
  Unlock
} from 'lucide-react';

export function LessonPlaylist({
  course,
  activeLessonId,
  onSelectLesson,
  progressMap = {},
  onUnlockLesson
}) {
  const [openSections, setOpenSections] = useState(() => {
    // Open all sections by default
    const initial = {};
    if (course && course.secciones) {
      course.secciones.forEach(sec => {
        initial[sec.id] = true;
      });
    }
    return initial;
  });

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (!course || !course.secciones) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxHeight: '620px'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface-secondary)'
      }}>
        <h3 className="heading-sm" style={{ margin: 0, fontSize: '1rem' }}>
          Contenido del Curso
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {course.secciones.length} módulos • {course.totalLecciones || 8} lecciones en video
        </p>
      </div>

      {/* Playlist Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {course.secciones.map((sec, secIdx) => {
          const isOpen = openSections[sec.id] ?? true;

          return (
            <div
              key={sec.id}
              style={{
                marginBottom: '0.65rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}
            >
              {/* Section Accordion Header */}
              <button
                onClick={() => toggleSection(sec.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>{sec.titulo}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {sec.lecciones.length} videos
                </span>
              </button>

              {/* Lesson Items */}
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {sec.lecciones.map((les, lesIdx) => {
                    const isActive = les.id === activeLessonId;
                    const prog = progressMap[les.id];
                    const isCompleted = prog?.completed || les.completada;
                    const isLocked = les.bloqueada && !isCompleted;
                    const progressRatio = les.duracionSegundos > 0 && prog?.seconds
                      ? Math.min(100, (prog.seconds / les.duracionSegundos) * 100)
                      : 0;

                    return (
                      <div
                        key={les.id}
                        onClick={() => {
                          if (!isLocked) {
                            onSelectLesson(les.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderTop: '1px solid var(--border-subtle)',
                          backgroundColor: isActive
                            ? 'rgba(99, 102, 241, 0.12)'
                            : isLocked
                            ? 'rgba(0, 0, 0, 0.15)'
                            : 'transparent',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.15s',
                          borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                          {/* Status Icon */}
                          {isCompleted ? (
                            <CheckCircle2 size={17} color="var(--color-success)" style={{ flexShrink: 0 }} />
                          ) : isLocked ? (
                            <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          ) : isActive ? (
                            <PlayCircle size={17} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
                          ) : (
                            <PlayCircle size={17} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                          )}

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                              fontSize: '0.85rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isLocked ? 'var(--text-muted)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {les.titulo}
                            </div>

                            {/* Progress bar underneath if partially watched */}
                            {!isCompleted && !isLocked && progressRatio > 0 && (
                              <div style={{
                                width: '100%',
                                height: '3px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '2px',
                                marginTop: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${progressRatio}%`,
                                  height: '100%',
                                  backgroundColor: 'var(--accent-cyan)'
                                }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Duration or Unlock button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                          {isLocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUnlockLesson && onUnlockLesson(course.id, les.id);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                              title="Desbloquear por 5 tokens"
                            >
                              <Unlock size={12} /> 5 tk
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {les.duracionFormato || '08:00'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}