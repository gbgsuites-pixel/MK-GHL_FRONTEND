import React, { useEffect, useState } from 'react';
import { btnPrimary, btnSecondary } from '../../styles/theme';

const initialForm = {
  clientName: '',
  consultantNum: '',
  password: '',
  ghlApiToken: '',
  ghlLocationId: '',
};

const steps = [
  { number: '01', label: 'Client profile' },
  { number: '02', label: 'Connections' },
  { number: '03', label: 'Ready to validate' },
];

export default function AddClientPanel({ onCreate, busy, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, busy]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setLocalError('');
  };

  const close = () => {
    if (busy) return;
    setIsOpen(false);
    setLocalError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setLocalError('');

    const normalized = {
      ...form,
      clientName: form.clientName.trim(),
      consultantNum: form.consultantNum.trim().toUpperCase(),
      ghlLocationId: form.ghlLocationId.trim(),
    };

    if (!normalized.clientName || !normalized.consultantNum || !normalized.password || !normalized.ghlApiToken || !normalized.ghlLocationId) {
      setLocalError('Complete all required fields before continuing.');
      return;
    }

    try {
      await onCreate(normalized);
      setForm(initialForm);
      setShowPassword(false);
      setShowToken(false);
      setIsOpen(false);
    } catch (submissionError) {
      setLocalError(submissionError.message || 'Unable to add client.');
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setLocalError('');
          setIsOpen(true);
        }}
        style={addButtonStyle}
        aria-haspopup="dialog"
      >
        <span style={addButtonIcon} aria-hidden="true">+</span>
        <span>Add client</span>
      </button>
    );
  }

  return (
    <div className="va3379-add-modal-backdrop" role="presentation">
      <section
        className="va3379-add-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-client-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="va3379-add-modal-header">
          <div className="va3379-add-modal-heading">
            <div className="va3379-add-modal-eyebrow">Client onboarding</div>
            <h2 id="add-client-heading">Connect a new client</h2>
            <p>Set up the Mary Kay and GoHighLevel connection in one secure workflow.</p>
          </div>
          <button type="button" onClick={close} disabled={busy} className="va3379-modal-close" aria-label="Close add client dialog">
            ×
          </button>
        </header>

        <div className="va3379-add-progress" aria-label="Onboarding steps">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="va3379-add-step">
                <span className="va3379-add-step-number">{step.number}</span>
                <span>{step.label}</span>
              </div>
              {index < steps.length - 1 && <span className="va3379-add-step-line" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>

        {(localError || error) && (
          <div role="alert" className="va3379-add-alert">
            <span className="va3379-alert-icon" aria-hidden="true">!</span>
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="va3379-add-modal-body">
            <div className="va3379-add-main-column">
              <fieldset className="va3379-form-section">
                <legend>Client profile</legend>
                <p className="va3379-section-copy">Identify the consultant that will be managed by this integration.</p>
                <div className="va3379-field-grid">
                  <Field label="Client name" required hint="Shown throughout the dashboard">
                    <input
                      value={form.clientName}
                      onChange={update('clientName')}
                      className="va3379-add-input"
                      placeholder="Example Client"
                      autoComplete="organization"
                      required
                      autoFocus
                    />
                  </Field>
                  <Field label="Consultant number" required hint="Used to sign in to Mary Kay InTouch">
                    <input
                      value={form.consultantNum}
                      onChange={update('consultantNum')}
                      className="va3379-add-input va3379-uppercase-input"
                      placeholder="Z00000"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      required
                    />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="va3379-form-section">
                <legend>Connection credentials</legend>
                <p className="va3379-section-copy">These credentials are used by the backend only. They are encrypted before being stored.</p>
                <div className="va3379-field-grid">
                  <Field label="Mary Kay password" required hint="Never displayed after submission">
                    <SecretInput
                      value={form.password}
                      onChange={update('password')}
                      visible={showPassword}
                      onToggle={() => setShowPassword((visible) => !visible)}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      ariaLabel="Mary Kay password"
                    />
                  </Field>
                  <Field label="GHL private integration token" required hint="Must have access to the selected location">
                    <SecretInput
                      value={form.ghlApiToken}
                      onChange={update('ghlApiToken')}
                      visible={showToken}
                      onToggle={() => setShowToken((visible) => !visible)}
                      placeholder="pit-…"
                      autoComplete="new-password"
                      ariaLabel="GHL private integration token"
                    />
                  </Field>
                  <div className="va3379-full-field">
                    <Field label="GHL location ID" required hint="The location where contacts and custom fields are managed">
                      <input
                        value={form.ghlLocationId}
                        onChange={update('ghlLocationId')}
                        className="va3379-add-input"
                        placeholder="Enter the GHL location ID"
                        autoComplete="off"
                        spellCheck="false"
                        required
                      />
                    </Field>
                  </div>
                </div>
              </fieldset>

              <div className="va3379-security-strip">
                <div className="va3379-security-icon" aria-hidden="true">✓</div>
                <div>
                  <strong>Safe onboarding</strong>
                  <span>No Mary Kay contacts are fetched or uploaded during this step. The backend only verifies the GHL field connection and stores encrypted credentials.</span>
                </div>
              </div>
            </div>

            <aside className="va3379-add-sidebar" aria-label="What happens next">
              <div className="va3379-sidebar-kicker">What happens next</div>
              <h3>Ready for validation</h3>
              <p className="va3379-sidebar-copy">The client will be created as <strong>Pending validation</strong> until the connection checks pass.</p>

              <div className="va3379-check-list">
                <CheckItem number="1" title="Fetch GHL fields" text="The selected location's contact custom fields are discovered automatically." />
                <CheckItem number="2" title="Encrypt credentials" text="Mary Kay and GHL secrets are encrypted before Supabase storage." />
                <CheckItem number="3" title="Validate access" text="Use Validate on the client row to confirm both systems before syncing." />
              </div>

              <div className="va3379-sidebar-note">
                <span className="va3379-note-dot" aria-hidden="true" />
                <span>Only active, validated clients are included in daily syncs.</span>
              </div>
            </aside>
          </div>

          <footer className="va3379-add-modal-footer">
            <div className="va3379-footer-status">
              <span className="va3379-status-dot" aria-hidden="true" />
              <span>Starts as pending validation</span>
            </div>
            <div className="va3379-footer-actions">
              <button type="button" onClick={close} style={btnSecondary} disabled={busy}>Cancel</button>
              <button type="submit" style={{ ...btnPrimary, ...primaryButtonStyle, opacity: busy ? 0.7 : 1 }} disabled={busy}>
                {busy ? 'Creating connection…' : 'Create client connection'}
              </button>
            </div>
          </footer>
        </form>
      </section>

      <style>{modalStyles}</style>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="va3379-add-field">
      <span className="va3379-add-label">
        <span>{label}</span>
        {required && <span className="va3379-required">Required</span>}
      </span>
      {children}
      {hint && <span className="va3379-add-hint">{hint}</span>}
    </label>
  );
}

function SecretInput({ value, onChange, visible, onToggle, placeholder, autoComplete, ariaLabel }) {
  return (
    <span className="va3379-secret-wrap">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="va3379-add-input va3379-secret-input"
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        required
      />
      <button type="button" className="va3379-secret-toggle" onClick={onToggle} aria-label={visible ? `Hide ${ariaLabel}` : `Show ${ariaLabel}`}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </span>
  );
}

function CheckItem({ number, title, text }) {
  return (
    <div className="va3379-check-item">
      <span className="va3379-check-number">{number}</span>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

const addButtonStyle = {
  ...btnPrimary,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '9px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 650,
  boxShadow: '0 5px 12px rgba(79, 70, 229, 0.18)',
};

const addButtonIcon = {
  width: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: 'rgba(255,255,255,0.2)',
  fontSize: '16px',
  lineHeight: 1,
};

const primaryButtonStyle = {
  minWidth: '190px',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '12px',
};

const modalStyles = `
  .va3379-add-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 23, 42, 0.62);
    backdrop-filter: blur(5px);
  }
  .va3379-add-modal {
    width: min(860px, 100%);
    max-height: min(900px, calc(100vh - 48px));
    overflow: auto;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 18px;
    background: #f8fafc;
    box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
    color: #1e293b;
  }
  .va3379-add-modal-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 24px 28px 20px;
    background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%);
    color: #fff;
  }
  .va3379-add-modal-eyebrow,
  .va3379-sidebar-kicker {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .va3379-add-modal-eyebrow { color: #c7d2fe; }
  .va3379-add-modal-heading h2 { margin: 6px 0 5px; font-size: 22px; letter-spacing: -0.02em; }
  .va3379-add-modal-heading p { margin: 0; max-width: 560px; color: #cbd5e1; font-size: 12px; line-height: 1.55; }
  .va3379-modal-close {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    border: 1px solid rgba(255,255,255,0.24);
    border-radius: 8px;
    background: rgba(255,255,255,0.1);
    color: #fff;
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
  }
  .va3379-modal-close:disabled { cursor: not-allowed; opacity: 0.5; }
  .va3379-add-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 28px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }
  .va3379-add-step { display: inline-flex; align-items: center; gap: 8px; color: #475569; font-size: 11px; font-weight: 650; white-space: nowrap; }
  .va3379-add-step-number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #eef2ff; color: #4338ca; font-size: 10px; font-weight: 750; }
  .va3379-add-step-line { height: 1px; min-width: 24px; flex: 1; background: #cbd5e1; }
  .va3379-add-alert { display: flex; align-items: flex-start; gap: 9px; margin: 16px 28px 0; padding: 11px 12px; border: 1px solid #fecaca; border-radius: 9px; background: #fff1f2; color: #991b1b; font-size: 12px; line-height: 1.45; }
  .va3379-alert-icon { display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; flex: 0 0 auto; border-radius: 50%; background: #dc2626; color: #fff; font-size: 11px; font-weight: 800; }
  .va3379-add-modal-body { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.75fr); gap: 16px; padding: 20px 28px 24px; }
  .va3379-add-main-column { display: grid; gap: 14px; min-width: 0; }
  .va3379-form-section { min-width: 0; margin: 0; padding: 17px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
  .va3379-form-section legend { padding: 0 6px; color: #1e293b; font-size: 13px; font-weight: 750; }
  .va3379-section-copy { margin: -2px 0 14px; color: #64748b; font-size: 11px; line-height: 1.5; }
  .va3379-field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .va3379-full-field { grid-column: 1 / -1; }
  .va3379-add-field { display: block; min-width: 0; }
  .va3379-add-label { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; color: #334155; font-size: 11px; font-weight: 700; }
  .va3379-required { color: #94a3b8; font-size: 9px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  .va3379-add-input { width: 100%; min-height: 40px; box-sizing: border-box; padding: 10px 11px; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; background: #fff; color: #0f172a; font-size: 12px; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
  .va3379-add-input::placeholder { color: #94a3b8; }
  .va3379-add-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14); }
  .va3379-uppercase-input { text-transform: uppercase; letter-spacing: 0.04em; }
  .va3379-add-hint { display: block; margin-top: 5px; color: #94a3b8; font-size: 10px; line-height: 1.35; }
  .va3379-secret-wrap { position: relative; display: block; }
  .va3379-secret-input { padding-right: 58px; }
  .va3379-secret-toggle { position: absolute; top: 5px; right: 5px; min-height: 30px; padding: 0 8px; border: 0; border-radius: 6px; background: #f1f5f9; color: #475569; cursor: pointer; font-size: 10px; font-weight: 700; }
  .va3379-security-strip { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid #bbf7d0; border-radius: 10px; background: #f0fdf4; color: #166534; }
  .va3379-security-icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex: 0 0 auto; border-radius: 50%; background: #16a34a; color: #fff; font-size: 12px; font-weight: 800; }
  .va3379-security-strip strong, .va3379-security-strip span { display: block; }
  .va3379-security-strip strong { margin-bottom: 2px; font-size: 11px; }
  .va3379-security-strip span { font-size: 10px; line-height: 1.45; }
  .va3379-add-sidebar { align-self: start; padding: 18px; border: 1px solid #c7d2fe; border-radius: 12px; background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%); }
  .va3379-sidebar-kicker { color: #6366f1; }
  .va3379-add-sidebar h3 { margin: 5px 0 6px; color: #1e1b4b; font-size: 16px; }
  .va3379-sidebar-copy { margin: 0; color: #475569; font-size: 11px; line-height: 1.55; }
  .va3379-check-list { display: grid; gap: 15px; margin-top: 20px; }
  .va3379-check-item { display: grid; grid-template-columns: 24px 1fr; gap: 9px; }
  .va3379-check-number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 7px; background: #fff; color: #4f46e5; font-size: 11px; font-weight: 750; box-shadow: 0 1px 3px rgba(30, 41, 59, 0.1); }
  .va3379-check-item strong, .va3379-check-item span { display: block; }
  .va3379-check-item strong { margin-bottom: 2px; color: #334155; font-size: 11px; }
  .va3379-check-item span { color: #64748b; font-size: 10px; line-height: 1.45; }
  .va3379-sidebar-note { display: flex; gap: 8px; align-items: flex-start; margin-top: 20px; padding-top: 14px; border-top: 1px solid #c7d2fe; color: #475569; font-size: 10px; line-height: 1.45; }
  .va3379-note-dot, .va3379-status-dot { display: inline-block; width: 7px; height: 7px; flex: 0 0 auto; margin-top: 3px; border-radius: 50%; background: #16a34a; }
  .va3379-add-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 28px; border-top: 1px solid #e2e8f0; background: #fff; }
  .va3379-footer-status { display: inline-flex; align-items: center; gap: 7px; color: #64748b; font-size: 10px; }
  .va3379-footer-actions { display: flex; align-items: center; gap: 8px; }
  .va3379-add-modal button:focus-visible, .va3379-add-modal input:focus-visible { outline: 3px solid rgba(99, 102, 241, 0.35); outline-offset: 2px; }
  @media (max-width: 720px) {
    .va3379-add-modal-backdrop { align-items: flex-start; padding: 10px; }
    .va3379-add-modal { max-height: calc(100vh - 20px); border-radius: 14px; }
    .va3379-add-modal-header, .va3379-add-progress, .va3379-add-modal-body, .va3379-add-modal-footer { padding-left: 17px; padding-right: 17px; }
    .va3379-add-modal-heading h2 { font-size: 19px; }
    .va3379-add-progress { gap: 5px; overflow-x: auto; }
    .va3379-add-step { font-size: 10px; }
    .va3379-add-step-line { min-width: 12px; }
    .va3379-add-modal-body { grid-template-columns: 1fr; }
    .va3379-field-grid { grid-template-columns: 1fr; }
    .va3379-full-field { grid-column: auto; }
    .va3379-add-modal-footer { align-items: stretch; flex-direction: column; }
    .va3379-footer-actions { justify-content: flex-end; }
  }
`;
