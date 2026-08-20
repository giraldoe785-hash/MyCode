import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Users, Sparkles, Smile, ShieldAlert } from 'lucide-react';

export function LiveChat({
  messages = [],
  onSendMessage,
  viewerCount = 842,
  isLive = true
}) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, user);
    setInputText('');
  };

  const addQuickReaction = (emoji) => {
    onSendMessage(emoji, user);
  };

  return (
    <div className="live-chat-card">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Chat en Vivo</h3>
          {isLive && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <Users size={14} color="var(--color-live)" />
              <strong>{viewerCount.toLocaleString()}</strong> espectadores
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <Sparkles size={12} color="#F59E0B" /> Modo Lento Activo
        </span>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages-container">
        <div style={{
          padding: '0.65rem 0.85rem',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ShieldAlert size={16} color="var(--accent-purple)" />
          <span>¡Bienvenido al chat! Sé respetuoso y comparte snippets o dudas constructivas.</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="chat-message-row">
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {msg.hora}
            </span>

            {msg.rol === 'mod' && <span className="chat-badge chat-badge-mod">MOD</span>}
            {msg.rol === 'pro' && <span className="chat-badge chat-badge-pro">PRO</span>}
            {msg.rol === 'student' && <span className="chat-badge chat-badge-student">DEV</span>}

            <div style={{ flex: 1 }}>
              <span style={{
                fontWeight: 700,
                color: msg.rol === 'mod' ? '#EF4444' : msg.rol === 'pro' ? 'var(--accent-purple)' : 'var(--text-primary)',
                marginRight: '0.4rem',
                fontSize: '0.85rem'
              }}>
                {msg.usuario}:
              </span>
              <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>
                {msg.mensaje}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reaction Emojis */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        padding: '0.4rem 1rem',
        backgroundColor: 'var(--bg-surface-secondary)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        {['🔥', '⚡', '🚀', '👏', '💻', '💡'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => addQuickReaction(emoji)}
            className="btn-ghost"
            style={{
              padding: '0.2rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem'
            }}
            title={`Enviar reacción ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={user ? "Escribe un mensaje en el chat..." : "Inicia sesión para chatear"}
          className="form-input"
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn btn-primary btn-sm"
          style={{ padding: '0.55rem 0.85rem' }}
          aria-label="Enviar mensaje"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}