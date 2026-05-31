// Arisan Hi-Fi — Create wizard, Undian, Bayar, Tukar (V2 directions)

function WizardProgress({ step, total = 3 }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 22px 4px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? 'var(--primary)' : 'var(--border-strong)', transition: 'background .2s' }} />
      ))}
    </div>
  );
}

// ===== Create grup wizard =====
function ScreenCreate1({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Buat Grup" sub="Langkah 1 dari 3" onBack={back} />
      <WizardProgress step={1} />
      <Body>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.5, margin: '14px 0 0' }}>
          Mau kasih nama apa<br/>grup kamu?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 10 }}>Bisa diubah nanti sebelum periode 1 dimulai.</p>
        <div style={{ marginTop: 26 }}>
          <Field value="Arisan Geng SMA" focused big />
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--surface)', borderRadius: 14, padding: 13 }}>
          <Icon name="info" size={18} color="var(--muted)" />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>Pakai nama yang mudah dikenali semua anggota.</div>
        </div>
        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('create2')} style={{ marginTop: 24 }} iconRight="arrowRight">Lanjut</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenCreate2({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Buat Grup" sub="Langkah 2 dari 3" onBack={back} />
      <WizardProgress step={2} />
      <Body>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.5, margin: '14px 0 22px' }}>
          Berapa & seberapa<br/>sering?
        </h1>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 7 }}>NOMINAL / PERIODE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1.5px solid var(--primary)', background: 'var(--card)', borderRadius: 16, padding: '16px', boxShadow: '0 0 0 4px var(--primary-ring)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color: 'var(--muted)' }}>Rp</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, color: 'var(--ink)', letterSpacing: -0.5 }}>500.000</span>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 7 }}>FREKUENSI</div>
          <Segmented options={['Mingguan', '2 Minggu', 'Bulanan']} value="Bulanan" />
        </div>

        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted-strong)', marginBottom: 7 }}>JUMLAH PERIODE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ width: 52, height: 52, borderRadius: 14, border: '1.5px solid var(--border-strong)', background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={2} color="var(--ink)" /><span style={{ fontSize: 26, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginTop: -4 }}>−</span></button>
            <div style={{ flex: 1, height: 52, borderRadius: 14, border: '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--ink)' }}>12</div>
            <button style={{ width: 52, height: 52, borderRadius: 14, border: 'none', background: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={22} color="#fff" strokeWidth={2.4} /></button>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>Total pot: <b style={{ color: 'var(--ink)' }}>Rp 6.000.000</b> per pemenang</div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('create3')} style={{ marginTop: 24 }} iconRight="arrowRight">Lanjut</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenCreate3({ nav, back }) {
  const modes = [
    { ic: 'users', t: 'Urutan tetap', s: 'Aku atur urutan giliran dari awal', on: false },
    { ic: 'sparkles', t: 'Undian per periode', s: 'Server acak tiap periode — transparan & adil', on: true },
    { ic: 'edit', t: 'Undian offline', s: 'Aku input manual setelah undian fisik', on: false },
  ];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Buat Grup" sub="Langkah 3 dari 3" onBack={back} />
      <WizardProgress step={3} />
      <Body>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.5, margin: '14px 0 20px' }}>
          Bagaimana giliran<br/>ditentukan?
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modes.map((m, i) => (
            <Card key={i} accent={m.on} tint={m.on} pad={15} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: m.on ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={m.ic} size={21} color={m.on ? '#fff' : 'var(--ink)'} strokeWidth={1.9} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--ink)' }}>{m.t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.35 }}>{m.s}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${m.on ? 'var(--primary)' : 'var(--border-strong)'}`, background: m.on ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.on && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('invite')} style={{ marginTop: 24 }} icon="check">Buat & Invite Anggota</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenInvite({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Invite Anggota" onBack={back} />
      <Body>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, margin: '4px 0 0' }}>Bagikan kode ini — anggota gabung dengan memasukkannya di app.</p>

        <Card accent tint pad={22} style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, letterSpacing: 2 }}>KODE INVITE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 42, color: 'var(--ink)', letterSpacing: 6, margin: '10px 0 6px' }}>SMA-X9K</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Berlaku sampai grup penuh atau periode 1 dimulai</div>
        </Card>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Btn variant="outline" size="md" icon="copy" style={{ flex: 1 }}>Salin kode</Btn>
          <Btn size="md" icon="share" style={{ flex: 1 }}>Share WhatsApp</Btn>
        </div>

        <div style={{ marginTop: 24 }}>
          <SectionLabel right={<Pill tone="neutral">3 / 12</Pill>}>Sudah bergabung</SectionLabel>
          <Card pad={6}>
            {[['Rina', 'Kamu · Ketua', true], ['Budi Hartono', 'Bergabung 2 menit lalu'], ['Sari Wulandari', 'Bergabung 5 menit lalu']].map(([n, s, me], i, a) => (
              <ListRow key={i} leading={<Avatar name={n} size={40} mint={me} />} title={n} sub={s} lastChild={i === a.length - 1}
                right={i === 0 ? <Pill tone="solid">Ketua</Pill> : <Icon name="checkCircle" size={20} color="var(--primary)" />} />
            ))}
          </Card>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" variant="dark" onClick={() => nav('group')} style={{ marginTop: 24 }}>Selesai → Lihat Grup</Btn>
      </Body>
    </React.Fragment>
  );
}

