// Arisan Hi-Fi — shared UI primitives (clean fintech).
// Exports to window: Icon, Phone, AppBar, TabBar, Btn, Card, Pill, Avatar,
//   Field, OtpBoxes, Stat, Sheet, ListRow, SectionLabel, Segmented, Toast, AvatarStack.

// ---- Icon set: stroke-based, 24px grid, currentColor ----
const ICON_PATHS = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM22 19v-1a4 4 0 0 0-3-3.87M16 4.13A4 4 0 0 1 16 11.5',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  chevronRight: 'M9 18l6-6-6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronDown: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  swap: 'M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4',
  sparkles: 'M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM19 14l.8 2 .8.8 2 .8-.8.8-.8 2-2-.8-.8.8-2-.8.8-2-2-.8.8-.8.8-2Z',
  wallet: 'M19 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1m0-6V8a1 1 0 0 0-1-1m-2 6h.01M3 9V7a2 2 0 0 1 2-2h11',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  copy: 'M9 9h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  lock: 'M19 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2ZM7 11V7a5 5 0 0 1 10 0v4',
  bank: 'M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M12 3 2 9h20L12 3Z',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  x: 'M18 6 6 18M6 6l12 12',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14h1M14 20h1M20 20h1M18 18h3v3',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3Z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v5a6 6 0 0 1-12 0V4ZM9 21h6M12 15v6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  message: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 16v-4M12 8h.01',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01',
  grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
  dollar: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z',
};

function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8, style = {}, fill = 'none' }) {
  const d = ICON_PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}>
      {d && d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

// ---- Phone shell ----
function Phone({ children, dark = false }) {
  return (
    <div className="phone-shell" style={{
      width: 390, height: 844, borderRadius: 52,
      background: '#0E1B16',
      padding: 11,
      boxShadow: '0 50px 100px -20px rgba(14,27,22,0.45), 0 30px 60px -30px rgba(0,0,0,0.4)',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden',
        background: dark ? '#0E1B16' : 'var(--bg)', position: 'relative',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 116, height: 33, borderRadius: 20, background: '#0E1B16', zIndex: 50,
        }} />
        {children}
      </div>
    </div>
  );
}

// status bar
function StatusBar({ dark = false }) {
  const c = dark ? '#fff' : 'var(--ink)';
  return (
    <div style={{
      height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 30px 6px', flexShrink: 0, position: 'relative', zIndex: 40,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: c, letterSpacing: 0.3 }}>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke={c} strokeWidth="1.4"><path d="M1 4.5a11 11 0 0 1 15 0M3.5 7.2a7 7 0 0 1 10 0M6 9.8a3 3 0 0 1 5 0" strokeLinecap="round"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="21" height="12" rx="3.5" stroke={c} opacity="0.4"/><rect x="2" y="2" width="16" height="9" rx="2" fill={c}/><rect x="23" y="4" width="2" height="5" rx="1" fill={c} opacity="0.4"/></svg>
      </div>
    </div>
  );
}

// App bar (in-screen header)
function AppBar({ title, onBack, right, sub, large = false, dark = false }) {
  const c = dark ? '#fff' : 'var(--ink)';
  return (
    <div style={{
      padding: large ? '4px 22px 8px' : '4px 16px 10px', flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12, border: 'none',
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--surface)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="chevronLeft" size={22} color={c} strokeWidth={2.2} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: large ? 28 : 18, color: c, lineHeight: 1.1, letterSpacing: -0.4,
        }}>{title}</div>}
        {sub && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// Bottom tab bar
function TabBar({ active, onTab }) {
  const tabs = [
    { key: 'home', icon: 'home', label: 'Beranda' },
    { key: 'groups', icon: 'users', label: 'Grup' },
    { key: 'notif', icon: 'bell', label: 'Notifikasi' },
    { key: 'profil', icon: 'user', label: 'Profil' },
  ];
  return (
    <div style={{
      flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--bg)',
      padding: '8px 12px 28px', display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(t => {
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onTab && onTab(t.key)} style={{
            border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? 'var(--primary)' : 'var(--muted)', padding: '4px 10px',
            position: 'relative',
          }}>
            <Icon name={t.icon} size={24} strokeWidth={on ? 2.2 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, fontFamily: 'var(--font-body)' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Button
function Btn({ children, onClick, variant = 'primary', size = 'md', full, icon, iconRight, style = {}, disabled }) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13.5, gap: 6, radius: 12 },
    md: { padding: '13px 20px', fontSize: 15.5, gap: 8, radius: 15 },
    lg: { padding: '16px 22px', fontSize: 16.5, gap: 9, radius: 17 },
  };
  const s = sizes[size];
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none', boxShadow: '0 6px 16px -6px var(--primary-shadow)' },
    dark: { background: 'var(--ink)', color: '#fff', border: 'none', boxShadow: '0 6px 16px -8px rgba(14,27,22,0.5)' },
    soft: { background: 'var(--primary-tint)', color: 'var(--primary-ink)', border: 'none' },
    outline: { background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--primary-ink)', border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
      padding: s.padding, fontSize: s.fontSize, borderRadius: s.radius,
      fontFamily: 'var(--font-body)', fontWeight: 600, cursor: disabled ? 'default' : 'pointer',
      width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1,
      transition: 'transform .12s, box-shadow .12s', ...variants[variant], ...style,
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.975)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} color={variants[variant].color} strokeWidth={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 17 : 19} color={variants[variant].color} strokeWidth={2} />}
    </button>
  );
}

// Card
function Card({ children, style = {}, pad = 16, onClick, tint, accent }) {
  return (
    <div onClick={onClick} style={{
      background: tint ? 'var(--primary-tint)' : 'var(--card)',
      border: accent ? '1.5px solid var(--primary)' : '1px solid var(--border)',
      borderRadius: 'var(--card-radius, 20px)', padding: pad,
      boxShadow: tint ? 'none' : '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.05)',
      cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

// Pill / badge
function Pill({ children, tone = 'neutral', style = {}, dot }) {
  const tones = {
    neutral: { bg: 'var(--surface)', fg: 'var(--muted-strong)' },
    mint: { bg: 'var(--primary-tint)', fg: 'var(--primary-ink)' },
    solid: { bg: 'var(--primary)', fg: '#fff' },
    amber: { bg: 'var(--amber-tint)', fg: 'var(--amber-ink)' },
    danger: { bg: 'var(--danger-tint)', fg: 'var(--danger)' },
    dark: { bg: 'var(--ink)', fg: '#fff' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: t.bg, color: t.fg, borderRadius: 999,
      padding: '4px 10px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: t.fg }} />}
      {children}
    </span>
  );
}

// Avatar with deterministic color
const AV_COLORS = [
  ['#E8FAF4', '#00A87E'], ['#FFF1E6', '#E07B39'], ['#EEF2FF', '#5B6CF0'],
  ['#FDECF2', '#D6447E'], ['#ECFCF6', '#0F9B76'], ['#FFF6E0', '#C99400'],
  ['#EAF4FF', '#2D7FD6'], ['#F2EEFC', '#7B5AD6'],
];
function Avatar({ name = '?', size = 40, src, ring, mint }) {
  const initial = name.trim()[0]?.toUpperCase() || '?';
  const idx = (name.charCodeAt(0) || 0) % AV_COLORS.length;
  const [bg, fg] = mint ? ['var(--primary-tint)', 'var(--primary-ink)'] : AV_COLORS[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.4,
      flexShrink: 0, border: ring ? '2px solid var(--card)' : 'none',
      boxShadow: ring ? '0 0 0 1px var(--border)' : 'none',
    }}>{initial}</div>
  );
}

function AvatarStack({ names, size = 30, max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - max;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((n, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <Avatar name={n} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div style={{
          marginLeft: -size * 0.32, width: size, height: size, borderRadius: '50%',
          background: 'var(--ink)', color: '#fff', border: '2px solid var(--card)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.34,
        }}>+{extra}</div>
      )}
    </div>
  );
}

// Form field
function Field({ label, value, placeholder, prefix, icon, focused, style = {}, big }) {
  return (
    <div style={style}>
      {label && <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 7, letterSpacing: 0.1 }}>{label}</div>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: 'var(--card)', borderRadius: 14, padding: big ? '14px 16px' : '12px 14px',
        boxShadow: focused ? '0 0 0 4px var(--primary-ring)' : 'none', transition: 'box-shadow .15s, border-color .15s',
      }}>
        {icon && <Icon name={icon} size={19} color="var(--muted)" />}
        {prefix && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: big ? 18 : 15, color: 'var(--ink)' }}>{prefix}</span>}
        <span style={{
          flex: 1, fontFamily: 'var(--font-body)', fontSize: big ? 18 : 15,
          color: value ? 'var(--ink)' : 'var(--muted)', fontWeight: value ? 500 : 400,
        }}>{value || placeholder}</span>
        {focused && <span style={{ width: 2, height: big ? 22 : 18, background: 'var(--primary)', borderRadius: 1, animation: 'caret 1s steps(1) infinite' }} />}
      </div>
    </div>
  );
}

