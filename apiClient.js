const SERVER_BASE = 'https://mypjokserver.com/server/public'; //'http://localhost:3000';
const API_BASE = `${SERVER_BASE}/api`;

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
            listMateriLatihan = materiList.map(m => m.nama_materi);
        }

        console.log("Data berhasil dimuat dari server!");
    } catch (error) {
        console.error("Gagal terhubung ke API Server:", error);
        if (typeof showNotification === 'function') {
            showNotification(error.message || "Gagal memuat data dari server.", "error");
        }
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}