// ===== Undian =====
function ScreenUndianPre({ nav, back }) {
  const cands = ['Rina', 'Sari', 'Andi', 'Maya', 'Doni', 'Eka', 'Gita', 'Hana', 'Ika'];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Undian Periode 4" onBack={back} />
      <Body>
        <Pill tone="mint" style={{ marginBottom: 14 }} dot>Live · 12 anggota akan menonton</Pill>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.15, color: 'var(--ink)', letterSpacing: -0.5, margin: 0 }}>
          Siap mengundi pemenang periode 4?
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, marginTop: 10 }}>
          Hanya anggota yang belum pernah menang yang diundi. Hasil diproses server — adil & tidak bisa diubah.
        </p>

        <Card style={{ marginTop: 20 }}>
          <SectionLabel>Calon pemenang · 9 orang</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {cands.map((n, i) => (
              <div key={i} style={{ aspectRatio: '3/4', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Avatar name={n} size={40} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{n}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ marginTop: 14, display: 'flex', gap: 11, alignItems: 'flex-start', background: 'var(--primary-tint)', borderRadius: 16, padding: 14 }}>
          <Icon name="shield" size={20} color="var(--primary-ink)" />
          <div style={{ fontSize: 12.5, color: 'var(--primary-ink)', lineHeight: 1.45 }}>
            Hasil otomatis disiarkan ke chat grup & semua anggota dapat notifikasi.
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('undian-loading')} style={{ marginTop: 24 }} icon="sparkles">Mulai Undian</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenUndianResult({ nav, back }) {
  const winners = [
    { p: 1, n: 'Budi Hartono', d: '15 Mar 2026' },
    { p: 2, n: 'Sari Wulandari', d: '15 Apr 2026' },
    { p: 3, n: 'Maya Indah', d: '15 Mei 2026' },
    { p: 4, n: 'Andi Pratama', d: '18 Jun 2026', current: true },
  ];
  return (
    <React.Fragment>
      <Confetti />
      <StatusBar />
      <AppBar onBack={back} title="Pemenang Periode 4" />
      <Body>
        {/* winner spotlight */}
        <div style={{ position: 'relative', borderRadius: 24, padding: '26px 20px', overflow: 'hidden', background: 'linear-gradient(150deg, var(--primary) 0%, var(--primary-deep) 100%)', boxShadow: '0 18px 40px -16px var(--primary-shadow)', textAlign: 'center' }}>
          {[[24,28,10],[330,40,-18],[60,150,22],[300,160,-12],[40,210,14]].map(([l,t,r],i)=>(
            <div key={i} style={{ position:'absolute', left:l, top:t, width:10, height:10, borderRadius:2, background:'rgba(255,255,255,0.5)', transform:`rotate(${r}deg)` }} />
          ))}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.9)', fontSize: 12.5, fontWeight: 600 }}>
            <Icon name="trophy" size={16} color="#fff" /> PEMENANG
          </div>
          <div style={{ margin: '14px auto 12px', width: 84, height: 84, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 38, color: 'var(--primary-ink)' }}>A</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, color: '#fff', letterSpacing: -0.4 }}>Andi Pratama 🎉</div>
          <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.92)', marginTop: 8 }}>Menerima <b>Rp 6.000.000</b></div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Pelaksanaan 18 Juni 2026</div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Daftar pemenang</SectionLabel>
          <Card pad={6}>
            {winners.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 8px', borderBottom: i < winners.length - 1 ? '1px solid var(--border)' : 'none', background: w.current ? 'var(--primary-tint)' : 'transparent', borderRadius: w.current ? 12 : 0, margin: w.current ? '2px 0' : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--muted-strong)', flexShrink: 0 }}>{w.p}</div>
                <Avatar name={w.n} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{w.n}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{w.d}</div>
                </div>
                {w.current && <Pill tone="solid">Baru</Pill>}
              </div>
            ))}
          </Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', marginTop: 12, fontSize: 11.5, color: 'var(--muted)' }}>
            <Icon name="lock" size={13} color="var(--muted)" /> Daftar pemenang permanen — tidak bisa diubah
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('chat')} style={{ marginTop: 22 }} icon="message">Ucapkan selamat di chat</Btn>
      </Body>
    </React.Fragment>
  );
}

