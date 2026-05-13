// src/app.jsx — root: browser chrome + view router + tweaks

const ACCENT_PRESETS = {
  emerald: { hue: 155, name: 'Emerald' },
  indigo:  { hue: 270, name: 'Indigo' },
  amber:   { hue: 65,  name: 'Amber' },
  slate:   { hue: 245, name: 'Slate', chroma: 0.04 },
  rose:    { hue: 15,  name: 'Rose' },
};

function applyAccent(name, isDark) {
  const p = ACCENT_PRESETS[name] || ACCENT_PRESETS.emerald;
  const c = p.chroma ?? 0.13;
  const root = document.documentElement;
  root.style.setProperty('--accent', `oklch(0.58 ${c} ${p.hue})`);
  root.style.setProperty('--accent-soft', isDark
    ? `oklch(0.28 ${c * 0.55} ${p.hue})`
    : `oklch(0.95 ${c * 0.32} ${p.hue})`);
  root.style.setProperty('--accent-soft-fg', isDark
    ? `oklch(0.82 ${c} ${p.hue})`
    : `oklch(0.38 ${c} ${p.hue})`);
  root.style.setProperty('--accent-hue', p.hue);
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const isDark = t.theme === 'dark';

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    applyAccent(t.accent, isDark);
  }, [t.theme, t.accent]);

  const [view, setView] = React.useState(t.view || 'wizard');
  React.useEffect(() => { setView(t.view); }, [t.view]);

  const flow = t.flow || 'compact';

  const [wizardStep, setWizardStep] = React.useState(t.wizardStep || 0);
  React.useEffect(() => { setWizardStep(t.wizardStep || 0); }, [t.wizardStep]);

  const setStep = (i) => { setWizardStep(i); setTweak('wizardStep', i); };
  const setView_ = (v) => { setView(v); setTweak('view', v); };

  const url = view === 'wizard'
    ? `portal.example.com/portal/apps/finance-mcp/setup`
    : `portal.example.com/portal/apps/finance-mcp`;

  return (
    <>
      <ChromeWindow
        tabs={[{ title: 'FinanceMCP — Portal' }, { title: 'Claude' }]}
        activeIndex={0}
        url={url}
        width="100%"
        height={900}
      >
        <div className="pl-app" style={{ position: 'relative' }}>
          {/* Top mini-bar: dev-style view switcher */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 20,
            background: 'var(--bg)', borderBottom: '1px solid var(--border)',
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <ViewSwitch view={view} setView={setView_} />
            {view === 'wizard' && flow === 'full' && (
              <StepJumper step={wizardStep} setStep={setStep} />
            )}
            {view === 'wizard' && (
              <FlowSwitch flow={flow} setFlow={(v) => setTweak('flow', v)} />
            )}
            <div style={{ flex: 1 }} />
            <ThemeToggleMini theme={t.theme} setTheme={(v) => setTweak('theme', v)} />
          </div>

          {view === 'wizard' && flow === 'full' && (
            <Wizard
              country={t.country}
              setCountry={(c) => setTweak('country', c)}
              step={wizardStep}
              setStep={setStep}
              onComplete={() => setView_('dashboard')}
            />
          )}
          {view === 'wizard' && flow === 'compact' && (
            <WizardCompact
              country={t.country}
              setCountry={(c) => setTweak('country', c)}
              onComplete={() => setView_('dashboard')}
            />
          )}
          {view === 'wizard' && flow === 'mcp_first' && (
            <WizardMcpFirst
              country={t.country}
              setCountry={(c) => setTweak('country', c)}
              onComplete={() => setView_('dashboard')}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard
              country={t.country}
              onBackToWizard={() => { setStep(0); setView_('wizard'); }}
            />
          )}
        </div>
      </ChromeWindow>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={t.theme}
                    options={[{label:'Light', value:'light'}, {label:'Dark', value:'dark'}]}
                    onChange={(v) => setTweak('theme', v)} />
        <AccentPicker value={t.accent} onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="State" />
        <TweakRadio label="View" value={view}
                    options={[{label:'Wizard', value:'wizard'}, {label:'Dashboard', value:'dashboard'}]}
                    onChange={(v) => setView_(v)} />
        <TweakRadio label="Flow" value={flow}
                    options={[{label:'Full', value:'full'},
                              {label:'Compact', value:'compact'},
                              {label:'MCP-first', value:'mcp_first'}]}
                    onChange={(v) => setTweak('flow', v)} />
        <TweakRadio label="Country" value={t.country}
                    options={[{label:'BR', value:'BR'}, {label:'US', value:'US'}]}
                    onChange={(v) => setTweak('country', v)} />
        {view === 'wizard' && flow === 'full' && (
          <TweakSelect label="Wizard step" value={wizardStep}
                       options={WIZARD_STEPS.map((s, i) => ({
                         value: i, label: `${i+1}. ${s.short}`,
                       }))}
                       onChange={(v) => setStep(Number(v))} />
        )}
      </TweaksPanel>
    </>
  );
}

