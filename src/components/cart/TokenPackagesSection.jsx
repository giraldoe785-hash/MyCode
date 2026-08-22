import React from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Coins,
  Package,
  Truck,
  Mountain,
  Zap,
  ShoppingCart,
  Check,
  Sparkles,
  Flame
} from 'lucide-react';

export function TokenPackagesSection({ title, subtitle, showHeader = true }) {
  const { packages, addToCart, cartItems, openCart } = useCart();
  const { t, isSpanish } = useLanguage();

  const getPackageIcon = (iconName) => {
    switch (iconName) {
      case 'Coins':
        return <Coins size={28} color="var(--accent-gold)" />;
      case 'Package':
        return <Package size={28} color="var(--accent-cyan)" />;
      case 'Truck':
        return <Truck size={28} color="var(--accent-purple)" />;
      case 'Mountain':
        return <Mountain size={28} color="var(--accent-gold)" />;
      default:
        return <Coins size={28} color="var(--accent-gold)" />;
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString(isSpanish ? 'es-ES' : 'en-US');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {showHeader && (
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-gold-soft)',
              color: 'var(--accent-gold-text)',
              border: '1px solid var(--accent-gold-border)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem'
            }}
          >
            <Sparkles size={14} color="var(--accent-gold)" />
            <span>{t('tokens.badge')}</span>
          </div>

          <h2 className="heading-lg" style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
            {title || t('tokens.title')}
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
            {subtitle || t('tokens.subtitle')}
          </p>
        </div>
      )}

      {/* 4 Packages Responsive Grid */}
      <div className="grid-4">
        {packages.map((pkg) => {
          const inCartItem = cartItems.find((item) => item.packageId === pkg.id);
          const inCartCount = inCartItem ? inCartItem.quantity : 0;

          return (
            <div
              key={pkg.id}
              className={`card ${pkg.popular ? 'plan-card-gold card-gold-accent' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                padding: '1.5rem',
                border: pkg.popular
                  ? '2px solid var(--accent-gold)'
                  : '1px solid var(--border-subtle)',
                boxShadow: pkg.popular ? '0 8px 30px var(--accent-gold-glow)' : 'var(--shadow-md)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              {/* Popular / Best Value Badge */}
              {pkg.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 10px rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Sparkles size={12} fill="#FFF" />
                  <span>{t('tokens.popular_badge')}</span>
                </div>
              )}

              <div>
                {/* Header with Icon and Discount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getPackageIcon(pkg.iconName)}
                  </div>

                  {pkg.discount ? (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--color-success)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {t('tokens.discount_prefix', { discount: pkg.discount })}
                    </span>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: 'var(--bg-surface-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.7rem'
                      }}
                    >
                      Starter
                    </span>
                  )}
                </div>

                {/* Package Name */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
                  {t(pkg.nameKey)}
                </h3>

                {/* Token Amount Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-gold-text)' }}>
                    {formatNumber(pkg.tokenAmount)}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {t('nav.tokens_suffix')}
                  </span>
                </div>

                {/* Price Display */}
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  ${pkg.price.toFixed(2)}{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {pkg.currency}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 1.5rem' }}>
                  {t(pkg.descriptionKey)}
                </p>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => addToCart(pkg.id, 1)}
                  className={`btn ${pkg.popular ? 'btn-gold' : 'btn-secondary'} btn-sm`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1rem'
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>
                    {inCartCount > 0
                      ? t('tokens.in_cart', { count: inCartCount })
                      : t('tokens.add_to_cart')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
