// src/ui.jsx — shared UI primitives & icons

// ─────────────────────────────────────────────────────────────────────────────
// Inline SVG icons (1-stroke, currentColor)
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, fill = 'none', stroke = 'currentColor', strokeWidth = 1.6, viewBox = '0 0 24 24', children, style }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    {d && <path d={d} />}
    {children}
  </svg>
);

const I = {
  Check:    (p) => <Icon {...p} d="M4 12l5 5L20 6" />,
  Chevron:  (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
  ChevronDown: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  ChevronLeft: (p) => <Icon {...p} d="M15 6l-6 6 6 6" />,
  X:        (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />,
  Plus:     (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  Search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  Lock:     (p) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>,
  Shield:   (p) => <Icon {...p} d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" />,
  Eye:      (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Copy:     (p) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></Icon>,
  ExternalLink: (p) => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></Icon>,
  Refresh:  (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
  AlertTriangle: (p) => <Icon {...p}><path d="M10.3 3.7 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></Icon>,
  Info:     (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></Icon>,
  Building: (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h6M10 21v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/></Icon>,
  Plug:     (p) => <Icon {...p}><path d="M9 2v6M15 2v6M5 8h14v3a7 7 0 0 1-14 0V8zM12 18v3"/></Icon>,
  Activity: (p) => <Icon {...p} d="M3 12h4l3-9 4 18 3-9h4" />,
  Bot:      (p) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M12 3v4M8 12v2M16 12v2"/></Icon>,
  Key:      (p) => <Icon {...p}><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9 1 3 3 1-3 3 1 3-3-3"/></Icon>,
  Gauge:    (p) => <Icon {...p}><path d="M12 14l4-4"/><circle cx="12" cy="14" r="8"/><path d="M12 6V3M5.6 8.6 3.5 6.5M18.4 8.6l2.1-2.1"/></Icon>,
  ScrollText: (p) => <Icon {...p}><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-4 0V5a2 2 0 0 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5M15 12h-5"/></Icon>,
  Wrench:   (p) => <Icon {...p} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z" />,
  Home:     (p) => <Icon {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7H8v7H5a2 2 0 0 1-2-2v-9z"/></Icon>,
  Box:      (p) => <Icon {...p}><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7l8.7 5 8.7-5M12 22V12"/></Icon>,
  ArrowRight: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6" />,
  ArrowLeft: (p) => <Icon {...p} d="M19 12H5M11 6l-6 6 6 6" />,
  CreditCard: (p) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Icon>,
  MoreH: (p) => <Icon {...p}><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></Icon>,
  Clock: (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Small UI primitives
// ─────────────────────────────────────────────────────────────────────────────
function Button({ children, variant = 'default', size, icon, iconRight, className = '', ...rest }) {
  const cls = ['btn',
    variant === 'primary' && 'btn-primary',
    variant === 'ghost' && 'btn-ghost',
    size === 'sm' && 'btn-sm',
    className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

function Pill({ children, variant, className = '', dot = false }) {
  const cls = ['pill',
    variant === 'success' && 'pill-success',
    variant === 'warn' && 'pill-warn',
    variant === 'danger' && 'pill-danger',
    variant === 'info' && 'pill-info',
    className].filter(Boolean).join(' ');
  return <span className={cls}>{dot && <span className="dot" />}{children}</span>;
}

// Bank logo "tile" — round, filled bg, monogram (color from data)
function BankLogo({ bank, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: bank.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.36, letterSpacing: '-0.02em',
      flexShrink: 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset',
    }}>{bank.short}</div>
  );
}

// Copy-to-clipboard helper
function CopyField({ value, monospace = true, label }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    try { navigator.clipboard.writeText(value); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      border: '1px solid var(--border-strong)', borderRadius: 10,
      background: 'var(--surface)', overflow: 'hidden',
    }}>
      {label && (
        <div style={{
          padding: '0 12px', fontSize: 11, color: 'var(--text-muted)',
          borderRight: '1px solid var(--border)', alignSelf: 'stretch',
          display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '.06em',
          background: 'var(--surface-2)', flexShrink: 0,
        }}>{label}</div>
      )}
      <div style={{
        flex: 1, padding: '10px 12px', fontFamily: monospace ? 'var(--mono)' : 'inherit',
        fontSize: 12.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{value}</div>
      <button onClick={onCopy} className="btn btn-ghost btn-sm" style={{
        borderRadius: 0, padding: '0 12px', height: '100%', alignSelf: 'stretch',
        borderLeft: '1px solid var(--border)', color: copied ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: 11,
      }}>
        {copied ? <><I.Check size={13} /> Copied</> : <><I.Copy size={13} /> Copy</>}
      </button>
    </div>
  );
}

// Sparkline
function Sparkline({ data, height = 60, color = 'var(--accent)', fill = true }) {
  const w = 100; const h = height;
  const max = Math.max(...data); const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(' ');
  const area = `${path} L${w} ${h} L0 ${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height }}>
      {fill && (
        <>
          <defs>
            <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={color} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d={area} fill="url(#spark-grad)" stroke="none" />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Vertical bar chart
function BarChart({ data, height = 140, color = 'var(--accent)' }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, width: '100%' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`,
          background: color, opacity: 0.85,
          borderRadius: 2, minHeight: 2,
        }} title={`${v.toLocaleString()} calls`} />
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, I, Button, Pill, BankLogo, CopyField, Sparkline, BarChart,
});
