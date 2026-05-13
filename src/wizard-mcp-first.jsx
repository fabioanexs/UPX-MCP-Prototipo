// src/wizard-mcp-first.jsx — alternative flow where MCP client is chosen first
// and the user gets a visual walkthrough (illustrated "screenshots") showing
// exactly where to click and what to paste in their chosen client.
//
// Steps:
//   0  pick_client   — Which MCP host are you using?
//   1  configure     — 3 illustrated cards: open settings → paste → restart
//   2  verify_client — Mock conversation showing the host with FinanceMCP active
//   3  connect_bank  — Same as compact flow
//   4  complete

const MCP_CLIENTS = [
  {
    id: 'claude_desktop',
    name: 'Claude Desktop',
    badge: 'desktop',
    mockBrand: 'aurora',
    settingsPath: 'Settings → Developer → Edit Config',
    filePath: '~/Library/Application Support/Claude/claude_desktop_config.json',
    desc: 'macOS / Windows desktop app',
  },
  {
    id: 'claude_web',
    name: 'Claude Web',
    badge: 'web',
    mockBrand: 'aurora',
    settingsPath: 'Settings → Connectors → Add custom connector',
    filePath: 'In-app · Settings › Connectors',
    desc: 'Browser-based, OAuth handshake',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    badge: 'desktop',
    mockBrand: 'sage',
    settingsPath: 'Settings → Connectors → Add MCP server',
    filePath: '~/Library/Application Support/ChatGPT/mcp.json',
    desc: 'macOS / Windows / Web',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    badge: 'editor',
    mockBrand: 'graphite',
    settingsPath: 'Cmd-Shift-P → "MCP: Edit Config"',
    filePath: '~/.cursor/mcp.json',
    desc: 'AI-first code editor',
  },
  {
    id: 'manus',
    name: 'Manus',
    badge: 'agent',
    mockBrand: 'coral',
    settingsPath: 'Workspace → Tools → Add MCP endpoint',
    filePath: 'Workspace settings (cloud)',
    desc: 'Autonomous agent platform',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    badge: 'agent',
    mockBrand: 'azure',
    settingsPath: '~/.openclaw/config.toml',
    filePath: '~/.openclaw/config.toml',
    desc: 'Open-source MCP runtime',
  },
  {
    id: 'custom',
    name: 'Custom / CLI',
    badge: 'cli',
    mockBrand: 'terminal',
    settingsPath: 'Add to your runtime config',
    filePath: 'mcp-config.toml',
    desc: 'Bring your own MCP host',
  },
];

const CLIENT_CONFIG_SNIPPETS = {
  claude_desktop: `{
  "mcpServers": {
    "finance-mcp": {
      "url": "https://mcp.upx-example.com/mcp",
      "auth": { "type": "oauth2",
                "discoveryUrl": "https://mcp.upx-example.com/.well-known/oauth-protected-resource" }
    }
  }
}`,
  claude_web: `// Pasted into the in-app "Add connector" dialog
{
  "name": "FinanceMCP",
  "url": "https://mcp.upx-example.com/mcp",
  "oauth": {
    "authorizationUrl": "https://mcp.upx-example.com/.well-known/oauth-protected-resource"
  }
}`,
  chatgpt: `{
  "mcp_servers": [
    {
      "name": "finance-mcp",
      "url": "https://mcp.upx-example.com/mcp",
      "auth": "oauth2",
      "scopes": ["accounts.read", "balances.read", "transactions.read"]
    }
  ]
}`,
  cursor: `// ~/.cursor/mcp.json
{
  "mcpServers": {
    "finance-mcp": {
      "transport": "http",
      "url": "https://mcp.upx-example.com/mcp"
    }
  }
}`,
  manus: `// Workspace › Tools › Add MCP endpoint
{
  "label": "FinanceMCP",
  "endpoint": "https://mcp.upx-example.com/mcp",
  "auth": "oauth2",
  "agentRole": "financial-analyst"
}`,
  openclaw: `# ~/.openclaw/config.toml
[mcp.servers.finance-mcp]
url       = "https://mcp.upx-example.com/mcp"
transport = "http"
auth      = "oauth2"
discovery = "https://mcp.upx-example.com/.well-known/oauth-protected-resource"`,
  custom: `[server.finance-mcp]
url = "https://mcp.upx-example.com/mcp"
auth = "oauth2"
discovery = "https://mcp.upx-example.com/.well-known/oauth-protected-resource"`,
};

