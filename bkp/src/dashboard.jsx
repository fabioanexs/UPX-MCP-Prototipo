// src/dashboard.jsx — post-onboarding portal: Overview, Connections, MCP Clients

const TABS = [
  { id: 'overview',      label: 'Overview',                icon: <I.Home size={14}/> },
  { id: 'connections',   label: 'Institutions',            icon: <I.Building size={14}/> },
  { id: 'clients',       label: 'MCP Clients',             icon: <I.Bot size={14}/> },
  { id: 'pat',           label: 'Personal access tokens',  icon: <I.Key size={14}/> },
  { id: 'scopes',        label: 'Scopes & consent',        icon: <I.Shield size={14}/> },
  { id: 'usage',         label: 'Usage & billing',         icon: <I.Gauge size={14}/> },
  { id: 'audit',         label: 'Audit & activity',        icon: <I.ScrollText size={14}/> },
  { id: 'docs',          label: 'Setup & docs',            icon: <I.Wrench size={14}/> },
];

function Dashboard({ country, onBackToWizard }) {
  const [tab, setTab] = React.useState('overview');
  return (
    <div style={{ display: 'flex', minHeight: 760 }}>
      {/* Left nav */}
      <aside style={{
        width: 240, padding: '24px 14px', borderRight: '1px solid var(--border)',
        background: 'var(--surface-2)', flexShrink: 0,
      }}>
        <div style={{ padding: '0 6px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 6 }}>App</div>
          <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
                        display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3-9 4 18 3-9h4"/>
              </svg>
            </div>
            FinanceMCP
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {TABS.map(t => (
            <div key={t.id}
                 className={`nav-item ${tab === t.id ? 'active' : ''}`}
                 onClick={() => !t.locked && setTab(t.id)}
                 style={{ opacity: t.locked ? 0.55 : 1, cursor: t.locked ? 'not-allowed' : 'pointer' }}>
              {t.icon}
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.locked && <I.Lock size={11} style={{ color: 'var(--text-dim)' }} />}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, padding: '0 6px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em',
                        textTransform: 'uppercase', marginBottom: 8 }}>Status</div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Runtime</span>
              <Pill variant="success" dot>healthy</Pill>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Plan</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Standard</span>
            </div>
          </div>

          <button onClick={onBackToWizard} className="btn btn-ghost btn-sm"
                  style={{ marginTop: 14, width: '100%', justifyContent: 'flex-start' }}>
            <I.Wrench size={12}/> Re-run setup
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          padding: '20px 32px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Portal</span><I.Chevron size={11}/>
              <span>Apps</span><I.Chevron size={11}/>
              <span style={{ color: 'var(--text)' }}>FinanceMCP</span>
            </div>
            <h2 style={{ marginTop: 4 }}>
              {TABS.find(x => x.id === tab)?.label}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Pill variant="success" dot>Setup complete</Pill>
            <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>Open docs</Button>
            <Button size="sm" icon={<I.Plus size={13}/>}>Authorize new client</Button>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }} key={tab} className="fade-up">
          {tab === 'overview'    && <OverviewTab country={country} onTab={setTab} />}
          {tab === 'connections' && <ConnectionsTab country={country} />}
          {tab === 'clients'     && <ClientsTab />}
          {tab === 'pat'         && <PatTab />}
          {tab === 'scopes'      && <ScopesTab />}
          {tab === 'usage'       && <UsageTab />}
          {tab === 'audit'       && <AuditTab />}
          {tab === 'docs'        && <DocsTab />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ country, onTab }) {
  const { connections, mcpClients, usage } = window.MOCK_DATA;
  const activeClients = mcpClients.filter(c => c.status === 'active').length;
  const needsReauth = connections.filter(c => c.status === 'needs_reauth').length;
  const pct = Math.round((usage.used / usage.limit) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Alerts */}
      {needsReauth > 0 && (
        <div className="card" style={{
          padding: 14, display: 'flex', gap: 12, alignItems: 'center',
          background: 'var(--warning-soft)', borderColor: 'transparent',
        }}>
          <I.AlertTriangle size={16} style={{ color: 'oklch(0.5 0.14 75)' }}/>
          <div style={{ flex: 1, fontSize: 13 }}>
            <strong>{needsReauth} institution{needsReauth>1?'s':''} need re-authentication.</strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>
              Consent expires within 7 days — clients will start failing.
            </span>
          </div>
          <Button size="sm" onClick={() => onTab('connections')}>Review</Button>
        </div>
      )}

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPI label="Institutions"   value={connections.length}     sub={`${connections.filter(c=>c.status==='active').length} active`} />
        <KPI label="MCP clients"    value={activeClients}          sub={`${mcpClients.length - activeClients} paused / throttled`} />
        <KPI label="Calls (period)" value={usage.used.toLocaleString()} sub={`${pct}% of plan`} progress={pct} />
        <KPI label="Denied / RL"    value={(usage.deniedCalls + usage.rateLimitedCalls).toLocaleString()}
             sub={`${usage.rateLimitedCalls} rate-limited`} variant="warn" />
      </div>

      {/* Usage chart + plan info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>API calls — last 30 days</div>
              <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>
                {usage.used.toLocaleString()}
                <span style={{ fontSize: 12, color: 'var(--text-muted)',
                  fontWeight: 400, marginLeft: 8 }}>of {usage.limit.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Pill>30d</Pill>
              <Pill variant="info" dot>+18.4% vs prev</Pill>
            </div>
          </div>
          <BarChart data={usage.daily} height={140} />
          <div style={{ display: 'flex', justifyContent: 'space-between',
                        marginTop: 10, fontSize: 11, color: 'var(--text-dim)' }}>
            <span>Apr 13</span><span>Apr 28</span><span>May 13</span>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Quick actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            <QuickAction icon={<I.Building size={15}/>} title="Connect a new bank"
                        sub={`${window.MOCK_DATA.institutions[country].length} available in ${country}`}
                        onClick={() => onTab('connections')} />
            <QuickAction icon={<I.Bot size={15}/>} title="Authorize an AI client"
                        sub="Claude Desktop, Cursor, custom hosts" onClick={() => onTab('clients')} />
            <QuickAction icon={<I.Activity size={15}/>} title="Inspect recent activity"
                        sub="Last event 4s ago" disabled />
            <QuickAction icon={<I.Wrench size={15}/>} title="View MCP setup"
                        sub="Endpoint URLs & client configs" disabled />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <h3>Recent activity</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Live event stream from the MCP runtime
            </div>
          </div>
          <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>Full audit log</Button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Time</th>
              <th>Tool</th>
              <th>Client</th>
              <th>Institution</th>
              <th>Scope</th>
              <th style={{ width: 80 }}>Duration</th>
              <th style={{ width: 110 }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {window.MOCK_DATA.events.map((e, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.t}</td>
                <td className="mono" style={{ fontSize: 12.5 }}>{e.tool}</td>
                <td>{e.client}</td>
                <td>{e.inst}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.scope}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.dur}</td>
                <td>
                  {e.decision === 'allowed' && <Pill variant="success" dot>allowed</Pill>}
                  {e.decision === 'denied'  && <Pill variant="danger" dot>denied · {e.reason}</Pill>}
                  {e.decision === 'step_up' && <Pill variant="warn" dot>step-up</Pill>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, progress, variant }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: variant === 'warn' ? 'oklch(0.5 0.14 75)' : 'var(--text-muted)',
                    marginTop: 4 }}>{sub}</div>
      {progress !== undefined && (
        <div style={{
          height: 3, background: 'var(--surface-3)', borderRadius: 2, marginTop: 10, overflow: 'hidden',
        }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
      )}
    </div>
  );
}

function QuickAction({ icon, title, sub, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      borderRadius: 8, background: 'transparent', border: '1px solid var(--border)',
      cursor: disabled ? 'default' : 'pointer', textAlign: 'left',
      color: 'var(--text)', opacity: disabled ? 0.55 : 1, transition: 'background .12s',
    }} onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'var(--surface-2)')}
       onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)',
        color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
      </div>
      <I.Chevron size={13} style={{ color: 'var(--text-dim)' }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Connections tab
// ─────────────────────────────────────────────────────────────────────────────
function ConnectionsTab({ country }) {
  const conns = window.MOCK_DATA.connections;
  const lookup = (id) => {
    const all = [...(window.MOCK_DATA.institutions.BR || []), ...(window.MOCK_DATA.institutions.US || [])];
    return all.find(b => b.id === id);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {conns.length} connected institutions · {conns.reduce((s,c)=>s+c.accounts,0)} accounts total
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="ghost" icon={<I.Refresh size={12}/>}>Sync all</Button>
          <Button size="sm" icon={<I.Plus size={13}/>}>Connect institution</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {conns.map(c => {
          const bank = lookup(c.institutionId) || { name: c.name, color: '#666', short: '?' };
          return <ConnectionCard key={c.id} c={c} bank={bank} />;
        })}
      </div>
    </div>
  );
}

function ConnectionCard({ c, bank }) {
  const statusMeta = {
    active:       { pill: 'success', label: 'active' },
    syncing:      { pill: 'info', label: 'syncing' },
    needs_reauth: { pill: 'warn', label: 'needs re-auth' },
  }[c.status];
  const syncLabel = c.lastSyncMin === 0 ? 'now'
                  : c.lastSyncMin < 60 ? `${c.lastSyncMin}m ago`
                  : c.lastSyncMin < 1440 ? `${Math.round(c.lastSyncMin/60)}h ago`
                  : `${Math.round(c.lastSyncMin/1440)}d ago`;
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <BankLogo bank={bank} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{c.label}</span>
            <Pill variant={statusMeta.pill} dot>{statusMeta.label}</Pill>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {c.name} · {c.region}
          </div>
        </div>
        <button className="btn btn-icon btn-ghost"><I.MoreH size={14}/></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <Stat label="Accounts" value={c.accounts}/>
        <Stat label="Last sync" value={syncLabel}/>
        <Stat label="Consent" value={`${c.consentExpiresDays}d`}
              tone={c.consentExpiresDays < 14 ? 'warn' : null}/>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {c.categories.map(cat => (
          <span key={cat} className="mono" style={{
            fontSize: 10.5, padding: '3px 7px', borderRadius: 4,
            background: 'var(--surface-2)', color: 'var(--text-muted)',
            border: '1px solid var(--border)', letterSpacing: '.04em',
          }}>{cat}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 6,
                    borderTop: '1px dashed var(--border)' }}>
        {c.status === 'needs_reauth' ? (
          <Button size="sm" variant="primary" icon={<I.Refresh size={12}/>}>Reconnect</Button>
        ) : (
          <Button size="sm" variant="ghost" icon={<I.Refresh size={12}/>}>Reconnect</Button>
        )}
        <Button size="sm" variant="ghost">Disconnect</Button>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" icon={<I.AlertTriangle size={12}/>}>Request deletion</Button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, marginTop: 3,
                    color: tone === 'warn' ? 'oklch(0.5 0.14 75)' : 'var(--text)' }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP Clients tab
// ─────────────────────────────────────────────────────────────────────────────
function ClientsTab() {
  const clients = window.MOCK_DATA.mcpClients;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {clients.length} authorized clients · {clients.reduce((s,c) => s + c.calls24h, 0).toLocaleString()} calls in last 24h
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" variant="ghost" icon={<I.ScrollText size={12}/>}>Policy</Button>
          <Button size="sm" icon={<I.Plus size={13}/>}>Authorize client</Button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 130 }}>Calls (24h)</th>
              <th style={{ width: 130 }}>Trend</th>
              <th style={{ width: 110 }}>Scopes</th>
              <th style={{ width: 110 }}>Last used</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <ClientRow key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invite slot */}
      <div className="card" style={{
        padding: 18, display: 'flex', alignItems: 'center', gap: 14,
        borderStyle: 'dashed', background: 'transparent',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><I.Plus size={16}/></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Authorize a new MCP client</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Generate a one-time authorization link — the client redeems it inside their MCP host.
          </div>
        </div>
        <Button size="sm" variant="primary">Generate link</Button>
      </div>
    </div>
  );
}

function ClientRow({ c }) {
  const statusMeta = {
    active:       { pill: 'success', label: 'active' },
    paused:       { pill: 'info',    label: 'paused' },
    rate_limited: { pill: 'warn',    label: 'throttled' },
  }[c.status];
  // pseudo trend data
  const trend = Array.from({ length: 20 }, (_, i) =>
    Math.max(2, Math.round(50 + 40 * Math.sin(i * 0.6 + c.id.length) + Math.random() * 30)));
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <I.Bot size={15}/>
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="mono">{c.host}</div>
          </div>
        </div>
      </td>
      <td><Pill variant={statusMeta.pill} dot>{statusMeta.label}</Pill></td>
      <td>
        <div style={{ fontWeight: 500 }}>{c.calls24h.toLocaleString()}</div>
        {c.rateLimitState === 'throttled' && (
          <div style={{ fontSize: 11, color: 'oklch(0.5 0.14 75)' }}>rate-limited</div>
        )}
      </td>
      <td><div style={{ width: 110 }}><Sparkline data={trend} height={36} color="var(--accent)"/></div></td>
      <td>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {c.scopes.slice(0, 2).map(s => (
            <span key={s} className="mono" style={{
              fontSize: 10, padding: '2px 5px', borderRadius: 3,
              background: 'var(--surface-2)', color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>{s.replace('.read','')}</span>
          ))}
          {c.scopes.length > 2 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{c.scopes.length - 2}</span>
          )}
        </div>
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{c.lastUsed}</td>
      <td>
        <button className="btn btn-icon btn-ghost"><I.MoreH size={14}/></button>
      </td>
    </tr>
  );
}

Object.assign(window, { Dashboard });
