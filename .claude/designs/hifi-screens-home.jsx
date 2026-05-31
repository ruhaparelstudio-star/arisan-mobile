// Arisan Hi-Fi — Home, Notifikasi, Profil (V2 direction)

const GROUPS = [
  { name: 'Arisan Geng SMA', initial: 'G', members: 12, nominal: 'Rp 500rb', periode: 'Periode 4 / 12', due: 2, role: 'Ketua' },
  { name: 'Ibu² Kompleks Melati', initial: 'M', members: 18, nominal: 'Rp 1jt', periode: 'Periode 2 / 18', due: 6 },
  { name: 'Arisan Kantor IT', initial: 'K', members: 8, nominal: 'Rp 250rb', periode: 'Periode 1 / 8', due: 'paid' },
];

function GroupRow({ g, nav }) {
  return (
    <ListRow
      onClick={() => nav('group')}
      leading={
        <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--primary-ink)' }}>{g.initial}</div>
      }
      title={g.name}
      sub={`${g.periode} · ${g.nominal}`}
      right={g.due === 'paid'
        ? <Pill tone="mint" dot>Lunas</Pill>
        : <Pill tone={g.due <= 3 ? 'amber' : 'neutral'} dot>H-{g.due}</Pill>}
    />
  );
}

function ScreenHome({ nav, onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Beranda" right={
        <button onClick={() => onTab('notif')} style={{ width: 42, height: 42, borderRadius: 13, border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Icon name="bell" size={21} color="var(--ink)" />
          <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 999, background: 'var(--amber)', border: '1.5px solid var(--surface)' }} />
        </button>
      } />
      <Body>
        {/* Hero: next action */}
        <div style={{
          borderRadius: 24, padding: 20, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)',
          boxShadow: '0 18px 40px -16px var(--primary-shadow)',
        }}>
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
          <div style={{ position: 'absolute', right: 30, bottom: -50, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
            <Icon name="clock" size={15} color="rgba(255,255,255,0.85)" /> PERLU PERHATIAN
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: '#fff', lineHeight: 1.2, marginTop: 8, letterSpacing: -0.3 }}>
            Bayar Arisan Geng SMA
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
            Rp 500.000 · jatuh tempo 2 hari lagi
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
            <Btn size="sm" variant="soft" onClick={() => nav('group')} style={{ background: '#fff', color: 'var(--primary-ink)' }}>Lihat detail</Btn>
            <Btn size="sm" variant="ghost" style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' }}>Sudah bayar</Btn>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel right={<span onClick={() => onTab('groups')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', cursor: 'pointer' }}>Lihat semua</span>}>Grup aktif</SectionLabel>
          <Card pad={6}>
            {GROUPS.map((g, i) => <GroupRow key={i} g={{ ...g, _last: i === GROUPS.length - 1 }} nav={nav} />)}
          </Card>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Btn size="md" icon="plus" onClick={() => nav('create1')} style={{ flex: 1 }}>Buat grup</Btn>
          <Btn size="md" variant="outline" onClick={() => nav('join')} style={{ flex: 1 }}>Gabung kode</Btn>
        </div>
      </Body>
      <TabBar active="home" onTab={onTab} />
    </React.Fragment>
  );
}

