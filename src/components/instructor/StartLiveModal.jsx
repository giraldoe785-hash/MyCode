import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';
import { Radio, Copy, Check, Tv, AlertTriangle, Play, Sparkles } from 'lucide-react';

export function StartLiveModal({ isOpen, onClose, courses = [], user, onStreamStarted }) {
  const navigate = useNavigate();
  const { t, isSpanish } = useLanguage();
  const [titulo, setTitulo] = useState('Masterclass en Vivo: Arquitectura y Concurrencia');
  const [tema, setTema] = useState('Sesión práctica interactiva con preguntas en vivo y revisión de proyectos.');
  const [cursoId, setCursoId] = useState(courses[0]?.id || '');
  const [streamKey] = useState('live_' + Math.random().toString(36).substring(2, 14));
  const [rtmpUrl] = useState('rtmp://ingest.mycodepro.dev/live');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRtmp, setCopiedRtmp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(streamKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyRtmp = () => {
    navigator.clipboard.writeText(rtmpUrl);
    setCopiedRtmp(true);
    setTimeout(() => setCopiedRtmp(false), 2000);
  };

  const handleStartStream = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setLoading(true);
    try {
      const { api } = await import('../../services/api');
      const res = await api.live.startStream({
        titulo: titulo.trim(),
        tema: tema.trim(),
        cursoId: cursoId || null,
        streamKey,
        rtmpUrl
      }, user);

      if (res.success) {
        if (onStreamStarted) onStreamStarted(res.stream);
        onClose();
        navigate('/live');
      }
    } catch (err) {
      console.error('Error starting live stream:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSpanish ? 'Iniciar Transmisión en Directo' : 'Start My Live Stream'}
      maxWidth="780px"
    >
      <form onSubmit={handleStartStream} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '80vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {/* 2-Column Responsive Layout (B.8 - B.9) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Stream Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{isSpanish ? 'Título del Directo *' : 'Live Stream Title *'}</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ej. Sesión en Vivo: Microservicios con Spring Boot"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{isSpanish ? 'Tema y Objetivos' : 'Topic & Objectives'}</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Explica qué temas se abordarán en la sesión..."
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{isSpanish ? 'Asociar a un Curso (Opcional)' : 'Associate with Course (Optional)'}</label>
              <select
                className="form-input"
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
              >
                <option value="">{isSpanish ? '-- Directo Abierto para Toda la Comunidad --' : '-- Open Stream for the Entire Community --'}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.titulo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Ingest & Streaming Credentials */}
          <div style={{
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Tv size={15} /> {isSpanish ? 'Credenciales de Emisión (OBS / vMix)' : 'Broadcast Credentials (OBS / vMix)'}
            </div>

            {/* Compact RTMP URL Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSpanish ? 'URL Ingesta RTMP' : 'RTMP Ingest URL'}</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  readOnly
                  value={rtmpUrl}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.35rem 0.6rem' }}
                />
                <button type="button" onClick={handleCopyRtmp} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem' }} title={isSpanish ? 'Copiar URL' : 'Copy URL'}>
                  {copiedRtmp ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Compact Stream Key Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSpanish ? 'Clave de Transmisión' : 'Stream Key'}</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  readOnly
                  value={streamKey}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.35rem 0.6rem' }}
                />
                <button type="button" onClick={handleCopyKey} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.6rem' }} title={isSpanish ? 'Copiar Clave' : 'Copy Key'}>
                  {copiedKey ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Notice Note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.72rem', color: '#F59E0B', marginTop: '0.25rem', lineHeight: 1.35 }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                {isSpanish ? <><strong>Simulación Demo:</strong> Al iniciar, se habilitará la sala con reproductor interactivo y chat de alumnos en <code>/live</code>.</> : <><strong>Demo Simulation:</strong> Starting will activate the broadcast room with interactive player and student chat in <code>/live</code>.</>}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Sticky Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '0.25rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
            {isSpanish ? 'Cancelar' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#EF4444', borderColor: '#EF4444' }}>
            <Radio size={14} className="animate-pulse" /> {loading ? (isSpanish ? 'Iniciando...' : 'Starting...') : (isSpanish ? 'Empezar Transmisión' : 'Start Stream')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
