// src/wizard.jsx — 6-step setup wizard
// Steps:
//  0 confirm_subscription   1 prepare_account     2 institution_selection
//  3 institution_connection 4 connection_validation 5 mcp_setup

const WIZARD_STEPS = [
  { id: 'confirm_subscription',     title: 'Confirm subscription',  short: 'Subscription' },
  { id: 'prepare_account',          title: 'Prepare your account',  short: 'Account' },
  { id: 'institution_selection',    title: 'Select your bank',      short: 'Bank' },
  { id: 'institution_connection',   title: 'Connect securely',      short: 'Connect' },
  { id: 'connection_validation',    title: 'Validate connection',   short: 'Validate' },
  { id: 'mcp_setup',                title: 'Configure MCP client',  short: 'MCP setup' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Wizard shell
// ─────────────────────────────────────────────────────────────────────────────
function Wizard({ country, setCountry, step, setStep, onComplete }) {
  // Per-step transient state lives in refs so jumping doesn't reset everything.
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [provisionState, setProvisionState] = React.useState('idle'); // idle | provisioning | provisioned | failed
  const [selectedBankId, setSelectedBankId] = React.useState(null);
  const [bankSearch, setBankSearch] = React.useState('');
  const [providerOpen, setProviderOpen] = React.useState(false);
  const [providerStep, setProviderStep] = React.useState('login'); // login | mfa | success
  const [validationState, setValidationState] = React.useState('idle'); // idle | checking | ok | pending
  const [testState, setTestState] = React.useState('idle'); // idle | testing | ok | failed
  const [completed, setCompleted] = React.useState(false);

  const inst = window.MOCK_DATA.institutions[country] || [];
  const selectedBank = inst.find(b => b.id === selectedBankId);

  // Auto-trigger provisioning when step 1 becomes active
  React.useEffect(() => {
    if (step === 1 && provisionState === 'idle') {
      setProvisionState('provisioning');
      const t = setTimeout(() => setProvisionState('provisioned'), 1800);
      return () => clearTimeout(t);
    }
  }, [step]);

  // Auto-validate when step 4 becomes active
  React.useEffect(() => {
    if (step === 4 && validationState === 'idle') {
      setValidationState('checking');
      const t = setTimeout(() => setValidationState('ok'), 1600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => setStep(Math.min(step + 1, WIZARD_STEPS.length - 1));
  const goBack = () => setStep(Math.max(step - 1, 0));

  // Step jumper exposes ALL steps directly; clicking jumps and resets that step's locals.
  const jumpTo = (i) => {
    if (i === 1) setProvisionState('idle');
    if (i === 4) setValidationState('idle');
    setStep(i);
  };

  const stepProps = {
    country, setCountry, acceptedTerms, setAcceptedTerms,
    provisionState, setProvisionState,
    selectedBankId, setSelectedBankId, bankSearch, setBankSearch,
    inst, selectedBank,
    providerOpen, setProviderOpen, providerStep, setProviderStep,
    validationState, setValidationState,
    testState, setTestState,
    completed, setCompleted,
    goNext, goBack, step,
    onFinishLater: () => alert('Saved for later (mock).'),
    onComplete,
  };

  return (
    <div style={{ display: 'flex', minHeight: 700 }}>
      {/* Left rail */}
      <aside style={{
        width: 280, padding: '28px 20px', borderRight: '1px solid var(--border)',
        background: 'var(--surface-2)', flexShrink: 0,
      }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 6 }}>Setup</div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>FinanceMCP</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Secure read-only bank data for AI clients
          </div>
        </div>

        <div className="step-rail">
          {WIZARD_STEPS.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'todo';
            return (
              <div key={s.id} className={`step ${state}`} onClick={() => jumpTo(i)}>
                <div className="step-num">
                  {state === 'done' ? <I.Check size={12} strokeWidth={2.4}/> : (i + 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.3 }}>{s.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 28 }}>
          <div style={{
            padding: 12, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                          color: 'var(--text)', fontWeight: 500, marginBottom: 4, fontSize: 12 }}>
              <I.Shield size={13}/> Read-only by design
            </div>
            FinanceMCP never moves money, makes payments, or modifies bank accounts.
          </div>
        </div>
      </aside>

      {/* Right pane */}
      <main style={{ flex: 1, padding: '32px 56px', position: 'relative', overflow: 'auto' }}>
        {/* Top utility row: country + actions */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Step {step + 1} of {WIZARD_STEPS.length}</span>
            <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
            <span className="mono">{WIZARD_STEPS[step].id}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <CountryToggle country={country} setCountry={setCountry} />
            <Button variant="ghost" size="sm" onClick={stepProps.onFinishLater}>Finish later</Button>
          </div>
        </div>

        <div key={step} className="fade-up">
          {step === 0 && <StepSubscription {...stepProps} />}
          {step === 1 && <StepProvision {...stepProps} />}
          {step === 2 && <StepInstitution {...stepProps} />}
          {step === 3 && <StepConnect {...stepProps} />}
          {step === 4 && <StepValidate {...stepProps} />}
          {step === 5 && <StepMcpSetup {...stepProps} />}
        </div>

        {/* Provider widget modal */}
        {providerOpen && (
          <ProviderWidget
            bank={selectedBank}
            providerStep={providerStep}
            setProviderStep={setProviderStep}
            onClose={() => setProviderOpen(false)}
            onDone={() => {
              setProviderOpen(false);
              setProviderStep('login');
              setStep(4);
            }}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CountryToggle({ country, setCountry }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--surface-2)',
      border: '1px solid var(--border)', borderRadius: 8, padding: 2,
    }}>
      {['BR', 'US'].map(c => (
        <button key={c} onClick={() => setCountry(c)}
          style={{
            padding: '4px 10px', fontSize: 12, fontWeight: 500,
            border: 0, borderRadius: 6, cursor: 'pointer',
            background: country === c ? 'var(--surface)' : 'transparent',
            color: country === c ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: country === c ? 'var(--shadow-sm)' : 'none',
          }}>
          {c === 'BR' ? '🇧🇷 Brazil' : '🇺🇸 United States'}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — Subscription
// ─────────────────────────────────────────────────────────────────────────────
function StepSubscription({ acceptedTerms, setAcceptedTerms, goNext }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <Pill variant="success" dot>Subscription active</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Subscription confirmed</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
        Your <strong style={{ color: 'var(--text)' }}>FinanceMCP — Standard</strong> plan is active.
        Before connecting your first bank, please review what this product does and doesn't do.
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 8 }}>
          <DoCol kind="do" title="What FinanceMCP does" items={[
            'Connects read-only to your bank via an aggregator',
            'Exposes accounts, balances, transactions via MCP',
            'Lets AI clients query your data with scoped consent',
            'Logs every tool call for audit',
          ]} />
          <DoCol kind="dont" title="What it never does" items={[
            'Moves money, makes payments, or transfers funds',
            'Changes or closes bank accounts',
            'Sees your banking credentials — auth happens at the provider',
            'Shares data without an explicit, revocable scope grant',
          ]} />
        </div>
      </div>

      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
        border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)',
        cursor: 'pointer', marginBottom: 24,
      }}>
        <input type="checkbox" checked={acceptedTerms}
               onChange={e => setAcceptedTerms(e.target.checked)}
               style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          I have read the <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Read-only Disclosure (v2.4)</a> and
          the <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Data Handling Terms</a>.
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            <span className="mono">legalDocumentVersionId · ld_v2.4_2026-03-12</span>
          </div>
        </div>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button variant="primary" disabled={!acceptedTerms} onClick={goNext}
                iconRight={<I.ArrowRight size={14} />}>
          Accept &amp; continue
        </Button>
      </div>
    </div>
  );
}

function DoCol({ kind, title, items }) {
  const ok = kind === 'do';
  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '.06em', marginBottom: 10,
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, lineHeight: 1.45 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
              background: ok ? 'var(--accent-soft)' : 'var(--danger-soft)',
              color: ok ? 'var(--accent-soft-fg)' : 'var(--danger)',
            }}>
              {ok ? <I.Check size={11} strokeWidth={2.6}/> : <I.X size={11} strokeWidth={2.6}/>}
            </div>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Provisioning
// ─────────────────────────────────────────────────────────────────────────────
function StepProvision({ provisionState, setProvisionState, goNext, goBack }) {
  const labels = {
    provisioning: 'Preparing your account…',
    provisioned:  'Account prepared',
    failed:       'Provisioning failed',
  };
  return (
    <div style={{ maxWidth: 640 }}>
      <Pill variant={provisionState === 'provisioned' ? 'success' : 'info'} dot>
        {provisionState === 'provisioned' ? 'Provisioned' : 'Setting up'}
      </Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Prepare your account</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
        We're creating your local FinanceMCP record. No bank connection is made at this step —
        the MCP runtime is only touched once you connect an institution.
      </p>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <ProvisionTask label="Creating tenant record"   state={provisionState !== 'idle' ? (provisionState === 'provisioning' ? 'running' : 'done') : 'todo'} />
        <ProvisionTask label="Granting baseline scopes"  state={provisionState === 'provisioned' ? 'done' : provisionState === 'provisioning' ? 'running' : 'todo'} delay={500} />
        <ProvisionTask label="Allocating API quota"     state={provisionState === 'provisioned' ? 'done' : provisionState === 'provisioning' ? 'pending' : 'todo'} delay={1000} />
        <ProvisionTask label="Wiring audit pipeline"    state={provisionState === 'provisioned' ? 'done' : 'todo'} delay={1500} last />
      </div>

      <div style={{
        padding: 12, background: 'var(--surface-2)', borderRadius: 10,
        fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
        display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24,
      }}>
        <I.Info size={14} style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <span className="mono">POST /api/apps/mcp-finance/provision</span> · No customer is registered
          with the MCP runtime until you connect your first institution.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <Button variant="primary" disabled={provisionState !== 'provisioned'} onClick={goNext}
                iconRight={<I.ArrowRight size={14}/>}>
          {provisionState === 'provisioned' ? 'Continue' : 'Preparing…'}
        </Button>
      </div>
    </div>
  );
}

function ProvisionTask({ label, state, last }) {
  const icon = {
    done: <div style={{
      width: 18, height: 18, borderRadius: 50, background: 'var(--accent)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><I.Check size={11} strokeWidth={2.8}/></div>,
    running: <div className="spinner" style={{ color: 'var(--accent)' }} />,
    pending: <div style={{ width: 14, height: 14, borderRadius: 50,
      border: '1.5px dashed var(--border-strong)' }} />,
    todo: <div style={{ width: 14, height: 14, borderRadius: 50, border: '1.5px solid var(--border)' }} />,
  }[state];
  const textColor = state === 'done' ? 'var(--text)'
                  : state === 'running' ? 'var(--text)'
                  : 'var(--text-dim)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: last ? 'none' : '1px dashed var(--border)',
    }}>
      <div style={{ width: 20, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13.5, color: textColor }}>{label}</div>
      {state === 'done' && <div style={{ fontSize: 11, color: 'var(--text-dim)' }} className="mono">ok</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Institution selection
// ─────────────────────────────────────────────────────────────────────────────
function StepInstitution({ country, inst, selectedBankId, setSelectedBankId,
                           bankSearch, setBankSearch, goNext, goBack }) {
  const filtered = inst.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  return (
    <div style={{ maxWidth: 760 }}>
      <Pill variant="info" dot>{country} · {inst.length} institutions</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Select your bank</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 22 }}>
        Pick the institution you want to connect first. You can add more after onboarding.
      </p>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <I.Search size={15} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-dim)',
        }}/>
        <input className="input" placeholder={`Search ${country === 'BR' ? 'Brazilian' : 'US'} banks…`}
               style={{ paddingLeft: 36 }}
               value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
        {filtered.map(b => (
          <button key={b.id} onClick={() => setSelectedBankId(b.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
            background: selectedBankId === b.id ? 'var(--accent-soft)' : 'var(--surface)',
            border: '1px solid ' + (selectedBankId === b.id ? 'var(--accent)' : 'var(--border)'),
            borderRadius: 10, cursor: 'pointer', textAlign: 'left',
            transition: 'all .12s',
          }}>
            <BankLogo bank={b} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                via {b.provider}
              </div>
            </div>
            {selectedBankId === b.id && <I.Check size={16} style={{ color: 'var(--accent)' }} strokeWidth={2.4}/>}
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: 'span 2', padding: 32, textAlign: 'center',
            color: 'var(--text-muted)', fontSize: 13,
            border: '1px dashed var(--border-strong)', borderRadius: 10,
          }}>
            No institutions match “{bankSearch}”.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <Button variant="primary" disabled={!selectedBankId} onClick={goNext}
                iconRight={<I.ArrowRight size={14}/>}>
          Continue with {inst.find(b=>b.id===selectedBankId)?.name || 'bank'}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Connect securely
// ─────────────────────────────────────────────────────────────────────────────
function StepConnect({ country, selectedBank, setProviderOpen, setProviderStep,
                       goNext, goBack }) {
  if (!selectedBank) {
    // Recovery banner — institution missing
    return (
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ marginBottom: 10 }}>Connect securely</h1>
        <div className="card" style={{ padding: 18, display: 'flex', gap: 14,
          alignItems: 'flex-start', borderColor: 'var(--warning-soft)',
          background: 'var(--warning-soft)' }}>
          <I.AlertTriangle size={18} style={{ color: 'oklch(0.5 0.14 75)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              No institution selected
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              We need an institutionId before opening the provider session. Let's go back and pick one.
            </span>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button variant="primary" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>
            Pick an institution
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Pill variant="info" dot>{country} · {selectedBank.provider}</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Connect securely with your institution</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 24 }}>
        Authentication happens directly with <strong style={{ color: 'var(--text)' }}>{selectedBank.provider}</strong>.
        FinanceMCP never sees your banking credentials.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 18 }}>
        <BankLogo bank={selectedBank} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 500 }}>{selectedBank.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>
            <span className="mono">institutionId · {selectedBank.id}</span>
          </div>
        </div>
        <Pill><I.Lock size={11}/> End-to-end</Pill>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        <SecPoint icon={<I.Shield size={14}/>} title="Credentials never touch FinanceMCP"
                  body={`You'll log in inside the ${selectedBank.provider} widget. We receive only an opaque connection token.`} />
        <SecPoint icon={<I.Eye size={14}/>} title="Read-only by contract"
                  body="The widget grants the minimum scopes you authorize — never write or transfer permissions." />
        <SecPoint icon={<I.Refresh size={14}/>} title="Revocable anytime"
                  body="Disconnect from the dashboard or directly with your bank to terminate access instantly." />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <Button variant="primary"
                onClick={() => { setProviderStep('login'); setProviderOpen(true); }}
                iconRight={<I.ExternalLink size={13}/>}>
          Continue to {selectedBank.provider} setup
        </Button>
      </div>
    </div>
  );
}

function SecPoint({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--surface-2)', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider widget — modal styled like Pluggy/Plaid embedded widget
// ─────────────────────────────────────────────────────────────────────────────
function ProviderWidget({ bank, providerStep, setProviderStep, onClose, onDone }) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submitLogin = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setProviderStep('mfa'); }, 1200);
  };
  const submitMfa = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setProviderStep('success'); }, 1100);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 420, background: 'var(--surface)', borderRadius: 16,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        {/* widget chrome */}
        <div style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <I.Lock size={12}/> <span>Secured by <strong style={{color:'var(--text)'}}>{bank.provider}</strong></span>
          </div>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><I.X size={14}/></button>
        </div>

        <div style={{ padding: 28, textAlign: 'center' }}>
          <BankLogo bank={bank} size={56} />
          <div style={{ marginTop: 14, fontSize: 16, fontWeight: 500 }}>{bank.name}</div>

          {providerStep === 'login' && (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 22 }}>
                Sign in with your online banking credentials
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <Field label={bank.id.startsWith('br-') ? 'CPF' : 'Username'}
                       value={user} onChange={setUser}
                       placeholder={bank.id.startsWith('br-') ? '000.000.000-00' : 'you@example.com'} />
                <Field label="Password" type="password" value={pass} onChange={setPass}
                       placeholder="••••••••••" />
              </div>
              <Button variant="primary" onClick={submitLogin}
                      style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
                      disabled={!user || !pass || busy}>
                {busy ? <><span className="spinner"/> Verifying…</> : 'Sign in securely'}
              </Button>
            </>
          )}

          {providerStep === 'mfa' && (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 22 }}>
                Enter the 6-digit code sent to your registered device
              </div>
              <input className="input" inputMode="numeric" maxLength={6}
                     value={code} onChange={e => setCode(e.target.value.replace(/\D/g,''))}
                     placeholder="123 456"
                     style={{
                       textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 22,
                       letterSpacing: '0.4em', padding: '14px 12px',
                     }} />
              <Button variant="primary" onClick={submitMfa}
                      style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
                      disabled={code.length < 6 || busy}>
                {busy ? <><span className="spinner"/> Confirming…</> : 'Verify code'}
              </Button>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 12 }}>
                Didn't get a code? <a style={{ color: 'var(--text-muted)' }}>Resend</a>
              </div>
            </>
          )}

          {providerStep === 'success' && (
            <>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-soft)',
                color: 'var(--accent-soft-fg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '20px auto 16px',
              }}><I.Check size={26} strokeWidth={2.2}/></div>
              <div style={{ fontSize: 17, fontWeight: 500 }}>Connection authorized</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6, marginBottom: 22, lineHeight: 1.5 }}>
                FinanceMCP can now read accounts, balances, and transactions from {bank.name}.
              </div>
              <Button variant="primary" onClick={onDone}
                      style={{ width: '100%', justifyContent: 'center' }}>
                Return to FinanceMCP
              </Button>
            </>
          )}
        </div>

        <div style={{
          padding: '10px 18px', borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)', fontSize: 11, color: 'var(--text-dim)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>🔒 {bank.provider} encrypts all credentials</span>
          <span className="mono">session: sess_••••a8f2</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type='text', placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <input className="input" type={type} value={value}
             onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Validate
// ─────────────────────────────────────────────────────────────────────────────
function StepValidate({ validationState, setValidationState, selectedBank,
                        goNext, goBack }) {
  const retry = () => {
    setValidationState('checking');
    setTimeout(() => setValidationState('ok'), 1400);
  };
  return (
    <div style={{ maxWidth: 640 }}>
      <Pill variant={validationState === 'ok' ? 'success' : 'info'} dot>
        {validationState === 'ok' ? 'Validated' : 'Checking'}
      </Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Validate your connection</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 28 }}>
        Confirming that at least one active institution is reporting back to FinanceMCP.
      </p>

      <div className="card" style={{ padding: 24, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: validationState === 'ok' ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: validationState === 'ok' ? 'var(--accent-soft-fg)' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {validationState === 'checking' ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 3 }}/>
            : validationState === 'ok' ? <I.Check size={28} strokeWidth={2.2}/>
            : <I.Plug size={26}/>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {validationState === 'checking' && 'Polling onboarding status…'}
            {validationState === 'ok' && 'Connection validated'}
            {validationState === 'pending' && 'No active connection detected yet'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }} className="mono">
            GET /api/apps/mcp-finance/onboarding/status
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28,
      }}>
        <StatCell label="Institutions" value={validationState === 'ok' ? '1' : '0'} />
        <StatCell label="Accounts" value={validationState === 'ok' ? '3' : '—'} />
        <StatCell label="Last sync" value={validationState === 'ok' ? '4s ago' : '—'} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          {validationState !== 'ok' && validationState !== 'checking' && (
            <Button onClick={retry} icon={<I.Refresh size={13}/>}>Retry</Button>
          )}
          <Button variant="primary" disabled={validationState !== 'ok'} onClick={goNext}
                  iconRight={<I.ArrowRight size={14}/>}>
            Continue to MCP setup
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, fontFamily: 'var(--font)' }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — MCP setup
// ─────────────────────────────────────────────────────────────────────────────
const EXAMPLE_CLAUDE_CONFIG = `{
  "mcpServers": {
    "finance-mcp": {
      "url": "https://mcp.upx-example.com/mcp",
      "auth": {
        "type": "oauth2",
        "discoveryUrl":
          "https://mcp.upx-example.com/.well-known/oauth-protected-resource"
      }
    }
  }
}`;

