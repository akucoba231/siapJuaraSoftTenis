// Logika untuk halaman Catatan Latihan

function renderLatihanSection() {
    const userStr = sessionStorage.getItem('loggedInUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const atletView = document.getElementById('atletLatihanView');
    const pelatihView = document.getElementById('pelatihLatihanView');

    if (user.role === 'pelatih') {
        atletView.style.display = 'none';
        pelatihView.style.display = 'block';
        renderDaftarPersetujuan(user.nama_pelatih);
    } else {
        atletView.style.display = 'block';
        pelatihView.style.display = 'none';
        renderGridMateriAtlet();
    }
}

// ---------------- ALUR ATLET ----------------

function renderGridMateriAtlet() {
    const grid = document.getElementById('gridMateriLatihan');
    grid.innerHTML = '';
    
    listMateriLatihan.forEach(materi => {
        const item = document.createElement('div');
        item.className = 'materi-item';
        
        item.innerHTML = `<strong>${materi}</strong> <span style="font-size: 1.2rem; font-weight: bold;">&#8250;</span>`;
        
        item.onclick = () => openFormLatihan(materi);
        grid.appendChild(item);
    });
}

function openFormLatihan(materi) {
    document.getElementById('atletLatihanTitle').innerText = `Form Latihan: ${materi}`;
    document.getElementById('atletMateriName').value = materi;
    document.getElementById('atletTanggal').value = new Date().toISOString().split('T')[0];
    navigateTo('form-latihan');
}

async function submitLatihanAtlet(e) {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    
    const newRecord = {
        id_latihan: "lat-" + Date.now(),
        id_atlet: user.id_atlet,
        tempat_latihan: document.getElementById('atletTempat').value,
        tanggal_latihan: document.getElementById('atletTanggal').value,
        materi_latihan: document.getElementById('atletMateriName').value,
        waktu: document.getElementById('atletWaktu').value,
        target: document.getElementById('atletTarget').value,
        jumlah: document.getElementById('atletJumlah').value,
        benar: document.getElementById('atletBenar').value,
        salah: document.getElementById('atletSalah').value,
        koreksi: document.getElementById('atletKoreksi').value,
        nilai: document.getElementById('atletNilai').value,
        evaluasi: document.getElementById('atletEvaluasi').value,
        catatan: document.getElementById('atletCatatan').value,
        status: "diajukan"
    };

    console.log("Data form catatan latihan:", newRecord);

    try {
        const res = await fetch(`${API_BASE}/latihan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRecord)
        });
        if (res.ok) {
            await fetchAllData(); // Ambil ulang data dari server
            document.getElementById('atletLatihanForm').reset();
            showNotification("Catatan latihan berhasil diajukan!", "success");
            navigateTo('grafik-riwayat'); // Kembali ke grafik & riwayat
        } else {
            showNotification("Gagal menyimpan latihan.", "error");
        }
    } catch(err) {
        showNotification("Terjadi kesalahan koneksi.", "error");
    }
}

function renderRiwayatAtlet(id_atlet) {
    const container = document.getElementById('riwayatLatihanAtlet');
    if (!container) return; // safeguard if element is not in DOM
    const myData = dataLatihan.filter(d => d.id_atlet === id_atlet);
    
    if(myData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-light)">Belum ada riwayat latihan.</p>';
        return;
    }
    
    let html = '';
    myData.forEach(d => {
        let statusBadge = d.status === 'diajukan' ? 
            `<span class="badge" style="background:var(--secondary); color:black;">Diajukan</span>` : 
            `<span class="badge" style="background:var(--primary); color:white;">Dinilai (Skor: ${d.nilai})</span>`;
            
        html += `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${d.status === 'diajukan' ? 'var(--secondary)' : 'var(--primary)'}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                <strong>${d.materi_latihan}</strong>
                ${statusBadge}
            </div>
            <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;">
                📅 ${d.tanggal_latihan} | 📍 ${d.tempat_latihan}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; background: var(--bg-hover); padding: 0.5rem; border-radius: 4px;">
                <div>Waktu: ${d.waktu || '-'}</div>
                <div>Target/Jml: ${d.target || '-'}/${d.jumlah || '-'}</div>
                <div>Benar/Salah: ${d.benar || '-'}/${d.salah || '-'}</div>
            </div>
            ${d.nilai ? `
            <div style="margin-top: 1rem; font-size: 0.9rem; border-top: 1px dashed var(--border); padding-top: 0.5rem;">
                <p><strong>Koreksi:</strong> ${d.koreksi}</p>
                <p><strong>Evaluasi:</strong> ${d.evaluasi}</p>
                <p><strong>Catatan:</strong> ${d.catatan}</p>
            </div>
            ` : ''}
        </div>
        `;
    });
    container.innerHTML = html;
}

// ---------------- ALUR PELATIH ----------------

function updateBadgeNotifEvaluasi() {
    const badge = document.getElementById('badgeNotifEvaluasi');
    if (!badge) return;
    
    // Hitung jumlah pengajuan yang belum dinilai (status = 'diajukan')
    const pendingData = dataLatihan.filter(d => d.status === 'diajukan');
    const count = pendingData.length;
    
    if (count > 0) {
        badge.innerText = count > 9 ? '9+' : count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
        badge.innerText = '';
    }
}


function renderDaftarPersetujuan(nama_pelatih) {
    const container = document.getElementById('listPersetujuanLatihan');
    const pendingData = dataLatihan.filter(d => d.status === 'diajukan');
    
    if(pendingData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-light)">Tidak ada pengajuan latihan yang menunggu persetujuan.</p>';
        return;
    }
    
    let html = '';
    pendingData.forEach(d => {
        // Cari nama atlet
        const atlet = dataAtlet.find(a => a.id_atlet === d.id_atlet);
        const namaAtlet = atlet ? atlet.nama_atlet : 'Atlet Unknown';
        
        html += `
        <div class="card" style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid var(--secondary);">
            <div>
                <strong>${namaAtlet}</strong> - ${d.materi_latihan}<br>
                <small style="color: var(--text-light)">📅 ${d.tanggal_latihan} | 📍 ${d.tempat_latihan}</small>
            </div>
            <button class="btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="openPelatihLatihanModal('${d.id_latihan}')">Nilai & Setujui</button>
        </div>
        `;
    });
    container.innerHTML = html;
}

function openPelatihLatihanModal(id_latihan) {
    const record = dataLatihan.find(d => d.id_latihan === id_latihan);
    if(!record) return;
    
    const atlet = dataAtlet.find(a => a.id_atlet === record.id_atlet);
    
    document.getElementById('pelatihLatihanId').value = id_latihan;
    document.getElementById('evalNamaAtlet').innerText = atlet ? atlet.nama_atlet : 'Unknown';
    document.getElementById('evalMateri').innerText = record.materi_latihan;
    document.getElementById('evalTanggal').innerText = record.tanggal_latihan;
    document.getElementById('evalWaktu').innerText = record.waktu || '-';
    document.getElementById('evalTargetJml').innerText = `${record.target || '-'}/${record.jumlah || '-'}`;
    document.getElementById('evalBenarSalah').innerText = `${record.benar || '-'}/${record.salah || '-'}`;
    
    document.getElementById('pelatihLatihanModal').classList.add('active');
}

function hidePelatihLatihanModal() {
    document.getElementById('pelatihLatihanModal').classList.remove('active');
}
function closePelatihLatihanModal(e) {
    if(e.target.id === 'pelatihLatihanModal') hidePelatihLatihanModal();
}

async function submitEvaluasiPelatih(e) {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const id_latihan = document.getElementById('pelatihLatihanId').value;
    
    const payload = {
        nilai: document.getElementById('evalNilai').value,
        koreksi: document.getElementById('evalKoreksi').value,
        evaluasi: document.getElementById('evalEvaluasi').value,
        catatan: document.getElementById('evalCatatan').value,
        status: `disetujui oleh ${user.nama_pelatih}`
    };

    try {
        const res = await fetch(`${API_BASE}/latihan/${id_latihan}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            await fetchAllData();
            hidePelatihLatihanModal();
            document.getElementById('pelatihLatihanForm').reset();
            showNotification("Penilaian berhasil disimpan!", "success");
            renderDaftarPersetujuan(user.nama_pelatih);
            if (typeof updateBadgeNotifEvaluasi === 'function') {
                updateBadgeNotifEvaluasi();
            }
        } else {
            showNotification("Gagal menyimpan penilaian.", "error");
        }
    } catch(err) {
        showNotification("Terjadi kesalahan koneksi.", "error");
    }
}

// ---------------- ALUR GRAFIK & RIWAYAT ----------------
function renderGrafikRiwayat() {
    const userStr = sessionStorage.getItem('loggedInUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    let myData = [];
    if (user.role === 'atlet') {
        myData = dataLatihan.filter(d => d.id_atlet === user.id_atlet);
    } else {
        myData = dataLatihan;
    }

    // --- Render DataTables ---
    if ($.fn.DataTable.isDataTable('#riwayatTable')) {
        $('#riwayatTable').DataTable().destroy();
    }
    
    const tbody = document.querySelector('#riwayatTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        
        myData.forEach((d, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${d.tanggal_latihan}</td>
                <td>${d.materi_latihan}</td>
                <td>${d.waktu || '-'}</td>
                <td>${d.benar !== "" ? d.benar : '-'}</td>
                <td>${d.salah !== "" ? d.salah : '-'}</td>
                <td>${d.target !== "" ? d.target : '-'}</td>
                <td>${d.jumlah !== "" ? d.jumlah : '-'}</td>
                <td>${d.koreksi || '-'}</td>
                <td>${d.nilai || '-'}</td>
                <td>${d.evaluasi ? `<div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: pre-wrap; cursor: pointer; min-width: 150px; max-width: 250px;" onclick="showFullCatatan('${encodeURIComponent(d.evaluasi).replace(/'/g, "%27")}')" title="Klik untuk lihat selengkapnya">${d.evaluasi}</div>` : '-'}</td>
                <td>${d.catatan ? `<div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; white-space: pre-wrap; cursor: pointer; min-width: 150px; max-width: 250px;" onclick="showFullCatatan('${encodeURIComponent(d.catatan).replace(/'/g, "%27")}')" title="Klik untuk lihat selengkapnya">${d.catatan}</div>` : '-'}</td>
                <td>${d.status === 'diajukan' ? '<span style="background:var(--accent); color:black; padding:2px 5px; border-radius:4px; font-size:12px; font-weight:600;">Diajukan</span>' : '<span style="background:var(--primary); color:white; padding:2px 5px; border-radius:4px; font-size:12px; font-weight:600;">Disetujui Pelatih</span>'}</td>
                <td style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; height: 100%;">
                    <button class="btn" style="width: 100%; padding: 4px 8px; font-size: 12px; background: var(--secondary);" onclick="editLatihan('${d.id_latihan}')">Ubah</button>
                    <button class="btn" style="width: 100%; padding: 4px 8px; font-size: 12px; background: #ef4444;" onclick="hapusLatihan('${d.id_latihan}')">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        $('#riwayatTable').DataTable({
            "pageLength": 10,
            "language": {
                "search": "Cari:",
                "lengthMenu": "Tampilkan _MENU_ entri",
                "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
                "emptyTable": "Tidak ada riwayat latihan tersedia",
                "paginate": {
                    "first": "Pertama",
                    "last": "Terakhir",
                    "next": "Selanjutnya",
                    "previous": "Sebelumnya"
                }
            }
        });

        // Setup eksternal filter materi latihan
        var table = $('#riwayatTable').DataTable();
        var select = $('#filterMateriLatihan');
        
        // Kosongkan dan isi ulang opsi select berdasarkan data di tabel
        select.empty();
        select.append('<option value="">Semua Materi</option>');
        table.column(2).data().unique().sort().each(function (d, j) {
            select.append('<option value="' + d + '">' + d + '</option>');
        });

        // Listener untuk filter dropdown eksternal
        select.off('change').on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            table.column(2)
                 .search(val ? '^' + val + '$' : '', true, false)
                 .draw();
        });
    }

    // --- Render Chart.js ---
    // Urutkan data berdasarkan tanggal untuk grafik, dan hanya ambil yang sudah dinilai
    const chartData = [...myData]
        .filter(d => d.nilai && !isNaN(d.nilai))
        .sort((a, b) => new Date(a.tanggal_latihan) - new Date(b.tanggal_latihan));
    
    // Label sumbu X: "Tanggal (Materi)"
    // 1. Populate Dropdown Filter for Line Chart
    const uniqueMateri = [...new Set(chartData.map(d => d.materi_latihan))];
    const selectMateri = $('#filterChartMateri');
    const currentSelected = selectMateri.val();
    selectMateri.empty();
    
    if(uniqueMateri.length > 0) {
        uniqueMateri.forEach(m => {
            selectMateri.append(`<option value="${m}">${m}</option>`);
        });
        if (currentSelected && uniqueMateri.includes(currentSelected)) {
            selectMateri.val(currentSelected);
        }
    } else {
        selectMateri.append('<option value="">Belum ada data nilai</option>');
    }

    const selectedMateri = selectMateri.val();

    // 2. Render Line Chart (Filtered by Dropdown)
    const lineDataFiltered = chartData.filter(d => d.materi_latihan === selectedMateri);
    const lineLabels = lineDataFiltered.map(d => d.tanggal_latihan);
    const lineNilai = lineDataFiltered.map(d => parseInt(d.nilai));

    if (window.myPerkembanganChart) {
        window.myPerkembanganChart.destroy();
    }

    const ctxLine = document.getElementById('perkembanganChart');
    if (ctxLine && selectedMateri) {
        window.myPerkembanganChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: lineLabels,
                datasets: [{
                    label: `Perkembangan: ${selectedMateri}`,
                    data: lineNilai,
                    borderColor: '#065f46',
                    backgroundColor: 'rgba(6, 95, 70, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#f59e0b',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { position: 'top', align: 'start' }
                }
            }
        });
    }

    // 3. Render Radar Chart (Latest score for each unique materi)
    const latestScores = {};
    chartData.forEach(d => {
        // Karena data sudah di-sort Ascending (lama ke baru), maka iterasi ke depan akan mereplace dengan yang terbaru
        latestScores[d.materi_latihan] = parseInt(d.nilai);
    });

    const radarLabels = Object.keys(latestScores);
    const radarData = Object.values(latestScores);

    if (window.myRadarChart) {
        window.myRadarChart.destroy();
    }

    const ctxRadar = document.getElementById('profilAtletChart');
    if (ctxRadar && radarLabels.length > 0) {
        window.myRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: radarLabels,
                datasets: [{
                    label: 'Profil Kekuatan Terkini',
                    data: radarData,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}

// ---------------- GRAFIK PROFIL PELATIH ----------------
function renderProfilGrafik(id_atlet) {
    if (!id_atlet) return;
    
    // Ambil data spesifik atlet ini dari dataRiwayatLatihan (hanya yang memiliki nilai teknik valid)
    const sourceData = (typeof dataRiwayatLatihan !== 'undefined' && dataRiwayatLatihan.length > 0) 
        ? dataRiwayatLatihan 
        : (typeof dataLatihan !== 'undefined' ? dataLatihan : []);

    const chartData = sourceData
        .filter(d => d.id_atlet === id_atlet && (d.teknik !== null && !isNaN(d.teknik) || d.nilai !== null && !isNaN(d.nilai)))
        .sort((a, b) => new Date(a.tanggal || a.tanggal_latihan) - new Date(b.tanggal || b.tanggal_latihan));
    
    // Helper function untuk resolusi nama materi
    const getMateriName = (d) => {
        if (d.nama_materi) return d.nama_materi;
        if (d.materi_latihan) return d.materi_latihan;
        if (typeof dataMateriPenilaian !== 'undefined' && dataMateriPenilaian.length > 0) {
            const found = dataMateriPenilaian.find(m => m.id_materi === d.id_materi);
            if (found) return found.nama_materi;
        }
        if (typeof listMateriLatihan !== 'undefined' && d.id_materi && listMateriLatihan[d.id_materi - 1]) {
            return listMateriLatihan[d.id_materi - 1];
        }
        return `Materi ${d.id_materi || '-'}`;
    };

    // Helper function untuk mengambil nilai teknik (prioritas: d.teknik, fallback: d.nilai)
    const getTeknikScore = (d) => {
        if (d.teknik !== null && !isNaN(d.teknik) && d.teknik !== undefined) return parseInt(d.teknik);
        if (d.nilai !== null && !isNaN(d.nilai) && d.nilai !== undefined) return parseInt(d.nilai);
        return 0;
    };

    // 1 & 2. Render Line Chart Perkembangan Latihan (jika elemen tersedia di DOM)
    if (typeof renderRiwayatLatihanGrafik === 'function') {
        renderRiwayatLatihanGrafik(id_atlet);
    }

    // 3. Render Radar Chart: canvas profilAtletChartPelatih (Nilai terbaru dari field teknik per materi)
    const latestScores = {};
    chartData.forEach(d => {
        latestScores[getMateriName(d)] = getTeknikScore(d);
    });

    const radarLabels = Object.keys(latestScores);
    const radarData = Object.values(latestScores);

    if (window.myRadarChartPelatih) {
        window.myRadarChartPelatih.destroy();
    }

    const ctxRadar = document.getElementById('profilAtletChartPelatih');
    if (ctxRadar && radarLabels.length > 0) {
        window.myRadarChartPelatih = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: radarLabels,
                datasets: [{
                    label: 'Profil Penguasaan Teknik Terkini',
                    data: radarData,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }

    // 4. Render Line Chart 4 Parameter Kesiapan: canvas chartKesiapanAtletPelatih (Fisik, Teknik, Mental, Intensitas / 2)
    if (window.myKesiapanChartPelatih) {
        window.myKesiapanChartPelatih.destroy();
    }

    const ctxKesiapan = document.getElementById('chartKesiapanAtletPelatih');
    if (ctxKesiapan && chartData.length > 0) {
        const kesiapanLabels = chartData.map(d => d.tanggal || d.tanggal_latihan);
        const dataFisik = chartData.map(d => (d.fisik !== null && !isNaN(d.fisik) && d.fisik !== undefined) ? parseInt(d.fisik) : 3);
        const dataTeknik = chartData.map(d => getTeknikScore(d));
        const dataMental = chartData.map(d => (d.mental !== null && !isNaN(d.mental) && d.mental !== undefined) ? parseInt(d.mental) : 3);
        const dataIntensitas = chartData.map(d => {
            const raw = (d.intensitas !== null && !isNaN(d.intensitas) && d.intensitas !== undefined) ? parseFloat(d.intensitas) : 5;
            return parseFloat((raw / 2).toFixed(1));
        });

        window.myKesiapanChartPelatih = new Chart(ctxKesiapan, {
            type: 'line',
            data: {
                labels: kesiapanLabels,
                datasets: [
                    {
                        label: 'Fisik (Zona HR 1-5)',
                        data: dataFisik,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointRadius: 5,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Teknik (Skala 1-5)',
                        data: dataTeknik,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointRadius: 5,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Mental (Skala 1-5)',
                        data: dataMental,
                        borderColor: '#eab308',
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#eab308',
                        pointBorderColor: '#fff',
                        pointRadius: 5,
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Intensitas (RPE / 2)',
                        data: dataIntensitas,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2.5,
                        borderDash: [5, 4],
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#fff',
                        pointRadius: 5,
                        fill: false,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 6,
                        ticks: { stepSize: 1 },
                        title: {
                            display: true,
                            text: 'Skala Nilai (Maks 5)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tanggal Sesi Latihan'
                        }
                    }
                },
                plugins: {
                    legend: { position: 'top', align: 'center' },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const idx = context[0].dataIndex;
                                const item = chartData[idx];
                                return `${item.tanggal || item.tanggal_latihan} | Materi: ${getMateriName(item)}`;
                            },
                            label: function(context) {
                                if (context.dataset.label.includes('Intensitas')) {
                                    const rawRpe = Math.round(context.parsed.y * 2);
                                    return ` Intensitas: RPE ${rawRpe}/10 (Normalisasi: ${context.parsed.y}/5)`;
                                }
                                return ` ${context.dataset.label}: ${context.parsed.y} / 5`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// ---------------- ALUR EDIT DAN HAPUS LATIHAN ----------------
function editLatihan(id) {
    const record = dataLatihan.find(d => d.id_latihan === id);
    if (!record) return;

    document.getElementById('editLatihanId').value = record.id_latihan;
    document.getElementById('editTempat').value = record.tempat_latihan || "";
    document.getElementById('editTanggal').value = record.tanggal_latihan || "";
    document.getElementById('editWaktu').value = record.waktu || "";
    document.getElementById('editTarget').value = record.target || "";
    document.getElementById('editJumlah').value = record.jumlah || "";
    document.getElementById('editBenar').value = record.benar || "";
    document.getElementById('editSalah').value = record.salah || "";
    document.getElementById('editKoreksi').value = record.koreksi || "";
    document.getElementById('editNilai').value = record.nilai || "";
    document.getElementById('editEvaluasi').value = record.evaluasi || "";
    document.getElementById('editCatatan').value = record.catatan || "";

    document.getElementById('editLatihanModal').classList.add('active');
}

function hideEditLatihanModal() {
    document.getElementById('editLatihanModal').classList.remove('active');
}

function closeEditLatihanModal(e) {
    if (e.target.id === 'editLatihanModal') {
        hideEditLatihanModal();
    }
}

async function submitEditLatihan(e) {
    e.preventDefault();

    const id = document.getElementById('editLatihanId').value;
    const payload = {
        tempat_latihan: document.getElementById('editTempat').value,
        tanggal_latihan: document.getElementById('editTanggal').value,
        waktu: document.getElementById('editWaktu').value,
        target: document.getElementById('editTarget').value,
        jumlah: document.getElementById('editJumlah').value,
        benar: document.getElementById('editBenar').value,
        salah: document.getElementById('editSalah').value,
        koreksi: document.getElementById('editKoreksi').value,
        nilai: document.getElementById('editNilai').value,
        evaluasi: document.getElementById('editEvaluasi').value,
        catatan: document.getElementById('editCatatan').value,
        status: "diajukan"
    };

    try {
        const res = await fetch(`${API_BASE}/latihan/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            await fetchAllData();
            hideEditLatihanModal();
            showNotification("Catatan latihan berhasil diperbarui!", "success");
            renderGrafikRiwayat();
        } else {
            showNotification("Gagal mengubah catatan.", "error");
        }
    } catch(err) {
        showNotification("Terjadi kesalahan koneksi.", "error");
    }
}

async function hapusLatihan(id) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan latihan ini?")) {
        try {
            const res = await fetch(`${API_BASE}/latihan/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchAllData();
                showNotification("Catatan latihan berhasil dihapus!", "success");
                renderGrafikRiwayat();
            } else {
                showNotification("Gagal menghapus catatan.", "error");
            }
        } catch(err) {
            showNotification("Terjadi kesalahan koneksi.", "error");
        }
    }
}

function showFullCatatan(encodedText) {
    const text = decodeURIComponent(encodedText);
    showNotification(text.replace(/\n/g, '<br>'), 'success');
}




// --- MANAJEMEN ATLET & NILAI (PELATIH) ---

let dtAtlet = null;
let dtNilai = null;
let dtProfilNilai = null;

function renderTabelManajemenAtlet() {
    if (dtAtlet) {
        dtAtlet.clear().rows.add(dataAtlet).draw();
        return;
    }
    
    dtAtlet = $('#tabelAtlet').DataTable({
        data: dataAtlet,
        columns: [
            { 
                data: null, 
                render: function (data, type, row, meta) { return meta.row + 1; }
            },
            { data: 'nama_atlet' },
            { data: 'club' },
            { data: 'ttl' },
            { 
                data: null,
                render: function (data, type, row) {
                    return `<button class="btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem; margin: 0.5vmin;" onclick="lihatProfilAtlet('${row.id_atlet}')">Profil</button>
                            <button class="btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem; margin: 0.5vmin; background: #dc2626;" onclick="hapusAtlet('${row.id_atlet}')">Hapus</button>`;
                }
            }
        ]
    });
}

function kembaliOn(){
    let kembali = document.getElementById('kembaliKeAtlet');
    if(pelatih === true){
        kembali.style.display = "inline-block";
        kembali.onclick = () => {
            navigateTo('manajemen-atlet');
        }
    }
    else {
        kembali.style.display = "none";
        kembali.onclick = "";
    }
}

let siswaIni = "";
function lihatProfilAtlet(id_atlet) {
    siswaIni = id_atlet;
    if (typeof renderProfil === 'function') {
        document.getElementById('profilTag').textContent = "Profil Akun Atlet";
        kembaliOn();
        renderProfil(id_atlet);
        if (typeof renderProfilGrafik === 'function') {
            renderProfilGrafik(id_atlet);
        }
        
        const wrapperGrafik = document.getElementById('profilGrafikWrapper');
        if (wrapperGrafik) wrapperGrafik.style.display = 'block';
        
        navigateTo('profil');
    }
}

async function hapusAtlet(id_atlet) {
    if (!confirm('Apakah Anda yakin ingin menghapus atlet ini?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/atlet/${id_atlet}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showNotification('Atlet berhasil dihapus', 'success');
            await fetchAllData();
            renderTabelManajemenAtlet();
        } else {
            showNotification('Gagal menghapus atlet', 'error');
        }
    } catch (err) {
        showNotification('Terjadi kesalahan koneksi', 'error');
    }
}

function renderTabelManajemenNilai() {
    if (dtNilai) {
        dtNilai.clear().rows.add(dataAtlet).draw();
        return;
    }

    dtNilai = $('#tabelNilai').DataTable({
        data: dataAtlet,
        columns: [
            { 
                data: null, 
                render: function (data, type, row, meta) { return meta.row + 1; }
            },
            { data: 'nama_atlet' },
            { data: 'club' },
            { data: 'ttl' },
            { 
                data: null,
                render: function (data, type, row) {
                    return `
                        <div style="display: flex; flex-direction: column; gap: 5px; width: 100%; min-width: 135px;">
                            <button class="btn" style="padding: 0.45rem 0.8rem; font-size: 0.82rem; background: var(--primary); color: white; border: none; border-radius: 6px; cursor: pointer; text-align: center; width: 100%; white-space: nowrap; box-sizing: border-box;" onclick="bukaModalPenilaian('${row.id_atlet}')">Lakukan Penilaian</button>
                            <button class="btn" style="padding: 0.45rem 0.8rem; font-size: 0.82rem; background: var(--accent); color: white; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; text-align: center; width: 100%; white-space: nowrap; box-sizing: border-box;" onclick="bukaRiwayatLatihanAtlet('${row.id_atlet}')">Riwayat Latihan</button>
                        </div>
                    `;
                }
            }
        ]
    });
}

function bukaRiwayatLatihanAtlet(id_atlet) {
    siswaIni = id_atlet;
    const atlet = (typeof dataAtlet !== 'undefined') ? dataAtlet.find(a => a.id_atlet === id_atlet) : null;
    const elNama = document.getElementById('riwayatLatihanNamaAtlet');
    const elSub = document.getElementById('riwayatLatihanSubTitle');
    if (atlet) {
        if (elNama) elNama.textContent = `${atlet.nama_atlet}`;
        if (elSub) elSub.textContent = `Klub/Sekolah: ${atlet.club || '-'} | TTL: ${atlet.ttl || '-'}`;
    } else {
        if (elNama) elNama.textContent = "Riwayat Latihan Atlet";
        if (elSub) elSub.textContent = "Memantau riwayat aktivitas dan sesi latihan individual atlet.";
    }
    navigateTo('riwayat-latihan-atlet');
    setTimeout(() => {
        renderRiwayatLatihanGrafik(id_atlet);
        renderProfilNilai(id_atlet);
    }, 60);
}

function renderRiwayatLatihanGrafik(id_atlet) {
    if (!id_atlet) return;

    const sourceData = (typeof dataRiwayatLatihan !== 'undefined' && dataRiwayatLatihan.length > 0) 
        ? dataRiwayatLatihan 
        : (typeof dataLatihan !== 'undefined' ? dataLatihan : []);

    const chartData = sourceData
        .filter(d => d.id_atlet === id_atlet && (d.teknik !== null && !isNaN(d.teknik) || d.nilai !== null && !isNaN(d.nilai)))
        .sort((a, b) => new Date(a.tanggal || a.tanggal_latihan) - new Date(b.tanggal || b.tanggal_latihan));

    const getMateriName = (d) => {
        if (d.nama_materi) return d.nama_materi;
        if (d.materi_latihan) return d.materi_latihan;
        if (typeof dataMateriPenilaian !== 'undefined' && dataMateriPenilaian.length > 0) {
            const found = dataMateriPenilaian.find(m => m.id_materi === d.id_materi);
            if (found) return found.nama_materi;
        }
        if (typeof listMateriLatihan !== 'undefined' && d.id_materi && listMateriLatihan[d.id_materi - 1]) {
            return listMateriLatihan[d.id_materi - 1];
        }
        return `Materi ${d.id_materi || '-'}`;
    };

    const getTeknikScore = (d) => {
        if (d.teknik !== null && !isNaN(d.teknik) && d.teknik !== undefined) return parseInt(d.teknik);
        if (d.nilai !== null && !isNaN(d.nilai) && d.nilai !== undefined) return parseInt(d.nilai);
        return 0;
    };

    const uniqueMateri = [...new Set(chartData.map(d => getMateriName(d)))];
    const selectMateri = $('#filterChartMateriPelatih');
    const currentSelected = selectMateri.val();
    selectMateri.empty();
    
    if (uniqueMateri.length > 0) {
        uniqueMateri.forEach(m => {
            selectMateri.append(`<option value="${m}">${m}</option>`);
        });
        if (currentSelected && uniqueMateri.includes(currentSelected)) {
            selectMateri.val(currentSelected);
        }
    } else {
        selectMateri.append('<option value="">Belum ada data nilai</option>');
    }

    const selectedMateri = selectMateri.val();
    const lineDataFiltered = chartData.filter(d => getMateriName(d) === selectedMateri);
    const lineLabels = lineDataFiltered.map(d => d.tanggal || d.tanggal_latihan);
    const lineNilai = lineDataFiltered.map(d => getTeknikScore(d));

    if (window.myPerkembanganChartPelatih) {
        window.myPerkembanganChartPelatih.destroy();
    }

    const ctxLine = document.getElementById('perkembanganChartPelatih');
    if (ctxLine && selectedMateri && lineLabels.length > 0) {
        window.myPerkembanganChartPelatih = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: lineLabels,
                datasets: [{
                    label: `Perkembangan Teknik: ${selectedMateri}`,
                    data: lineNilai,
                    borderColor: '#065f46',
                    backgroundColor: 'rgba(6, 95, 70, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#f59e0b',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 6,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { position: 'top', align: 'start' }
                }
            }
        });
    }
}

function bukaModalPenilaian(id_atlet) {
    const atlet = dataAtlet.find(a => a.id_atlet === id_atlet);
    if (!atlet) {
        showNotification("Data atlet tidak ditemukan", "error");
        return;
    }

    // Set info atlet
    document.getElementById('penilaianIdAtlet').value = atlet.id_atlet;
    document.getElementById('penilaianNamaAtlet').innerText = atlet.nama_atlet || '-';
    document.getElementById('penilaianKlubAtlet').innerText = atlet.club || '-';
    document.getElementById('penilaianTtlAtlet').innerText = atlet.ttl || '-';

    // Set default tanggal hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('penilaianTanggal').value = today;

    // Populate dropdown materi penilaian
    const selectMateri = document.getElementById('penilaianMateri');
    selectMateri.innerHTML = '<option value="">-- Pilih Materi Latihan --</option>';

    if (typeof dataMateriPenilaian !== 'undefined' && dataMateriPenilaian.length > 0) {
        dataMateriPenilaian.forEach(m => {
            selectMateri.innerHTML += `<option value="${m.id_materi}">${m.nama_materi}</option>`;
        });
    } else if (typeof listMateriLatihan !== 'undefined' && listMateriLatihan.length > 0) {
        listMateriLatihan.forEach((m, idx) => {
            selectMateri.innerHTML += `<option value="${idx + 1}">${m}</option>`;
        });
    }

    // Reset nilai form default
    document.getElementById('penilaianFokus').value = 'teknik dasar';
    document.getElementById('penilaianIntensitas').value = 5;
    document.getElementById('rpeDisplayVal').innerText = '5';
    document.getElementById('penilaianFisik').value = '';
    document.getElementById('penilaianMental').value = '';
    document.getElementById('penilaianTeknik').value = '';
    document.getElementById('penilaianCatatan').value = '';

    const modal = document.getElementById('modalPenilaianAtlet');
    if (modal) {
        modal.classList.add('active');
        const modalContent = document.getElementById('modalKeatas');
        if (modalContent) 
            {
                setTimeout(()=>{
                    modalContent.scrollTo(
                    {
                        top: 0,
                        behavior: 'smooth'
                    }
                    );
                }, 200);
            }
        modal.scrollTop = 0;
    }
}

function tutupModalPenilaian() {
    const modal = document.getElementById('modalPenilaianAtlet');
    if (modal) {
        modal.classList.remove('active');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) modalContent.scrollTop = 0;
    }
}

function closeModalPenilaianOverlay(e) {
    if (e.target.id === 'modalPenilaianAtlet') {
        tutupModalPenilaian();
    }
}

async function submitPenilaianAtlet(e) {
    e.preventDefault();
    const id_atlet = document.getElementById('penilaianIdAtlet').value;
    const id_materi = document.getElementById('penilaianMateri').value;
    const tanggal = document.getElementById('penilaianTanggal').value;
    const fokus = document.getElementById('penilaianFokus').value;
    const intensitas = document.getElementById('penilaianIntensitas').value;
    const fisik = document.getElementById('penilaianFisik').value;
    const mental = document.getElementById('penilaianMental').value;
    const teknik = document.getElementById('penilaianTeknik').value;
    const catatan = document.getElementById('penilaianCatatan').value;

    if (!id_materi) {
        showNotification("Silakan pilih materi latihan terlebih dahulu", "error");
        return;
    }
    if (!fisik || !mental || !teknik) {
        showNotification("Harap lengkapi penilaian fisik, mental, dan teknik", "error");
        return;
    }

    const payload = {
        id_riwayat_latihan: "rwl-" + Date.now(),
        id_materi: parseInt(id_materi),
        id_atlet: id_atlet,
        tanggal: tanggal,
        fokus: fokus,
        intensitas: parseInt(intensitas),
        fisik: parseInt(fisik),
        mental: parseInt(mental),
        teknik: parseInt(teknik),
        catatan: catatan
    };
    showLoading();
    try {
        const res = await fetch(`${API_BASE}/tabel_riwayat_latihan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            tutupModalPenilaian();
            document.getElementById('formPenilaianAtlet').reset();
            showNotification("Penilaian atlet berhasil disimpan ke database!", "success");
            if (typeof fetchAllData === 'function') {
                await fetchAllData();
            }
            if (typeof siswaIni !== 'undefined' && siswaIni) {
                renderProfilNilai(siswaIni);
                if (typeof renderProfilGrafik === 'function') {
                    renderProfilGrafik(siswaIni);
                }
            }
        } else {
            const err = await res.json().catch(() => ({}));
            showNotification(err.error || "Gagal menyimpan penilaian.", "error");
        }
    } catch (err) {
        showNotification("Terjadi kesalahan koneksi ke server.", "error");
    }
    finally {
        hideLoading();
    }
}

function renderProfilNilai(id_atlet) {
    const sourceData = (typeof dataRiwayatLatihan !== 'undefined' && dataRiwayatLatihan.length > 0)
        ? dataRiwayatLatihan
        : (typeof dataLatihan !== 'undefined' ? dataLatihan : []);

    const riwayat = sourceData.filter(d => d.id_atlet === id_atlet);

    const getMateriName = (d) => {
        if (d.nama_materi) return d.nama_materi;
        if (d.materi_latihan) return d.materi_latihan;
        if (typeof dataMateriPenilaian !== 'undefined' && dataMateriPenilaian.length > 0) {
            const found = dataMateriPenilaian.find(m => m.id_materi === d.id_materi);
            if (found) return found.nama_materi;
        }
        if (typeof listMateriLatihan !== 'undefined' && d.id_materi && listMateriLatihan[d.id_materi - 1]) {
            return listMateriLatihan[d.id_materi - 1];
        }
        return `Materi ${d.id_materi || '-'}`;
    };
    
    if (dtProfilNilai) {
        dtProfilNilai.clear().rows.add(riwayat).draw();
        return;
    }
    
    dtProfilNilai = $('#tabelProfilNilai').DataTable({
        data: riwayat,
        order: [[0, 'desc']],
        columns: [
            { 
                data: null,
                render: function(d) {
                    return d.tanggal || d.tanggal_latihan || '-';
                }
            },
            { 
                data: null,
                render: function(d) {
                    return getMateriName(d);
                }
            },
            { 
                data: null,
                render: function(d) {
                    const fokusText = d.fokus || (d.status ? d.status : 'Teknik Dasar');
                    return `<span class="badge" style="background: var(--bg-hover); color: var(--text-dark); text-transform: capitalize; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;">${fokusText}</span>`;
                }
            },
            { 
                data: null,
                render: function(d) {
                    const skor = (d.teknik !== null && d.teknik !== undefined) ? d.teknik : (d.nilai || '-');
                    let translasi = Number(skor); //cekTeknik(Number(skor));
                    return `<strong style="color: var(--primary); font-size: 1rem;">${translasi}</strong>`;
                }
            },
            { 
                data: null,
                render: function(d) {
                    const skor = (d.intensitas !== null && d.intensitas !== undefined) ? d.intensitas : (d.nilai || '-');
                    let translasi = cekIntensitas(Number(skor));
                    return `<strong style="color: var(--primary); font-size: 1rem;">${translasi}</strong>`;
                }
            },
            { 
                data: null,
                render: function(d) {
                    const skor = (d.fisik !== null && d.fisik !== undefined) ? d.fisik : (d.nilai || '-');
                    let translasi = cekFisik(Number(skor));
                    return `<strong style="color: var(--primary); font-size: 1rem;">${translasi}</strong>`;
                }
            },
            { 
                data: null,
                render: function(d) {
                    const skor = (d.mental !== null && d.mental !== undefined) ? d.mental : (d.nilai || '-');
                    let translasi = cekMental(Number(skor));
                    return `<strong style="color: var(--primary); font-size: 1rem;">${translasi}</strong>`;
                }
            }
        ],
        searching: false,
        lengthChange: false,
        pageLength: 5
    });
}

// ---------------- DASHBOARD ADMIN (SB ADMIN 2 INSPIRED) ----------------
let adminTeamRadarChart = null;

function renderDashboardAdmin() {
    const userStr = sessionStorage.getItem('loggedInUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'pelatih') return;

    // 1. Update nama pelatih di greeting
    const greetingEl = document.getElementById('dashCoachName');
    if (greetingEl && user.nama_pelatih) {
        greetingEl.innerText = user.nama_pelatih;
    }

    // 2. Total Atlet
    const totalAtletEl = document.getElementById('dashTotalAtlet');
    if (totalAtletEl && typeof dataAtlet !== 'undefined') {
        totalAtletEl.innerText = dataAtlet.length;
    }

    // 3. Sesi Selesai (latihan dengan nilai)
    const totalSesiEl = document.getElementById('dashTotalSesi');
    if (totalSesiEl && typeof dataLatihan !== 'undefined') {
        const dinilaiCount = dataLatihan.filter(d => d.status !== 'diajukan').length;
        totalSesiEl.innerText = dinilaiCount;
    }

    // 4. Pending Evaluasi
    const pendingEvaluasiEl = document.getElementById('dashPendingEvaluasi');
    const pendingData = (typeof dataLatihan !== 'undefined') ? dataLatihan.filter(d => d.status === 'diajukan') : [];
    if (pendingEvaluasiEl) {
        pendingEvaluasiEl.innerText = pendingData.length;
    }

    // 5. Countdown Porprov
    const countdownEl = document.getElementById('dashCountdown');
    if (countdownEl) {
        const target = new Date("2026-11-01T08:00:00").getTime();
        const diff = target - new Date().getTime();
        const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        countdownEl.innerText = days;
    }

    // 6. Render Tabel Mini Antrean Pengajuan Latihan
    const tableContainer = document.getElementById('dashPendingTableBody');
    if (tableContainer) {
        if (pendingData.length === 0) {
            tableContainer.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-light); padding: 1.8rem;">
                        🎉 Tidak ada pengajuan latihan yang menunggu evaluasi saat ini. Semua telah dinilai!
                    </td>
                </tr>
            `;
        } else {
            tableContainer.innerHTML = pendingData.slice(0, 5).map((row) => {
                const atlet = dataAtlet.find(a => a.id_atlet === row.id_atlet);
                const nama = atlet ? atlet.nama_atlet : 'Atlet Unknown';
                return `
                    <tr>
                        <td style="font-weight: 600;">${row.tanggal_latihan || '-'}</td>
                        <td style="font-weight: 600; color: var(--secondary);">${nama}</td>
                        <td>${row.materi_latihan || '-'}</td>
                        <td><span class="badge" style="background: #fef3c7; color: #b45309; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 0.78rem;">Menunggu</span></td>
                        <td>
                            <button class="btn" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; background: var(--primary);" onclick="openPelatihLatihanModal('${row.id_latihan}')">
                                Evaluasi
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // 7. Render Team Radar Chart (Soft Tennis Skill Pillars)
    const ctxRadar = document.getElementById('dashTeamRadarChart');
    if (ctxRadar) {
        if (adminTeamRadarChart) {
            adminTeamRadarChart.destroy();
        }

        const categories = ['Forehand', 'Backhand', 'Service', 'Volley', 'Slice', 'Fisik'];
        const values = [4.2, 3.8, 4.0, 3.6, 3.9, 4.5]; // Metrik tim representatif

        adminTeamRadarChart = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'Rata-rata Tim Saat Ini',
                        data: values,
                        backgroundColor: 'rgba(78, 115, 223, 0.25)',
                        borderColor: '#4e73df',
                        borderWidth: 2,
                        pointBackgroundColor: '#4e73df',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#4e73df'
                    },
                    {
                        label: 'Target Standar Porprov Emas',
                        data: [4.8, 4.5, 4.8, 4.5, 4.5, 5.0],
                        backgroundColor: 'rgba(28, 200, 138, 0.1)',
                        borderColor: '#1cc88a',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointBackgroundColor: '#1cc88a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#f1f5f9' },
                        suggestedMin: 0,
                        suggestedMax: 5,
                        ticks: { stepSize: 1, backdropColor: 'transparent', font: { size: 10 } }
                    }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
                }
            }
        });
    }

    updateBadgeNotifEvaluasi();
}

const originalNavigateTo = navigateTo;
navigateTo = function(targetId) {
    originalNavigateTo(targetId);
    if (targetId === 'dashboard-admin') {
        renderDashboardAdmin();
    } else if (targetId === 'manajemen-atlet') {
        renderTabelManajemenAtlet();
    } else if (targetId === 'manajemen-nilai') {
        renderTabelManajemenNilai();
    } else if (targetId === 'profil') {
        const userStr = sessionStorage.getItem('loggedInUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'pelatih' && document.getElementById('profilNilaiWrapper')) {
                document.getElementById('profilNilaiWrapper').style.display = 'none';
            }
        }
    }
};

function cekTeknik(int){
    switch(int){
        case 5 :
        return "Pukulan sangat akurat dan konsisten";
        break;
        case 4 :
        return "Pukulan cukup akurat";
        break;
        case 3 :
        return "Pukulan cukup namun kurang konsisten";
        break;
        case 2 :
        return "Pukulan kurang tepat";
        break;
        default :
        return "Pukulan tidak tepat";
        break;
    }
}

function cekFisik(int){
    switch(int){
        case 5 :
        return "Sangat Baik";
        break;
        case 4 :
        return "Baik";
        break;
        case 3 :
        return "Sedang";
        break;
        case 2 :
        return "Kurang";
        break;
        default :
        return "Sangat Kurang";
        break;
    }
}

function cekMental(int){
    switch(int){
        case 5 :
        return "Kondisi Puncak / Prima";
        break;
        case 4 :
        return "Fokus terkontrol";
        break;
        case 3 :
        return "Kurang Fokus";
        break;
        case 2 :
        return "Gelisah / Cemas";
        break;
        default :
        return "Kelelahan Mental";
        break;
    }
}

function cekIntensitas(int){
    if(int >= 0) {
        return "Sangat Ringan";
    }
    else if (int >= 2) {
        return "Ringan";
    }
    else if (int >= 4) {
        return "Sedang-Ringan";
    }
    else if (int >= 5) {
        return "Sedang";
    }
    else if (int >= 7) {
        return "Keras";
    }
    else if (int >= 8) {
        return "Sangat Keras";
    }
    else if (int >= 10) {
        return "Maksimal";
    }
}
