import React, { useState } from 'react';
import { useLiveStream } from '../context/LiveStreamContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { LiveChat } from '../components/video/LiveChat';
import { LiveBadge } from '../components/video/LiveBadge';
import { Modal } from '../components/common/Modal';
import {
  Radio,
  Calendar,
  Clock,
  Users,
  Bell,
  BellOff,
  Play,
  Film,
  Zap,
  Sparkles,
  Share2
} from 'lucide-react';

export function LiveStreamingView() {
  const { user } = useAuth();
  const { activeStream, upcomingStreams, pastStreams, toggleReminder } = useLiveStream();
  const { t, isSpanish } = useLanguage();

  const [selectedVod, setSelectedVod] = useState(null);

  return (
    <div style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* 1. Main Live Stream Broadcast Room */}
        {activeStream && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LiveBadge text={t('live.badge')} />
                <h1 className="heading-md" style={{ margin: 0 }}>
                  {isSpanish ? activeStream.titulo : (activeStream.tituloEn || activeStream.titulo)}
                </h1>
              </div>
            </div>

            {/* Cinema Split View: Player + Live Chat */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '1.5rem',
              alignItems: 'start'
            }} className="live-stream-grid">
              {/* Left: Custom Video Player */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <VideoPlayer
                  src={activeStream.videoUrl}
                  title={isSpanish ? activeStream.titulo : (activeStream.tituloEn || activeStream.titulo)}
                  autoPlay={true}
                />

                {/* Stream Metadata Card */}
                <div className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={activeStream.instructorAvatar}
                        alt={activeStream.instructor}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeStream.instructor}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Software Engineer</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                        <Share2 size={14} /> Compartir
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.5 }}>
                    {isSpanish ? activeStream.tema : (activeStream.temaEn || activeStream.tema)}
                  </p>
                </div>
              </div>

              {/* Right: Real-time Live Chat Feed */}
              <div style={{ height: '580px' }}>
                <LiveChat />
              </div>
            </div>
          </div>
        )}

        {/* 2. Upcoming Schedule with Countdown */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('live.upcoming_badge')}
            </div>
            <h2 className="heading-lg" style={{ margin: '0.25rem 0' }}>{t('live.upcoming_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('live.upcoming_subtitle')}
            </p>
          </div>

          <div className="grid-3">
            {upcomingStreams.map((stream) => (
              <div
                key={stream.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: stream.recordatorioActivo ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      <Calendar size={12} /> {new Date(stream.fechaHora).toLocaleDateString()} {new Date(stream.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="token-pill" style={{ fontSize: '0.75rem' }}>
                      <Zap size={12} fill="#F59E0B" /> {stream.costoTokens} tk
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {isSpanish ? stream.titulo : (stream.tituloEn || stream.titulo)}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                    {isSpanish ? stream.descripcion : (stream.descripcionEn || stream.descripcion)}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('live.by_prefix')} {stream.instructor}</span>

                  <button
                    onClick={() => toggleReminder(stream.id)}
                    className={`btn-sm ${stream.recordatorioActivo ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {stream.recordatorioActivo ? (
                      <>
                        <BellOff size={14} /> <span>{t('live.reminder_active')}</span>
                      </>
                    ) : (
                      <>
                        <Bell size={14} /> <span>{t('live.remind_me')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Past Streams Archive (VOD Recordings) */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('live.vod_badge')}
            </div>
            <h2 className="heading-lg" style={{ margin: '0.25rem 0' }}>{t('live.past_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('live.past_subtitle')}
            </p>
          </div>

          <div className="grid-2">
            {pastStreams.map((vod) => (
              <div key={vod.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <img
                    src={vod.miniatura}
                    alt={isSpanish ? vod.titulo : (vod.tituloEn || vod.titulo)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    right: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {vod.duracion}
                  </span>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                      {isSpanish ? vod.titulo : (vod.tituloEn || vod.titulo)}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {vod.instructor} • {vod.fecha} • {vod.vistas} {t('live.views_suffix')}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVod(vod)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Play size={14} /> {t('live.watch_vod_btn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VOD Playback Modal */}
      {selectedVod && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVod(null)}
          title={isSpanish ? selectedVod.titulo : (selectedVod.tituloEn || selectedVod.titulo)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <VideoPlayer
              src={selectedVod.grabacionUrl}
              title={isSpanish ? selectedVod.titulo : (selectedVod.tituloEn || selectedVod.titulo)}
              autoPlay={true}
            />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Grabado el {selectedVod.fecha} • Instructor: {selectedVod.instructor}
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @media (max-width: 992px) {
          .live-stream-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}