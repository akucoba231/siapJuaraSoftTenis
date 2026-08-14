// Data Catatan Latihan Atlet
const dummyDataLatihan = [
    {
        id_latihan: "lat-1720200001",
        id_atlet: "atlet-1720200000001",
        tempat_latihan: "GOR Wibawa Mukti",
        tanggal_latihan: "2026-08-01",
        
        materi_latihan: "Lari",
        
        // Input dari Atlet
        waktu: "15:00",
        benar: "",
        salah: "",
        target: 10,
        jumlah: 8,
        
        // Input / Feedback dari Pelatih
        koreksi: "Tingkatkan stamina",
        nilai: 4, // skala 1-5
        evaluasi: "Fisik cukup bagus, perlu konsistensi",
        catatan: "Terus tingkatkan porsi lari setiap pagi",
        
        // Status Workflow
        status: "disetujui oleh Dhani Rohyat, S.Pd"
    },
    {
        id_latihan: "lat-1720200002",
        id_atlet: "atlet-1720200000001",
        tempat_latihan: "GOR Wibawa Mukti",
        tanggal_latihan: "2026-08-02",
        
        materi_latihan: "Volley",
        
        // Input dari Atlet
        waktu: "",
        benar: 15,
        salah: 5,
        target: 20,
        jumlah: 20,
        
        // Input / Feedback dari Pelatih
        koreksi: "Pergelangan tangan kurang ditekuk",
        nilai: 3, // skala 1-5
        evaluasi: "Secara teknis pukulan cukup namun kurang konsisten",
        catatan: "Perbanyak porsi volley minggu depan",
        
        // Status Workflow
        status: "diajukan"
    },
    {
        id_latihan: "lat-1720200003",
        id_atlet: "atlet-1720200000002",
        tempat_latihan: "Lapangan Indoor",
        tanggal_latihan: "2026-08-02",
        
        materi_latihan: "Forehand",
        
        // Input dari Atlet
        waktu: "",
        benar: 18,
        salah: 2,
        target: 20,
        jumlah: 20,
        
        // Input / Feedback dari Pelatih
        koreksi: "Ayunannya sudah pas",
        nilai: 5, // skala 1-5
        evaluasi: "Pukulan sangat akurat dan konsisten",
        catatan: "Pertahankan gerakan ini",
        
        // Status Workflow
        status: "disetujui oleh Dhani Rohyat, S.Pd"
    }
];

let dataLatihan = dummyDataLatihan;

// List 18 Materi sesuai form fisik Excel
let listMateriLatihan = [
    "Lari", 
    "Bleed Test", 
    "Medicine Ball", 
    "Skipping", 
    "Dumbell", 
    "Rally Mini Soft Tenis", 
    "Rally Volley", 
    "Rally Groundstroke Forehand & Backhand", 
    "Teknik Soft Tenis (Forehand, Backhand, Service)", 
    "Volley", 
    "Drive Volley", 
    "Slice", 
    "Half Volley", 
    "Sit-up", 
    "Back-up", 
    "Leg up", 
    "Push-up", 
    "Ability"
];
