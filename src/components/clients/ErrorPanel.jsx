import React, { useState } from 'react';

/**
 * Expandable error panel grouped by client.
 * Shows contact details when available and also supports service-level upload
 * failures that do not have a contact attached.
 */
export default function ErrorPanel({ clients, getClientErrors, totalErrors }) {
  const [expanded, setExpanded] = useState({});
  const clientsWithErrors = clients
    .map((client) => ({ client, errors: getClientErrors(client.name || client.clientName) }))
    .filter(({ errors }) => errors.length > 0);

  if (clientsWithErrors.length === 0) return null;

  const toggleExpand = (name) =>
    setExpanded((previous) => ({ ...previous, [name]: !previous[name] }));

  return (
    <div style={{ marginTop: '20px' }}>
      <h4
        style={{
          margin: '0 0 10px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#dc2626',
        }}
      >
        ⚠️ Sync and upload errors ({totalErrors})
      </h4>
      {clientsWithErrors.map(({ client, errors }) => {
        const name = client.name || client.clientName || 'Unknown client';
        const isExpanded = expanded[name];

        return (
          <div
            key={name}
            style={{
              marginBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
            }}
          >
            <button
              type="button"
              onClick={() => toggleExpand(name)}
              style={{
                width: '100%',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: 0,
                background: 'transparent',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}>
                {name} — {errors.length} error{errors.length > 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>
            {isExpanded && (
              <div style={{ padding: '0 12px 10px' }}>
                {errors.map((error, index) => (
                  <div
                    key={error.id || index}
                    style={{
                      padding: '8px',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      fontSize: '11px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {error.firstName || error.lastName
                        ? `${error.firstName || ''} ${error.lastName || ''}`.trim()
                        : 'Service-level upload error'}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      {error.email || error.phone || error.message}
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {error.statusCode === 'EXCEPTION'
                        ? 'Exception'
                        : error.statusCode === 'ERROR'
                        ? 'Error'
                        : `HTTP ${error.statusCode}`}
                      {error.retryAttempts > 0 && ` (${error.retryAttempts} retries)`}
                    </span>
                    {error.message && (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        {error.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
