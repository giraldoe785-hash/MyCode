import React from 'react';

export function LiveBadge({ text = 'EN VIVO', className = '' }) {
  return (
    <span className={`live-badge ${className}`} aria-label="Transmisión en vivo">
      <span className="live-dot" />
      {text}
    </span>
  );
}