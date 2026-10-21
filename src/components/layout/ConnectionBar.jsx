import React from 'react';
import { inputStyle, btnPrimary, connectionErrorStyle } from '../../styles/theme';

/**
 * Connection bar: backend URL + API key inputs with connect button.
 */
export default function ConnectionBar({
  backendUrl,
  setBackendUrl,
  apiKey,
  setApiKey,
  isConnecting,
  connectionError,
  onConnect,
}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: connectionError ? '1px solid #fca5a5' : '1px solid #e2e8f0',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'end',
      }}
    >
      <div style={{ flex: 1, minWidth: '180px' }}>
        <label style={labelStyle}>Backend URL</label>
        <input
          type="text"
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          placeholder="https://your-service.onrender.com"
          aria-label="Backend URL"
          style={inputStyle}
        />
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={labelStyle}>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="my-local-test-key"
          aria-label="Backend API key"
          style={inputStyle}
        />
      </div>
      <button
        onClick={onConnect}
        disabled={!apiKey || !backendUrl || isConnecting}
        style={{ ...btnPrimary, opacity: !apiKey || !backendUrl || isConnecting ? 0.55 : 1 }}
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
      {connectionError && (
        <p style={connectionErrorStyle}>{connectionError}</p>
      )}
      {!connectionError && !backendUrl && (
        <p style={connectionErrorStyle}>
          Production backend URL is not configured. Add <code>VITE_BACKEND_URL</code> in Vercel or enter it here.
        </p>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 500,
  color: '#64748b',
  marginBottom: '2px',
};
