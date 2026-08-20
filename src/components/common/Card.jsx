import React from 'react';

export function Card({
  children,
  hoverable = true,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}