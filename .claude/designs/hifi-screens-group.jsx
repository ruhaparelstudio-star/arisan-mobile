// Arisan Hi-Fi — Group detail (V2 single feed) + Chat (V2 pinned+filter)

const MEMBERS = [
  { name: 'Rina', status: 'lunas', me: true },
  { name: 'Budi', status: 'lunas', winner: true },
  { name: 'Sari', status: 'lunas' },
  { name: 'Andi', status: 'belum' },
  { name: 'Maya', status: 'terlambat' },
  { name: 'Doni', status: 'lunas' },
  { name: 'Eka', status: 'belum' },
  { name: 'Gita', status: 'lunas' },
];

function statusDot(status) {
  const map = { lunas: 'var(--primary)', belum: 'var(--border-strong)', terlambat: 'var(--danger)' };
  return map[status];
}

function ScreenGroup({ nav, onTab }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={() => nav('home')} title="Detail Grup" right={
        <button style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="grip" size={20} color="var(--ink)" />
        </button>
      } />
      <Body>
        {/* group identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--primary-ink)' }}>G</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink)', letterSpacing: -0.3 }}>Arisan Geng SMA</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>12 anggota · Rp 500rb · Bulanan</div>
          </div>
          <Pill tone="solid">Ketua</Pill>
        </div>

        {/* status hero card */}
        <Card accent tint pad={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>PERIODE 4 DARI 12</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                <Icon name="trophy" size={18} color="var(--primary-ink)" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>Pemenang: Budi</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Jatuh tempo</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--amber-ink)', marginTop: 3 }}>15 Jun · H-2</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted-strong)', marginBottom: 6, fontWeight: 600 }}>
              <span>Sudah bayar</span><span>7 / 12</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,168,126,0.18)', overflow: 'hidden' }}>
              <div style={{ width: '58%', height: '100%', borderRadius: 4, background: 'var(--primary)' }} />
            </div>
          </div>
        </Card>

        {/* quick actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {[
            { ic: 'wallet', l: 'Bayar', primary: true, go: 'bayar' },
            { ic: 'message', l: 'Chat', go: 'chat' },
            { ic: 'swap', l: 'Tukar', go: 'tukar' },
            { ic: 'sparkles', l: 'Undian', go: 'undian-pre' },
          ].map((a, i) => (
            <button key={i} onClick={() => nav(a.go)} style={{
              flex: 1, border: a.primary ? 'none' : '1px solid var(--border)', cursor: 'pointer',
              background: a.primary ? 'var(--primary)' : 'var(--card)', borderRadius: 16, padding: '13px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              boxShadow: a.primary ? '0 8px 18px -8px var(--primary-shadow)' : '0 1px 2px rgba(16,24,40,0.04)',
            }}>
              <Icon name={a.ic} size={22} color={a.primary ? '#fff' : 'var(--ink)'} strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 600, color: a.primary ? '#fff' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>{a.l}</span>
            </button>
          ))}
        </div>

        {/* who paid */}
        <div style={{ marginTop: 24 }}>
          <SectionLabel right={<span onClick={() => nav('bayar')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', cursor: 'pointer' }}>Kelola</span>}>Status bayar periode 4</SectionLabel>
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {MEMBERS.map((m, i) => (
                <div key={i} style={{ position: 'relative', textAlign: 'center', width: 52 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar name={m.name} size={44} mint={m.me} />
                    <span style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderRadius: '50%', background: statusDot(m.status), border: '2.5px solid var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.status === 'lunas' && <Icon name="check" size={9} color="#fff" strokeWidth={3.5} />}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-strong)', marginTop: 4, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}{m.me ? ' (kamu)' : ''}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* recent activity */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel right={<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', cursor: 'pointer' }}>Semua</span>}>Aktivitas terbaru</SectionLabel>
          <Card pad={6}>
            {[
              { ic: 'checkCircle', tone: 'mint', t: 'Rina konfirmasi bayar Sari', w: '14:32' },
              { ic: 'sparkles', tone: 'mint', t: 'Undian periode 4 — Budi menang', w: 'Kemarin' },
              { ic: 'swap', tone: 'blue', t: 'Andi minta tukar giliran dgn Doni', w: '8 Jun' },
            ].map((a, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 6px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <NotifIconBox icon={a.ic} tone={a.tone} />
                <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{a.t}</div>
                <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{a.w}</span>
              </div>
            ))}
          </Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 12, fontSize: 11.5, color: 'var(--muted)' }}>
            <Icon name="lock" size={13} color="var(--muted)" /> Aktivitas tercatat permanen — tidak bisa diubah
          </div>
        </div>
      </Body>
    </React.Fragment>
  );
}

// ===== Chat (V2) =====
function ScreenChat({ nav }) {
  const [filter, setFilter] = React.useState('Semua');
  const msgs = [
    { sys: true, icon: 'sparkles', text: 'Undian periode 4 selesai — Andi Pratama menang 🎉', when: '20:00' },
    { who: 'Budi', text: 'Selamat Andiii! 🎉', when: '20:01' },
    { who: 'Maya', text: 'wah congrats! traktir dong wkwk 😄', when: '20:02' },
    { sys: true, icon: 'checkCircle', text: 'Rina (Ketua) konfirmasi bayar Sari', when: '20:05' },
    { me: true, text: 'Yang belum transfer ditunggu sampai besok ya 🙏', when: '20:06' },
    { who: 'Andi', text: 'siap kak, nanti malam transfer', when: '20:07' },
  ];
  const filtered = msgs.filter(m => filter === 'Semua' || (filter === 'Sistem' ? m.sys : !m.sys));
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={() => nav('group')} title="Geng SMA" sub="12 anggota · 4 online" right={
        <button style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="info" size={20} color="var(--ink)" />
        </button>
      } />

      {/* pinned status */}
      <div style={{ margin: '0 16px 8px', padding: '11px 14px', borderRadius: 14, background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => nav('group')}>
        <Icon name="trophy" size={18} color="var(--primary-ink)" />
        <div style={{ flex: 1, fontSize: 12.5, color: 'var(--primary-ink)', fontWeight: 500, lineHeight: 1.3 }}>
          <b>Periode 4:</b> Andi menang · 7/12 lunas · H-2
        </div>
        <Icon name="chevronRight" size={17} color="var(--primary-ink)" />
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <Segmented options={['Semua', 'Obrolan', 'Sistem']} value={filter} onChange={setFilter} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--muted)', margin: '2px 0' }}>Hari ini</div>
        {filtered.map((m, i) => {
          if (m.sys) {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, maxWidth: '85%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 13px' }}>
                  <Icon name={m.icon} size={14} color="var(--primary-ink)" />
                  <span style={{ fontSize: 11.5, color: 'var(--muted-strong)', fontWeight: 500, lineHeight: 1.3 }}>{m.text}</span>
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'flex', justifyContent: m.me ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
              {!m.me && <Avatar name={m.who} size={28} />}
              <div style={{ maxWidth: '72%' }}>
                {!m.me && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3, marginLeft: 4, fontWeight: 600 }}>{m.who}</div>}
                <div style={{
                  background: m.me ? 'var(--primary)' : 'var(--card)', color: m.me ? '#fff' : 'var(--ink)',
                  border: m.me ? 'none' : '1px solid var(--border)',
                  borderRadius: 18, borderBottomRightRadius: m.me ? 5 : 18, borderBottomLeftRadius: m.me ? 18 : 5,
                  padding: '9px 13px', fontSize: 14, lineHeight: 1.35, fontFamily: 'var(--font-body)',
                  boxShadow: m.me ? 'none' : '0 1px 2px rgba(16,24,40,0.04)',
                }}>{m.text}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textAlign: m.me ? 'right' : 'left', marginRight: m.me ? 4 : 0, marginLeft: m.me ? 0 : 4 }}>{m.when}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flexShrink: 0, padding: '10px 16px 26px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg)' }}>
        <button style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="plus" size={22} color="var(--primary-ink)" strokeWidth={2} />
        </button>
        <div style={{ flex: 1, height: 42, borderRadius: 999, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', padding: '0 16px', color: 'var(--muted)', fontSize: 14 }}>Tulis pesan...</div>
        <button style={{ width: 42, height: 42, borderRadius: '50%', border: 'none', background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px -8px var(--primary-shadow)' }}>
          <Icon name="send" size={20} color="#fff" strokeWidth={2} />
        </button>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { ScreenGroup, ScreenChat });
