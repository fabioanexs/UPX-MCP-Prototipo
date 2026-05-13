// src/wizard-compact.jsx — simplified 3-card "guided checklist" onboarding
// Pattern: all 3 tasks visible at once. Active card is expanded; completed cards
// collapse to a one-line status row with a "Review" affordance.
//
// Mapping from original 6 steps:
//   1 (terms)    → Task 1 "Accept terms"   (provisioning runs silently after accept)
//   2 (provision)→ background, no UI step
//   3 (bank)+    → Task 2 "Connect bank"   (modal handles auth, inline validate on close)
//   4 (connect)+
//   5 (validate)+
//   6 (mcp)      → Task 3 "Configure client"

function WizardCompact({ country, setCountry, onComplete }) {
  // Per-card state
  const [t1Done, setT1Done] = React.useState(false);        // terms accepted
  const [t2Done, setT2Done] = React.useState(false);        // bank connected
  const [t3Done, setT3Done] = React.useState(false);        // mcp tested

  // Sub-state
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
  const [provisioning, setProvisioning]   = React.useState(false);
  const [selectedBankId, setSelectedBankId] = React.useState(null);
  const [bankSearch, setBankSearch]       = React.useState('');
  const [providerOpen, setProviderOpen]   = React.useState(false);
  const [providerStep, setProviderStep]   = React.useState('login');
  const [validating, setValidating]       = React.useState(false);
  const [connectionInfo, setConnectionInfo] = React.useState(null); // {bankName, accounts}
  const [testState, setTestState]         = React.useState('idle');

  // Open/expand control: defaults to "current task", user can re-open any card
  const [openCard, setOpenCard] = React.useState(1);

  const allDone = t1Done && t2Done && t3Done;
  const inst = (window.MOCK_DATA.institutions[country] || []);
  const selectedBank = inst.find(b => b.id === selectedBankId);

  // Accept terms → kicks off silent provisioning → marks task 1 done → advances
  const acceptTerms = () => {
    setProvisioning(true);
    setTimeout(() => {
      setProvisioning(false);
      setT1Done(true);
      setOpenCard(2);
    }, 900);
  };

  // After provider widget closes successfully → validate inline
  const onProviderSuccess = () => {
    setProviderOpen(false);
    setProviderStep('login');
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      setConnectionInfo({ bank: selectedBank, accounts: 3 });
      setT2Done(true);
      setOpenCard(3);
    }, 1100);
  };

  const runTest = () => {
    setTestState('testing');
    setTimeout(() => {
      setTestState('ok');
      setT3Done(true);
    }, 1300);
  };

  return (
    <div style={{ display: 'flex', minHeight: 700 }}>
      {/* Sidebar — slimmer, just brand & read-only assurance */}
      <aside style={{
        width: 260, padding: '32px 22px', borderRight: '1px solid var(--border)',
        background: 'var(--surface-2)', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 6 }}>Setup</div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>FinanceMCP</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            ~2 minutes · 3 steps
          </div>
        </div>

        {/* Progress mini-list */}
        <div style={{
          marginTop: 28, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[
            { n: 1, label: 'Accept terms', done: t1Done },
            { n: 2, label: 'Connect a bank', done: t2Done },
            { n: 3, label: 'Configure MCP client', done: t3Done },
          ].map(s => (
            <div key={s.n} style={{
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5,
              padding: '6px 4px',
              color: s.done ? 'var(--text)' : (openCard === s.n ? 'var(--text)' : 'var(--text-muted)'),
            }}>
              <ProgressDot done={s.done} active={openCard === s.n && !s.done} n={s.n} />
              <span>{s.label}</span>
            </div>
          ))}
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
            FinanceMCP never moves money, makes payments, or modifies accounts.
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px 56px 56px', position: 'relative', overflow: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ marginBottom: 8 }}>Set up FinanceMCP</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55 }}>
              Three steps to connect your bank and let your AI clients read it. You can revisit any
              step before finishing.
            </p>
          </div>

          {/* Task 1 — Terms */}
          <TaskCard n={1} title="Accept the read-only terms"
                    summaryDone="Read-only terms accepted"
                    summaryHint="v2.4 · accepted just now"
                    done={t1Done} open={openCard === 1}
                    onToggle={() => setOpenCard(openCard === 1 ? 0 : 1)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <CompactDo kind="do" title="Does" items={[
                'Reads accounts, balances, transactions',
                'Exposes them through MCP to AI clients',
                'Logs every tool call for audit',
              ]} />
              <CompactDo kind="dont" title="Never does" items={[
                'Moves money or makes payments',
                'Modifies or closes accounts',
                'Sees your banking credentials',
              ]} />
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)',
              cursor: 'pointer', marginBottom: 14, fontSize: 13,
            }}>
              <input type="checkbox" checked={acceptedTerms}
                     onChange={e => setAcceptedTerms(e.target.checked)}
                     style={{ accentColor: 'var(--accent)' }}/>
              I have read the <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Read-only Disclosure (v2.4)
              </a>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button variant="primary" disabled={!acceptedTerms || provisioning}
                      onClick={acceptTerms}>
                {provisioning ? <><span className="spinner"/> Preparing account…</> : 'Accept & continue'}
              </Button>
              {provisioning && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Provisioning runs in the background — no need to wait.
                </span>
              )}
            </div>
          </TaskCard>

          {/* Task 2 — Connect bank */}
          <TaskCard n={2} title="Connect your first bank"
                    summaryDone={connectionInfo
                      ? `${connectionInfo.bank.name} connected · ${connectionInfo.accounts} accounts`
                      : 'Bank connected'}
                    summaryHint={connectionInfo ? `Just now · auth via ${connectionInfo.bank.provider}` : ''}
                    summaryIcon={connectionInfo ? <BankLogo bank={connectionInfo.bank} size={20}/> : null}
                    done={t2Done} open={openCard === 2}
                    locked={!t1Done}
                    onToggle={() => setOpenCard(openCard === 2 ? 0 : 2)}>

            {/* country + search inline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <I.Search size={14} style={{
                  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}/>
                <input className="input" placeholder={`Search ${country === 'BR' ? 'Brazilian' : 'US'} banks…`}
                       style={{ paddingLeft: 34 }}
                       value={bankSearch} onChange={e => setBankSearch(e.target.value)} />
              </div>
              <CountryToggle country={country} setCountry={setCountry} />
            </div>

            {validating ? (
              <ValidatingState bank={selectedBank} />
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                maxHeight: 280, overflowY: 'auto', paddingRight: 4,
              }}>
                {inst.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
                     .map(b => (
                  <button key={b.id} onClick={() => {
                    setSelectedBankId(b.id);
                    setProviderStep('login');
                    setProviderOpen(true);
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    transition: 'all .12s',
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <BankLogo bank={b} size={28} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div style={{
              marginTop: 14, padding: '10px 12px', background: 'var(--surface-2)',
              borderRadius: 8, fontSize: 12, color: 'var(--text-muted)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <I.Lock size={13}/> You'll sign in at your bank's provider — FinanceMCP never sees credentials.
            </div>
          </TaskCard>

          {/* Task 3 — MCP setup */}
          <TaskCard n={3} title="Configure your MCP client"
                    summaryDone="MCP client configured · connection verified"
                    summaryHint="10 scopes · 1 connection · last test passed"
                    done={t3Done} open={openCard === 3}
                    locked={!t2Done}
                    onToggle={() => setOpenCard(openCard === 3 ? 0 : 3)}>
            <McpInlinePanel testState={testState} runTest={runTest} />
          </TaskCard>

          {/* Finish */}
          <div style={{
            marginTop: 24, padding: '16px 18px', borderRadius: 12,
            background: allDone ? 'var(--accent-soft)' : 'var(--surface-2)',
            border: '1px solid ' + (allDone ? 'transparent' : 'var(--border)'),
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'all .2s',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: allDone ? 'var(--accent)' : 'var(--surface)',
              color: allDone ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {allDone ? <I.Check size={18} strokeWidth={2.4}/> : <I.Box size={16}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {allDone ? "You're all set" : `Complete the ${3 - [t1Done,t2Done,t3Done].filter(Boolean).length} remaining step${3 - [t1Done,t2Done,t3Done].filter(Boolean).length === 1 ? '' : 's'}`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {allDone
                  ? 'Open the dashboard to manage institutions, clients, and audit logs.'
                  : 'You can finish later — your progress is saved.'}
              </div>
            </div>
            <Button variant="primary" disabled={!allDone} onClick={onComplete}
                    iconRight={<I.ArrowRight size={14}/>}>
              Open dashboard
            </Button>
          </div>
        </div>

        {/* Provider widget reused */}
        {providerOpen && (
          <ProviderWidget
            bank={selectedBank}
            providerStep={providerStep}
            setProviderStep={setProviderStep}
            onClose={() => setProviderOpen(false)}
            onDone={onProviderSuccess}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ProgressDot({ done, active, n }) {
  if (done) {
    return (
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}><I.Check size={11} strokeWidth={2.8}/></div>
    );
  }
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
      background: active ? 'var(--text)' : 'var(--surface)',
      color: active ? 'var(--bg)' : 'var(--text-muted)',
      border: active ? 'none' : '1px solid var(--border-strong)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 600,
    }}>{n}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function TaskCard({ n, title, summaryDone, summaryHint, summaryIcon,
                    done, open, locked, onToggle, children }) {
  const expanded = open && !locked;
  return (
    <div style={{
      marginBottom: 12,
      border: '1px solid ' + (expanded ? 'var(--border-strong)' : 'var(--border)'),
      borderRadius: 14, overflow: 'hidden', background: 'var(--surface)',
      opacity: locked && !done ? 0.55 : 1,
      transition: 'border-color .15s',
      boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    }}>
      <button onClick={onToggle} disabled={locked && !done}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', background: 'transparent',
                border: 0, cursor: locked && !done ? 'not-allowed' : 'pointer',
                textAlign: 'left', color: 'var(--text)',
              }}>
        <ProgressDot done={done} active={expanded && !done} n={n} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {done ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {summaryIcon}
                <span style={{ fontSize: 14, fontWeight: 500 }}>{summaryDone}</span>
              </div>
              {summaryHint && (
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  {summaryHint}
                </div>
              )}
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
          )}
        </div>
        {done && !expanded && (
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Review</span>
        )}
        <I.ChevronDown size={15} style={{
          color: 'var(--text-dim)',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform .15s',
        }}/>
      </button>
      {expanded && (
        <div style={{ padding: '4px 18px 20px 50px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Compact Do/Don't column
function CompactDo({ kind, title, items }) {
  const ok = kind === 'do';
  return (
    <div>
      <div style={{
        fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '.06em', marginBottom: 8,
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, lineHeight: 1.4 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: ok ? 'var(--accent-soft)' : 'var(--danger-soft)',
              color: ok ? 'var(--accent-soft-fg)' : 'var(--danger)',
            }}>
              {ok ? <I.Check size={9} strokeWidth={2.8}/> : <I.X size={9} strokeWidth={2.8}/>}
            </div>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validating state shown inline after provider widget closes
function ValidatingState({ bank }) {
  return (
    <div style={{
      padding: '24px 16px', borderRadius: 10,
      background: 'var(--surface-2)', border: '1px dashed var(--border-strong)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5, color: 'var(--accent)' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>
          Validating connection with {bank?.name || 'your bank'}…
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
          Confirming the runtime sees at least one active institution.
        </div>
      </div>
    </div>
  );
}

// Compact MCP setup — endpoints + one tabbed config + test
function McpInlinePanel({ testState, runTest }) {
  const [tab, setTab] = React.useState('claude');
  const code = tab === 'claude' ? EXAMPLE_CLAUDE_CONFIG : EXAMPLE_CURSOR_CONFIG;
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <CopyField label="MCP server" value="https://mcp.upx-example.com/mcp" />
        <CopyField label="Discovery" value="https://mcp.upx-example.com/.well-known/mcp-server" />
      </div>

      <div style={{
        display: 'flex', gap: 4, marginBottom: 10, padding: 2,
        background: 'var(--surface-2)', borderRadius: 8, width: 'fit-content',
        border: '1px solid var(--border)',
      }}>
        {[
          { id: 'claude', label: 'Claude Desktop' },
          { id: 'cursor', label: 'Cursor' },
        ].map(o => (
          <button key={o.id} onClick={() => setTab(o.id)}
                  style={{
                    border: 0, background: tab === o.id ? 'var(--surface)' : 'transparent',
                    padding: '5px 10px', fontSize: 12, fontWeight: 500, borderRadius: 5,
                    color: tab === o.id ? 'var(--text)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: tab === o.id ? 'var(--shadow-sm)' : 'none',
                  }}>{o.label}</button>
        ))}
      </div>

      <CodeBlockCopy code={code}/>

      <div style={{
        marginTop: 14, padding: 12, borderRadius: 10,
        background: testState === 'ok' ? 'var(--accent-soft)' : 'var(--surface-2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {testState === 'ok'
          ? <I.Check size={16} style={{ color: 'var(--accent-soft-fg)' }} strokeWidth={2.4}/>
          : <I.Activity size={16} style={{ color: 'var(--text-muted)' }}/>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500,
                        color: testState === 'ok' ? 'var(--accent-soft-fg)' : 'var(--text)' }}>
            {testState === 'ok' ? 'Connection verified · 10 scopes · 1 connection' : 'Test the MCP connection'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
            {testState === 'ok' ? 'Your AI client can now query the runtime.'
              : "After pasting the config in your client, click test to verify the round-trip."}
          </div>
        </div>
        <Button size="sm" onClick={runTest} disabled={testState === 'testing'}
                variant={testState === 'ok' ? 'default' : 'primary'}
                icon={testState === 'testing' ? <span className="spinner"/> : <I.Refresh size={12}/>}>
          {testState === 'testing' ? 'Testing…' : testState === 'ok' ? 'Run again' : 'Test connection'}
        </Button>
      </div>
    </>
  );
}

Object.assign(window, { WizardCompact });
