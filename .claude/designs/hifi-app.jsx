// Arisan Hi-Fi — App shell: router, flow-map, tweaks

const SCREENS = {
  welcome: ScreenWelcome, phone: ScreenPhone, otp: ScreenOtp,
  join: ScreenJoin, 'join-confirm': ScreenJoinConfirm, 'join-done': ScreenJoinDone,
  home: ScreenHome, groups: ScreenGroups, notif: ScreenNotif, profil: ScreenProfil,
  group: ScreenGroup, chat: ScreenChat,
  create1: ScreenCreate1, create2: ScreenCreate2, create3: ScreenCreate3, invite: ScreenInvite,
  'undian-pre': ScreenUndianPre, 'undian-result': ScreenUndianResult,
  bayar: ScreenBayar, 'bayar-done': ScreenBayarDone,
  tukar: ScreenTukar, 'tukar-status': ScreenTukarStatus,
  // states
  'otp-loading': ScreenOtpLoading, 'undian-loading': ScreenUndianLoading, 'bayar-loading': ScreenBayarLoading,
  'home-loading': ScreenHomeLoading, 'home-empty': ScreenHomeEmpty, 'notif-empty': ScreenNotifEmpty,
  'chat-empty': ScreenChatEmpty, 'otp-error': ScreenOtpError, 'conn-error': ScreenConnError, 'undian-error': ScreenUndianError,
};

const TAB_ROOTS = ['home', 'groups', 'notif', 'profil'];

const FLOW_MAP = [
  { group: 'Onboarding', items: [['welcome', 'Welcome'], ['phone', 'Input nomor'], ['otp', 'Verifikasi OTP']] },
  { group: 'Utama', items: [['home', 'Beranda'], ['groups', 'Daftar grup'], ['notif', 'Notifikasi'], ['profil', 'Profil']] },
  { group: 'Detail grup', items: [['group', 'Detail grup'], ['chat', 'Chat grup']] },
  { group: 'Buat grup', items: [['create1', '1 · Nama'], ['create2', '2 · Nominal'], ['create3', '3 · Mode undian'], ['invite', 'Invite anggota']] },
  { group: 'Gabung (anggota)', items: [['join', 'Input kode'], ['join-confirm', 'Konfirmasi'], ['join-done', 'Berhasil']] },
  { group: 'Undian', items: [['undian-pre', 'Sebelum mulai'], ['undian-result', 'Pemenang 🎉']] },
  { group: 'Konfirmasi bayar', items: [['bayar', 'Pilih & batch'], ['bayar-done', 'Berhasil']] },
  { group: 'Tukar giliran', items: [['tukar', 'Timeline'], ['tukar-status', 'Status 3-step']] },
  { group: 'Loading', items: [['home-loading', 'Beranda (skeleton)'], ['otp-loading', 'Verifikasi OTP'], ['undian-loading', 'Mengundi…'], ['bayar-loading', 'Konfirmasi bayar']] },
  { group: 'Empty', items: [['home-empty', 'Beranda kosong'], ['notif-empty', 'Notifikasi kosong'], ['chat-empty', 'Chat kosong']] },
  { group: 'Error', items: [['otp-error', 'OTP salah'], ['conn-error', 'Koneksi gagal'], ['undian-error', 'Undian gagal']] },
];

// Accent palettes
const ACCENTS = {
  Mint:   { primary: '#00C897', deep: '#00A87E', ink: '#047857', tint: '#E6FAF4', ring: 'rgba(0,200,151,0.18)', shadow: 'rgba(0,168,126,0.55)' },
  Teal:   { primary: '#0EA5A5', deep: '#0E8F8F', ink: '#0F766E', tint: '#E2F7F6', ring: 'rgba(14,165,165,0.18)', shadow: 'rgba(14,143,143,0.55)' },
  Indigo: { primary: '#5B6CF0', deep: '#4754D6', ink: '#4338CA', tint: '#EBEDFE', ring: 'rgba(91,108,240,0.18)', shadow: 'rgba(71,84,214,0.5)' },
  Coral:  { primary: '#FB6F5C', deep: '#E85844', ink: '#C2402E', tint: '#FFEDE9', ring: 'rgba(251,111,92,0.18)', shadow: 'rgba(232,88,68,0.5)' },
};