// Per-client copy for the "restart / apply" step
const CLIENT_RESTART = {
  claude_desktop: {
    title: 'Restart Claude Desktop',
    instruction: 'Quit Claude Desktop and open it again. You should see "finance-mcp" listed in available servers.',
    actionLabel: 'It restarted',
  },
  claude_web: {
    title: 'Authorize in your browser',
    instruction: 'Claude Web will open a new tab to complete the OAuth handshake with FinanceMCP. After authorizing, return to the chat — the connector turns green.',
    actionLabel: 'Authorized',
  },
  chatgpt: {
    title: 'Activate the connector',
    instruction: 'Toggle the FinanceMCP connector on. ChatGPT may ask you to sign in once with OAuth — do so to grant the read-only scopes.',
    actionLabel: 'It connected',
  },
  cursor: {
    title: 'Reload Cursor',
    instruction: 'Cmd-Shift-P → "Developer: Reload Window". You should see finance-mcp under the MCP servers list.',
    actionLabel: 'Reloaded',
  },
  manus: {
    title: 'Publish the workspace',
    instruction: 'Click Publish in the workspace settings. The new MCP endpoint is available to every agent in this workspace within seconds — no restart needed.',
    actionLabel: 'Published',
  },
  openclaw: {
    title: 'Reload the OpenClaw daemon',
    instruction: 'Run "openclaw reload" (or send SIGHUP). The daemon re-reads ~/.openclaw/config.toml without dropping in-flight requests.',
    actionLabel: 'Daemon reloaded',
  },
  custom: {
    title: 'Restart your MCP host',
    instruction: 'However your runtime reloads config — restart the process or re-source the file — make sure it picks up the new [server.finance-mcp] block.',
    actionLabel: 'It picked it up',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
function WizardMcpFirst({ country, setCountry, onComplete }) {
  const [step, setStep] = React.useState(0);
  const [clientId, setClientId] = React.useState(null);
  const [configStep, setConfigStep] = React.useState(0); // 0=opened, 1=pasted, 2=restarted
  const [verified, setVerified] = React.useState(false);
  const [verifyState, setVerifyState] = React.useState('idle'); // idle | testing | ok
  // bank-connection state (reuse from compact)
  const [selectedBankId, setSelectedBankId] = React.useState(null);
  const [bankSearch, setBankSearch] = React.useState('');
  const [providerOpen, setProviderOpen] = React.useState(false);
  const [providerStep, setProviderStep] = React.useState('login');
  const [connectionInfo, setConnectionInfo] = React.useState(null);

  const client = MCP_CLIENTS.find(c => c.id === clientId);
  const inst = window.MOCK_DATA.institutions[country] || [];
  const selectedBank = inst.find(b => b.id === selectedBankId);

  const STEPS = [
    { n: 1, label: 'Pick your AI client',  done: step > 0, active: step === 0 },
    { n: 2, label: 'Configure ' + (client?.name || 'host'),
      done: step > 1, active: step === 1, locked: !client },
    { n: 3, label: 'Verify it works',     done: step > 2, active: step === 2, locked: configStep < 3 },
    { n: 4, label: 'Connect a bank',      done: step > 3, active: step === 3, locked: !verified },
  ];

  const runVerify = () => {
    setVerifyState('testing');
    setTimeout(() => {
      setVerifyState('ok');
      setVerified(true);
    }, 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 700 }}>
      {/* Top header with brand + horizontal step indicator */}
      <header style={{
        padding: '20px 56px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '.08em',
                          textTransform: 'uppercase', marginBottom: 2 }}>Setup</div>
            <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>FinanceMCP</div>
          </div>

          <div style={{ width: 1, height: 30, background: 'var(--border)' }} />

          {/* Horizontal stepper */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: s.locked && !s.done ? 0.5 : 1,
                }}>
                  <ProgressDot done={s.done} active={s.active && !s.done} n={s.n} />
                  <div>
                    <div style={{
                      fontSize: 12, fontWeight: 500,
                      color: s.done ? 'var(--text)' : (s.active ? 'var(--text)' : 'var(--text-muted)'),
                    }}>{s.label}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 1, margin: '0 16px',
                    background: STEPS[i].done ? 'var(--accent)' : 'var(--border)',
                    minWidth: 20, maxWidth: 80,
                  }}/>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{
            flexShrink: 0, padding: '8px 12px', borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4,
            maxWidth: 240,
          }}>
            <I.Shield size={13} style={{ color: 'var(--text)', flexShrink: 0 }}/>
            <span><strong style={{color:'var(--text)'}}>Client first:</strong> prove the host can reach FinanceMCP before binding bank data.</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px 56px 56px', overflow: 'auto', position: 'relative' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {step === 0 && (
            <PickClientStep onPick={(id) => { setClientId(id); setStep(1); }} />
          )}
          {step === 1 && client && (
            <ConfigureStep client={client} configStep={configStep}
                           setConfigStep={setConfigStep}
                           onBack={() => setStep(0)}
                           onDone={() => setStep(2)} />
          )}
          {step === 2 && client && (
            <VerifyStep client={client}
                         verifyState={verifyState} runVerify={runVerify}
                         onBack={() => setStep(1)}
                         onDone={() => setStep(3)} />
          )}
          {step === 3 && (
            <ConnectBankStep country={country} setCountry={setCountry}
                              inst={inst} bankSearch={bankSearch} setBankSearch={setBankSearch}
                              selectedBankId={selectedBankId} setSelectedBankId={setSelectedBankId}
                              setProviderOpen={setProviderOpen} setProviderStep={setProviderStep}
                              connectionInfo={connectionInfo}
                              onBack={() => setStep(2)}
                              onDone={onComplete} />
          )}
        </div>

        {providerOpen && (
          <ProviderWidget bank={selectedBank}
            providerStep={providerStep} setProviderStep={setProviderStep}
            onClose={() => setProviderOpen(false)}
            onDone={() => {
              setProviderOpen(false);
              setProviderStep('login');
              setConnectionInfo({ bank: selectedBank, accounts: 3 });
              setTimeout(() => onComplete(), 200);
            }}
          />
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — pick client
// ─────────────────────────────────────────────────────────────────────────────
function PickClientStep({ onPick }) {
  return (
    <div>
      <Pill variant="info" dot>1 of 4 · choose host</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Choose the AI client to connect</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginBottom: 28 }}>
        Pick the host that will talk to FinanceMCP. We'll walk you through the exact configuration
        with screenshots before touching any bank data.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {MCP_CLIENTS.filter(c => c.id !== 'custom').map(c => (
          <button key={c.id} onClick={() => onPick(c.id)}
            className="card"
            style={{
              padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start',
              cursor: 'pointer', background: 'var(--surface)',
              transition: 'all .12s', textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)';
                                 e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';
                                 e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <ClientIcon brand={c.mockBrand} badge={c.badge}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14.5, fontWeight: 500 }}>{c.name}</span>
                <Pill>{c.badge}</Pill>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.45 }}>
                {c.desc}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                   className="mono">
                {c.filePath}
              </div>
            </div>
            <I.Chevron size={14} style={{ color: 'var(--text-dim)', marginTop: 4 }}/>
          </button>
        ))}
      </div>

      {/* Advanced — custom row */}
      {(() => {
        const c = MCP_CLIENTS.find(x => x.id === 'custom');
        return (
          <button onClick={() => onPick(c.id)} className="card"
            style={{
              marginTop: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center',
              cursor: 'pointer', background: 'var(--surface)',
              transition: 'all .12s', textAlign: 'left', width: '100%',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <ClientIcon brand={c.mockBrand} badge={c.badge}/>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                <Pill>advanced</Pill>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                {c.desc} — any MCP host that speaks HTTP works
              </div>
            </div>
            <I.Chevron size={14} style={{ color: 'var(--text-dim)' }}/>
          </button>
        );
      })()}
    </div>
  );
}

