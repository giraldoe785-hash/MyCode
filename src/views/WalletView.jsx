import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { TokenPackagesSection } from '../components/cart/TokenPackagesSection';
import {
  Wallet,
  Zap,
  TrendingUp,
  TrendingDown,
  Calendar,
  Calculator,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function WalletView() {
  const { user } = useAuth();
  const { balance, transactions, addTokens } = useWallet();
  const { t, isSpanish } = useLanguage();

  // Calculator State
  const [calcCompilations, setCalcCompilations] = useState(10);
  const [calcLessons, setCalcLessons] = useState(2);
  const [calcLivePasses, setCalcLivePasses] = useState(1);

  // Transactions Filter & Pagination
  const [filterType, setFilterType] = useState('all'); // 'all' | 'recarga' | 'consumo'
  const [searchTx, setSearchTx] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalCalculatedCost = (calcCompilations * 2) + (calcLessons * 5) + (calcLivePasses * 15);
  const tokensDeficit = Math.max(0, totalCalculatedCost - balance);

  const filteredTransactions = transactions.filter(tx => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'recarga' && tx.cambio > 0) ||
      (filterType === 'consumo' && tx.cambio < 0);

    const matchesSearch =
      tx.descripcion.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.tipo.toLowerCase().includes(searchTx.toLowerCase());

    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxTokens = user?.plan === 'Oro' ? 350 : user?.plan === 'Plata' ? 150 : 50;

  const formatTxDescription = (desc) => {
    if (!desc) return '';
    if (desc.startsWith('Compilación de ')) {
      const filePart = desc.substring('Compilación de '.length);
      return isSpanish ? desc : `Compilation of ${filePart}`;
    }
    if (desc === 'Bono de bienvenida' || desc === 'Bono de Bienvenida') {
      return isSpanish ? desc : 'Welcome bonus';
    }
    if (desc.startsWith('Recarga mensual')) {
      return isSpanish ? desc : desc.replace('Recarga mensual', 'Monthly recharge');
    }
    return desc;
  };

  const formatTxType = (tipo) => {
    if (!tipo) return '';
    if (tipo.toLowerCase() === 'consumo' || tipo.toLowerCase() === 'consumo sandbox') {
      return isSpanish ? 'Consumo' : 'Usage';
    }
    if (tipo.toLowerCase() === 'recarga') {
      return isSpanish ? 'Recarga' : 'Recharge';
    }
    if (tipo.toLowerCase() === 'bono') {
      return isSpanish ? 'Bono' : 'Bonus';
    }
    return tipo;
  };


  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Header */}
        <div>
          <div className="section-overline">
            {t('wallet.badge')}
          </div>
          <h1 className="heading-lg" style={{ margin: '0.25rem 0' }}>
            {t('wallet.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {t('wallet.subtitle')}
          </p>
        </div>

        {/* 1. Wallet Balance Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), var(--bg-surface))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.balance_card_title')}</span>
              <div style={{ padding: '0.4rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: '50%', color: '#F59E0B' }}>
                <Zap size={20} fill="#F59E0B" />
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
              {balance} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('nav.tokens_suffix')}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              {t('wallet.monthly_limit')} <strong>{maxTokens} {t('nav.tokens_suffix')}</strong>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.recharge_card_title')}</span>
              <Calendar size={20} color="var(--accent-purple)" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {t('wallet.recharge_date')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={16} /> {t('wallet.auto_recharge_included')}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('wallet.plan_card_title')}</span>
                <Sparkles size={20} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {user?.plan || 'Bronce'}
              </div>
            </div>
            <Link to="/pricing" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
              <span>{t('wallet.upgrade_plan_btn')}</span>
            </Link>
          </div>
        </div>

        {/* 2. Token Packages Section (Buy / Add to Cart) */}
        <TokenPackagesSection />

        {/* 3. Interactive Token Consumption Calculator */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Calculator size={22} color="var(--accent-purple)" />
            <h2 className="heading-md" style={{ margin: 0 }}>
              {t('wallet.calc_title')}
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {t('wallet.calc_subtitle')}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Input Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                  <span>{t('wallet.calc_compilations')}</span>
                  <strong>{calcCompilations} runs ({calcCompilations * 2} tk)</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={calcCompilations}
                  onChange={(e) => setCalcCompilations(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                  <span>{t('wallet.calc_lessons')}</span>
                  <strong>{calcLessons} ({calcLessons * 5} tk)</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={calcLessons}
                  onChange={(e) => setCalcLessons(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
                  <span>{t('wallet.calc_live_passes')}</span>
                  <strong>{calcLivePasses} ({calcLivePasses * 15} tk)</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={calcLivePasses}
                  onChange={(e) => setCalcLivePasses(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Results Box */}
            <div style={{
              backgroundColor: 'var(--bg-surface-secondary)',
              padding: '1.75rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('wallet.calc_total_cost')}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F59E0B', margin: '0.25rem 0' }}>
                {totalCalculatedCost} {t('nav.tokens_suffix')}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                {tokensDeficit > 0 ? (
                  <span style={{ color: '#EF4444' }}>
                    {t('wallet.calc_deficit_msg', { count: tokensDeficit, balance })}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-success)' }}>
                    {t('wallet.calc_covered_msg', { balance })}
                  </span>
                )}
              </div>

              {tokensDeficit > 0 ? (
                <Link to="/pricing" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  {t('wallet.upgrade_silver_gold_btn')}
                </Link>
              ) : (
                <button
                  onClick={() => addTokens(10, 'Bono de prueba de recarga')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Plus size={14} /> {t('wallet.simulate_bonus_btn')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Filterable & Paginated Transactions History Table */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="heading-md" style={{ margin: 0 }}>{t('wallet.history_title')}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {t('wallet.history_subtitle')}
              </p>
            </div>

            {/* Filter Buttons & Search */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={t('wallet.search_tx_placeholder')}
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingRight: '0.75rem', fontSize: '0.85rem', width: '180px' }}
                />
              </div>

              <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface-secondary)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
                <button
                  onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                  className={`btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {t('wallet.filter_all')}
                </button>
                <button
                  onClick={() => { setFilterType('recarga'); setCurrentPage(1); }}
                  className={`btn-sm ${filterType === 'recarga' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {t('wallet.filter_recharge')}
                </button>
                <button
                  onClick={() => { setFilterType('consumo'); setCurrentPage(1); }}
                  className={`btn-sm ${filterType === 'consumo' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {t('wallet.filter_consumption')}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('wallet.th_date')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('wallet.th_type')}</th>
                  <th style={{ padding: '0.75rem 1rem' }}>{t('wallet.th_desc')}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('wallet.th_change')}</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{t('wallet.th_balance')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {t('wallet.no_transactions')}
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {tx.fecha}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: tx.cambio > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: tx.cambio > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                        }}>
                          {tx.cambio > 0 ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {formatTxType(tx.tipo)}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {formatTxDescription(tx.descripcion)}
                      </td>
                      <td style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.cambio > 0 ? 'var(--color-success)' : '#F59E0B'
                      }}>
                        {tx.cambio > 0 ? `+${tx.cambio}` : tx.cambio} tk
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {tx.saldoRestante} tk
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('wallet.pagination_info', { current: currentPage, total: totalPages, count: filteredTransactions.length })}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="btn btn-secondary btn-sm"
                  aria-label={t('wallet.prev_page')}
                >
                  <ChevronLeft size={16} /> {t('wallet.prev_page')}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="btn btn-secondary btn-sm"
                  aria-label={t('wallet.next_page')}
                >
                  {t('wallet.next_page')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}