const FONTS = {
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Sora': "'Sora', sans-serif",
  'Bricolage': "'Bricolage Grotesque', sans-serif",
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Mint",
  "displayFont": "Space Grotesk",
  "cardRadius": 20,
  "showFlowMap": true,
  "deviceShadow": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stack, setStack] = React.useState(() => {
    const saved = localStorage.getItem('arisan-stack');
    try { const a = JSON.parse(saved); if (Array.isArray(a) && a.length) return a; } catch (e) {}
    return ['welcome'];
  });

  React.useEffect(() => { localStorage.setItem('arisan-stack', JSON.stringify(stack)); }, [stack]);

  const cur = stack[stack.length - 1];
  const go = React.useCallback((key) => {
    if (!SCREENS[key]) return;
    if (TAB_ROOTS.includes(key)) setStack([key]);
    else setStack(s => (s[s.length - 1] === key ? s : [...s, key]));
  }, []);
  const back = React.useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = React.useCallback((key) => setStack(s => [...s.slice(0, -1), key]), []);
  const onTab = React.useCallback((key) => setStack([key]), []);
  const jump = React.useCallback((key) => setStack([key]), []);

  const Screen = SCREENS[cur] || ScreenHome;

  const acc = ACCENTS[t.accent] || ACCENTS.Mint;
  const rootVars = {
    '--bg': '#FFFFFF',
    '--card': '#FFFFFF',
    '--surface': '#F4F6F5',
    '--border': '#ECEFEE',
    '--border-strong': '#DDE3E1',
    '--ink': '#0E1B16',
    '--muted': '#7A8B84',
    '--muted-strong': '#566159',
    '--primary': acc.primary,
    '--primary-deep': acc.deep,
    '--primary-ink': acc.ink,
    '--primary-tint': acc.tint,
    '--primary-ring': acc.ring,
    '--primary-shadow': acc.shadow,
    '--amber': '#F5A524',
    '--amber-tint': '#FFF4E0',
    '--amber-ink': '#B57400',
    '--danger': '#EF5B52',
    '--danger-tint': '#FEECEB',
    '--font-display': FONTS[t.displayFont] || FONTS['Space Grotesk'],
    '--font-body': "'Plus Jakarta Sans', sans-serif",
    '--card-radius': t.cardRadius + 'px',
  };

  return (
    <div style={{
      ...rootVars,
      minHeight: '100vh', width: '100%',
      background: 'radial-gradient(circle at 30% 20%, #F0F4F2 0%, #E7ECEA 60%, #E2E8E5 100%)',
      display: 'flex', alignItems: 'stretch',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Flow map */}
      {t.showFlowMap && (
        <div style={{
          width: 240, flexShrink: 0, height: '100vh', overflowY: 'auto', position: 'sticky', top: 0,
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(14,27,22,0.08)', padding: '24px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: acc.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trophy" size={17} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: FONTS[t.displayFont], fontWeight: 600, fontSize: 17, color: '#0E1B16' }}>Arisan</span>
          </div>
          <div style={{ fontSize: 11.5, color: '#7A8B84', marginBottom: 18, paddingLeft: 1 }}>Hi-fi prototype · klik untuk lompat</div>
          {FLOW_MAP.map((sec, si) => (
            <div key={si} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9AA8A2', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6, paddingLeft: 10 }}>{sec.group}</div>
              {sec.items.map(([key, label]) => {
                const on = cur === key;
                return (
                  <button key={key} onClick={() => jump(key)} style={{
                    display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: on ? acc.tint : 'transparent', color: on ? acc.ink : '#566159',
                    borderRadius: 9, padding: '7px 10px', fontSize: 13, fontWeight: on ? 700 : 500,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 1, transition: 'background .12s',
                  }}>{label}</button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Stage */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: '100vh' }}>
        <div style={{ filter: t.deviceShadow ? 'none' : 'none' }}>
          <Phone>
            <div className="screen-anim" key={cur} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Screen nav={go} back={back} onTab={onTab} replace={replace} />
            </div>
          </Phone>
        </div>
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Warna" />
        <TweakColor label="Aksen" value={t.accent === 'Mint' ? ACCENTS.Mint.primary : ACCENTS[t.accent].primary}
          options={Object.values(ACCENTS).map(a => a.primary)}
          onChange={(hex) => {
            const name = Object.keys(ACCENTS).find(k => ACCENTS[k].primary === hex) || 'Mint';
            setTweak('accent', name);
          }} />
        <TweakSection label="Tipografi" />
        <TweakSelect label="Font display" value={t.displayFont} options={Object.keys(FONTS)} onChange={v => setTweak('displayFont', v)} />
        <TweakSection label="Bentuk" />
        <TweakSlider label="Radius kartu" value={t.cardRadius} min={8} max={28} step={2} unit="px" onChange={v => setTweak('cardRadius', v)} />
        <TweakSection label="Tampilan" />
        <TweakToggle label="Tampilkan flow map" value={t.showFlowMap} onChange={v => setTweak('showFlowMap', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