// Groups tab — list of all groups
function ScreenGroups({ nav, onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Grup kamu" right={
        <button onClick={() => nav('create1')} style={{ width: 42, height: 42, borderRadius: 13, border: 'none', background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -8px var(--primary-shadow)' }}>
          <Icon name="plus" size={22} color="#fff" strokeWidth={2.2} />
        </button>
      } />
      <Body>
        <div style={{ marginBottom: 16 }}>
          <Segmented options={['Semua', 'Sebagai ketua', 'Anggota']} value="Semua" />
        </div>
        {GROUPS.map((g, i) => (
          <Card key={i} style={{ marginBottom: 12 }} onClick={() => nav('group')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--primary-ink)' }}>{g.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16.5, color: 'var(--ink)' }}>{g.name}</span>
                  {g.role && <Pill tone="solid" style={{ fontSize: 10.5, padding: '2px 8px' }}>{g.role}</Pill>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{g.members} anggota · {g.nominal}/periode</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{g.periode}</span>
              {g.due === 'paid' ? <Pill tone="mint" dot>Lunas</Pill> : <Pill tone={g.due <= 3 ? 'amber' : 'neutral'} dot>Bayar H-{g.due}</Pill>}
            </div>
          </Card>
        ))}
      </Body>
      <TabBar active="groups" onTab={onTab} />
    </React.Fragment>
  );
}

// ===== Notifikasi (V2 grouped) =====
const NOTIFS = [
  { icon: 'wallet', tone: 'amber', title: 'Jatuh tempo besok', body: 'Bayar Arisan Geng SMA Rp 500rb sebelum 15 Jun', when: '1j', cta: 'Bayar', nav: 'group' },
  { icon: 'sparkles', tone: 'mint', title: 'Andi menang undian!', body: 'Periode 4 Geng SMA — selamat untuk Andi 🎉', when: '3j', cta: 'Lihat', nav: 'undian-result' },
  { icon: 'swap', tone: 'blue', title: 'Request tukar giliran', body: 'Doni ingin tukar giliran denganmu (P8 ↔ P9)', when: '5j', cta: 'Tinjau', nav: 'tukar' },
];
const NOTIFS_OLD = [
  { icon: 'checkCircle', tone: 'mint', title: 'Pembayaranmu dikonfirmasi', body: 'Rina (Ketua) konfirmasi bayarmu periode 3', when: 'Kemarin' },
  { icon: 'users', tone: 'neutral', title: 'Maya bergabung', body: 'Anggota baru di Ibu² Kompleks Melati', when: '2 hari' },
];

function NotifIconBox({ icon, tone }) {
  const map = { amber: ['var(--amber-tint)', 'var(--amber-ink)'], mint: ['var(--primary-tint)', 'var(--primary-ink)'], blue: ['#EAF2FF', '#2D6FD6'], neutral: ['var(--surface)', 'var(--muted-strong)'] };
  const [bg, fg] = map[tone] || map.neutral;
  return (
    <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={21} color={fg} />
    </div>
  );
}

function ScreenNotif({ nav, onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Notifikasi" right={
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-ink)', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)' }}>Tandai dibaca</button>
      } />
      <Body>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber-ink)', letterSpacing: 0.3 }}>PERLU TINDAKAN</span>
          <Pill tone="amber" style={{ fontSize: 11, padding: '1px 8px' }}>{NOTIFS.length}</Pill>
        </div>
        <Card pad={6} style={{ marginBottom: 22 }}>
          {NOTIFS.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 8px', borderBottom: i < NOTIFS.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <NotifIconBox icon={n.icon} tone={n.tone} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{n.title}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', flexShrink: 0 }}>{n.when}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 2 }}>{n.body}</div>
                <div style={{ marginTop: 8 }}>
                  <Btn size="sm" variant={i === 0 ? 'primary' : 'soft'} onClick={() => nav(n.nav)}>{n.cta}</Btn>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.3, marginBottom: 10 }}>SEBELUMNYA</div>
        <Card pad={6}>
          {NOTIFS_OLD.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 8px', borderBottom: i < NOTIFS_OLD.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <NotifIconBox icon={n.icon} tone={n.tone} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{n.title}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', flexShrink: 0 }}>{n.when}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 2 }}>{n.body}</div>
              </div>
            </div>
          ))}
        </Card>
      </Body>
      <TabBar active="notif" onTab={onTab} />
    </React.Fragment>
  );
}

// ===== Profil =====
function ScreenProfil({ nav, onTab }) {
  const menu = [
    ['bank', 'Rekening bank', 'BCA ···4821'],
    ['bell', 'Pengaturan notifikasi', ''],
    ['lock', 'Keamanan & PIN', ''],
    ['activity', 'Riwayat semua arisan', '5 grup'],
    ['shield', 'Bantuan & dukungan', ''],
  ];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar large title="Profil" right={
        <button style={{ width: 42, height: 42, borderRadius: 13, border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="settings" size={21} color="var(--ink)" />
        </button>
      } />
      <Body>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0 8px' }}>
          <Avatar name="Rina" size={68} mint />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 21, color: 'var(--ink)', letterSpacing: -0.3 }}>Rina Setiawati</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 2 }}>+62 812-3456-7890</div>
            <div style={{ marginTop: 7 }}><Pill tone="mint" dot>Ketua 2 grup</Pill></div>
          </div>
        </div>

        <Card tint pad={18} style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {[['5', 'Grup'], ['Rp 12jt', 'Total iuran'], ['3×', 'Menang']].map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--primary-ink)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card pad={6} style={{ marginTop: 16 }}>
          {menu.map(([ic, t, v], i) => (
            <ListRow key={i} icon={ic} title={t} lastChild={i === menu.length - 1}
              right={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{v && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{v}</span>}<Icon name="chevronRight" size={18} color="var(--muted)" /></div>} />
          ))}
        </Card>

        <button onClick={() => nav('welcome')} style={{ width: '100%', marginTop: 18, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--danger)', fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-body)', padding: 12 }}>
          <Icon name="logout" size={19} color="var(--danger)" /> Keluar
        </button>
      </Body>
      <TabBar active="profil" onTab={onTab} />
    </React.Fragment>
  );
}

Object.assign(window, { ScreenHome, ScreenGroups, ScreenNotif, ScreenProfil });
