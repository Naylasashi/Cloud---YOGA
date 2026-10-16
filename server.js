// server.js - backend Sukma Yoga (Express + MySQL)
// Jalankan: node server.js   (lalu buka http://localhost:3000)

const crypto = require('crypto');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Jangan sampai file server & konfigurasi bisa dibuka lewat browser
app.use((req, res, next) => {
  if (/^\/(server\.js|package|node_modules|\.env)/i.test(req.path)) return res.status(404).end();
  next();
});
app.use(express.static(__dirname)); // index.html, jadwal.html, dll tetap tampil

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sukma_yoga',
  dateStrings: true // kolom DATE dikirim sebagai teks 'YYYY-MM-DD'
});

/* ---------- helper ---------- */

class Gagal extends Error {
  constructor(pesan, status = 400) { super(pesan); this.status = status; }
}

const aman = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (e instanceof Gagal) return res.status(e.status).json({ error: e.message });
    console.error(e);
    res.status(500).json({ error: 'Terjadi kesalahan di server' });
  });

async function transaksi(fn) {
  const c = await db.getConnection();
  try {
    await c.beginTransaction();
    const hasil = await fn(c);
    await c.commit();
    return hasil;
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function tanggalKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function tambahBulan(d, n) {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const hariTerakhir = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  r.setDate(Math.min(d.getDate(), hariTerakhir));
  return r;
}

function hariDariTanggal(key) {
  const [y, m, d] = key.split('-').map(Number);
  return NAMA_HARI[new Date(y, m - 1, d).getDay()];
}

async function kodeUnik(c, tabel, kolom, buat) {
  for (let i = 0; i < 10; i++) {
    const kode = buat();
    const [rows] = await c.query(`SELECT 1 FROM \`${tabel}\` WHERE \`${kolom}\` = ?`, [kode]);
    if (!rows.length) return kode;
  }
  throw new Gagal('Gagal membuat kode unik, coba lagi', 500);
}

const angka6 = () => String(Math.floor(100000 + Math.random() * 900000));

// Credit terpakai = booking milik credit itu, kecuali yang dibatalkan DAN creditnya dikembalikan
async function ambilCredit(c, kode) {
  const [rows] = await c.query(
    `SELECT c.kode, c.tipe, c.total_credit, c.berlaku_sampai, p.nama AS nama_pelanggan, p.email,
            (SELECT COUNT(*) FROM booking b
              WHERE b.credit_kode = c.kode
                AND NOT (b.status = 'dibatalkan' AND b.credit_dikembalikan = 1)) AS terpakai
       FROM credit c
       JOIN pelanggan p ON p.id = c.pelanggan_id
      WHERE c.kode = ?`,
    [String(kode || '').trim().toUpperCase()]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    kode: r.kode,
    tipe: r.tipe,
    nama: r.nama_pelanggan,
    email: r.email,
    totalCredit: r.total_credit,
    berlakuSampai: r.berlaku_sampai,
    terpakai: r.terpakai,
    sisa: Math.max(0, r.total_credit - r.terpakai),
    kedaluwarsa: r.berlaku_sampai < tanggalKey(new Date())
  };
}

/* ---------- endpoint ---------- */

// Daftar paket
app.get('/api/paket', aman(async (req, res) => {
  const [rows] = await db.query(
    'SELECT kode, nama, tipe, harga, jumlah_credit AS jumlahCredit, masa_berlaku_bulan AS masaBerlakuBulan FROM paket ORDER BY id'
  );
  res.json(rows);
}));

// Semua kelas (jadwal mingguan)
app.get('/api/kelas', aman(async (req, res) => {
  const [rows] = await db.query(
    `SELECT k.id, k.nama, k.hari, k.jam_mulai AS jamMulai, k.jam_selesai AS jamSelesai,
            k.kapasitas, i.nama AS instruktur
       FROM kelas k JOIN instruktur i ON i.id = k.instruktur_id
      ORDER BY FIELD(k.hari,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), k.jam_mulai`
  );
  res.json(rows);
}));

// Kelas pada tanggal tertentu + sisa kursi.  /api/kelas/tanggal?tanggal=2026-10-19
app.get('/api/kelas/tanggal', aman(async (req, res) => {
  const tanggal = String(req.query.tanggal || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) throw new Gagal('Format tanggal harus YYYY-MM-DD');
  const [rows] = await db.query(
    `SELECT k.id, k.nama, k.jam_mulai AS jamMulai, k.jam_selesai AS jamSelesai, k.kapasitas,
            i.nama AS instruktur, COUNT(b.kode_booking) AS terisi
       FROM kelas k
       JOIN instruktur i ON i.id = k.instruktur_id
       LEFT JOIN booking b ON b.kelas_id = k.id AND b.tanggal = ? AND b.status = 'aktif'
      WHERE k.hari = ?
      GROUP BY k.id, i.nama
      ORDER BY k.jam_mulai`,
    [tanggal, hariDariTanggal(tanggal)]
  );
  res.json(rows.map((r) => ({ ...r, sisa: Math.max(0, r.kapasitas - r.terisi) })));
}));

// Beli paket -> pelanggan + pembelian + credit baru
// (pembayaran dianggap langsung lunas, sama seperti data contoh di database)
app.post('/api/beli', aman(async (req, res) => {
  const { nama, email, hp, paketKode, metode } = req.body || {};
  if (!nama || !email || !hp || !paketKode || !metode) throw new Gagal('Data belum lengkap');

  const hasil = await transaksi(async (c) => {
    const [pk] = await c.query('SELECT * FROM paket WHERE kode = ?', [paketKode]);
    if (!pk.length) throw new Gagal('Paket tidak ditemukan', 404);
    const paket = pk[0];

    const [pel] = await c.query(
      `INSERT INTO pelanggan (nama, email, hp) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nama = VALUES(nama), hp = VALUES(hp), id = LAST_INSERT_ID(id)`,
      [nama.trim(), email.trim().toLowerCase(), hp.trim()]
    );
    const pelangganId = pel.insertId;

    const [pem] = await c.query(
      `INSERT INTO pembelian (pelanggan_id, paket_id, harga, metode, status, dibayar_pada)
       VALUES (?, ?, ?, ?, 'lunas', NOW())`,
      [pelangganId, paket.id, paket.harga, metode]
    );

    const awalan = paket.tipe === 'member' ? 'MBR-' : 'DI-';
    const kode = await kodeUnik(c, 'credit', 'kode', () => awalan + angka6());
    const berlakuSampai = tanggalKey(tambahBulan(new Date(), paket.masa_berlaku_bulan));

    await c.query(
      `INSERT INTO credit (kode, pembelian_id, pelanggan_id, tipe, total_credit, berlaku_sampai)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [kode, pem.insertId, pelangganId, paket.tipe, paket.jumlah_credit, berlakuSampai]
    );
    return kode;
  });

  res.json(await ambilCredit(db, hasil));
}));

// Cek credit / akun berdasarkan kode
app.get('/api/credit/:kode', aman(async (req, res) => {
  const credit = await ambilCredit(db, req.params.kode);
  if (!credit) throw new Gagal('Kode tidak ditemukan', 404);
  res.json(credit);
}));

// Booking kelas
app.post('/api/booking', aman(async (req, res) => {
  const { kode, kelasId, tanggal } = req.body || {};
  if (!kode || !kelasId || !/^\d{4}-\d{2}-\d{2}$/.test(String(tanggal))) throw new Gagal('Data belum lengkap');

  const kodeBooking = await transaksi(async (c) => {
    // kunci baris kelas & credit supaya dua orang tidak bisa mengambil kursi terakhir bersamaan
    const [kl] = await c.query('SELECT * FROM kelas WHERE id = ? FOR UPDATE', [kelasId]);
    if (!kl.length) throw new Gagal('Kelas tidak ditemukan', 404);
    const kelas = kl[0];

    await c.query('SELECT kode FROM credit WHERE kode = ? FOR UPDATE', [String(kode).trim().toUpperCase()]);
    const credit = await ambilCredit(c, kode);
    if (!credit) throw new Gagal('Kode member / drop-in tidak ditemukan', 404);

    if (hariDariTanggal(tanggal) !== kelas.hari) throw new Gagal(`Kelas ini hanya ada hari ${kelas.hari}`);
    if (tanggal < tanggalKey(new Date())) throw new Gagal('Tanggal sudah lewat');
    if (credit.kedaluwarsa) throw new Gagal('Credit sudah kedaluwarsa');
    if (tanggal > credit.berlakuSampai) throw new Gagal(`Credit hanya berlaku sampai ${credit.berlakuSampai}`);
    if (credit.sisa <= 0) throw new Gagal('Credit sudah habis');

    const [dobel] = await c.query(
      `SELECT 1 FROM booking WHERE credit_kode = ? AND kelas_id = ? AND tanggal = ? AND status = 'aktif'`,
      [credit.kode, kelas.id, tanggal]
    );
    if (dobel.length) throw new Gagal('Kamu sudah booking kelas ini di tanggal tersebut');

    const [[{ terisi }]] = await c.query(
      `SELECT COUNT(*) AS terisi FROM booking WHERE kelas_id = ? AND tanggal = ? AND status = 'aktif'`,
      [kelas.id, tanggal]
    );
    if (terisi >= kelas.kapasitas) throw new Gagal('Kelas sudah penuh');

    const kb = await kodeUnik(c, 'booking', 'kode_booking', () => 'BK-' + crypto.randomBytes(3).toString('hex').toUpperCase());
    await c.query(
      'INSERT INTO booking (kode_booking, credit_kode, kelas_id, tanggal) VALUES (?, ?, ?, ?)',
      [kb, credit.kode, kelas.id, tanggal]
    );
    return kb;
  });

  res.json({ ok: true, kodeBooking });
}));

// Batalkan booking. Member: credit dikembalikan. Drop-in: tidak dikembalikan.
// (Kalau ada aturan batas waktu pembatalan, tambahkan pengecekannya di sini.)
app.post('/api/booking/:kodeBooking/batal', aman(async (req, res) => {
  const hasil = await transaksi(async (c) => {
    const [rows] = await c.query(
      `SELECT b.kode_booking, b.status, cr.tipe
         FROM booking b JOIN credit cr ON cr.kode = b.credit_kode
        WHERE b.kode_booking = ? FOR UPDATE`,
      [req.params.kodeBooking]
    );
    if (!rows.length) throw new Gagal('Booking tidak ditemukan', 404);
    if (rows[0].status !== 'aktif') throw new Gagal('Booking ini sudah tidak aktif');

    const kembali = rows[0].tipe === 'member' ? 1 : 0;
    await c.query(
      `UPDATE booking SET status = 'dibatalkan', credit_dikembalikan = ?, dibatalkan_pada = NOW()
        WHERE kode_booking = ?`,
      [kembali, req.params.kodeBooking]
    );
    return kembali === 1;
  });
  res.json({ ok: true, creditDikembalikan: hasil });
}));

// Riwayat booking milik satu kode
app.get('/api/riwayat/:kode', aman(async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.kode_booking AS kodeBooking, b.tanggal, b.status,
            b.credit_dikembalikan AS creditDikembalikan,
            k.nama AS kelas, k.jam_mulai AS jamMulai, k.jam_selesai AS jamSelesai,
            i.nama AS instruktur
       FROM booking b
       JOIN kelas k ON k.id = b.kelas_id
       JOIN instruktur i ON i.id = k.instruktur_id
      WHERE b.credit_kode = ?
      ORDER BY b.tanggal DESC, k.jam_mulai`,
    [String(req.params.kode).trim().toUpperCase()]
  );
  res.json(rows);
}));

app.listen(3000, () => console.log('Jalan di http://localhost:3000'));