// Arisan Hi-Fi — Empty / Error / Loading states

// Spinning ring with a contextual icon in the center
function LoadingRing({ icon, size = 96, accent = 'var(--primary)' }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `4px solid var(--primary-tint)`, borderTopColor: accent,
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 14, borderRadius: '50%', background: 'var(--primary-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={size * 0.34} color="var(--primary-ink)" strokeWidth={1.9} />
      </div>
    </div>
  );
}

function LoadingView({ icon, title, sub, cycle }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!cycle) return;
    const t = setInterval(() => setIdx(i => (i + 1) % cycle.length), 130);
    return () => clearInterval(t);
  }, [cycle]);
  return (
    <React.Fragment>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
        <LoadingRing icon={icon} />
        {cycle && (
          <div style={{ height: 38, marginTop: 22, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, color: 'var(--ink)', letterSpacing: -0.4 }}>{cycle[idx]}</span>
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--ink)', letterSpacing: -0.3, marginTop: cycle ? 4 : 26 }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8, maxWidth: 260 }}>{sub}</div>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 22 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--primary)', animation: `dot 1.2s ${i*0.15}s infinite` }} />)}
        </div>
      </div>
    </React.Fragment>
  );
}

// Generic empty / error state
function StateView({ icon, tone = 'mint', title, body, primary, secondary, onPrimary, onSecondary }) {
  const map = { mint: ['var(--primary-tint)', 'var(--primary-ink)'], amber: ['var(--amber-tint)', 'var(--amber-ink)'], danger: ['var(--danger-tint)', 'var(--danger)'], neutral: ['var(--surface)', 'var(--muted-strong)'] };
  const [bg, fg] = map[tone];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={42} color={fg} strokeWidth={1.7} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, color: 'var(--ink)', letterSpacing: -0.4, margin: '24px 0 0' }}>{title}</h1>
      <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 10, maxWidth: 280 }}>{body}</p>
      <div style={{ width: '100%', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {primary && <Btn full size="lg" onClick={onPrimary}>{primary}</Btn>}
        {secondary && <Btn full size="md" variant="ghost" onClick={onSecondary}>{secondary}</Btn>}
      </div>
    </div>
  );
}

// ============ LOADING SCREENS (auto-advance via replace) ============
function ScreenOtpLoading({ replace }) {
  React.useEffect(() => { const t = setTimeout(() => replace('home'), 1500); return () => clearTimeout(t); }, []);
  return <LoadingView icon="shield" title="Memverifikasi kode..." sub="Mencocokkan kode OTP dengan WhatsApp kamu" />;
}

function ScreenUndianLoading({ replace }) {
  React.useEffect(() => { const t = setTimeout(() => replace('undian-result'), 2100); return () => clearTimeout(t); }, []);
  return <LoadingView icon="sparkles" title="Server sedang mengundi" sub="Hasil acak & adil — disiarkan ke semua anggota" cycle={['Sari', 'Andi', 'Maya', 'Doni', 'Eka', 'Gita', 'Rina', 'Hana', 'Ika']} />;
}

function ScreenBayarLoading({ replace }) {
  React.useEffect(() => { const t = setTimeout(() => replace('bayar-done'), 1500); return () => clearTimeout(t); }, []);
  return <LoadingView icon="wallet" title="Mengonfirmasi pembayaran..." sub="Menyimpan status & mencatat audit trail" />;
}

// Skeleton loading for Beranda
function SkeletonBar({ w = '100%', h = 14, r = 7, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, var(--surface) 25%, #EDF1EF 37%, var(--surface) 63%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s infinite', ...style }} />;
}
function ScreenHomeLoading({ onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Beranda" right={<div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--surface)' }} />} />
      <Body>
        <div style={{ borderRadius: 24, height: 150, background: 'linear-gradient(90deg, var(--surface) 25%, #EDF1EF 37%, var(--surface) 63%)', backgroundSize: '400% 100%', animation: 'shimmer 1.4s infinite' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0 12px' }}>
          <SkeletonBar w={100} h={13} />
          <SkeletonBar w={70} h={13} />
        </div>
        <Card pad={6}>
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 2px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--surface)', animation: 'shimmer 1.4s infinite', backgroundImage: 'linear-gradient(90deg, var(--surface) 25%, #EDF1EF 37%, var(--surface) 63%)', backgroundSize: '400% 100%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SkeletonBar w="65%" h={13} />
                <SkeletonBar w="40%" h={11} />
              </div>
              <SkeletonBar w={48} h={22} r={11} />
            </div>
          ))}
        </Card>
      </Body>
      <TabBar active="home" onTab={onTab} />
    </React.Fragment>
  );
}

