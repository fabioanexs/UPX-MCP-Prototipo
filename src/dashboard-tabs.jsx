// src/dashboard-tabs.jsx — five remaining dashboard tabs
// PAT · Scopes & Consent · Usage & Billing · Audit & Activity · Setup & Docs

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                  marginBottom: 12 }}>
      <div>
        <h3 style={{ fontSize: 14 }}>{title}</h3>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}

function ScopeChip({ id, sensitivity }) {
  const sensitive = sensitivity === 'sensitive';
  return (
    <span className="mono" style={{
      fontSize: 10.5, padding: '2px 6px', borderRadius: 4,
      background: sensitive ? 'var(--warning-soft)' : 'var(--surface-2)',
      color: sensitive ? 'oklch(0.45 0.14 75)' : 'var(--text-muted)',
      border: '1px solid ' + (sensitive ? 'transparent' : 'var(--border)'),
      letterSpacing: '.02em', whiteSpace: 'nowrap',
    }}>{id}</span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAT — Personal Access Tokens
// ─────────────────────────────────────────────────────────────────────────────
function PatTab() {
  const [tokens, setTokens] = React.useState(window.MOCK_DATA.tokens);
  const [creating, setCreating] = React.useState(false);
  const [freshToken, setFreshToken] = React.useState(null);

  const onCreated = (tok) => {
    setTokens([{ ...tok, status: 'active' }, ...tokens]);
    setFreshToken(tok);
    setCreating(false);
  };

  const revoke = (id) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, status: 'revoked' } : t));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionHeader
        title={`${tokens.filter(t=>t.status!=='revoked').length} active tokens`}
        subtitle="Bearer tokens used for server-to-server access. Bearer secrets are shown only once."
        right={<Button size="sm" icon={<I.Plus size={13}/>} onClick={() => setCreating(true)}>
                Generate token
              </Button>} />

      {/* Freshly-created token reveal */}
      {freshToken && (
        <div className="card" style={{
          padding: 16, background: 'var(--accent-soft)',
          borderColor: 'transparent',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <I.Key size={18} style={{ color: 'var(--accent-soft-fg)', marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--accent-soft-fg)' }}>
                Copy your token now — you won't see it again
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-soft-fg)', opacity: 0.85, marginTop: 2 }}>
                {freshToken.name} · expires {freshToken.expires}
              </div>
              <div style={{ marginTop: 12 }}>
                <CopyField value={`${freshToken.prefix}${'•'.repeat(8)}_${Math.random().toString(36).slice(2,14)}`} />
              </div>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={() => setFreshToken(null)}>
              <I.X size={14}/>
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 140 }}>Token</th>
              <th>Scopes</th>
              <th style={{ width: 110 }}>Last used</th>
              <th style={{ width: 110 }}>Expires</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(t => (
              <tr key={t.id} style={{ opacity: t.status === 'revoked' ? 0.55 : 1 }}>
                <td>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Created {t.created}
                  </div>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {t.prefix}_••••
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {t.scopes.slice(0,3).map(s => (
                      <span key={s} className="mono" style={{
                        fontSize: 10, padding: '2px 5px', borderRadius: 3,
                        background: 'var(--surface-2)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}>{s.replace('.read','')}</span>
                    ))}
                    {t.scopes.length > 3 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        +{t.scopes.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{t.lastUsed}</td>
                <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{t.expires}</td>
                <td>
                  {t.status === 'active'   && <Pill variant="success" dot>active</Pill>}
                  {t.status === 'unused'   && <Pill>unused</Pill>}
                  {t.status === 'expiring' && <Pill variant="warn" dot>expiring</Pill>}
                  {t.status === 'revoked'  && <Pill variant="danger" dot>revoked</Pill>}
                </td>
                <td>
                  <TokenRowMenu onRevoke={() => revoke(t.id)} disabled={t.status === 'revoked'}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security tip */}
      <div className="card" style={{
        padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12,
        background: 'var(--surface-2)', borderColor: 'transparent',
      }}>
        <I.Shield size={15} style={{ color: 'var(--text-muted)', marginTop: 2 }}/>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          PATs inherit the scopes you grant at creation — they cannot exceed your account's allowlist.
          Rotate at least every 90 days. Revoked tokens are rejected within 30 seconds.
        </div>
      </div>

      {creating && <CreateTokenModal onClose={() => setCreating(false)} onCreated={onCreated} />}
    </div>
  );
}

function TokenRowMenu({ onRevoke, disabled }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-icon btn-ghost"
              onClick={() => setOpen(!open)} disabled={disabled}>
        <I.MoreH size={14}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)}
               style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
          <div style={{
            position: 'absolute', right: 0, top: 30, zIndex: 41,
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 8, padding: 4, minWidth: 140,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <MenuItem icon={<I.Copy size={12}/>} label="Copy prefix"/>
            <MenuItem icon={<I.Refresh size={12}/>} label="Rotate"/>
            <MenuItem icon={<I.X size={12}/>} label="Revoke" danger
                      onClick={() => { onRevoke(); setOpen(false); }}/>
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ icon, label, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', fontSize: 12.5, border: 0, borderRadius: 5,
      background: 'transparent', cursor: 'pointer', textAlign: 'left',
      color: danger ? 'var(--danger)' : 'var(--text)',
    }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {icon} {label}
    </button>
  );
}

function CreateTokenModal({ onClose, onCreated }) {
  const [name, setName] = React.useState('');
  const [scopes, setScopes] = React.useState(['accounts.read','balances.read']);
  const [expiry, setExpiry] = React.useState('90');
  const allScopes = window.MOCK_DATA.scopeCatalog;
  const toggle = (s) => setScopes(scopes.includes(s) ? scopes.filter(x=>x!==s) : [...scopes, s]);
  const submit = () => {
    const days = parseInt(expiry, 10);
    const d = new Date(Date.now() + days * 86400000);
    onCreated({
      id: 'pat_' + Math.random().toString(36).slice(2,8),
      name: name || 'Untitled token',
      prefix: 'fmcp_' + Math.random().toString(36).slice(2,4),
      scopes, created: new Date().toISOString().slice(0,10),
      lastUsed: 'just now', expires: d.toISOString().slice(0,10),
    });
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, background: 'var(--surface)', borderRadius: 14,
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Generate personal access token</div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><I.X size={14}/></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Token name" value={name} onChange={setName}
                 placeholder="e.g. CI · finance-bot"/>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
              Scopes ({scopes.length}/{allScopes.length} selected)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6,
                          maxHeight: 220, overflowY: 'auto',
                          border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
              {allScopes.map(s => (
                <label key={s.id} style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '6px 8px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 12.5,
                }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <input type="checkbox" checked={scopes.includes(s.id)}
                         onChange={() => toggle(s.id)} style={{ accentColor: 'var(--accent)' }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: 11.5 }}>{s.id}</span>
                      {s.sensitivity === 'sensitive' && <Pill variant="warn">sensitive</Pill>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {s.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Field label="Expires in (days)" value={expiry} onChange={setExpiry} placeholder="90"/>
        </div>
        <div style={{
          padding: '12px 18px', borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" onClick={submit}
                  disabled={!name || scopes.length === 0}>
            Generate token
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <input className="input" type={type} value={value}
             onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scopes & Consent
// ─────────────────────────────────────────────────────────────────────────────
function ScopesTab() {
  const { mcpClients, scopeCatalog, connections } = window.MOCK_DATA;
  const [matrix, setMatrix] = React.useState(() => {
    // Initialize matrix from clients' scopes
    const m = {};
    mcpClients.forEach(c => {
      m[c.id] = {};
      scopeCatalog.forEach(s => { m[c.id][s.id] = c.scopes.includes(s.id); });
    });
    return m;
  });

  const toggle = (clientId, scopeId) => {
    setMatrix(m => ({ ...m, [clientId]: { ...m[clientId], [scopeId]: !m[clientId][scopeId] } }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Scope catalog */}
      <div>
        <SectionHeader title="Scope catalog"
                       subtitle="All available read-only scopes. Sensitive scopes require step-up authentication." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {scopeCatalog.map(s => {
            const grantedTo = mcpClients.filter(c => matrix[c.id][s.id]).length;
            return (
              <div key={s.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 11.5, fontWeight: 500 }}>{s.id}</span>
                  {s.sensitivity === 'sensitive' && <Pill variant="warn">sensitive</Pill>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)',
                              lineHeight: 1.45, marginBottom: 10, minHeight: 34 }}>
                  {s.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>Granted to</span>
                  <span style={{ color: grantedTo > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                    {grantedTo} / {mcpClients.length} clients
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions matrix */}
      <div>
        <SectionHeader title="Permissions matrix"
                       subtitle="Toggle which scopes each MCP client may use. Changes apply within 30 seconds."
                       right={<Button size="sm" variant="ghost" icon={<I.Refresh size={12}/>}>
                              Reset to defaults
                              </Button>} />
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Client</th>
                  {scopeCatalog.map(s => (
                    <th key={s.id} style={{ minWidth: 90 }}>
                      <span className="mono" style={{ fontSize: 10, textTransform: 'none', letterSpacing: 0,
                                                       fontWeight: 500 }}>
                        {s.id.replace('.read','')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mcpClients.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7,
                                      background: 'var(--surface-2)', color: 'var(--text-muted)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <I.Bot size={13}/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 12.5 }}>{c.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }} className="mono">
                            {c.host}
                          </div>
                        </div>
                      </div>
                    </td>
                    {scopeCatalog.map(s => (
                      <td key={s.id}>
                        <MatrixToggle on={matrix[c.id][s.id]}
                                      onChange={() => toggle(c.id, s.id)}/>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Institution access summary */}
      <div>
        <SectionHeader title="Institutional access"
                       subtitle="Which institutions each client may query. Set when authorizing the client." />
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Client</th>
                <th>Authorized institutions</th>
                <th style={{ width: 120 }}>Coverage</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {mcpClients.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.institutions.map(iid => {
                        const cn = connections.find(x => x.institutionId === iid);
                        return cn ? (
                          <span key={iid} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '3px 8px', borderRadius: 999,
                            background: 'var(--surface-2)', border: '1px solid var(--border)',
                            fontSize: 11.5,
                          }}>{cn.name}</span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {c.institutions.length} / {connections.length}
                  </td>
                  <td>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MatrixToggle({ on, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 30, height: 18, borderRadius: 999, border: 0, padding: 0,
      cursor: 'pointer', position: 'relative',
      background: on ? 'var(--accent)' : 'var(--surface-3)',
      transition: 'background .12s',
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 14 : 2,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        transition: 'left .15s',
      }}/>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Usage & Billing
// ─────────────────────────────────────────────────────────────────────────────
function UsageTab() {
  const { usage, byClient, byInstitution, plan, invoices } = window.MOCK_DATA;
  const pct = Math.round((usage.used / usage.limit) * 100);
  const projected = Math.round(usage.used / 13 * 30); // 13 days into month
  const projPct = Math.round((projected / usage.limit) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPIBig label="Calls used"           value={usage.used.toLocaleString()}
                sub={`${pct}% of plan`}     progress={pct} />
        <KPIBig label="Projected EOM"        value={projected.toLocaleString()}
                sub={`${projPct}% of plan`} progress={projPct}
                tone={projPct >= 100 ? 'warn' : null}/>
        <KPIBig label="Denied"               value={usage.deniedCalls.toLocaleString()}
                sub="≈1.4% of all calls" />
        <KPIBig label="Rate-limited"         value={usage.rateLimitedCalls.toLocaleString()}
                sub="Mostly Custom MCP host" tone="warn"/>
      </div>

      {/* Big chart */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>API calls — last 30 days</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              {usage.used.toLocaleString()}
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                of {usage.limit.toLocaleString()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Pill>30d</Pill>
            <Pill variant="info" dot>+18.4% vs prev</Pill>
          </div>
        </div>
        <BarChart data={usage.daily} height={180}/>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      marginTop: 10, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>Apr 13</span><span>Apr 22</span><span>May 1</span><span>May 13</span>
        </div>
      </div>

      {/* Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <BreakdownCard title="By client" rows={byClient.map(r => ({
          label: r.client, value: r.calls, share: r.share,
        }))}/>
        <BreakdownCard title="By institution" rows={byInstitution.map(r => ({
          label: r.inst, value: r.calls, share: r.share,
        }))}/>
      </div>

      {/* Plan + invoices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '.06em' }}>Current plan</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 500 }}>{plan.name}</span>
              <Pill variant="success" dot>active</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{plan.price}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>{plan.cycle}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12,
                        borderTop: '1px solid var(--border)' }}>
            <PlanRow label="API calls / month" value={plan.quotaCalls.toLocaleString()}/>
            <PlanRow label="MCP clients" value={plan.quotaClients}/>
            <PlanRow label="Institutions" value={plan.quotaInstitutions}/>
            <PlanRow label="Audit retention" value={`${plan.retentionDays} days`}/>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <Button size="sm" variant="primary" style={{ flex: 1, justifyContent: 'center' }}>
              Upgrade plan
            </Button>
            <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>
              Open billing
            </Button>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3>Recent invoices</h3>
            <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>
              All invoices
            </Button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th style={{ width: 110 }}>Due</th>
                <th style={{ width: 120 }}>Amount</th>
                <th style={{ width: 90 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{inv.id}</td>
                  <td>{inv.period}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{inv.due}</td>
                  <td style={{ fontWeight: 500 }}>{inv.amount}</td>
                  <td>
                    {inv.status === 'open' && <Pill variant="warn" dot>open</Pill>}
                    {inv.status === 'paid' && <Pill variant="success" dot>paid</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPIBig({ label, value, sub, progress, tone }) {
  const tonecolor = tone === 'warn' ? 'oklch(0.5 0.14 75)' : 'var(--text-muted)';
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: tonecolor, marginTop: 4 }}>{sub}</div>
      {progress !== undefined && (
        <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%',
                        background: progress >= 100 ? 'oklch(0.5 0.14 75)' : 'var(--accent)' }}/>
        </div>
      )}
    </div>
  );
}

function PlanRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function BreakdownCard({ title, rows }) {
  const max = Math.max(...rows.map(r => r.value));
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{r.label}</span>
              <span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.value.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11.5 }}>
                  {(r.share * 100).toFixed(1)}%
                </span>
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(r.value / max) * 100}%`, height: '100%',
                            background: 'var(--accent)', opacity: 0.85,
                            borderRadius: 3 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit & Activity
// ─────────────────────────────────────────────────────────────────────────────
function AuditTab() {
  const { auditEvents, mcpClients, connections } = window.MOCK_DATA;
  const [filters, setFilters] = React.useState({ client: 'all', decision: 'all', q: '' });
  const [expanded, setExpanded] = React.useState(null);

  const filtered = auditEvents.filter(e => {
    if (filters.client !== 'all' && e.client !== filters.client) return false;
    if (filters.decision !== 'all' && e.decision !== filters.decision) return false;
    if (filters.q && !`${e.tool} ${e.client} ${e.inst} ${e.scope}`.toLowerCase()
                       .includes(filters.q.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <AuditStat label="Events (24h)"  value="3,182"  spark={[20,22,24,28,32,30,35,40,42,38,45,52,48,55,60,58,62]}/>
        <AuditStat label="Allowed"       value="2,996"  tone="success" share="94.2%"/>
        <AuditStat label="Denied"        value="184"    tone="danger"  share="5.8%"/>
        <AuditStat label="Step-up"       value="42"     tone="warn"    share="1.3%"/>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <I.Search size={14} style={{
            position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-dim)',
          }}/>
          <input className="input" placeholder="Search tool, client, scope, institution…"
                 style={{ paddingLeft: 34, padding: '7px 10px 7px 34px', fontSize: 12.5 }}
                 value={filters.q} onChange={e => setFilters({...filters, q: e.target.value})}/>
        </div>
        <Select label="Client" value={filters.client}
                onChange={v => setFilters({...filters, client: v})}
                options={[{value:'all',label:'All clients'}, ...mcpClients.map(c => ({value:c.name,label:c.name}))]}/>
        <Select label="Decision" value={filters.decision}
                onChange={v => setFilters({...filters, decision: v})}
                options={[{value:'all',label:'All decisions'},
                          {value:'allowed',label:'Allowed'},
                          {value:'denied',label:'Denied'},
                          {value:'step_up',label:'Step-up'}]}/>
        <Button size="sm" variant="ghost" icon={<I.Refresh size={12}/>}>Live</Button>
        <Button size="sm" variant="ghost" icon={<I.ExternalLink size={12}/>}>Export</Button>
      </div>

      {/* Event table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 150 }}>Time</th>
              <th>Tool</th>
              <th>Client</th>
              <th>Institution</th>
              <th>Scope</th>
              <th style={{ width: 80 }}>Duration</th>
              <th style={{ width: 130 }}>Decision</th>
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <React.Fragment key={i}>
                <tr onClick={() => setExpanded(expanded === i ? null : i)}
                    style={{ cursor: 'pointer' }}>
                  <td className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {e.t.slice(11)}
                  </td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{e.tool}</td>
                  <td>{e.client}</td>
                  <td>{e.inst}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {e.scope}
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {e.dur > 0 ? `${e.dur}ms` : '—'}
                  </td>
                  <td>
                    {e.decision === 'allowed' && <Pill variant="success" dot>allowed</Pill>}
                    {e.decision === 'denied'  && <Pill variant="danger" dot>denied</Pill>}
                    {e.decision === 'step_up' && <Pill variant="warn" dot>step-up</Pill>}
                  </td>
                  <td>
                    <I.ChevronDown size={13} style={{
                      color: 'var(--text-dim)',
                      transform: expanded === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform .15s',
                    }}/>
                  </td>
                </tr>
                {expanded === i && (
                  <tr>
                    <td colSpan={8} style={{ background: 'var(--surface-2)', padding: 0 }}>
                      <EventDetail e={e}/>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No events match your filters.
          </div>
        )}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          <span>Showing {filtered.length} of {auditEvents.length} events</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button size="sm" variant="ghost" disabled>← Prev</Button>
            <Button size="sm" variant="ghost">Next →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditStat({ label, value, tone, share, spark }) {
  const c = { success: 'var(--accent)', danger: 'var(--danger)', warn: 'oklch(0.65 0.14 75)' }[tone];
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 500, color: c || 'var(--text)' }}>{value}</span>
        {share && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{share}</span>}
      </div>
      {spark && (
        <div style={{ marginTop: 6 }}>
          <Sparkline data={spark} height={28} color={c || 'var(--accent)'}/>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
            style={{
              padding: '7px 10px', fontSize: 12.5, borderRadius: 8,
              border: '1px solid var(--border-strong)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function EventDetail({ e }) {
  return (
    <div style={{ padding: '14px 18px 14px 18px',
                  borderTop: '1px dashed var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 12 }}>
        <DetailItem label="Timestamp" value={e.t}/>
        <DetailItem label="Request ID" value={`req_${Math.random().toString(36).slice(2,10)}`}/>
        <DetailItem label="Trace ID" value={`tr_${Math.random().toString(36).slice(2,12)}`}/>
        <DetailItem label="Origin IP" value={`${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.•••.•••`}/>
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
          Redacted summary
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)' }}>{e.summary}</div>
      </div>
      {e.reason && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 6,
          background: e.decision === 'denied' ? 'var(--danger-soft)' : 'var(--warning-soft)',
          color: e.decision === 'denied' ? 'var(--danger)' : 'oklch(0.45 0.14 75)',
          fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <I.Info size={12}/> Reason: <span className="mono">{e.reason}</span>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{label}</div>
      <div className="mono" style={{ fontSize: 12 }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup & Docs
// ─────────────────────────────────────────────────────────────────────────────
function DocsTab() {
  const [tab, setTab] = React.useState('claude');
  const [test, setTest] = React.useState('idle');
  const runTest = () => {
    setTest('testing');
    setTimeout(() => setTest('ok'), 1300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Health card */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          <HealthCol label="Runtime" status="healthy" detail="us-east · v4.12"/>
          <HealthCol label="Connections" status="ok" detail="4 active · 1 needs re-auth"/>
          <HealthCol label="Scopes" status="ok" detail="10 entitled"/>
          <HealthCol label="Avg latency" status="ok" detail="284ms · last hour"/>
        </div>
      </div>

      {/* Endpoints */}
      <div>
        <SectionHeader title="MCP endpoints"
                       subtitle="Use these URLs to connect any MCP-capable client."/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CopyField label="MCP server"    value="https://mcp.upx-example.com/mcp"/>
          <CopyField label="Authorization" value="https://mcp.upx-example.com/.well-known/oauth-protected-resource"/>
          <CopyField label="Discovery"     value="https://mcp.upx-example.com/.well-known/mcp-server"/>
          <CopyField label="OpenAPI"       value="https://mcp.upx-example.com/openapi.json"/>
        </div>
      </div>

      {/* Test connection */}
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <I.Activity size={18} style={{ color: 'var(--text-muted)' }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Test the connection</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Verifies the runtime, your scopes, and that at least one institution is reachable.
          </div>
        </div>
        {test === 'ok' && <Pill variant="success" dot>10 scopes · 1 connection · 284ms</Pill>}
        <Button onClick={runTest} disabled={test === 'testing'}
                icon={test === 'testing' ? <span className="spinner"/> : <I.Refresh size={13}/>}>
          {test === 'testing' ? 'Testing…' : test === 'ok' ? 'Run again' : 'Test connection'}
        </Button>
      </div>

      {/* Client configs */}
      <div>
        <SectionHeader title="Client configuration"
                       subtitle="Paste these into your AI client to enable FinanceMCP."/>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)', padding: '0 8px',
          }}>
            {[
              { id: 'claude', label: 'Claude Desktop' },
              { id: 'cursor', label: 'Cursor' },
              { id: 'http',   label: 'Raw HTTP' },
            ].map(o => (
              <button key={o.id} onClick={() => setTab(o.id)} style={{
                border: 0, background: 'transparent', padding: '12px 14px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: tab === o.id ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: '2px solid ' + (tab === o.id ? 'var(--accent)' : 'transparent'),
                marginBottom: -1,
              }}>{o.label}</button>
            ))}
          </div>
          <div style={{ padding: 18 }}>
            {tab === 'claude' && <>
              <ClientNote path="~/Library/Application Support/Claude/claude_desktop_config.json"/>
              <CodeBlockCopy code={EXAMPLE_CLAUDE_CONFIG}/>
            </>}
            {tab === 'cursor' && <>
              <ClientNote path="~/.cursor/mcp.json"/>
              <CodeBlockCopy code={EXAMPLE_CURSOR_CONFIG}/>
            </>}
            {tab === 'http' && <>
              <ClientNote text="OAuth 2.1 bearer flow. Exchange the discovery URL for token endpoints."/>
              <CodeBlockCopy code={`# Discover authorization endpoints
curl https://mcp.upx-example.com/.well-known/mcp-server

# Call a tool over MCP HTTP
curl https://mcp.upx-example.com/mcp \\
  -H "Authorization: Bearer fmcp_•••" \\
  -H "Content-Type: application/json" \\
  -d '{"method":"transactions.list","params":{"institution":"itau"}}'`}/>
            </>}
          </div>
        </div>
      </div>

      {/* Resource cards */}
      <div>
        <SectionHeader title="Resources"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <ResourceCard icon={<I.ScrollText size={18}/>}
                        title="MCP specification"
                        desc="Tools, transports, OAuth 2.1 flow."/>
          <ResourceCard icon={<I.Box size={18}/>}
                        title="Tool reference"
                        desc="Every read-only tool, schemas, examples."/>
          <ResourceCard icon={<I.Shield size={18}/>}
                        title="Security model"
                        desc="Step-up, audit redaction, retention."/>
        </div>
      </div>
    </div>
  );
}

function HealthCol({ label, status, detail }) {
  const ok = status === 'healthy' || status === 'ok';
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: ok ? 'var(--accent)' : 'var(--danger)',
          boxShadow: '0 0 0 3px ' + (ok ? 'var(--accent-soft)' : 'var(--danger-soft)'),
        }}/>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{status}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function ClientNote({ path, text }) {
  return (
    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
      {path ? <>Paste into <span className="mono" style={{ color: 'var(--text)' }}>{path}</span> then restart.</>
            : text}
    </div>
  );
}

function ResourceCard({ icon, title, desc }) {
  return (
    <a className="card" style={{
      padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
      cursor: 'pointer', textDecoration: 'none', color: 'inherit',
      transition: 'border-color .12s',
    }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
       onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <I.ExternalLink size={14} style={{ color: 'var(--text-dim)' }}/>
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
    </a>
  );
}

Object.assign(window, { PatTab, ScopesTab, UsageTab, AuditTab, DocsTab });
