import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Subtitles,
  Tv,
  Check,
  Sparkles
} from 'lucide-react';

export function VideoPlayer({
  videoUrl,
  subtitlesUrl,
  title = '',
  initialTime = 0,
  onProgressUpdate,
  onEnded,
  nextLesson = null,
  onPlayNext,
  autoPlay = false
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const scrubberRef = useRef(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('main'); // 'main' | 'speed' | 'quality'

  // Scrubbing & Hover Tooltip
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [hoverTime, setHoverTime] = useState(0);

  // Auto-next lesson countdown
  const [showAutoNext, setShowAutoNext] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownIntervalRef = useRef(null);

  // Subtitle simulation text
  const [activeSubtitle, setActiveSubtitle] = useState('');

  // Sample dynamic subtitles synchronized with time
  useEffect(() => {
    if (!showSubtitles) {
      setActiveSubtitle('');
      return;
    }
    const sec = Math.floor(currentTime);
    if (sec % 12 < 4) {
      setActiveSubtitle('Bienvenido a esta lección: analizando arquitectura de software.');
    } else if (sec % 12 < 8) {
      setActiveSubtitle('Recuerda aplicar el principio de responsabilidad única en tus servicios.');
    } else {
      setActiveSubtitle('Probemos ejecutar este bloque en el sandbox interactivo.');
    }
  }, [currentTime, showSubtitles]);

  // Initial time setup & video loading
  useEffect(() => {
    if (videoRef.current) {
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
      if (autoPlay) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [videoUrl, initialTime, autoPlay]);

  // Periodic Auto-save progress every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && onProgressUpdate && !videoRef.current.paused) {
        onProgressUpdate(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [onProgressUpdate]);

  // Time & Buffer Update Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // Buffer tracking
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const totalDur = videoRef.current.duration || 1;
      setBufferedPercent(Math.min(100, (bufferedEnd / totalDur) * 100));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowAutoNext(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettingsMenu(false);
    setActiveSettingsTab('main');
  };

  const changeQuality = (q) => {
    setQuality(q);
    setShowSettingsMenu(false);
    setActiveSettingsTab('main');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP no disponible:', e);
    }
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if focused on input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => {
            const next = Math.min(1, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => {
            const next = Math.max(0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'c':
        case 'C':
          setShowSubtitles(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isMuted, isPlaying]);

  // Scrubber scrubbing handlers
  const handleScrubberMouseDown = (e) => {
    if (!scrubberRef.current || !duration) return;
    setIsScrubbing(true);
    updateScrubberTime(e);
  };

  const updateScrubberTime = (e) => {
    if (!scrubberRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleScrubberMouseMove = (e) => {
    if (!scrubberRef.current || !duration) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);

    if (isScrubbing) {
      updateScrubberTime(e);
    }
  };

  const handleScrubberMouseUp = () => {
    setIsScrubbing(false);
  };

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('mousemove', handleScrubberMouseMove);
      window.addEventListener('mouseup', handleScrubberMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleScrubberMouseMove);
        window.removeEventListener('mouseup', handleScrubberMouseUp);
      };
    }
  }, [isScrubbing]);

  // Video End & Auto Next Lesson
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();

    if (nextLesson) {
      setShowAutoNext(true);
      setCountdown(5);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setShowAutoNext(false);
            if (onPlayNext) onPlayNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const cancelAutoNext = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowAutoNext(false);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player-container ${!isPlaying ? 'paused' : ''}`}
      tabIndex={0}
      aria-label={`Reproductor de video para ${title}`}
    >
      {/* Native Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="video-element"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        playsInline
      />

      {/* Simulated Subtitles Overlay */}
      {showSubtitles && activeSubtitle && (
        <div className="video-subtitles-overlay">
          {activeSubtitle}
        </div>
      )}

      {/* Auto Next Lesson Overlay */}
      {showAutoNext && nextLesson && (
        <div className="auto-next-overlay">
          <div style={{
            background: 'rgba(99, 102, 241, 0.2)',
            borderRadius: '50%',
            padding: '1rem',
            border: '1px solid var(--accent-purple)'
          }}>
            <Sparkles size={36} color="var(--accent-purple)" />
          </div>
          <div>
            <h3 className="heading-md" style={{ color: '#FFFFFF', marginBottom: '0.4rem' }}>
              ¡Lección completada!
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>
              Siguiente: <strong style={{ color: '#FFFFFF' }}>{nextLesson.titulo}</strong>
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {countdown}s
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={cancelAutoNext} className="btn btn-secondary">
              Permanecer aquí
            </button>
            <button onClick={() => { cancelAutoNext(); onPlayNext && onPlayNext(); }} className="btn btn-primary">
              Reproducir ahora
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="video-controls-overlay">
        {/* Top bar title */}
        <div className="video-top-bar">
          <div style={{ fontWeight: 600, fontSize: '0.95rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {quality}
            </span>
          </div>
        </div>

        {/* Center Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="video-center-button"
          aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
        >
          {isPlaying ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: '4px' }} />}
        </button>

        {/* Bottom Bar: Timeline Scrubber and Action Controls */}
        <div className="video-bottom-controls">
          {/* Scrubbable Timeline */}
          <div
            ref={scrubberRef}
            className="video-scrubber-wrapper"
            onMouseDown={handleScrubberMouseDown}
            onMouseMove={handleScrubberMouseMove}
            onMouseLeave={() => setHoverPosition(null)}
          >
            <div className="video-scrubber-bg" />
            <div className="video-scrubber-buffered" style={{ width: `${bufferedPercent}%` }} />
            <div className="video-scrubber-progress" style={{ width: `${progressPercent}%` }} />
            <div className="video-scrubber-handle" style={{ left: `${progressPercent}%` }} />

            {/* Hover Tooltip Preview */}
            {hoverPosition !== null && (
              <div className="video-scrubber-tooltip" style={{ left: `${hoverPosition}%` }}>
                <div className="video-scrubber-preview-thumb">
                  <span>{formatTime(hoverTime)}</span>
                </div>
                <span>{formatTime(hoverTime)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div className="video-action-bar">
            {/* Left Controls: Play, Seek, Volume, Time */}
            <div className="video-action-group">
              <button onClick={togglePlay} className="video-btn" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button onClick={() => seekRelative(-5)} className="video-btn" title="Retroceder 5s (←)">
                <RotateCcw size={18} />
              </button>

              <button onClick={() => seekRelative(5)} className="video-btn" title="Avanzar 5s (→)">
                <RotateCw size={18} />
              </button>

              <div className="volume-control-wrapper">
                <button onClick={toggleMute} className="video-btn" aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  aria-label="Volumen"
                />
              </div>

              <div className="video-time-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls: Subtitles, Settings, PiP, Fullscreen */}
            <div className="video-action-group">
              {/* Subtitles Toggle */}
              <button
                onClick={() => setShowSubtitles(prev => !prev)}
                className="video-btn"
                title={`Subtítulos (C): ${showSubtitles ? 'Activados' : 'Desactivados'}`}
                style={{ color: showSubtitles ? 'var(--accent-cyan)' : '#FFFFFF' }}
              >
                <Subtitles size={20} />
              </button>

              {/* Settings Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowSettingsMenu(prev => !prev);
                    setActiveSettingsTab('main');
                  }}
                  className="video-btn"
                  title="Configuración de reproducción"
                >
                  <Settings size={20} />
                </button>

                {showSettingsMenu && (
                  <div className="video-settings-menu">
                    {activeSettingsTab === 'main' && (
                      <>
                        <div
                          className="video-menu-item"
                          onClick={() => setActiveSettingsTab('speed')}
                        >
                          <span>Velocidad</span>
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{playbackRate}x</span>
                        </div>
                        <div
                          className="video-menu-item"
                          onClick={() => setActiveSettingsTab('quality')}
                        >
                          <span>Calidad</span>
                          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{quality}</span>
                        </div>
                      </>
                    )}

                    {activeSettingsTab === 'speed' && (
                      <>
                        <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          Velocidad de reproducción
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <div
                            key={rate}
                            className={`video-menu-item ${playbackRate === rate ? 'active' : ''}`}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
                            {playbackRate === rate && <Check size={14} color="var(--accent-cyan)" />}
                          </div>
                        ))}
                      </>
                    )}

                    {activeSettingsTab === 'quality' && (
                      <>
                        <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          Calidad de video
                        </div>
                        {['1080p Full HD', '720p HD', '360p SD'].map(q => {
                          const qKey = q.split(' ')[0];
                          return (
                            <div
                              key={q}
                              className={`video-menu-item ${quality === qKey ? 'active' : ''}`}
                              onClick={() => changeQuality(qKey)}
                            >
                              <span>{q}</span>
                              {quality === qKey && <Check size={14} color="var(--accent-cyan)" />}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* PiP Button */}
              <button onClick={togglePiP} className="video-btn" title="Modo Picture-in-Picture">
                <Tv size={19} />
              </button>

              {/* Fullscreen Button */}
              <button onClick={toggleFullscreen} className="video-btn" title="Pantalla completa (F)">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}