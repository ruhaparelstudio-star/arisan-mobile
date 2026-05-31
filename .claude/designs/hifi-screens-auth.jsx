// Arisan Hi-Fi — Auth & onboarding screens (V2 direction)

function ScreenWelcome({ nav }) {
  return (
    <React.Fragment>
      <StatusBar />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 22px' }}>
        <button onClick={() => nav('home')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', padding: 8 }}>Lewati</button>
      </div>
      <Body pad={28} style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Illustration block */}
        <div style={{
          height: 300, borderRadius: 28, background: 'var(--primary-tint)',
          position: 'relative', overflow: 'hidden', marginTop: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* abstract community illustration */}
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '2px dashed var(--primary)', opacity: 0.35 }} />
          <div style={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', border: '2px dashed var(--primary)', opacity: 0.5 }} />
          {[
            { x: 0, y: -78, n: 'B' }, { x: 74, y: -24, n: 'M' }, { x: 46, y: 66, n: 'S' },
            { x: -46, y: 66, n: 'A' }, { x: -74, y: -24, n: 'R' },
          ].map((p, i) => (
            <div key={i} style={{ position: 'absolute', transform: `translate(${p.x}px, ${p.y}px)` }}>
              <Avatar name={p.n} size={i === 0 ? 56 : 46} ring />
            </div>
          ))}
          <div style={{
            width: 72, height: 72, borderRadius: 22, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
            boxShadow: '0 12px 30px -8px var(--primary-shadow)',
          }}>
            <Icon name="trophy" size={34} color="#fff" strokeWidth={2} />
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, lineHeight: 1.08,
            color: 'var(--ink)', letterSpacing: -0.8, margin: 0,
          }}>Arisan grup,<br/>tanpa ribet WA</h1>
          <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 14, maxWidth: 300 }}>
            Lacak siapa sudah bayar, undian yang adil & transparan, dan semua histori tersimpan rapi otomatis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 7, marginTop: 22 }}>
          <span style={{ width: 26, height: 6, borderRadius: 3, background: 'var(--primary)' }} />
          <span style={{ width: 8, height: 6, borderRadius: 3, background: 'var(--border-strong)' }} />
          <span style={{ width: 8, height: 6, borderRadius: 3, background: 'var(--border-strong)' }} />
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" iconRight="arrowRight" onClick={() => nav('phone')} style={{ marginTop: 24 }}>Mulai</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenPhone({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={back} />
      <Body>
        <Pill tone="mint" style={{ marginBottom: 14 }}>Langkah 1 dari 2</Pill>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 27, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.6, margin: 0 }}>
          Halo! Boleh tahu<br/>nomor WhatsApp kamu?
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
          Kami kirim kode verifikasi 6 digit lewat WhatsApp dalam ±30 detik.
        </p>

        <div style={{ marginTop: 26 }}>
          <Field label="NOMOR WHATSAPP" prefix="🇮🇩  +62" value="812 3456 7890" focused big />
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 11, alignItems: 'flex-start', background: 'var(--primary-tint)', borderRadius: 16, padding: 14 }}>
          <Icon name="message" size={20} color="var(--primary-ink)" />
          <div style={{ fontSize: 13, color: 'var(--primary-ink)', lineHeight: 1.45 }}>
            Pakai nomor yang aktif di WhatsApp ya — kode dikirim ke sana.
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('otp')} style={{ marginTop: 24 }}>Kirim Kode</Btn>
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.4 }}>
          Lanjut berarti setuju <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>Ketentuan</span> & <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>Privasi</span>
        </p>
      </Body>
    </React.Fragment>
  );
}

function ScreenOtp({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar onBack={back} />
      <Body>
        <Pill tone="mint" style={{ marginBottom: 14 }}>Langkah 2 dari 2</Pill>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 27, lineHeight: 1.12, color: 'var(--ink)', letterSpacing: -0.6, margin: 0 }}>
          Masukkan kode dari<br/>WhatsApp
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
          Dikirim ke +62 812-3456-7890 · <span style={{ color: 'var(--primary-ink)', fontWeight: 600, cursor: 'pointer' }}>ubah</span>
        </p>

        <div style={{ marginTop: 30 }}>
          <OtpBoxes filled={3} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--muted)' }}>
          Belum diterima? <span style={{ color: 'var(--muted-strong)', fontWeight: 600 }}>Kirim ulang dalam 00:24</span>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 11, alignItems: 'flex-start', border: '1px solid var(--border)', borderRadius: 16, padding: 14 }}>
          <Icon name="info" size={20} color="var(--muted)" />
          <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.45 }}>
            Setelah 3× gagal, kamu bisa hubungi dukungan untuk verifikasi manual.
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('otp-loading')} style={{ marginTop: 24 }}>Verifikasi</Btn>
      </Body>
    </React.Fragment>
  );
}

