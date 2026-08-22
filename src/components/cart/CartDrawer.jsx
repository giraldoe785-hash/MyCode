import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Zap,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coins,
  Package,
  Truck,
  Mountain,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    totalItemCount,
    totalTokens,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    closeCart,
    isCheckoutModalOpen,
    openCheckout,
    closeCheckout
  } = useCart();

  const { t, isSpanish } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const handleBrowsePackages = () => {
    closeCart();
    // Navigate to real token economy page (/wallet if logged in, or /pricing if not)
    navigate(isAuthenticated ? '/wallet' : '/pricing');
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const getPackageIcon = (iconName) => {
    switch (iconName) {
      case 'Coins':
        return <Coins size={22} color="var(--accent-gold)" />;
      case 'Package':
        return <Package size={22} color="var(--accent-cyan)" />;
      case 'Truck':
        return <Truck size={22} color="var(--accent-purple)" />;
      case 'Mountain':
        return <Mountain size={22} color="var(--accent-gold)" />;
      default:
        return <Coins size={22} color="var(--accent-gold)" />;
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString(isSpanish ? 'es-ES' : 'en-US');
  };

  return (
    <>
      {/* Slide-over Backdrop & Drawer */}
      {isCartOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={closeCart}
          aria-modal="true"
          role="dialog"
          aria-label={t('cart.title')}
        >
          <div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.25s ease-out',
              overflow: 'hidden'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    padding: '0.45rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-gold-soft)',
                    border: '1px solid var(--accent-gold-border)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {t('cart.title')}
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {totalItemCount === 1
                      ? t('cart.items_count', { count: totalItemCount })
                      : t('cart.items_count_plural', { count: totalItemCount })}
                  </span>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="btn-ghost"
                style={{
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {items.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    gap: '1rem',
                    margin: 'auto 0'
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold-soft)',
                      border: '1.5px dashed var(--accent-gold-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)'
                    }}
                  >
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>
                      {t('cart.empty_title')}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '280px' }}>
                      {t('cart.empty_message')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBrowsePackages}
                    className="btn btn-gold btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    {t('cart.browse_packages')}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.packageId}
                    className="card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-surface-secondary)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {getPackageIcon(item.iconName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {t(item.nameKey)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                            <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                              <Zap size={10} fill="currentColor" /> {formatNumber(item.tokenAmount)} {t('nav.tokens_suffix')}
                            </span>
                            {item.discount && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                                {t('tokens.discount_prefix', { discount: item.discount })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.packageId)}
                        className="btn-ghost"
                        style={{
                          padding: '0.35rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-muted)',
                          transition: 'color var(--transition-fast)'
                        }}
                        title={t('cart.remove')}
                        aria-label={t('cart.remove')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quantity Selector & Item Subtotal */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--bg-surface-secondary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.15rem'
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.packageId, item.quantity - 1)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          style={{
                            minWidth: '28px',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.packageId, item.quantity + 1)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Item Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold-text)' }}>
                          ${item.itemSubtotal.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>USD</span>
                        </div>
                        {item.quantity > 1 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ${item.price.toFixed(2)} {t('cart.unit_price')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer / Summary */}
            {items.length > 0 && (
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Summary Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>{t('cart.total_tokens')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold-text)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Zap size={14} fill="currentColor" /> +{formatNumber(totalTokens)} {t('nav.tokens_suffix')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    <span>{t('cart.total')}</span>
                    <span style={{ color: 'var(--accent-gold-text)' }}>
                      ${subtotal.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={clearCart}
                    className="btn btn-ghost btn-sm"
                    style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.8rem' }}
                  >
                    {t('cart.clear_cart')}
                  </button>
                  <button
                    onClick={openCheckout}
                    className="btn btn-gold"
                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <span>{t('cart.checkout_btn')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Prototype Checkout Modal */}
      {isCheckoutModalOpen && (
        <Modal
          isOpen={isCheckoutModalOpen}
          onClose={closeCheckout}
          title={t('cart.checkout_modal_title')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-gold-soft)',
                border: '1px solid var(--accent-gold-border)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle size={22} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {t('cart.checkout_mock_notice')}
              </div>
            </div>

            {/* Order Preview */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('cart.order_summary_title')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>{t('cart.packages_selected')}</span>
                <span style={{ fontWeight: 600 }}>{totalItemCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>{t('cart.total_tokens')}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold-text)' }}>
                  +{formatNumber(totalTokens)} {t('nav.tokens_suffix')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span>{t('cart.total_to_pay')}</span>
                <span style={{ color: 'var(--accent-gold-text)' }}>${subtotal.toFixed(2)} USD</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={closeCheckout}
                className="btn btn-primary"
                style={{ minWidth: '120px' }}
              >
                {t('cart.checkout_mock_btn')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Keyframe animations for slide-over drawer */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
