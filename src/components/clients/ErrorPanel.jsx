import React from 'react';

/**
 * Expandable error panel grouped by client.
 * Shows contact name, email/phone, status code, and retry attempts.
 */
export default function ErrorPanel({ clients, getClientErrors, totalErrors }) {
  const clientsWithErrors = clients.filter(
    (c) => (getClientErrors(c.name)?.length || 0) > 0
  );

  if (clientsWithErrors.length === 0) return null;

  const [expanded, setExpanded] = React.useState({});

  const toggleExpand = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

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
        ⚠️ Sync Errors ({totalErrors})
      </h4>
      {clientsWithErrors.map((client) => {
        const errors = getClientErrors(client.name);
        const isExpanded = expanded[client.name];

        return (
          <div
            key={client.name}
            style={{
              marginBottom: '10px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
            }}
          >
            <div
              onClick={() => toggleExpand(client.name)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{ fontSize: '13px', fontWeight: 600, color: '#991b1b' }}
              >
                {client.name} &mdash; {errors.length} error
                {errors.length > 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>
            {isExpanded && (
              <div style={{ padding: '0 12px 10px' }}>
                {errors.map((err, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 8px',
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
                      {err.firstName} {err.lastName}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      {err.email || err.phone || 'No email/phone'}
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          err.statusCode === 'EXCEPTION' ? '#fee2e2' : '#fef3c7',
                        color:
                          err.statusCode === 'EXCEPTION' ? '#dc2626' : '#d97706',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {err.statusCode === 'EXCEPTION'
                        ? 'Exception'
                        : `HTTP ${err.statusCode}`}
                      {err.retryAttempts > 0 && ` (${err.retryAttempts} retries)`}
                    </span>
                    {err.error && (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        {err.error.substring(0, 150)}
                        {err.error.length > 150 ? '...' : ''}
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
