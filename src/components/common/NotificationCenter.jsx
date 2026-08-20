import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Sparkles,
  ExternalLink,
  Zap,
  Code2,
  FileCode,
  GraduationCap
} from 'lucide-react';

export function NotificationCenter() {
  const { user } = useAuth();
  const { t, isSpanish } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const userId = user?.id || 'usr_101';

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll(userId);
      setNotifications(data || []);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Click outside & Escape key listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    const res = await api.notifications.markAsRead(id, userId);
    if (res.success) {
      setNotifications(res.notifications);
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await api.notifications.markAllAsRead(userId);
    if (res.success) {
      setNotifications(res.notifications);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="btn-ghost"
        style={{
          position: 'relative',
          padding: '0.45rem',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? 'var(--accent-purple)' : 'var(--text-secondary)',
          cursor: 'pointer'
        }}
        aria-label="Centro de Notificaciones"
        title={isSpanish ? "Centro de Notificaciones" : "Notification Center"}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: 'var(--accent-purple)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px var(--accent-purple-glow)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: '-60px',
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-surface-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem' }}>
              <Bell size={15} color="var(--accent-purple)" />
              <span style={{ color: 'var(--text-primary)' }}>{isSpanish ? 'Notificaciones' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {unreadCount} {isSpanish ? 'nuevas' : 'new'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {isSpanish ? 'Marcar leídas' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.7 }} />
                <span>{isSpanish ? '¡Todo al día! No tienes notificaciones.' : 'All caught up! No notifications.'}</span>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.read;
                const isSubmission = n.type === 'nueva-entrega';

                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isUnread 
                        ? (isSubmission ? 'rgba(6, 182, 212, 0.08)' : 'rgba(99, 102, 241, 0.08)')
                        : 'transparent',
                      transition: 'background-color var(--transition-fast)',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      position: 'relative'
                    }}
                  >
                    {/* Type Icon */}
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      {isSubmission ? (
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileCode size={14} color="var(--accent-cyan)" />
                        </div>
                      ) : n.type === 'success' ? (
                        <CheckCircle2 size={16} color="var(--color-success)" />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle size={16} color="#F59E0B" />
                      ) : (
                        <Info size={16} color="var(--accent-cyan)" />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '0.85rem', color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {isSpanish ? n.title : (n.titleEn || n.title)}
                        </strong>
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            title={isSpanish ? 'Marcar como leída' : 'Mark as read'}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex'
                            }}
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem', lineHeight: 1.4 }}>
                        {isSpanish ? n.message : (n.messageEn || n.message)}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>{n.date}</span>
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => setIsOpen(false)}
                            style={{ color: 'var(--accent-purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            <span>{isSubmission ? (isSpanish ? 'Calificar Entrega' : 'Grade Submission') : (isSpanish ? 'Ver' : 'View')}</span>
                            <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
