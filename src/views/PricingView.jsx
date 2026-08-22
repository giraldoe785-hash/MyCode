import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from '../components/common/Modal';
import {
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Radio,
  Code2,
  Download,
  Users
} from 'lucide-react';
import { PLANS_DATA } from '../services/mockData';
import { TokenPackagesSection } from '../components/cart/TokenPackagesSection';

export function PricingView() {
  const { user } = useAuth();
  const { upgradePlan } = useWallet();
  const { t, isSpanish } = useLanguage();

  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    setIsUpgrading(true);
    await upgradePlan(selectedPlanForUpgrade.id, isAnnual);
    setIsUpgrading(false);
    setSelectedPlanForUpgrade(null);
  };

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Header & Billing Cycle Switch */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--accent-purple)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={15} /> {t('pricing.badge')}
          </div>

          <h1 className="heading-xl" style={{ margin: '0.25rem 0 1rem' }}>
            {t('pricing.title_1')}{' '}
            <span className="text-gradient">{t('pricing.title_gradient')}</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {t('pricing.subtitle')}
          </p>

          {/* Billing Switch */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-secondary)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setIsAnnual(false)}
              className={`btn-sm ${!isAnnual ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
            >
              {t('pricing.billing_monthly')}
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`btn-sm ${isAnnual ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 'var(--radius-full)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>{t('pricing.billing_annual')}</span>
              <span style={{
                backgroundColor: 'var(--color-success)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px'
              }}>
                {t('pricing.discount_badge')}
              </span>
            </button>
          </div>
        </div>

        {/* 3-Tier Pricing Cards with Distinct Futuristic Metallic Identities */}
        <div className="grid-3">
          {PLANS_DATA.map((plan) => {
            const isCurrent = user?.plan?.toLowerCase() === plan.nombre.toLowerCase();
            const price = isAnnual
              ? (plan.precioAnual > 0 ? (plan.precioAnual / 12).toFixed(2) : 0)
              : plan.precioMensual.toFixed(2);

            const cardClass = plan.themeClass || (
              plan.id === 'bronce' ? 'plan-card-bronze' :
              plan.id === 'plata' ? 'plan-card-silver' : 'plan-card-gold'
            );

            const featuresList = isSpanish ? plan.caracteristicas : (plan.caracteristicasEn || plan.caracteristicas);
            const planDesc = isSpanish ? plan.descripcion : (plan.descripcionEn || plan.descripcion);

            return (
              <div
                key={plan.id}
                className={`card ${cardClass}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2.25rem',
                  position: 'relative'
                }}
              >
                {plan.destacado && (
                  <span style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '1.5rem',
                    backgroundColor: 'var(--accent-purple)',
                    color: '#FFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 4px 12px var(--accent-purple-glow)'
                  }}>
                    {t('pricing.popular_badge')}
                  </span>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: plan.colorAccent
                    }}>
                      {plan.nombre}
                    </h3>
                    <span className="token-pill" style={{ fontSize: '0.8rem' }}>
                      <Zap size={14} fill="#F59E0B" /> {plan.tokensMensuales} tk/mes
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1 }}>
                      ${price}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('pricing.per_month')} USD</span>
                  </div>

                  {isAnnual && plan.precioAnual > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginBottom: '1rem', fontWeight: 600 }}>
                      {t('pricing.billed_annually', { price: plan.precioAnual })}
                    </div>
                  )}

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    {planDesc}
                  </p>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.85rem', letterSpacing: '0.05em' }}>
                      {t('pricing.included_label')}
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {featuresList.map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <button disabled className="btn btn-secondary" style={{ width: '100%', opacity: 0.8 }}>
                      {t('pricing.current_plan_btn')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlanForUpgrade(plan)}
                      className={`btn ${plan.destacado ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ width: '100%' }}
                    >
                      <span>{t('pricing.choose_plan_btn', { name: plan.nombre })}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="card" style={{ padding: '2rem', overflowX: 'auto' }}>
          <h2 className="heading-md" style={{ marginBottom: '1.5rem' }}>{t('pricing.matrix_title')}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t('pricing.th_feature')}</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--bronze-primary)' }}>Bronce ($9.99)</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--silver-primary)' }}>Plata ($19.99)</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--gold-primary)' }}>Oro ($39.99)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{t('pricing.feat_tokens')}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>50 tokens</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700 }}>150 tokens</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#F59E0B' }}>350 tokens</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{t('pricing.feat_compilations')}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{t('pricing.val_2_tk')}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{t('pricing.val_2_tk')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 700 }}>{t('pricing.val_unlimited_0')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{t('pricing.feat_lives')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('pricing.val_open_only')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)' }}>{t('pricing.val_all_included')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)' }}>{t('pricing.val_all_review')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{t('pricing.feat_vod')}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{t('pricing.val_by_tokens')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)' }}>{t('pricing.val_unlimited_access')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)' }}>{t('pricing.val_unlimited_access')}</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{t('pricing.feat_offline')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('pricing.val_no')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('pricing.val_no')}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-success)', fontWeight: 700 }}>{t('pricing.val_yes_simulated')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      {selectedPlanForUpgrade && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlanForUpgrade(null)}
          title={t('pricing.modal_title', { name: selectedPlanForUpgrade.nombre })}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {t('pricing.modal_desc', { name: selectedPlanForUpgrade.nombre, tokens: selectedPlanForUpgrade.tokensMensuales })}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('pricing.modal_amount_label')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                  ${isAnnual ? selectedPlanForUpgrade.precioAnual : selectedPlanForUpgrade.precioMensual} USD
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}> ({isAnnual ? t('pricing.billing_annual') : t('pricing.billing_monthly')})</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('pricing.modal_tokens_label')}</div>
                <div style={{ fontWeight: 800, color: '#F59E0B', fontSize: '1.2rem' }}>
                  +{selectedPlanForUpgrade.tokensMensuales} tk
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPlanForUpgrade(null)} className="btn btn-secondary">
                {t('pricing.modal_cancel')}
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={isUpgrading}
                className="btn btn-primary"
              >
                {isUpgrading ? t('pricing.modal_processing') : t('pricing.modal_confirm', { name: selectedPlanForUpgrade.nombre })}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}