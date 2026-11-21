# PBJTOOLS v1.7 — PDF Tools dan Dashboard Excel (internal)

Aplikasi internal berbasis HTML/CSS/JavaScript untuk pengolahan PDF dan data Excel. Beranda langsung menampilkan katalog alat tanpa konten promosi. Menggunakan logo PBJ yang disertakan pengguna. Dashboard Excel pada versi lama tetap dipertahankan. Ini aplikasi beta; jangan anggap sebagai layanan TTE tersertifikasi atau sistem resmi untuk menyimpan dokumen pemerintah.

## Penyesuaian v1.7

- Beranda operasional tanpa slogan, ajakan promosi, harga, atau langganan. Akses cepat untuk Gabung, Pisah, Kompres, dan Tanda Tangan PDF tetap ada.
- Katalog PDF tetap dilengkapi: kartu interaktif dengan animasi singkat, tombol favorit (bintang), filter Favorit, pencarian dengan jumlah hasil, dan pintasan `Ctrl+K` (atau `/` saat bukan di input).
- Alat terakhir dibuka muncul di beranda. Favorit dan riwayat **nama alat saja** disimpan dalam penyimpanan browser; berkas PDF tidak disimpan di fitur riwayat ini.
- Workspace PDF dilengkapi penunjuk langkah Pilih Berkas → Atur Hasil → Unduh.
- Perbaikan tampilan desktop/HP. Bahasa menu disederhanakan. Seluruh alat dan Excel Dashboard v1.5 dipertahankan.
- **Tidak ada login, biaya berlangganan, atau iklan** pada versi ini.

## Menjalankan

1. Ekstrak ZIP dan buka folder `PBJTOOLS`.
2. Buka `index.html` di Chrome/Edge. Untuk mengunggah versi website, publikasikan isi **folder** `PBJTOOLS` ke root repository atau pengaturan GitHub Pages yang berlaku.
3. Klik kartu alat PDF. Pilih file, isi pengaturan, dan unduh hasilnya.
4. Untuk Excel, pilih menu **Dashboard Excel** atau **Olah Data Excel**.

**Koneksi internet diperlukan untuk fitur PDF:** pustaka `pdf-lib` dan `PDF.js` dimuat melalui CDN. Pada jaringan yang memblokir CDN, pemrosesan PDF tidak dapat berjalan sampai dua pustaka ini dipasang lokal di folder `vendor`. JSZip untuk file ZIP sudah disediakan lokal.

## Alat yang bisa digunakan di versi ini (18)

- Gabung PDF, Pisah PDF (satu gabungan/halaman terpisah/semua halaman).
- Kompres PDF (ringan, seimbang, kecil, ekstrem).
- Edit PDF (menambah teks/catatan, bukan mengganti teks asli).
- Tanda tangan visual (JPG/PNG atau potongan dari PDF; **BUKAN TTE tersertifikasi**).
- Atur halaman (urut, hapus, putar).
- Hapus halaman, Ambil halaman, Putar PDF.
- Tambah nomor halaman, watermark teks, potong margin/tampilan PDF.
- Simpan ulang PDF yang masih terbaca (upaya perapian struktur, bukan pemulihan rusak parah).
- JPG/PNG ke PDF, PDF ke JPG (ZIP), scan/foto ke PDF.
- PDF ke Markdown **teks sederhana** (bukan OCR, tidak mempertahankan tabel/gambar/tata letak).
- Bandingkan PDF **berbasis ekstraksi teks** (bukan selisih visual/gambar).

Semua operasi di atas berjalan di browser, tanpa upload file ke server PBJTOOLS.

## Daftar alat yang tampil tetapi memerlukan pengembangan