// ===== Gabung via kode (member side) =====
function ScreenJoin({ nav, back }) {
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Gabung Grup" onBack={back} />
      <Body>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--ink)', letterSpacing: -0.4, margin: '4px 0 6px' }}>
          Punya kode undangan?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>Minta kode ke ketua grup, lalu masukkan di sini.</p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {['S','M','A','X','9','K'].map((c, i) => (
            <div key={i} style={{
              flex: 1, height: 54, borderRadius: 14,
              border: `1.5px solid ${i < 3 ? 'var(--primary)' : 'var(--border-strong)'}`,
              background: i < 3 ? 'var(--primary-tint)' : 'var(--card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--ink)',
            }}>{i < 3 ? c : ''}</div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>atau</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <Btn full size="md" variant="outline" icon="qr">Scan QR Code</Btn>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('join-confirm')} style={{ marginTop: 24 }}>Cari Grup</Btn>
      </Body>
    </React.Fragment>
  );
}

function ScreenJoinConfirm({ nav, back }) {
  const rows = [
    ['Iuran / periode', 'Rp 500.000'],
    ['Frekuensi', 'Bulanan'],
    ['Total periode', '12 bulan'],
    ['Mode undian', 'Acak per periode'],
  ];
  return (
    <React.Fragment>
      <StatusBar />
      <AppBar title="Konfirmasi Gabung" onBack={back} />
      <Body>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 12 }}>Kamu akan bergabung ke:</div>
        <Card accent tint pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px -8px var(--primary-shadow)' }}>
              <Icon name="users" size={26} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>Arisan Geng SMA</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Ketua: Rina · 11 anggota</div>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: 14 }} pad={6}>
          {rows.map(([k, v], i) => (
            <ListRow key={i} title={k} lastChild={i === rows.length - 1}
              right={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)' }}>{v}</span>}
            />
          ))}
        </Card>

        <div style={{ marginTop: 14, display: 'flex', gap: 11, alignItems: 'flex-start', background: 'var(--amber-tint)', borderRadius: 16, padding: 14 }}>
          <Icon name="alert" size={20} color="var(--amber-ink)" />
          <div style={{ fontSize: 13, color: 'var(--amber-ink)', lineHeight: 1.45 }}>
            Dengan gabung, kamu berkomitmen bayar Rp 500rb/bulan selama 12 periode.
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <Btn variant="outline" size="lg" onClick={back} style={{ flex: 1 }}>Batal</Btn>
          <Btn size="lg" onClick={() => nav('join-done')} style={{ flex: 2 }}>Gabung Grup</Btn>
        </div>
      </Body>
    </React.Fragment>
  );
}

function ScreenJoinDone({ nav }) {
  return (
    <React.Fragment>
      <StatusBar />
      <Body style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 60 }}>
        <div style={{ width: 92, height: 92, borderRadius: '50%', background: 'var(--primary-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px -8px var(--primary-shadow)' }}>
            <Icon name="check" size={34} color="#fff" strokeWidth={3} />
          </div>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26, color: 'var(--ink)', letterSpacing: -0.5, margin: '24px 0 8px' }}>Selamat bergabung!</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280 }}>
          Kamu sekarang anggota <b style={{ color: 'var(--ink)' }}>Arisan Geng SMA</b>. Ketua akan mengabari jadwal periode pertama.
        </p>

        <Card style={{ marginTop: 26, width: '100%', textAlign: 'left' }}>
          <SectionLabel>Langkah selanjutnya</SectionLabel>
          {[
            ['wallet', 'Lengkapi nomor rekening'],
            ['calendar', 'Tunggu jadwal periode 1'],
            ['trophy', 'Pantau giliranmu di tab Grup'],
          ].map(([ic, t], i, a) => (
            <ListRow key={i} icon={ic} iconColor="var(--primary-ink)" title={t} lastChild={i === a.length - 1}
              right={<Icon name="chevronRight" size={18} color="var(--muted)" />} />
          ))}
        </Card>

        <div style={{ flex: 1 }} />
        <Btn full size="lg" onClick={() => nav('group')} style={{ marginTop: 24 }} iconRight="arrowRight">Lihat Grup</Btn>
      </Body>
    </React.Fragment>
  );
}

Object.assign(window, { ScreenWelcome, ScreenPhone, ScreenOtp, ScreenJoin, ScreenJoinConfirm, ScreenJoinDone });
