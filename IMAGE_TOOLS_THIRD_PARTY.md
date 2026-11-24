# Image Tools — komponen pihak ketiga

Image Tools menggunakan API browser standar (Canvas, File, Blob). Mode hapus latar otomatis memuat modul pihak ketiga saat digunakan (tidak termasuk kode sumber library tersebut dalam ZIP):

- `@imgly/background-removal` versi 1.7.0, IMG.LY, lisensi AGPL-3.0.
- Repositori sumber: https://github.com/imgly/background-removal-js
- Halaman paket: https://www.npmjs.com/package/@imgly/background-removal
- Lisensi AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html

Modul, model ONNX, dan WASM dimuat hanya saat tombol **Hapus latar otomatis** digunakan. Untuk penggunaan dan redistribusi, periksa kewajiban lisensi AGPL-3.0, termasuk pemberian akses kode sumber modifikasi, jika berlaku. Jika syarat lisensi tidak cocok, jangan aktifkan mode otomatis; alat penghapusan warna/kuas tidak memerlukan library tersebut.