function ClientIcon({ brand, badge }) {
  // 3-tone abstract glyph that suggests the client without copying any real brand.
  const palettes = {
    aurora:   { bg: 'oklch(0.95 0.04 285)', fg: 'oklch(0.55 0.16 285)' },  // violet
    graphite: { bg: 'oklch(0.95 0.005 250)', fg: 'oklch(0.30 0.01 250)' }, // dark gray
    lagoon:   { bg: 'oklch(0.95 0.04 200)', fg: 'oklch(0.55 0.12 200)' },  // teal
    sage:     { bg: 'oklch(0.95 0.04 145)', fg: 'oklch(0.45 0.14 145)' },  // green
    coral:    { bg: 'oklch(0.94 0.05 30)',  fg: 'oklch(0.55 0.16 30)' },   // coral
    azure:    { bg: 'oklch(0.94 0.05 245)', fg: 'oklch(0.50 0.15 245)' },  // blue
    terminal: { bg: 'oklch(0.18 0.01 150)', fg: 'oklch(0.85 0.12 150)' },  // dark/green
  };
  const p = palettes[brand] || palettes.graphite;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 11, flexShrink: 0,
      background: p.bg, color: p.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {badge === 'cli' ? (
        <span className="mono" style={{ fontSize: 16, fontWeight: 600 }}>$_</span>
      ) : badge === 'editor' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 16 -4-4 4-4"/><path d="m15 8 4 4-4 4"/>
        </svg>
      ) : badge === 'web' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
        </svg>
      ) : badge === 'agent' ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3"/>
          <rect x="5" y="6" width="14" height="12" rx="3"/>
          <circle cx="9" cy="12" r="1.4" fill="currentColor"/>
          <circle cx="15" cy="12" r="1.4" fill="currentColor"/>
          <path d="M9 18v2M15 18v2"/>
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3"/>
          <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — configure walkthrough