// OTP boxes
function OtpBoxes({ filled = 3, value = '472953' }) {
  return (
    <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between' }}>
      {[0,1,2,3,4,5].map(i => {
        const on = i < filled;
        const active = i === filled;
        return (
          <div key={i} style={{
            flex: 1, height: 58, borderRadius: 15,
            border: `1.5px solid ${on ? 'var(--primary)' : active ? 'var(--primary)' : 'var(--border-strong)'}`,
            background: on ? 'var(--primary-tint)' : 'var(--card)',
            boxShadow: active ? '0 0 0 4px var(--primary-ring)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--ink)',
          }}>
            {on ? value[i] : active ? <span style={{ width: 2, height: 24, background: 'var(--primary)', borderRadius: 1, animation: 'caret 1s steps(1) infinite' }} /> : ''}
          </div>
        );
      })}
    </div>
  );
}

// Generic list row
function ListRow({ icon, iconColor, title, sub, right, onClick, lastChild, leading }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 2px',
      borderBottom: lastChild ? 'none' : '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default',
    }}>
      {leading}
      {icon && (
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={icon} size={20} color={iconColor || 'var(--ink)'} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function SectionLabel({ children, right, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px', ...style }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', letterSpacing: 0.1 }}>{children}</span>
      {right}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 13, padding: 4, gap: 2 }}>
      {options.map(o => {
        const on = (o.key || o) === value;
        return (
          <button key={o.key || o} onClick={() => onChange && onChange(o.key || o)} style={{
            flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10, padding: '8px 6px',
            background: on ? 'var(--card)' : 'transparent', color: on ? 'var(--ink)' : 'var(--muted)',
            fontFamily: 'var(--font-body)', fontWeight: on ? 700 : 500, fontSize: 13,
            boxShadow: on ? '0 1px 3px rgba(16,24,40,0.1)' : 'none', transition: 'all .15s',
          }}>{o.label || o}</button>
        );
      })}
    </div>
  );
}

// Scroll body
function Body({ children, style = {}, pad = 22 }) {
  return (
    <div className="screen-body" style={{
      flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: `2px ${pad}px 18px`, ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  Icon, Phone, StatusBar, AppBar, TabBar, Btn, Card, Pill, Avatar, AvatarStack,
  Field, OtpBoxes, ListRow, SectionLabel, Segmented, Body,
});