const EXAMPLE_CURSOR_CONFIG = `// ~/.cursor/mcp.json
{
  "finance-mcp": {
    "transport": "http",
    "url": "https://mcp.upx-example.com/mcp"
  }
}`;

function StepMcpSetup({ testState, setTestState, onComplete, goBack }) {
  const [tab, setTab] = React.useState('claude');

  const runTest = () => {
    setTestState('testing');
    setTimeout(() => setTestState('ok'), 1600);
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <Pill variant="success" dot>Almost there</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Configure your MCP client</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.55, marginBottom: 24 }}>
        Connect Claude Desktop, Cursor, or any MCP-capable client to your read-only finance data.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        <CopyField label="MCP server" value="https://mcp.upx-example.com/mcp" />
        <CopyField label="Authorization" value="https://mcp.upx-example.com/.well-known/oauth-protected-resource" />
        <CopyField label="Discovery" value="https://mcp.upx-example.com/.well-known/mcp-server" />
      </div>

      <div className="card" style={{ overflow: 'hidden', marginBottom: 22 }}>
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)', padding: '0 8px',
        }}>
          {[
            { id: 'claude', label: 'Claude Desktop' },
            { id: 'cursor', label: 'Cursor' },
            { id: 'other',  label: 'Other clients' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              border: 0, background: 'transparent', padding: '12px 14px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              color: tab === t.id ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: '2px solid ' + (tab === t.id ? 'var(--accent)' : 'transparent'),
              marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: 18 }}>
          {tab === 'claude' && (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                Paste into <span className="mono">~/Library/Application Support/Claude/claude_desktop_config.json</span> then restart.
              </div>
              <CodeBlockCopy code={EXAMPLE_CLAUDE_CONFIG}/>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Button size="sm" icon={<I.ExternalLink size={12}/>}>Quick-connect Claude Desktop</Button>
                <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>Download Claude Desktop</Button>
              </div>
            </>
          )}
          {tab === 'cursor' && (
            <>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                Add to your Cursor MCP config file.
              </div>
              <CodeBlockCopy code={EXAMPLE_CURSOR_CONFIG}/>
            </>
          )}
          {tab === 'other' && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Any client that speaks the MCP HTTP transport can connect using the URLs above.
              <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                <li>Use the <strong>Discovery</strong> URL to fetch server metadata.</li>
                <li>Use the <strong>Authorization</strong> URL for the OAuth 2.1 flow.</li>
                <li>Bear tokens are scoped per client and rotate every 7 days.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14 }}>
        <I.Activity size={18} style={{ color: 'var(--text-muted)' }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Test the connection</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Verifies the runtime, your scopes, and at least one connected institution.
          </div>
        </div>
        {testState === 'ok' && (
          <Pill variant="success" dot>10 scopes · 1 connection</Pill>
        )}
        <Button onClick={runTest} disabled={testState === 'testing'}
                variant={testState === 'ok' ? 'default' : 'default'}
                icon={testState === 'testing' ? <span className="spinner"/> : <I.Refresh size={13}/>}>
          {testState === 'testing' ? 'Testing…' : testState === 'ok' ? 'Run again' : 'Test connection'}
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="ghost" onClick={goBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <Button variant="primary" onClick={onComplete}
                iconRight={<I.ArrowRight size={14}/>}>
          Complete setup
        </Button>
      </div>
    </div>
  );
}

function CodeBlockCopy({ code }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    try { navigator.clipboard.writeText(code); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1300);
  };
  return (
    <div style={{ position: 'relative' }}>
      <pre className="codeblock" style={{ margin: 0 }}>{code}</pre>
      <button onClick={onCopy} className="btn btn-sm"
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.18)',
                color: copied ? 'var(--accent)' : '#e5e5e5',
              }}>
        {copied ? <><I.Check size={12}/> Copied</> : <><I.Copy size={12}/> Copy</>}
      </button>
    </div>
  );
}

Object.assign(window, { Wizard, WIZARD_STEPS, CountryToggle, ProviderWidget,
  EXAMPLE_CLAUDE_CONFIG, EXAMPLE_CURSOR_CONFIG, CodeBlockCopy });