// ─────────────────────────────────────────────────────────────────────────────
function ConfigureStep({ client, configStep, setConfigStep, onBack, onDone }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Pill variant="info" dot>2 of 4 · configure</Pill>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {client.name}</span>
      </div>
      <h1 style={{ marginBottom: 10 }}>Set up {client.name}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginBottom: 22 }}>
        Three quick steps. The illustrations show roughly what you'll see — exact layout may differ
        slightly between versions.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <ConfigCard
          n={1}
          title={`Open the MCP settings`}
          instruction={`In ${client.name}, open ${client.settingsPath}.`}
          done={configStep >= 1}
          active={configStep === 0}
          mockup={<MockSettings client={client}/>}
          actionLabel="I opened it"
          onAction={() => setConfigStep(1)}
        />
        <ConfigCard
          n={2}
          title="Paste the FinanceMCP config"
          instruction={<>Copy this snippet and paste it into <span className="mono" style={{color:'var(--text)'}}>{client.filePath}</span>. Save the file.</>}
          done={configStep >= 2}
          active={configStep === 1}
          mockup={<MockConfigEditor client={client}/>}
          extra={<CopyField value={CLIENT_CONFIG_SNIPPETS[client.id]} />}
          actionLabel="I pasted &amp; saved"
          onAction={() => setConfigStep(2)}
        />
        <ConfigCard
          n={3}
          title={CLIENT_RESTART[client.id]?.title || `Restart ${client.name}`}
          instruction={CLIENT_RESTART[client.id]?.instruction
            || `Quit and reopen ${client.name} so it picks up the new config. You should see "finance-mcp" listed in available servers.`}
          done={configStep >= 3}
          active={configStep === 2}
          mockup={<MockRestart client={client}/>}
          actionLabel={CLIENT_RESTART[client.id]?.actionLabel || "It restarted"}
          onAction={() => setConfigStep(3)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button variant="ghost" onClick={onBack} icon={<I.ArrowLeft size={14}/>}>
          Change client
        </Button>
        <Button variant="primary" disabled={configStep < 3} onClick={onDone}
                iconRight={<I.ArrowRight size={14}/>}>
          Verify the connection
        </Button>
      </div>
    </div>
  );
}

function ConfigCard({ n, title, instruction, done, active, mockup, extra, actionLabel, onAction }) {
  const collapsed = done;
  return (
    <div className="card" style={{
      overflow: 'hidden', borderColor: active ? 'var(--border-strong)' : 'var(--border)',
      boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      opacity: !active && !done ? 0.7 : 1,
      transition: 'all .15s',
    }}>
      <div style={{
        padding: collapsed ? '12px 18px' : '16px 18px 0',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <ProgressDot done={done} active={active} n={n} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
          {!collapsed && (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>
              {instruction}
            </div>
          )}
        </div>
        {collapsed && <Pill variant="success" dot>done</Pill>}
      </div>

      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 18,
                       padding: '14px 18px 18px 50px' }}>
          <div style={{ minWidth: 0 }}>{mockup}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            {extra}
            <Button variant="primary" size="sm" onClick={onAction} disabled={!active}
                    style={{ alignSelf: 'flex-start' }}>
              {actionLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock window chrome + illustrated "screenshots"
// ─────────────────────────────────────────────────────────────────────────────
function MockWindow({ title, children, theme = 'light', width, height }) {
  const dark = theme === 'dark';
  const term = theme === 'terminal';
  const bg = term ? 'oklch(0.16 0.01 150)' : dark ? 'oklch(0.20 0.005 250)' : 'oklch(0.99 0.003 90)';
  const surface = term ? 'oklch(0.13 0.01 150)' : dark ? 'oklch(0.16 0.005 250)' : 'oklch(0.97 0.005 90)';
  const text = term || dark ? 'oklch(0.92 0.005 90)' : 'oklch(0.2 0.01 90)';
  const border = term || dark ? 'oklch(0.30 0.008 250)' : 'oklch(0.91 0.006 90)';
  return (
    <div style={{
      width: width || '100%', height: height || 'auto',
      border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden',
      background: bg, color: text, fontSize: 11.5,
      boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        background: surface, padding: '8px 12px',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }}/>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }}/>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }}/>
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 11,
                       color: term || dark ? 'oklch(0.72 0.007 90)' : 'var(--text-muted)',
                       fontFamily: 'inherit' }}>{title}</span>
        <span style={{ width: 30 }}/>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── Mockup 1: Settings panel with menu item highlighted
