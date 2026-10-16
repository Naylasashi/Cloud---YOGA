/* Helper credit & member Sukma Yoga Studio (dipakai halaman Paket, Jadwal, Riwayat).
   Data disimpan di localStorage browser ini (demo, belum ada server). */
var Kredit = (function () {
  var KUNCI_AKUN = 'sukmaYogaMembers';
  var KUNCI_BOOKING = 'sukmaYogaBookings';

  function baca(kunci) {
    try { return JSON.parse(localStorage.getItem(kunci) || '[]'); }
    catch (e) { return []; }
  }

  function semuaAkun() { return baca(KUNCI_AKUN); }

  function simpanAkun(daftar) {
    try { localStorage.setItem(KUNCI_AKUN, JSON.stringify(daftar)); return true; }
    catch (e) { return false; }
  }

  function cariAkun(kode) {
    var k = String(kode || '').trim().toUpperCase();
    if (!k) return null;
    return semuaAkun().filter(function (a) { return a.kode.toUpperCase() === k; })[0] || null;
  }

  // Credit terpakai = booking dengan kode ini, kecuali yang dibatalkan dan creditnya dikembalikan (member).
  // Drop-in yang dibatalkan tidak mengembalikan credit.
  function terpakai(akun) {
    return baca(KUNCI_BOOKING).filter(function (b) {
      return b.kodeMember === akun.kode && !(b.status === 'dibatalkan' && b.creditDikembalikan);
    }).length;
  }

  function sisa(akun) { return Math.max(0, akun.totalCredit - terpakai(akun)); }

  function buatKode(tipe) {
    var awalan = tipe === 'member' ? 'MBR-' : 'DI-';
    var kode;
    do { kode = awalan + String(Math.floor(100000 + Math.random() * 900000)); }
    while (cariAkun(kode));
    return kode;
  }

  function tanggalKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function tambahBulan(d, n) {
    var r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var hariTerakhir = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), hariTerakhir));
    return r;
  }

  function formatTanggal(key) {
    var a = String(key).split('-');
    return new Date(Number(a[0]), Number(a[1]) - 1, Number(a[2]))
      .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function kedaluwarsa(akun) { return akun.berlakuSampai < tanggalKey(new Date()); }

  // Jadwal mingguan (0 Minggu ... 6 Sabtu), dipakai widget dashboard
  var KELAS = {
    1: [{ jam: '07.00 - 08.00', nama: 'Hatha Yoga (Pemula)', ins: 'Ayu' }],
    2: [{ jam: '18.30 - 19.30', nama: 'Vinyasa Flow', ins: 'Raka' }],
    3: [{ jam: '07.00 - 08.00', nama: 'Meditasi dan Pernapasan', ins: 'Ayu' }, { jam: '18.30 - 19.30', nama: 'Hatha Yoga (Pemula)', ins: 'Dewi' }],
    4: [{ jam: '18.30 - 19.30', nama: 'Yin Yoga', ins: 'Dewi' }],
    5: [{ jam: '07.00 - 08.00', nama: 'Vinyasa Flow', ins: 'Raka' }],
    6: [{ jam: '08.00 - 09.30', nama: 'Vinyasa Flow', ins: 'Raka' }],
    0: [{ jam: '08.00 - 09.00', nama: 'Hatha Yoga (Pemula)', ins: 'Dewi' }]
  };

  return {
    KELAS: KELAS,
    semuaAkun: semuaAkun, simpanAkun: simpanAkun, cariAkun: cariAkun,
    terpakai: terpakai, sisa: sisa, buatKode: buatKode,
    tanggalKey: tanggalKey, tambahBulan: tambahBulan, formatTanggal: formatTanggal,
    kedaluwarsa: kedaluwarsa
  };
})();