// ============ EMPTY STATES ============
function ScreenHomeEmpty({ nav, onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Beranda" right={
        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={21} color="var(--ink)" /></div>
      } />
      <StateView icon="users" tone="mint"
        title="Belum ada grup arisan"
        body="Buat grup baru sebagai ketua, atau gabung grup yang sudah ada pakai kode undangan."
        primary="Buat grup pertama" onPrimary={() => nav('create1')}
        secondary="Punya kode? Gabung di sini" onSecondary={() => nav('join')} />
      <TabBar active="home" onTab={onTab} />
    </React.Fragment>
  );
}

function ScreenNotifEmpty({ onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Notifikasi" />
      <StateView icon="bell" tone="neutral"
        title="Belum ada notifikasi"
        body="Pengingat bayar, hasil undian, dan request tukar giliran akan muncul di sini." />
      <TabBar active="notif" onTab={onTab} />
    </React.Fragment>
  );
}

function ScreenChatEmpty({ nav }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={() => nav('group')} title="Geng SMA" sub="12 anggota" />
      <StateView icon="message" tone="mint"
        title="Belum ada obrolan"
        body="Jadi yang pertama menyapa! Event sistem seperti undian & konfirmasi bayar juga akan tampil di sini." />
      <div style={{ flexShrink: 0, padding: '10px 16px 26px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg)' }}>
        <button style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="plus" size={22} color="var(--primary-ink)" strokeWidth={2} />
        </button>
        <div style={{ flex: 1, height: 42, borderRadius: 999, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', padding: '0 16px', color: 'var(--muted)', fontSize: 14 }}>Tulis pesan...</div>
        <button style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="send" size={20} color="#fff" strokeWidth={2} />
        </button>
      </div>
    </React.Fragment>
  );
}

// ============ ERROR STATES ============
function ScreenOtpError({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={back} />
      <Body>
        <Pill tone="mint" style={{ marginBottom: 14 }}>Langkah 2 dari 2</Pill>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 27, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.6, margin: 0 }}>Masukkan kode dari<br/>WhatsApp</h1>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>Dikirim ke +62 812-3456-7890 · <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>ubah</span></p>

        {/* error OTP boxes (red) */}
        <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between', marginTop: 30 }}>
          {['4','7','2','9','1','5'].map((d, i) => (
            <div key={i} style={{ flex: 1, height: 58, borderRadius: 15, border: '1.5px solid var(--danger)', background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--danger)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--danger)' }}>
          <Icon name="alert" size={17} color="var(--danger)" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Kode salah. Sisa 2 percobaan lagi.</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--muted)' }}>
          Belum diterima? <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>Kirim ulang kode</span>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('otp')}>Coba lagi</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenConnError({ back, retry }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={back} />
      <StateView icon="alert" tone="danger"
        title="Koneksi terputus"
        body="Gagal menyambung ke server. Cek koneksi internet kamu lalu coba lagi."
        primary="Coba lagi" onPrimary={() => (retry ? retry() : back())}
        secondary="Kembali" onSecondary={back} />
    </React.Fragment>
  );
}

function ScreenUndianError({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={back} title="Undian Periode 4" />
      <StateView icon="alert" tone="amber"
        title="Undian gagal diproses"
        body="Server tidak merespons saat mengundi. Tidak ada pemenang yang tercatat — kamu bisa mengulang undian dengan aman."
        primary="Ulangi undian" onPrimary={() => nav('undian-loading')}
        secondary="Nanti saja" onSecondary={() => nav('group')} />
    </React.Fragment>
  );
}

// Confetti burst — falling pieces over the phone screen
function Confetti({ count = 46 }) {
  const COLORS = ['#00C897', '#F5A524', '#FB6F5C', '#5B6CF0', '#FFFFFF', '#34D9A8'];
  const pieces = React.useMemo(() => Array.from({ length: count }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    dur: 2.2 + Math.random() * 1.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * 360,
    size: 6 + Math.random() * 8,
    round: Math.random() > 0.55,
    drift: (Math.random() - 0.5) * 60,
  })), [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 60 }}>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: -24, left: p.left + '%',
          width: p.size, height: p.size * (p.round ? 1 : 1.4),
          background: p.color, borderRadius: p.round ? '50%' : 2,
          transform: `rotate(${p.rot}deg)`,
          ['--drift']: p.drift + 'px',
          animation: `confetti-fall ${p.dur}s ${p.delay}s cubic-bezier(.3,.5,.5,1) forwards`,
          boxShadow: p.color === '#FFFFFF' ? '0 0 0 0.5px rgba(0,0,0,0.05)' : 'none',
        }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  LoadingRing, LoadingView, StateView, Confetti,
  ScreenOtpLoading, ScreenUndianLoading, ScreenBayarLoading, ScreenHomeLoading,
  ScreenHomeEmpty, ScreenNotifEmpty, ScreenChatEmpty,
  ScreenOtpError, ScreenConnError, ScreenUndianError,
});