function MockSettings({ client }) {
  // Menu items vary per client to feel native
  const menus = {
    claude_desktop: { items: ['General', 'Account', 'Appearance', 'Developer', 'MCP Servers', 'About'],     theme: 'light', container: 'app' },
    claude_web:     { items: ['Profile', 'Personalization', 'Memory', 'Connectors', 'Privacy', 'Subscription'], theme: 'light', container: 'browser', activeLabel: 'Connectors' },
    chatgpt:        { items: ['General', 'Notifications', 'Personalization', 'Connectors', 'Speech', 'Data'],   theme: 'light', container: 'app', activeLabel: 'Connectors' },
    cursor:         { items: ['General', 'Editor', 'Keybindings', 'MCP Servers', 'AI', 'Extensions'],          theme: 'dark',  container: 'app' },
    manus:          { items: ['Workspace', 'Tools', 'Agents', 'Knowledge', 'Triggers', 'Billing'],             theme: 'light', container: 'app', activeLabel: 'Tools' },
    openclaw:       { items: ['[server.x]', '[server.y]', '[mcp.servers.finance-mcp]', '[transport]', '[auth]'], theme: 'dark', container: 'editor' },
    custom:         { items: ['env', 'transport', 'auth', '[server.finance-mcp]', 'logging'],                  theme: 'dark', container: 'editor' },
  };
  const cfg = menus[client.id] || menus.claude_desktop;
  const dark = cfg.theme === 'dark';
  const items = cfg.items;
  const activeLabel = cfg.activeLabel || 'MCP Servers';
  const highlightIdx = Math.max(0, items.findIndex(i => i.toLowerCase().includes(activeLabel.toLowerCase()) || activeLabel === 'MCP Servers' && i.toLowerCase().includes('mcp')));
  const title = cfg.container === 'browser'
    ? `claude.ai — Settings`
    : cfg.container === 'editor'
    ? client.filePath
    : `${client.name} — Settings`;

  return (
    <MockWindow title={title} theme={dark ? 'dark' : 'light'}>
      <div style={{ display: 'flex', height: 200 }}>
        <div style={{
          width: 144, padding: 10, borderRight: `1px solid ${dark ? 'oklch(0.30 0.008 250)' : 'oklch(0.91 0.006 90)'}`,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {items.map((it, i) => (
            <div key={i} style={{
              padding: '6px 8px', borderRadius: 5, fontSize: 11,
              fontFamily: cfg.container === 'editor' ? 'var(--mono)' : 'inherit',
              background: i === highlightIdx ? (dark ? 'oklch(0.28 0.06 155)' : 'oklch(0.95 0.04 155)') : 'transparent',
              color: i === highlightIdx
                ? (dark ? 'oklch(0.82 0.12 155)' : 'oklch(0.38 0.13 155)')
                : (dark ? 'oklch(0.72 0.007 90)' : 'oklch(0.45 0.008 90)'),
              fontWeight: i === highlightIdx ? 500 : 400,
              display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: '50%',
                background: 'currentColor', opacity: i === highlightIdx ? 0.9 : 0.4,
                flexShrink: 0,
              }}/>
              {it}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 12, position: 'relative', minWidth: 0 }}>
          <PointerArrow side="left" label="Click here" />
          <div style={{ fontSize: 10.5, opacity: 0.5, marginBottom: 8, letterSpacing: '.06em' }}>
            {activeLabel.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <MockField label={cfg.container === 'editor' ? 'url' : 'Server URL'} width="80%"/>
            <MockField label={cfg.container === 'editor' ? 'auth' : 'Auth method'} width="50%"/>
            <MockField label="" width="35%" height={20} muted/>
          </div>
        </div>
      </div>
    </MockWindow>
  );
}

// ── Mockup 2: Code editor with config visible
function MockConfigEditor({ client }) {
  const code = CLIENT_CONFIG_SNIPPETS[client.id];
  const lines = code.split('\n');
  return (
    <MockWindow title={client.filePath} theme="dark">
      <div style={{ display: 'flex', minHeight: 200, maxHeight: 240, overflow: 'hidden' }}>
        <div style={{
          padding: '10px 6px', textAlign: 'right',
          color: 'oklch(0.45 0.008 90)', fontSize: 10,
          fontFamily: 'var(--mono)', userSelect: 'none',
          borderRight: '1px solid oklch(0.26 0.008 250)',
          minWidth: 28,
        }}>
          {lines.map((_, i) => <div key={i}>{i+1}</div>)}
        </div>
        <pre style={{
          margin: 0, padding: '10px 12px', flex: 1, overflow: 'auto',
          fontFamily: 'var(--mono)', fontSize: 11, lineHeight: '1.5',
          color: 'oklch(0.92 0.005 90)',
        }}>{syntaxHighlightJson(code)}</pre>
      </div>
    </MockWindow>
  );
}

// Tiny manual JSON syntax color — split on common patterns
function syntaxHighlightJson(text) {
  const parts = [];
  const regex = /("[^"\\]*(?:\\.[^"\\]*)*")(\s*:)?|(\/\/[^\n]*|#[^\n]*)|(\b(true|false|null)\b)|(\b\d+(?:\.\d+)?\b)|([{}\[\],])/g;
  let last = 0; let m; let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{text.slice(last, m.index)}</span>);
    if (m[1]) {
      const key = !!m[2];
      parts.push(<span key={i++} style={{ color: key ? 'oklch(0.78 0.14 75)' : 'oklch(0.78 0.13 155)' }}>
        {m[1]}{m[2] || ''}
      </span>);
    } else if (m[3]) {
      parts.push(<span key={i++} style={{ color: 'oklch(0.55 0.01 90)', fontStyle: 'italic' }}>{m[3]}</span>);
    } else if (m[4]) {
      parts.push(<span key={i++} style={{ color: 'oklch(0.7 0.16 27)' }}>{m[4]}</span>);
    } else if (m[6]) {
      parts.push(<span key={i++} style={{ color: 'oklch(0.7 0.16 27)' }}>{m[6]}</span>);
    } else if (m[7]) {
      parts.push(<span key={i++} style={{ color: 'oklch(0.65 0.008 90)' }}>{m[7]}</span>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return parts;
}

// ── Mockup 3: Restart confirmation
function MockRestart({ client }) {
  const dark = ['cursor', 'openclaw', 'custom'].includes(client.id);
  return (
    <MockWindow title={client.name} theme={dark ? 'dark' : 'light'}>
      <div style={{
        height: 200, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'oklch(0.95 0.04 155)', color: 'oklch(0.38 0.13 155)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12l5 5L20 6"/>
          </svg>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>finance-mcp registered</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                       fontSize: 10.5, opacity: 0.7 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'oklch(0.55 0.16 145)' }}/>
          Connected · 7 tools available
        </div>
        <div style={{
          marginTop: 6, padding: '4px 10px', borderRadius: 5,
          background: 'oklch(0.95 0.005 90)', fontSize: 10,
          fontFamily: 'var(--mono)', color: 'oklch(0.45 0.008 90)',
          border: '1px solid oklch(0.91 0.006 90)',
        }}>
          mcp.upx-example.com/mcp
        </div>
      </div>
    </MockWindow>
  );
}

function MockField({ label, width, height = 24, muted }) {
  return (
    <div>
      {label && (
        <div style={{ fontSize: 9.5, opacity: 0.5, marginBottom: 3,
                       textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      )}
      <div style={{
        width, height, borderRadius: 4,
        background: 'currentColor', opacity: muted ? 0.08 : 0.15,
      }}/>
    </div>
  );
}

function PointerArrow({ side, label }) {
  // Small annotation arrow that points at the highlighted item
  return (
    <div style={{
      position: 'absolute', top: 16,
      [side]: -6, transform: 'translateX(-100%)',
      display: 'flex', alignItems: 'center', gap: 6, zIndex: 2,
    }}>
      <span style={{
        fontSize: 10.5, fontWeight: 500, padding: '2px 8px',
        background: 'var(--accent)', color: 'var(--accent-fg)',
        borderRadius: 999, whiteSpace: 'nowrap',
      }}>{label}</span>
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path d="M0 7h14M10 2l5 5-5 5" stroke="var(--accent)" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — verify
// ─────────────────────────────────────────────────────────────────────────────
function VerifyStep({ client, verifyState, runVerify, onBack, onDone }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Pill variant="info" dot>3 of 4 · verify</Pill>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {client.name}</span>
      </div>
      <h1 style={{ marginBottom: 10 }}>Test it inside {client.name}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginBottom: 22 }}>
        Open {client.name} and ask anything — FinanceMCP will reply that it has no bank data
        connected yet (that's fine, that's the next step).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 18 }}>
        <MockChatVerify client={client} verified={verifyState === 'ok'}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase',
                          letterSpacing: '.06em', marginBottom: 8 }}>Try asking</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'List my accounts',
                'Show recent transactions',
                'What MCP tools are available?',
              ].map(q => (
                <div key={q} style={{
                  padding: '8px 10px', borderRadius: 7,
                  background: 'var(--surface-2)', fontSize: 12.5,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <I.ArrowRight size={11} style={{ color: 'var(--text-dim)' }}/>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{
            padding: 16,
            background: verifyState === 'ok' ? 'var(--accent-soft)' : 'var(--surface)',
            borderColor: verifyState === 'ok' ? 'transparent' : 'var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {verifyState === 'testing' ? (
                <div className="spinner" style={{ color: 'var(--accent)' }}/>
              ) : verifyState === 'ok' ? (
                <I.Check size={16} style={{ color: 'var(--accent-soft-fg)' }} strokeWidth={2.4}/>
              ) : (
                <I.Activity size={16} style={{ color: 'var(--text-muted)' }}/>
              )}
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500,
                              color: verifyState === 'ok' ? 'var(--accent-soft-fg)' : 'var(--text)' }}>
                {verifyState === 'testing' ? 'Pinging FinanceMCP…'
                 : verifyState === 'ok' ? 'finance-mcp is responding'
                 : 'Ready to verify'}
              </div>
            </div>
            <div style={{ fontSize: 11.5,
                           color: verifyState === 'ok' ? 'var(--accent-soft-fg)' : 'var(--text-muted)',
                           marginTop: 4, lineHeight: 1.5,
                           opacity: verifyState === 'ok' ? 0.85 : 1 }}>
              {verifyState === 'ok' ? 'Tools advertised: accounts, balances, transactions, identity, cards, statements, investments.'
                : "We'll send a no-op ping to confirm the host can reach FinanceMCP."}
            </div>
            <div style={{ marginTop: 12 }}>
              <Button size="sm" variant={verifyState === 'ok' ? 'default' : 'primary'}
                      onClick={runVerify} disabled={verifyState === 'testing'}
                      icon={verifyState === 'testing' ? <span className="spinner"/> : <I.Refresh size={12}/>}>
                {verifyState === 'testing' ? 'Pinging…' : verifyState === 'ok' ? 'Ping again' : 'Run ping'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <Button variant="ghost" onClick={onBack} icon={<I.ArrowLeft size={14}/>}>
          Back to config
        </Button>
        <Button variant="primary" disabled={verifyState !== 'ok'} onClick={onDone}
                iconRight={<I.ArrowRight size={14}/>}>
          Looks good — connect a bank
        </Button>
      </div>
    </div>
  );
}

function MockChatVerify({ client, verified }) {
  const dark = ['cursor', 'openclaw', 'custom'].includes(client.id);
  return (
    <MockWindow title={client.name} theme={dark ? 'dark' : 'light'}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
                     minHeight: 280 }}>
        {/* Status pill */}
        <div style={{
          alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10.5, padding: '3px 8px', borderRadius: 999,
          background: verified ? 'oklch(0.95 0.04 155)' : (dark ? 'oklch(0.26 0.008 250)' : 'oklch(0.95 0.005 90)'),
          color: verified ? 'oklch(0.38 0.13 155)' : (dark ? 'oklch(0.72 0.007 90)' : 'oklch(0.45 0.008 90)'),
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%',
            background: verified ? 'oklch(0.55 0.16 145)' : 'currentColor' }}/>
          {verified ? 'finance-mcp · connected' : 'finance-mcp · pending'}
        </div>

        {/* User message */}
        <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
          <div style={{
            padding: '8px 12px', borderRadius: 12, borderTopRightRadius: 4,
            background: dark ? 'oklch(0.30 0.05 230)' : 'oklch(0.93 0.03 230)',
            color: dark ? 'oklch(0.92 0.005 90)' : 'oklch(0.2 0.05 230)',
            fontSize: 12, lineHeight: 1.5,
          }}>
            List the MCP tools available from finance-mcp
          </div>
        </div>

        {/* AI response */}
        <div style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
          <div style={{
            padding: '10px 12px', borderRadius: 12, borderTopLeftRadius: 4,
            background: dark ? 'oklch(0.18 0.005 250)' : 'oklch(0.97 0.005 90)',
            border: `1px solid ${dark ? 'oklch(0.30 0.008 250)' : 'oklch(0.91 0.006 90)'}`,
            fontSize: 12, lineHeight: 1.55,
          }}>
            {verified ? (
              <>
                <div style={{ marginBottom: 6 }}>
                  Connected to <strong>finance-mcp</strong>. Available tools:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {['accounts.list','balances.get','transactions.list','identity.get',
                    'cards.list','statements.list','investments.list'].map(t => (
                    <span key={t} className="mono" style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: dark ? 'oklch(0.26 0.008 250)' : 'oklch(0.94 0.006 90)',
                      color: dark ? 'oklch(0.82 0.005 90)' : 'oklch(0.45 0.008 90)',
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
                  No institutions connected yet — connect one in FinanceMCP to enable these.
                </div>
              </>
            ) : (
              <span style={{ opacity: 0.5 }}>(Run the ping to populate this response.)</span>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8,
          background: dark ? 'oklch(0.18 0.005 250)' : 'oklch(0.97 0.005 90)',
          border: `1px solid ${dark ? 'oklch(0.30 0.008 250)' : 'oklch(0.91 0.006 90)'}`,
        }}>
          <span style={{ fontSize: 11, opacity: 0.5 }}>Ask anything…</span>
          <div style={{ flex: 1 }}/>
          <div style={{ width: 22, height: 22, borderRadius: 5,
            background: dark ? 'oklch(0.30 0.008 250)' : 'oklch(0.91 0.006 90)' }}/>
        </div>
      </div>
    </MockWindow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — connect bank (uses ProviderWidget)
// ─────────────────────────────────────────────────────────────────────────────
function ConnectBankStep({ country, setCountry, inst, bankSearch, setBankSearch,
                            selectedBankId, setSelectedBankId,
                            setProviderOpen, setProviderStep, connectionInfo,
                            onBack, onDone }) {
  if (connectionInfo) {
    return (
      <div>
        <Pill variant="success" dot>4 of 4 · all set</Pill>
        <h1 style={{ marginTop: 14, marginBottom: 10 }}>You're set up</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginBottom: 24 }}>
          {connectionInfo.bank.name} is connected and your AI client can now query it.
        </p>
        <div className="card" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
          <BankLogo bank={connectionInfo.bank} size={42}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{connectionInfo.bank.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {connectionInfo.accounts} accounts · synced just now
            </div>
          </div>
          <Button variant="primary" onClick={onDone} iconRight={<I.ArrowRight size={14}/>}>
            Open dashboard
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Pill variant="info" dot>4 of 4 · connect bank</Pill>
      <h1 style={{ marginTop: 14, marginBottom: 10 }}>Connect your first bank</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14.5, lineHeight: 1.55, marginBottom: 18 }}>
        Now that your client is talking to FinanceMCP, grant it some bank data to query.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
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

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        maxHeight: 360, overflowY: 'auto',
      }}>
        {inst.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map(b => (
          <button key={b.id} onClick={() => {
            setSelectedBankId(b.id); setProviderStep('login'); setProviderOpen(true);
          }} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all .12s',
          }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
             onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <BankLogo bank={b} size={28}/>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {b.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
        <Button variant="ghost" onClick={onBack} icon={<I.ArrowLeft size={14}/>}>Back</Button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          Pick a bank to open its provider widget
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { WizardMcpFirst, MCP_CLIENTS });
