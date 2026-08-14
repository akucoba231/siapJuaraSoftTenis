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

function switchChartTab(tab) {
    const tabLine = document.getElementById('tabLine');
    const tabRadar = document.getElementById('tabRadar');
    const lineContainer = document.getElementById('lineChartContainer');
    const radarContainer = document.getElementById('radarChartContainer');

    if (tab === 'line') {
        tabLine.style.background = 'var(--primary)';
        tabLine.style.color = 'white';
        tabLine.style.borderBottom = 'none';
        
        tabRadar.style.background = 'var(--bg)';
        tabRadar.style.color = 'var(--text-dark)';
        tabRadar.style.borderBottom = '1px solid var(--border)';
        
        lineContainer.style.display = 'block';
        radarContainer.style.display = 'none';
    } else {
        tabRadar.style.background = 'var(--primary)';
        tabRadar.style.color = 'white';
        tabRadar.style.borderBottom = 'none';
        
        tabLine.style.background = 'var(--bg)';
        tabLine.style.color = 'var(--text-dark)';
        tabLine.style.borderBottom = '1px solid var(--border)';
        
        lineContainer.style.display = 'none';
        radarContainer.style.display = 'block';
    }
}

