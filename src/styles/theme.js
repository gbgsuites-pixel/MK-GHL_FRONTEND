/**
 * Shared inline style objects and CSS utilities.
 * All visual styling constants live here for consistency.
 */

// ── Input ──
export const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: 'white',
};

// ── Buttons ──
export const btnPrimary = {
  padding: '7px 14px',
  borderRadius: '6px',
  backgroundColor: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
  height: '34px',
};

export const btnSecondary = {
  padding: '6px 12px',
  borderRadius: '6px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  fontSize: '11px',
};

export const btnAction = {
  padding: '6px 12px',
  borderRadius: '6px',
  backgroundColor: '#4f46e5',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 600,
};

export const btnSuccess = {
  padding: '8px 16px',
  borderRadius: '8px',
  backgroundColor: '#16a34a',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600,
};

export const btnTab = (isActive) => ({
  padding: '12px 18px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  color: isActive ? '#4f46e5' : '#64748b',
  borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
  fontSize: '13px',
  fontWeight: isActive ? 600 : 400,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.15s ease',
});

// ── Cards ──
export const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #e2e8f0',
  marginBottom: '16px',
};

export const cardStyleNoMargin = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid #e2e8f0',
};

// ── Page ──
export const pageStyle = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  color: '#1e293b',
};

export const headerStyle = {
  background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  color: 'white',
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
};

export const navStyle = {
  backgroundColor: 'white',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  padding: '0 24px',
  gap: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

export const contentStyle = {
  maxWidth: '1600px',
  margin: '0 auto',
  padding: '20px 24px',
};

// ── Label ──
export const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 500,
  color: '#64748b',
  marginBottom: '2px',
};

// ── Empty State ──
export const emptyStateStyle = {
  color: '#94a3b8',
  fontSize: '13px',
  textAlign: 'center',
  padding: '32px 0',
};

// ── Error box ──
export const errorBoxStyle = {
  marginTop: '8px',
  padding: '8px 10px',
  borderRadius: '6px',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  fontSize: '11px',
  fontFamily: 'monospace',
};

// ── Connection error ──
export const connectionErrorStyle = {
  color: '#dc2626',
  fontSize: '11px',
  margin: 0,
};

// ── Global CSS keyframes ──
export const globalStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #1e293b; }
  ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #64748b; }
  button:hover:not(:disabled) { filter: brightness(0.95); }
  button:active:not(:disabled) { transform: scale(0.98); }
`;