Konversi PDF↔Word, PDF↔PowerPoint, PDF↔Excel, HTML→PDF, PDF/A, OCR hasil scan, PDF berpassword, redaksi sensitif permanen, formulir PDF canggih, terjemahan AI, ringkasan AI, dan workflow perlu mesin konversi/server atau pustaka tambahan. **Kartu ditandai dan menampilkan penjelasan; tidak menjalankan proses palsu.** Untuk memasang layanan tersebut secara akurat di GitHub Pages, diperlukan backend terpisah dan kebijakan privasi/penyimpanan data yang jelas.

## Aturan nama hasil

Nama file asal dipertahankan dan ditambah `-PBJtool`. Contoh:

- `RAPOT2002.pdf` → `RAPOT2002-PBJtool-edit.pdf` atau `RAPOT2002-PBJtool-kompres-balanced.pdf`.
- `RAPOT2002.pdf`, split `3,9,8` mode terpisah → ZIP bernama `RAPOT2002-PBJtool-halaman-pilihan.zip` berisi `RAPOT2002-PBJtool-halaman_003.pdf`, `RAPOT2002-PBJtool-halaman_009.pdf`, dan `RAPOT2002-PBJtool-halaman_008.pdf`.
- `DATA PEGAWAI.xlsx` → `DATA-PEGAWAI-PBJtool.html` dari Dashboard Excel.

Nama file dibersihkan dari karakter yang tidak diperbolehkan sistem operasi. Ekstensi dan keterangan proses ditambahkan agar unduhan tidak saling menimpa. Saat **Cetak / PDF** dari dashboard Excel, penamaan diatur oleh dialog cetak browser, bukan aplikasi.

## Catatan teknis & keamanan

- PDF sampai 35 MB per berkas pada antarmuka versi ini; file besar dan scan beresolusi tinggi dapat menghabiskan memori HP.
- Kompresi raster mengubah halaman menjadi gambar dan menghilangkan kemampuan mencari teks. Ukuran akhir bisa saja tidak lebih kecil dari sumber; sistem mempertahankan sumber jika kompresi justru memperbesar.
- `Crop PDF` mengatur *crop box* (batas tampilan), bukan membuang data di luar area secara permanen.
- Menambah teks, watermark, memotong, menyusun, atau mengompresi dokumen PDF yang sudah ditandatangani digital dapat membatalkan verifikasi tanda tangan sebelumnya.
- Bandingkan PDF hanya memeriksa teks yang dapat diekstrak; perubahan foto atau letak dokumen mungkin tidak terdeteksi.
- `Repair` hanya bekerja untuk PDF yang bisa dimuat. Dokumen rusak berat/enkripsi tidak otomatis bisa dipulihkan.
- Jangan gunakan tempelan tanda tangan sebagai pengganti TTE tersertifikasi PSrE/BSrE.

## Struktur berkas

- `index.html`: antarmuka utama dan workspace
- `styles.css`, `orbita-theme.css`, `pdf-studio.css`, `pdf-directory.css`, `pbjtools-modern.css`, `pbjtools-internal.css`: gaya UI
- `app.js`: dashboard Excel lama, tetap dipertahankan
- `pdf-studio.js`: pemrosesan PDF
- `pdf-directory.js`: katalog, pencarian, dan filter alat PDF
- `pbjtools-modern.js`: favorit, riwayat alat, shortcut pencarian, dan indikator alur
- `assets/`: logo PBJ dan favicon
- `contoh-data/` dan `contoh-pdf/`: file contoh pengujian

## Status pengujian

Tampilan desktop/HP, filter & favorit, pencarian, alat terakhir digunakan, navigasi workspace, demo Dashboard Excel, dan penamaan ekspor HTML telah diuji di Chromium. Alur Split PDF `3,9,8` serta nama file ZIP telah diuji menggunakan simulasi pustaka PDF. **Pemrosesan PDF asli secara menyeluruh belum diuji**, karena pustaka eksternal membutuhkan jaringan yang sesuai. Lakukan uji dengan PDF asli di browser sebelum dipakai dalam pekerjaan resmi.