// ===== Konfirmasi Bayar (multi-select batch) =====
function ScreenBayar({ nav, back }) {
  const [sel, setSel] = React.useState({ Andi: true, Maya: true, Eka: true });
  const unpaid = [
    { n: 'Andi Pratama', s: 'Slot urutan #3' },
    { n: 'Maya Sari', s: '⚠ Terlambat 3 hari', late: true },
    { n: 'Eka Wijaya', s: 'Slot urutan #9' },
    { n: 'Citra Dewi', s: 'Slot urutan #6' },
    { n: 'Fajar Nugroho', s: 'Slot urutan #10' },
  ];
  const count = Object.values(sel).filter(Boolean).length;
  const toggle = n => setSel(s => ({ ...s, [n]: !s[n] }));
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Konfirmasi Bayar" sub="Periode 4 · pilih lalu konfirmasi" onBack={back} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '2px 22px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Pill tone="amber" dot>5 belum bayar</Pill>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', cursor: 'pointer' }}>Pilih semua</span>
        </div>
        <Card pad={6}>
          {unpaid.map((m, i) => {
            const on = !!sel[m.n.split(' ')[0]];
            return (
              <div key={i} onClick={() => toggle(m.n.split(' ')[0])} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', borderBottom: i < unpaid.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: on ? 'var(--primary-tint)' : 'transparent', borderRadius: on ? 12 : 0, margin: on ? '2px 0' : 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`, background: on ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
                </div>
                <Avatar name={m.n} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{m.n}</div>
                  <div style={{ fontSize: 12, color: m.late ? 'var(--danger)' : 'var(--muted)' }}>{m.s}</div>
                </div>
              </div>
            );
          })}
        </Card>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid var(--border)', borderRadius: 14, padding: 13 }}>
          <Icon name="lock" size={18} color="var(--muted)" />
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>Tiap konfirmasi tercatat: <b style={{ color: 'var(--ink)' }}>"oleh Rina (Ketua) · {`{waktu}`}"</b> dan terlihat semua anggota.</div>
        </div>
      </div>

      {/* sticky action */}
      <div style={{ flexShrink: 0, padding: '14px 22px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{count} dipilih · total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>Rp {(count * 500).toLocaleString('id')}.000</div>
        </div>
        <Btn size="lg" onClick={() => nav('bayar-loading')} disabled={count === 0} icon="check">Konfirmasi {count}</Btn>
      </div>
    </React.Fragment>
  );
}

function ScreenBayarDone({ nav }) {
  const names = ['Andi Pratama', 'Maya Sari', 'Eka Wijaya'];
  return (
    <React.Fragment>
      <StatusBar />
      <Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 56 }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px -8px var(--primary-shadow)' }}>
            <Icon name="check" size={34} color="#fff" strokeWidth={3} />
          </div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 25, color: 'var(--ink)', letterSpacing: -0.5, margin: '22px 0 8px' }}>3 anggota dikonfirmasi</h1>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280 }}>Status berubah jadi Lunas. Notifikasi terkirim & tercatat di aktivitas.</p>

        <Card style={{ marginTop: 24, width: '100%', textAlign: 'left' }} pad={6}>
          {names.map((n, i) => (
            <ListRow key={i} leading={<Avatar name={n} size={36} />} title={n} sub="Periode 4" lastChild={i === names.length - 1}
              right={<div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 13, color: 'var(--muted)' }}>Rp 500rb</span><Icon name="checkCircle" size={20} color="var(--primary)" /></div>} />
          ))}
        </Card>
        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('group')} style={{ marginTop: 24 }}>Selesai</Btn>
      </Body>
    </React.Fragment>
  );
}