// Custom accent picker — colored swatches that store the preset name
function AccentPicker({ value, onChange }) {
  return (
    <TweakRow label="Accent">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Object.entries(ACCENT_PRESETS).map(([k, p]) => {
          const color = `oklch(0.58 ${p.chroma ?? 0.13} ${p.hue})`;
          const on = value === k;
          return (
            <button key={k} title={p.name} onClick={() => onChange(k)}
              style={{
                width: 24, height: 24, borderRadius: 7, border: 0,
                background: color, cursor: 'pointer', padding: 0,
                outline: on ? '2px solid rgba(41,38,27,.4)' : 'none',
                outlineOffset: 2,
                position: 'relative',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
              }}>
              {on && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white"
                     strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                     style={{ position: 'absolute', inset: 0, margin: 'auto' }}>
                  <path d="M4 12l5 5L20 6"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function ViewSwitch({ view, setView }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--surface-2)',
      border: '1px solid var(--border)', borderRadius: 8, padding: 2,
    }}>
      {[
        { id: 'wizard',    label: 'Onboarding',  icon: <I.Wrench size={11}/> },
        { id: 'dashboard', label: 'Dashboard',   icon: <I.Home   size={11}/> },
      ].map(opt => (
        <button key={opt.id} onClick={() => setView(opt.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', fontSize: 11.5, fontWeight: 500,
            border: 0, borderRadius: 6, cursor: 'pointer',
            background: view === opt.id ? 'var(--surface)' : 'transparent',
            color: view === opt.id ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: view === opt.id ? 'var(--shadow-sm)' : 'none',
          }}>
          {opt.icon}{opt.label}
        </button>
      ))}
    </div>
  );
}

function StepJumper({ step, setStep }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 2,
    }}>
      {WIZARD_STEPS.map((s, i) => (
        <button key={s.id} onClick={() => setStep(i)}
                title={s.title}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px', fontSize: 11, fontWeight: 500,
                  border: 0, borderRadius: 5, cursor: 'pointer',
                  background: i === step ? 'var(--surface)' : 'transparent',
                  color: i === step ? 'var(--text)'
                    : i < step ? 'var(--text-muted)' : 'var(--text-dim)',
                  boxShadow: i === step ? 'var(--shadow-sm)' : 'none',
                }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 14, height: 14, borderRadius: '50%',
            fontSize: 9, fontWeight: 600,
            background: i < step ? 'var(--accent)' : i === step ? 'var(--text)' : 'transparent',
            color: i < step ? 'var(--accent-fg)' : i === step ? 'var(--bg)' : 'inherit',
            border: i > step ? '1px solid var(--border-strong)' : 'none',
          }}>
            {i < step ? <I.Check size={8} strokeWidth={3.4}/> : i + 1}
          </span>
          <span style={{ display: i === step ? 'inline' : 'none' }}>{s.short}</span>
        </button>
      ))}
    </div>
  );
}

function FlowSwitch({ flow, setFlow }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--surface-2)',
      border: '1px solid var(--border)', borderRadius: 8, padding: 2,
    }}>
      {[
        { id: 'full',      label: 'Full (6)' },
        { id: 'compact',   label: 'Compact (3)' },
        { id: 'mcp_first', label: 'MCP-first (4)' },
      ].map(opt => (
        <button key={opt.id} onClick={() => setFlow(opt.id)}
          style={{
            padding: '5px 10px', fontSize: 11.5, fontWeight: 500,
            border: 0, borderRadius: 6, cursor: 'pointer',
            background: flow === opt.id ? 'var(--surface)' : 'transparent',
            color: flow === opt.id ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: flow === opt.id ? 'var(--shadow-sm)' : 'none',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ThemeToggleMini({ theme, setTheme }) {
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-sm btn-ghost"
            style={{ padding: '4px 8px', fontSize: 11 }}>
      {theme === 'dark' ? '◐ Dark' : '◑ Light'}
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
