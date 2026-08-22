import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { LiveBadge } from '../video/LiveBadge';
import { LanguageSelector } from '../common/LanguageSelector';
import { NotificationCenter } from '../common/NotificationCenter';
import {
  Terminal,
  Search,
  Sun,
  Moon,
  Zap,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  Radio,
  Code2,
  CreditCard,
  LayoutDashboard,
  ChevronDown,
  BarChart3,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { COURSES_DATA } from '../../services/mockData';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { balance } = useWallet();
  const { openCart, totalItemCount } = useCart();
  const { t, isSpanish, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cyberMenuOpen, setCyberMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cyberButtonRef = useRef(null);


  // Close mobile & cyber menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCyberMenuOpen(false);
  }, [location.pathname]);

  // Click outside & Escape key listener for Cyber Dropdown Menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        cyberButtonRef.current &&
        !cyberButtonRef.current.contains(e.target)
      ) {
        setCyberMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (cyberMenuOpen) {
          setCyberMenuOpen(false);
          cyberButtonRef.current?.focus();
        }
        if (searchOpen) {
          setSearchOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cyberMenuOpen, searchOpen]);


  // Global search keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const searchResults = searchQuery.trim()
    ? COURSES_DATA.filter(c =>
        (isSpanish ? c.titulo : (c.tituloEn || c.titulo)).toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lenguaje.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectCourse = (courseId) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/courses/${courseId}`);
  };

  const navLinks = [
    ...(isAuthenticated ? [{ label: isSpanish ? 'Mi Panel' : 'My Dashboard', path: '/dashboard', icon: LayoutDashboard }] : []),
    { label: t('nav.courses'), path: '/courses', icon: BookOpen },
    { label: t('nav.live'), path: '/live', icon: Radio, hasBadge: true },
    { label: t('nav.sandbox'), path: '/playground', icon: Code2 },
    { label: t('nav.plans'), path: '/pricing', icon: CreditCard }
  ];

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(8px)',
        height: '68px',
        transition: 'background-color var(--transition-normal)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          gap: '1rem'
        }}>
          {/* Left: Logo & Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 16px var(--accent-purple-glow)',
              flexShrink: 0
            }}>
              <Terminal size={20} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                MyCode
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                background: 'rgba(6, 182, 212, 0.12)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px'
              }}>
                PRO
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links with Enhanced Hover & Microinteractions */}
          <nav className="desktop-nav" style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.65rem',
            margin: '0 auto',
            whiteSpace: 'nowrap'
          }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              const isPlans = link.path === '/pricing';
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`navbar-link ${isActive ? 'active' : ''} ${isPlans ? 'nav-link-plans' : ''}`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                  {link.hasBadge && <LiveBadge isMini text="LIVE" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls: Search, Lang Selector, Theme, Token Pill & Auth */}
          <div className="right-header-controls" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}>
            {/* Quick Search Button (Desktop Full - wide screens >= 1400px only) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-secondary btn-sm search-btn-full"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                flexShrink: 1,
                maxWidth: '220px'
              }}
              title="Buscar cursos (Ctrl+K)"
            >
              <Search size={14} />
              <span style={{ fontSize: '0.8rem' }}>{t('nav.search_placeholder')}</span>
              <kbd style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}>
                Ctrl+K
              </kbd>
            </button>

            {/* Quick Search Icon Only (Screens < 1400px) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost search-btn-compact"
              style={{
                display: 'none',
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                flexShrink: 0
              }}
              title="Buscar cursos (Ctrl+K)"
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>

            {/* Independent Language Selector (Available for all users, auth or unauth) */}
            <LanguageSelector compact />

            {/* Visible Theme Toggle Button (Light/Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-ghost theme-toggle-btn"
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                color: theme === 'dark' ? 'var(--accent-purple)' : 'var(--accent-gold-text)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title={theme === 'dark' ? t('nav.theme_light') : t('nav.theme_dark')}
              aria-label={theme === 'dark' ? t('nav.theme_light') : t('nav.theme_dark')}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* TOKEN BALANCE PILL (ALWAYS VISIBLE IN MAIN NAVBAR, OUTSIDE DROPDOWN) */}
            <Link
              to={isAuthenticated ? "/wallet" : "/pricing"}
              className="token-pill"
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.32rem 0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
              title="Tokens disponibles para compilar y desbloquear lecciones"
            >
              <Zap size={14} fill="#F59E0B" color="#F59E0B" />
              <span>{balance}</span>
            </Link>

            {/* SHOPPING CART BUTTON */}
            <button
              type="button"
              onClick={openCart}
              className="btn-ghost"
              style={{
                position: 'relative',
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                color: totalItemCount > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title={t('cart.open_cart')}
              aria-label={t('cart.open_cart')}
            >
              <ShoppingCart size={19} />
              {totalItemCount > 0 && (
                <span className="cart-badge">
                  {totalItemCount > 99 ? '99+' : totalItemCount}
                </span>
              )}
            </button>

            {/* Authenticated State: Cyber Dropdown Menu Button */}
            {isAuthenticated ? (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  ref={cyberButtonRef}
                  type="button"
                  onClick={() => setCyberMenuOpen(prev => !prev)}
                  className="cyber-menu-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.28rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    background: cyberMenuOpen 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2))'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(245, 158, 11, 0.1))',
                    border: '1.5px solid #10B981',
                    boxShadow: cyberMenuOpen
                      ? '0 0 12px rgba(16, 185, 129, 0.4), 0 0 4px #F59E0B'
                      : '0 0 8px rgba(16, 185, 129, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    flexShrink: 0
                  }}
                  aria-expanded={cyberMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menú de usuario y configuración"
                  title="Menú de Usuario y Configuración"
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid #10B981',
                    flexShrink: 0
                  }}>
                    <img
                      src={user?.avatar || '/avatars/cyber_fox.svg'}
                      alt={user?.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <span className="cyber-user-name" style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.nombre ? user.nombre.split(' ')[0] : 'Usuario'}
                  </span>

                  <ChevronDown
                    size={14}
                    color="#10B981"
                    style={{
                      transform: cyberMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {/* Cyber Dropdown Menu Panel */}
                {cyberMenuOpen && (
                  <div
                    ref={dropdownRef}
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '280px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 1000,
                      overflow: 'hidden',
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    {/* Header: User Info */}
                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--accent-purple)',
                        flexShrink: 0
                      }}>
                        <img
                          src={user?.avatar || '/avatars/cyber_fox.svg'}
                          alt={user?.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.nombre || 'Desarrollador'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                            {user?.rol || 'Estudiante'}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                            {user?.plan || 'Bronce'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Navigation Actions */}
                    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <Link
                        to="/dashboard"
                        className="cyber-dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <LayoutDashboard size={16} color="var(--accent-purple)" />
                        <span>{t('nav.dashboard')}</span>
                      </Link>

                      <Link
                        to="/profile"
                        className="cyber-dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)'
                        }}
                      >
                        <User size={16} color="var(--accent-cyan)" />
                        <span>{isSpanish ? 'Mi Perfil y Cuenta' : 'My Profile & Account'}</span>
                      </Link>

                      {(user?.role === 'instructor' || user?.role === 'admin') && (
                        <>
                          <Link
                            to="/instructor"
                            className="cyber-dropdown-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)'
                            }}
                          >
                            <BookOpen size={16} color="#F59E0B" />
                            <span>{isSpanish ? 'Panel Instructor (CMS)' : 'Instructor Panel'}</span>
                          </Link>
                          <Link
                            to="/instructor"
                            className="cyber-dropdown-item"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)'
                            }}
                          >
                            <BarChart3 size={16} color="var(--color-success)" />
                            <span>{isSpanish ? 'Analítica de Cursos' : 'Course Analytics'}</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/wallet"
                        className="cyber-dropdown-item"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Zap size={16} fill="#F59E0B" color="#F59E0B" />
                          <span>{t('nav.wallet')}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 }}>
                          {balance} tk
                        </span>
                      </Link>
                    </div>

                    {/* Section 2: Preferences & Settings (Lang / Theme) */}
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Globe size={14} color="var(--text-muted)" />
                          {isSpanish ? 'Idioma' : 'Language'}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setLanguage('es')}
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              border: isSpanish ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                              backgroundColor: isSpanish ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              color: isSpanish ? 'var(--accent-purple)' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ES
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              border: !isSpanish ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                              backgroundColor: !isSpanish ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              color: !isSpanish ? 'var(--accent-purple)' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {theme === 'dark' ? <Moon size={14} color="var(--accent-purple)" /> : <Sun size={14} color="#F59E0B" />}
                          {theme === 'dark' ? (isSpanish ? 'Modo Oscuro' : 'Dark Mode') : (isSpanish ? 'Modo Claro' : 'Light Mode')}
                        </span>
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="btn-ghost btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--accent-purple)' }}
                        >
                          {isSpanish ? 'Cambiar' : 'Toggle'}
                        </button>
                      </div>
                    </div>

                    {/* Section 3: Logout Action */}
                    <div style={{
                      padding: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface-secondary)'
                    }}>
                      <button
                        type="button"
                        onClick={logout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'var(--color-danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        className="card-hover"
                      >
                        <LogOut size={16} />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <Link to="/login" className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="btn-ghost mobile-menu-btn"
              style={{ padding: '0.4rem', color: 'var(--text-primary)', flexShrink: 0 }}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <style>{`
        @media (max-width: 600px) {
          .cyber-user-name { display: none; }
        }
        .cyber-menu-btn:focus-visible {
          outline: 2px solid #10B981 !important;
          outline-offset: 2px;
        }
        .cyber-dropdown-item:hover, .cyber-dropdown-item:focus-visible {
          background-color: var(--bg-surface-secondary);
          outline: none;
        }
      `}</style>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: '68px 0 0 0',
            backgroundColor: 'var(--bg-surface)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.5rem',
            overflowY: 'auto',
            borderTop: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: location.pathname === link.path ? 'var(--bg-surface-secondary)' : 'transparent',
                    fontWeight: 600
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color="var(--accent-purple)" />
                    <span>{link.label}</span>
                  </div>
                  {link.hasBadge && <LiveBadge isMini text="LIVE" />}
                </Link>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isSpanish ? 'Idioma / Language' : 'Language / Idioma'}
              </span>
              <LanguageSelector />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('nav.theme_toggle_label')}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem'
                }}
              >
                {theme === 'dark' ? <Sun size={14} color="#F59E0B" /> : <Moon size={14} color="var(--accent-purple)" />}
                <span>{theme === 'dark' ? t('nav.theme_current_dark') : t('nav.theme_current_light')}</span>
              </button>
            </div>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="var(--accent-purple)" /> Mi Perfil y Cuenta
                </Link>
                {(user?.role === 'instructor' || user?.role === 'admin') && (
                  <Link to="/instructor" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)' }}>
                    <BookOpen size={16} /> Panel de Instructor
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%' }}>
                  <LayoutDashboard size={16} /> {t('nav.dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={16} color="var(--accent-gold)" /> {t('cart.title')}
                  </span>
                  {totalItemCount > 0 && (
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {totalItemCount}
                    </span>
                  )}
                </button>
                <Link to="/wallet" className="btn btn-secondary" style={{ width: '100%' }}>
                  <Zap size={16} fill="#F59E0B" /> {t('nav.wallet')} ({balance} tk)
                </Link>
                <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', color: 'var(--color-danger)' }}>
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Quick Search Modal (Ctrl+K) */}
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div
            className="modal-panel"
            style={{ maxWidth: '600px', padding: '1.25rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search_input_placeholder')}
                className="form-input"
                style={{ paddingLeft: '2.8rem', fontSize: '1rem' }}
              />
            </div>

            {searchQuery.trim() === '' ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('nav.search_empty_prompt')}
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('nav.search_no_results', { query: searchQuery })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                {searchResults.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)'
                    }}
                    className="card-hover"
                  >
                    <img
                      src={course.miniatura}
                      alt={isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isSpanish ? course.titulo : (course.tituloEn || course.titulo)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {course.instructor} • {course.lenguaje} • {course.nivel}
                      </div>
                    </div>
                    <span className="token-pill" style={{ fontSize: '0.75rem' }}>
                      <Zap size={12} fill="#F59E0B" /> {course.costoTokens} tk
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (min-width: 1400px) {
          .search-btn-full { display: flex !important; }
          .search-btn-compact { display: none !important; }
        }
        @media (min-width: 1200px) and (max-width: 1399px) {
          .search-btn-compact { display: flex !important; }
          .search-btn-full { display: none !important; }
          .desktop-nav { gap: 0.45rem !important; }
          .right-header-controls { gap: 0.4rem !important; }
        }
        @media (min-width: 992px) and (max-width: 1199px) {
          .search-btn-compact { display: flex !important; }
          .search-btn-full { display: none !important; }
          .cyber-user-name { display: none; }
          .desktop-nav { gap: 0.35rem !important; }
          .desktop-nav .navbar-link { padding: 0.4rem 0.6rem !important; font-size: 0.85rem !important; }
          .right-header-controls { gap: 0.35rem !important; }
        }
        @media (max-width: 1100px) {
          .instructor-nav-text { display: none; }
        }
        @media (max-width: 600px) {
          .cyber-user-name { display: none; }
        }
        .cyber-menu-btn:focus-visible {
          outline: 2px solid #10B981 !important;
          outline-offset: 2px;
        }
        .cyber-dropdown-item:hover, .cyber-dropdown-item:focus-visible {
          background-color: var(--bg-surface-secondary);
          outline: none;
        }
      `}</style>
    </>
  );
}