// ===== Tukar Giliran (timeline) =====
function ScreenTukar({ nav, back }) {
  const slots = [
    { p: 1, n: 'Budi', d: 'Mar', past: true }, { p: 2, n: 'Sari', d: 'Apr', past: true },
    { p: 3, n: 'Maya', d: 'Mei', past: true }, { p: 4, n: 'Andi', d: 'Jun', current: true },
    { p: 5, n: 'Eka', d: 'Jul' }, { p: 6, n: 'Fajar', d: 'Agu' }, { p: 7, n: 'Gita', d: 'Sep' },
    { p: 8, n: 'Rina (kamu)', d: 'Okt', me: true }, { p: 9, n: 'Doni', d: 'Nov', target: true },
  ];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Tukar Giliran" onBack={back} />
      <Body>
        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: 'var(--primary-tint)', borderRadius: 16, padding: 14, marginBottom: 16 }}>
          <Icon name="info" size={19} color="var(--primary-ink)" />
          <div style={{ fontSize: 12.5, color: 'var(--primary-ink)', lineHeight: 1.45 }}>
            Giliranmu <b>periode 8</b>. Tap periode lain untuk ajukan tukar. Sisa request: <b>2 dari 2</b>.
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {/* timeline line */}
          <div style={{ position: 'absolute', left: 19, top: 14, bottom: 14, width: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {slots.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 13, position: 'relative',
                padding: '8px 12px', borderRadius: 14,
                background: s.me ? 'var(--primary-tint)' : s.target ? 'var(--amber-tint)' : 'transparent',
                border: s.me ? '1.5px dashed var(--primary)' : s.target ? '1.5px dashed var(--amber)' : '1.5px solid transparent',
                opacity: s.past ? 0.5 : 1,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, background: s.current ? 'var(--primary)' : 'var(--card)', color: s.current ? '#fff' : 'var(--ink)', border: s.current ? 'none' : '1.5px solid var(--border-strong)' }}>{s.p}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.n}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Periode {s.p} · {s.d} 2026</div>
                </div>
                {s.me && <Pill tone="mint">Posisimu</Pill>}
                {s.target && <Pill tone="amber">Tukar ke sini</Pill>}
                {s.current && <Pill tone="solid">Sekarang</Pill>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('tukar-status')} style={{ marginTop: 22 }} icon="swap">Kirim request: P8 ↔ P9 (Doni)</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenTukarStatus({ nav, back }) {
  const steps = [
    { l: 'Request dibuat', s: 'Kamu · 14 Jun 14:32', done: true },
    { l: 'Doni menyetujui', s: '✓ disetujui · 14 Jun 16:10', done: true },
    { l: 'Ketua approve final', s: 'Menunggu approval', current: true },
    { l: 'Urutan ter-update', s: 'Otomatis setelah approve' },
  ];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Status Tukar" onBack={back} />
      <Body>
        <Card tint accent pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar name="Rina" size={50} mint />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 6 }}>Rina (kamu)</div>
              <Pill tone="neutral" style={{ marginTop: 4 }}>P8 → P9</Pill>
            </div>
            <Icon name="swap" size={28} color="var(--primary-ink)" />
            <div style={{ textAlign: 'center' }}>
              <Avatar name="Doni" size={50} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginTop: 6 }}>Doni</div>
              <Pill tone="neutral" style={{ marginTop: 4 }}>P9 → P8</Pill>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 22 }}>
          <SectionLabel>Progress 3 langkah</SectionLabel>
          <div style={{ position: 'relative', paddingLeft: 4 }}>
            <div style={{ position: 'absolute', left: 16, top: 16, bottom: 16, width: 2, background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {steps.map((st, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: st.done ? 'var(--primary)' : st.current ? 'var(--amber-tint)' : 'var(--card)', border: st.done ? 'none' : `1.5px solid ${st.current ? 'var(--amber)' : 'var(--border-strong)'}` }}>
                    {st.done ? <Icon name="check" size={14} color="#fff" strokeWidth={3} /> : st.current ? <Icon name="clock" size={14} color="var(--amber-ink)" /> : <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{i + 1}</span>}
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ fontSize: 14.5, fontWeight: st.current ? 700 : 600, color: st.done || st.current ? 'var(--ink)' : 'var(--muted)' }}>{st.l}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{st.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Btn variant="outline" size="lg" onClick={back} style={{ flex: 1 }}>Batalkan</Btn>
          <Btn size="lg" onClick={() => nav('group')} style={{ flex: 2 }} icon="check">Approve sebagai ketua</Btn>
        </div>
      </Body>
    </React.Fragment>
  );
}

Object.assign(window, {
  ScreenCreate1, ScreenCreate2, ScreenCreate3, ScreenInvite,
  ScreenUndianPre, ScreenUndianResult, ScreenBayar, ScreenBayarDone,
  ScreenTukar, ScreenTukarStatus,
});
