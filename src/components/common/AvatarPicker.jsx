import React from 'react';
import { PRESET_AVATARS } from '../../services/mockData';
import { Check } from 'lucide-react';

export function AvatarPicker({ selectedAvatar, onSelectAvatar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        Elige tu avatar de la galería:
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        backgroundColor: 'var(--bg-surface-secondary)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {PRESET_AVATARS.map((avatar) => {
          const isSelected = selectedAvatar === avatar.url || selectedAvatar === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelectAvatar(avatar)}
              title={avatar.name}
              style={{
                position: 'relative',
                aspectRatio: '1/1',
                borderRadius: '50%',
                overflow: 'hidden',
                border: isSelected ? '3px solid var(--accent-purple)' : '2px solid transparent',
                boxShadow: isSelected ? '0 0 12px var(--accent-purple-glow)' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
                padding: 0,
                backgroundColor: 'var(--bg-surface)',
                outline: 'none'
              }}
            >
              <img
                src={avatar.url}
                alt={avatar.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {isSelected && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <div style={{
                    backgroundColor: 'var(--accent-purple)',
                    borderRadius: '50%',
                    padding: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}