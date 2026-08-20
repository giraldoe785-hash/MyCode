import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Search,
  Filter,
  BookOpen,
  Zap,
  Star,
  Users,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { COURSES_DATA } from '../services/mockData';
import { api } from '../services/api';

export function CourseCatalogView() {
  const { t, isSpanish } = useLanguage();
  const [allCourses, setAllCourses] = useState(COURSES_DATA);
  const [courses, setCourses] = useState(COURSES_DATA);

  useEffect(() => {
    const loadCourses = async () => {
      const data = await api.courses.getAll();
      setAllCourses(data || COURSES_DATA);
    };
    loadCourses();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Debounced search & filter
  useEffect(() => {
    // Ocultar cursos despublicados o borradores para nuevos estudiantes
    let filtered = allCourses.filter(c => c.estado !== 'despublicado' && c.estado !== 'borrador');

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (isSpanish ? c.titulo : (c.tituloEn || c.titulo)).toLowerCase().includes(q) ||
        (isSpanish ? c.subtitulo : (c.subtituloEn || c.subtitulo)).toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.lenguaje.toLowerCase().includes(q)
      );
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(c => c.lenguaje.toLowerCase() === selectedLanguage.toLowerCase());
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(c => c.nivel.toLowerCase() === selectedLevel.toLowerCase());
    }

    if (selectedFormat !== 'all') {
      filtered = filtered.filter(c => {
        if (selectedFormat === 'grabado') return c.formato.toLowerCase().includes('grabado');
        if (selectedFormat === 'vivo') return c.formato.toLowerCase().includes('vivo');
        return true;
      });
    }

    setCourses(filtered);
  }, [searchTerm, selectedLanguage, selectedLevel, selectedFormat, isSpanish, allCourses]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('all');
    setSelectedLevel('all');
    setSelectedFormat('all');
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div>
          <div style={{ color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('courses.badge')}
          </div>
          <h1 className="heading-lg" style={{ margin: '0.25rem 0' }}>
            {t('courses.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('courses.subtitle')}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={t('courses.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="form-input"
                aria-label="Filtrar por lenguaje"
              >
                <option value="all">{t('courses.filter_language')} {t('courses.all')}</option>
                <option value="java">Java & Spring</option>
                <option value="python">Python & ML</option>
                <option value="javascript">JavaScript / React</option>
                <option value="c++">C++ Algoritmos</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="form-input"
                aria-label="Filtrar por nivel"
              >
                <option value="all">{t('courses.filter_level')} {t('courses.all')}</option>
                <option value="básico">{t('courses.basic')}</option>
                <option value="intermedio">{t('courses.intermediate')}</option>
                <option value="avanzado">{t('courses.advanced')}</option>
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="form-input"
                aria-label="Filtrar por formato"
              >
                <option value="all">{t('courses.filter_format')} {t('courses.all')}</option>
                <option value="grabado">{t('courses.recorded')}</option>
                <option value="vivo">{t('courses.upcoming_live')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 className="heading-sm">{t('courses.empty_title')}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
              {t('courses.empty_desc')}
            </p>
            <button onClick={resetFilters} className="btn btn-secondary btn-sm" style={{ margin: '0 auto' }}>
              <RotateCcw size={14} /> {t('courses.reset_filters')}
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {courses.map((course) => (
              <div key={course.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Thumbnail */}
                <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                  <img
                    src={course.miniatura}
                    alt={isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px'
                  }}>
                    {course.lenguaje}
                  </span>

                  {course.desbloqueado ? (
                    <span style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      backgroundColor: 'rgba(16, 185, 129, 0.9)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <CheckCircle2 size={12} /> {t('courses.unlocked_badge')}
                    </span>
                  ) : (
                    <span className="token-pill" style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', fontSize: '0.75rem' }}>
                      <Zap size={12} fill="#F59E0B" /> {course.costoTokens} tk
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{course.nivel}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 700 }}>
                        <Star size={13} fill="#F59E0B" /> {course.valoracion}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.5rem' }}>
                      {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                      {isSpanish ? course.subtitulo : (course.subtituloEn || course.subtitulo)}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> {course.duracionTotal}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <BookOpen size={13} /> {course.totalLecciones} {t('courses.lessons_count')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={13} /> {course.estudiantes}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={course.instructorAvatar} alt={course.instructor} style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.instructor}</span>
                    </div>

                    <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
                      <Play size={14} fill="#FFF" />
                      <span>Ver Detalles</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}