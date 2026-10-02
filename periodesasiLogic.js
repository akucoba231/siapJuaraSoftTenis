// --- PERIODESASI RENDERER ---
document.addEventListener('DOMContentLoaded', () => {
    if(!document.getElementById('periodesasiTableBody')) return;
    renderPeriodesasiTable();
});

function renderPeriodesasiTable() {
    const tableBody = document.getElementById('periodesasiTableBody');
    if(!tableBody || typeof dataJadwal === 'undefined') return;

    // Inject Porprov TC data into schedule for accurate UI matching if not exists
    let dataJadwalPeriodesasi = JSON.parse(JSON.stringify(dataJadwal)); // Clone to avoid side-effects
    if(!dataJadwalPeriodesasi.find(j => j.tanggal === "2026-11-07")) {
        // Insert dummy dates for Porprov in November
        for(let i=7; i<=20; i++) {
            dataJadwalPeriodesasi.push({
                "no": 999,
                "tanggal": "2026-11-" + (i < 10 ? "0" + i : i),
                "hari": "-",
                "sesi": "08:00 - 18:00",
                "latihan": "Porprov Jabar",
                "utama": "Porprov Jabar 2026",
                "simulasi": "Match",
                "evaluasi": "Cooling Down",
                "tempat": "Venue Porprov Jabar"
            });
        }
        // Sort ascending by date
        dataJadwalPeriodesasi.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    }

    const groupedByMonth = {};
    dataJadwalPeriodesasi.forEach(item => {
        const dateObj = new Date(item.tanggal);
        const monthName = dateObj.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const dayStr = dateObj.getDate().toString();
        if (!groupedByMonth[monthName]) groupedByMonth[monthName] = [];
        groupedByMonth[monthName].push(dayStr);
    });

    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    }

    let row1 = `<tr><th rowspan="3">Dates</th><th>Month</th>`;
    let row2 = `<tr><th>Weeks</th>`;
    let row3 = `<tr><th>Dates</th>`;

    let hDateIndex = 0;
    for (const [month, dates] of Object.entries(groupedByMonth)) {
        row1 += `<th colspan="${dates.length}">${month}</th>`;
        let currentWeek = -1;
        let currentCount = 0;
        let weekGroupsHTML = '';
        let tempIndex = hDateIndex;
        
        dates.forEach(date => {
            const item = dataJadwalPeriodesasi[tempIndex];
            const dObj = new Date(item.tanggal);
            const weekNo = getWeekNumber(dObj);
            if (weekNo === currentWeek) {
                currentCount++;
            } else {
                if (currentWeek !== -1) {
                    weekGroupsHTML += `<th colspan="${currentCount}">Week-${currentWeek}</th>`;
                }
                currentWeek = weekNo;
                currentCount = 1;
            }
            tempIndex++;
        });
        if (currentWeek !== -1) {
            weekGroupsHTML += `<th colspan="${currentCount}">W${currentWeek}</th>`;
        }
        row2 += weekGroupsHTML;
        
        dates.forEach(date => {
            row3 += `<td>${date}</td>`;
            hDateIndex++;
        });
    }

    let row4 = `<tr><th rowspan="5">Calendar of Competition</th><th>Domestic</th>`;
    let row5 = `<tr><th>International</th>`;
    let row6 = `<tr><th>Dates</th>`;
    let row7 = `<tr><th>Location</th>`;
    let row8 = `<tr><th>Event</th>`;

    let row9 = `<tr><th rowspan="10">Periodezation</th><th>Trainning Phase</th>`;
    let row10 = `<tr><th>Sub Trainning Phase</th>`;
    let row11 = `<tr><th>Strength</th>`;
    let row12 = `<tr><th>Endurance</th>`;
    let row13 = `<tr><th>Flexibility</th>`;
    let row14 = `<tr><th>Speed & Agility</th>`;
    let row15 = `<tr><th>Technique</th>`;
    let row16 = `<tr><th>Nutrition</th>`;
    let row17 = `<tr><th>Mesocycles</th>`;
    let row18 = `<tr><th>Microcycles</th>`;

    let row19 = `<tr><th colspan="2">Peaking Index</th>`;
    let row20 = `<tr><th colspan="2">Testing dates</th>`;
    let row21 = `<tr><th colspan="2">Medical control dates</th>`;
    let row22 = `<tr><th colspan="2">Camp/ Semi camp/ rest</th>`;

    function getPeriodizationData(tanggal) {
        const d = new Date(tanggal);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        let p = { phase:"PREPARATION", sub:"", str:"", end:"", flex:"Specific", spd:"", tech:"", nut:"", meso: m - 5, peaking: 5, testing: "" };
        
        if (tanggal === "2026-06-29") p.testing = "Initial Test";
        else if (tanggal === "2026-08-31") p.testing = "Mid Test";
        else if (tanggal === "2026-10-31") p.testing = "Final Test";

        if(m === 6) { p.sub="General Prep (GP)"; p.str="Adaptasi Anatomi"; p.end="Aerobic Base"; p.flex="General"; p.spd="Footwork Dasar"; p.tech="Fund Skill"; p.nut="Balance"; p.peaking = 5; }
        else if(m === 7) { p.sub="General Prep (GP)"; p.str="Max Strength"; p.end="Aerobic Base"; p.spd="COD & Reaction"; p.tech="Advance & Spin"; p.nut="High Protein"; p.peaking = 5; }
        else if(m === 8) { p.sub="Specific Prep (SP)"; p.str="Power & Core"; p.end="Anaerobic"; p.spd="Specific Agility"; p.tech="Drill Taktik"; p.nut="High Protein"; p.peaking = 4; }
        else if(m === 9) { p.sub="Specific Prep (SP)"; p.str="Power Endurance"; p.end="Specific Tennis"; p.spd="Specific Agility"; p.tech="Simulasi Ganda/Tunggal"; p.nut="High Carbo"; p.peaking = 3; }
        else if(m === 10) { p.sub="Pre-Competition"; p.str="Maintenance"; p.end="Maintenance"; p.spd="Maintenance"; p.tech="Spesialisasi"; p.nut="High Carbo"; p.peaking = 2; }
        else if(m === 11) { 
            if(day >= 7 && day <= 20) {
                p.phase="COMPETITION"; p.sub="Main Comp"; p.str="Peak"; p.end="Match"; p.spd="Match Agility"; p.tech="Match Play"; p.nut="High Carbo/Recovery"; p.peaking = 1;
            } else {
                p.sub="Pre-Competition"; p.str="Tapering/Peak Power"; p.end="Tapering"; p.spd="Peak Agility"; p.tech="Match Strategy"; p.nut="High Carbo"; p.peaking = 2;
            }
        }
        return p;
    }

    function getMetricsForMonth(m) {
        if(m === 6) return { phys: 50, tech: 30, tact: 10, psych: 10, vol: 80, int: 40 };
        if(m === 7) return { phys: 40, tech: 40, tact: 10, psych: 10, vol: 85, int: 50 };
        if(m === 8) return { phys: 30, tech: 35, tact: 25, psych: 10, vol: 70, int: 65 };
        if(m === 9) return { phys: 20, tech: 30, tact: 35, psych: 15, vol: 55, int: 80 };
        if(m === 10) return { phys: 15, tech: 20, tact: 50, psych: 15, vol: 40, int: 90 };
        if(m === 11) return { phys: 10, tech: 10, tact: 60, psych: 20, vol: 20, int: 100 };
        return { phys: 0, tech: 0, tact: 0, psych: 0, vol: 0, int: 0 };
    }

    let chartLabels = [];
    let volData = []; let intData = []; let physData = []; let techData = []; let tactData = []; let psychData = [];
    let totalDates = 0;
    
    let dateIndex = 0;
    for (const [month, dates] of Object.entries(groupedByMonth)) {
        dates.forEach(date => {
            const item = dataJadwalPeriodesasi[dateIndex];
            const pData = getPeriodizationData(item.tanggal);
            const micro = Math.ceil((dateIndex + 1) / 2);
            const m = new Date(item.tanggal).getMonth() + 1;
            const metrics = getMetricsForMonth(m);
            
            const isTC = item.utama.includes("TC");

            row4 += `<td class="bg-primary-local"></td>`;
            row5 += `<td></td>`;
            row6 += `<td></td>`;
            row7 += `<td>${item.tempat.replace("Lapangan Tenis", "Lap.")}</td>`;
            
            let eventText = "Training";
            if (isTC) eventText = "Training Camp";
            else if (pData.phase === "COMPETITION") eventText = "Porprov Jabar";
            
            row8 += `<td>${eventText}</td>`;
            
            row9 += `<td>${pData.phase}</td>`;
            row10 += `<td>${pData.sub}</td>`;
            row11 += `<td>${pData.str}</td>`;
            row12 += `<td>${pData.end}</td>`;
            row13 += `<td>${pData.flex}</td>`;
            row14 += `<td>${pData.spd}</td>`;
            row15 += `<td>${pData.tech}</td>`;
            row16 += `<td>${pData.nut}</td>`;
            row17 += `<td>${pData.meso}</td>`;
            row18 += `<td>${micro}</td>`;
            
            row19 += `<td>${pData.peaking}</td>`;
            row20 += `<td>${pData.testing}</td>`;
            row21 += `<td></td>`;
            row22 += `<td>${isTC ? "Training Camp" : (pData.phase === "COMPETITION" ? "Main Event" : "")}</td>`;
            
            chartLabels.push(date + " " + month.substring(0,3));
            volData.push(metrics.vol);
            intData.push(metrics.int);
            physData.push(metrics.phys);
            techData.push(metrics.tech);
            tactData.push(metrics.tact);
            psychData.push(metrics.psych);
            
            totalDates++;
            dateIndex++;
        });
    }

    const colspanValue = 1 + totalDates;
    let row23 = `<tr><th rowspan="11">Trainning Factors</th><td colspan="${colspanValue}" rowspan="11" style="background-color: white; padding: 0;"><div style="width: 100%; min-width: 1000px; height: 350px;"><canvas id="trainingChart"></canvas></div></td></tr>`;
    let row24 = `<tr></tr>`;
    let row25 = `<tr></tr>`;
    let row26 = `<tr></tr>`;
    let row27 = `<tr></tr>`;
    let row28 = `<tr></tr>`;
    let row29 = `<tr></tr>`;
    let row30 = `<tr></tr>`;
    let row31 = `<tr></tr>`;
    let row32 = `<tr></tr>`;
    let row33 = `<tr></tr>`;

    row1 += `</tr>`; row2 += `</tr>`; row3 += `</tr>`; row4 += `</tr>`; row5 += `</tr>`;
    row6 += `</tr>`; row7 += `</tr>`; row8 += `</tr>`; row9 += `</tr>`; row10 += `</tr>`;
    row11 += `</tr>`; row12 += `</tr>`; row13 += `</tr>`; row14 += `</tr>`; row15 += `</tr>`;
    row16 += `</tr>`; row17 += `</tr>`; row18 += `</tr>`; row19 += `</tr>`; row20 += `</tr>`;
    row21 += `</tr>`; row22 += `</tr>`;

    const totalCols = 2 + totalDates; // 2 kolom header + jumlah hari
    let rowHeader = `<tr><td colspan="${totalCols}" rowspan="10" style="padding: 0;"><img src="header.png" alt="Header Periodesasi" style="width: 100%; height: 100%; display: block; object-fit: cover;" /></td></tr>`;
    for(let i = 0; i < 9; i++) rowHeader += `<tr></tr>`;

    tableBody.innerHTML = rowHeader + row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9 + row10 + row11 + row12 + row13 + row14 + row15 + row16 + row17 + row18 + row19 + row20 + row21 + row22 + row23 + row24 + row25 + row26 + row27 + row28 + row29 + row30 + row31 + row32 + row33;

    setTimeout(() => {
        const ctx = document.getElementById('trainingChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [
                    { label: 'Volume (%)', data: volData, borderColor: 'blue', backgroundColor: 'blue', tension: 0.3, borderWidth: 3, pointRadius: 0 },
                    { label: 'Intensity (%)', data: intData, borderColor: 'red', backgroundColor: 'red', tension: 0.3, borderWidth: 3, pointRadius: 0 },
                    { label: 'Phys Prep (%)', data: physData, borderColor: 'green', backgroundColor: 'green', tension: 0.3, borderDash: [5, 5], pointRadius: 0 },
                    { label: 'Tech Prep (%)', data: techData, borderColor: 'orange', backgroundColor: 'orange', tension: 0.3, borderDash: [5, 5], pointRadius: 0 },
                    { label: 'Tact Prep (%)', data: tactData, borderColor: 'purple', backgroundColor: 'purple', tension: 0.3, borderDash: [5, 5], pointRadius: 0 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { stepSize: 10 } }
                },
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }, 100);
}
