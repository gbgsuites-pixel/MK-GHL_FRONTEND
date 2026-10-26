import React, { useState } from 'react';
import { cardStyle, inputStyle, btnPrimary, btnSecondary, labelStyle } from '../../styles/theme';

const initialForm = {
  clientName: '',
  consultantNum: '',
  password: '',
  ghlApiToken: '',
  ghlLocationId: '',
};

export default function AddClientPanel({ onCreate, busy, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState('');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setLocalError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError('');
    try {
      await onCreate(form);
      setForm(initialForm);
      setIsOpen(false);
    } catch (submissionError) {
      setLocalError(submissionError.message || 'Unable to add client.');
    }
  };

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} style={btnPrimary}>
        + Add new client
      </button>
    );
  }

  return (
    <section style={{ ...cardStyle, marginBottom: '16px', backgroundColor: '#f8fafc' }} aria-labelledby="add-client-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Managed onboarding</div>
          <h3 id="add-client-heading" style={{ margin: '4px 0 3px', fontSize: '16px', color: '#1e293b' }}>Add a new client</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>
            GHL custom fields are fetched from the supplied location and stored encrypted in Supabase during creation.
          </p>
        </div>
        <button type="button" onClick={() => setIsOpen(false)} style={btnSecondary}>Cancel</button>
      </div>

      {(localError || error) && (
        <div role="alert" style={{ marginTop: '12px', padding: '9px 10px', borderRadius: '7px', color: '#991b1b', backgroundColor: '#fef2f2', border: '1px solid #fecaca', fontSize: '11px' }}>
          {localError || error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '14px' }}>
        <Field label="Client name" required>
          <input value={form.clientName} onChange={update('clientName')} style={inputStyle} placeholder="Example Client" required autoComplete="organization" />
        </Field>
        <Field label="Consultant number" required>
          <input value={form.consultantNum} onChange={update('consultantNum')} style={inputStyle} placeholder="Z00000" required autoCapitalize="characters" />
        </Field>
        <Field label="Mary Kay password" required>
          <input type="password" value={form.password} onChange={update('password')} style={inputStyle} placeholder="Enter securely" required autoComplete="new-password" />
        </Field>
        <Field label="GHL private integration token" required>
          <input type="password" value={form.ghlApiToken} onChange={update('ghlApiToken')} style={inputStyle} placeholder="pit-…" required autoComplete="new-password" />
        </Field>
        <Field label="GHL location ID" required>
          <input value={form.ghlLocationId} onChange={update('ghlLocationId')} style={inputStyle} placeholder="Location ID" required />
        </Field>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '10px', marginRight: 'auto' }}>The client starts pending validation after the GHL field lookup succeeds.</span>
          <button type="button" onClick={() => setIsOpen(false)} style={btnSecondary} disabled={busy}>Cancel</button>
          <button type="submit" style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }} disabled={busy}>
            {busy ? 'Adding and fetching fields…' : 'Add client'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={labelStyle}>{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}
