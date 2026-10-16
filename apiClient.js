// Toggle Server: Aktifkan localhost untuk pengembangan lokal, atau beri komentar untuk beralih ke server produksi
//const SERVER_BASE = 'http://localhost:3000';
const SERVER_BASE = 'https://mypjokserver.com/server/public';

const API_BASE = `${SERVER_BASE}/api`;
let dataMateriPenilaian = [];

async function fetchAllData() {
    if (typeof showLoading === 'function') showLoading();
    try {
        // Fetch Atlet
        const resAtlet = await fetch(`${API_BASE}/atlet`);
        if (resAtlet.ok) {
            const data = await resAtlet.json();
            // Parse JSON field for posisi_pemain if it's stored as string
            dataAtlet = data.map(atlet => {
                try {
                    if(typeof atlet.posisi_pemain === 'string' && atlet.posisi_pemain.startsWith('[')){
                        atlet.posisi_pemain = JSON.parse(atlet.posisi_pemain);
                    }
                } catch(e) {}
                return atlet;
            });
        } else {
            const errData = await resAtlet.json().catch(() => ({}));
            throw new Error(errData.error || `Gagal mengambil data atlet (${resAtlet.status})`);
        }

        // Fetch Pelatih
        const resPelatih = await fetch(`${API_BASE}/pelatih`);
        if (resPelatih.ok) {
            dataPelatih = await resPelatih.json();
        } else {
            const errData = await resPelatih.json().catch(() => ({}));
            throw new Error(errData.error || `Gagal mengambil data pelatih (${resPelatih.status})`);
        }

        // Fetch Latihan
        const resLatihan = await fetch(`${API_BASE}/latihan`);
        if (resLatihan.ok) {
            dataLatihan = await resLatihan.json();
            // Konversi tipe data numerik yang dari DB mungkin menjadi string
            dataLatihan.forEach(d => {
                if (d.target !== null) d.target = parseInt(d.target);
                if (d.jumlah !== null) d.jumlah = parseInt(d.jumlah);
                if (d.benar !== null) d.benar = parseInt(d.benar);
                if (d.salah !== null) d.salah = parseInt(d.salah);
                if (d.nilai !== null) d.nilai = parseInt(d.nilai);
            });
        }

        // Fetch Materi Latihan (Opsional, timpa array listMateriLatihan)
        const resMateri = await fetch(`${API_BASE}/materi_penilaian`);
        if (resMateri.ok) {
            const materiList = await resMateri.json();
            dataMateriPenilaian = materiList;
            listMateriLatihan = materiList.map(m => m.nama_materi);
        }

        // Fetch Riwayat Latihan (Evaluasi Pelatih Terstruktur)
        try {
            const resRiwayat = await fetch(`${API_BASE}/tabel_riwayat_latihan`);
            if (resRiwayat.ok) {
                const riwayatList = await resRiwayat.json();
                if (Array.isArray(riwayatList)) {
                    dataRiwayatLatihan = riwayatList;
                    dataRiwayatLatihan.forEach(d => {
                        if (d.id_materi !== null) d.id_materi = parseInt(d.id_materi);
                        if (d.intensitas !== null) d.intensitas = parseInt(d.intensitas);
                        if (d.fisik !== null) d.fisik = parseInt(d.fisik);
                        if (d.mental !== null) d.mental = parseInt(d.mental);
                        if (d.teknik !== null) d.teknik = parseInt(d.teknik);
                    });
                }
            }
        } catch (e) {
            console.warn("Gagal memuat tabel_riwayat_latihan:", e);
        }

        console.log("Data berhasil dimuat dari server!");
        
        // Update badge notifikasi jika login sebagai pelatih
        if (typeof updateBadgeNotifEvaluasi === 'function') {
            updateBadgeNotifEvaluasi();
        }
    } catch (error) {
        console.error("Gagal terhubung ke API Server:", error);
        if (typeof showNotification === 'function') {
            showNotification(error.message || "Gagal memuat data dari server.", "error");
        }
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}
