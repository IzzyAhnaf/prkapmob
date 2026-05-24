import React, { useState, useEffect } from 'react';
import { ref, set, get } from 'firebase/database';
import { signOut } from 'firebase/auth'; // 👈 Import fungsi signOut
import { db, auth } from '../Config/firebase'; // 👈 Import auth dari config kamu
import Swal from 'sweetalert2';

export function SettingsView() {
  // State Konfigurasi Alat
  const [deviceName, setDeviceName] = useState("");
  const [publishInterval, setPublishInterval] = useState(0);
  const [irThreshold, setIrThreshold] = useState(0);
  
  // State Parameter Peringatan Dini
  const [minSpo2, setMinSpo2] = useState(0);
  const [maxSuhu, setMaxSuhu] = useState(0);
  const [minHr, setMinHr] = useState(0);
  const [maxHr, setMaxHr] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data dari Firebase saat halaman dimuat
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRef = ref(db, 'konfigurasi_sistem');
        const snapshot = await get(configRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setDeviceName(data.nama_perangkat || "Robot Kesehatan Kelompok 10");
          setPublishInterval(data.interval_detik || 5);
          setIrThreshold(data.batas_ir || 50000);
          
          if (data.peringatan_dini) {
            setMinSpo2(data.peringatan_dini.spo2_minimal || 95);
            setMaxSuhu(data.peringatan_dini.suhu_maksimal || 37.5);
            setMinHr(data.peringatan_dini.hr_minimal || 60);
            setMaxHr(data.peringatan_dini.hr_maksimal || 100);
          }
        } else {
          setDeviceName("Robot Kesehatan Kelompok 10");
          setPublishInterval(5);
          setIrThreshold(50000);
          setMinSpo2(95);
          setMaxSuhu(37.5);
          setMinHr(60);
          setMaxHr(100);
        }
      } catch (error) {
        console.error("Gagal mengambil konfigurasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const configRef = ref(db, 'konfigurasi_sistem');
      
      await set(configRef, {
        nama_perangkat: deviceName,
        interval_detik: publishInterval,
        batas_ir: irThreshold,
        peringatan_dini: {
          spo2_minimal: minSpo2,
          suhu_maksimal: maxSuhu,
          hr_minimal: minHr,
          hr_maksimal: maxHr
        },
        terakhir_diubah: Date.now()
      });

      Swal.fire({
        title: 'Tersimpan!',
        text: 'Konfigurasi komplit berhasil disinkronkan ke Firebase.',
        icon: 'success',
        background: '#191917',
        color: '#fff',
        confirmButtonColor: '#86efac',
        confirmButtonText: 'Oke'
      });

    } catch (error) {
      console.error("Gagal simpan:", error);
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyimpan konfigurasi.',
        icon: 'error',
        background: '#191917',
        color: '#fff',
        confirmButtonColor: '#fca5a5'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 🚀 FUNGSI LOGOUT
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Keluar Akun?',
      text: "Anda harus login kembali untuk mengakses dashboard.",
      icon: 'question',
      showCancelButton: true,
      background: '#191917',
      color: '#fff',
      confirmButtonColor: '#fca5a5',
      cancelButtonColor: '#333',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Gagal logout:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'rgba(255,255,255,0.4)' }}>
        Memuat konfigurasi dari Firebase...
      </div>
    );
  }

  return (
    <>
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* KARTU 1: KONFIGURASI ALAT */}
        <div className="card-dark">
          <div className="big-card-header"><span className="big-card-title">Konfigurasi Perangkat</span></div>
          
          <div className="input-group">
            <label>NAMA PERANGKAT</label>
            <input 
              type="text" 
              value={deviceName} 
              onChange={(e) => setDeviceName(e.target.value)} 
            />
          </div>
          
          <div className="input-group">
            <label>INTERVAL PUBLISH MQTT (Detik)</label>
            <input 
              type="number" 
              value={publishInterval} 
              onChange={(e) => setPublishInterval(Number(e.target.value))} 
            />
          </div>
          
          <div className="input-group">
            <label>SENSITIVITAS SENSOR (IR_RAW THRESHOLD)</label>
            <input 
              type="number" 
              value={irThreshold} 
              onChange={(e) => setIrThreshold(Number(e.target.value))} 
            />
          </div>
          
          <button 
            onClick={handleSaveConfig}
            disabled={isSaving}
            style={{ 
              marginTop: '1rem', background: isSaving ? '#999' : '#fff', color: '#111', 
              border: 'none', padding: '10px 16px', borderRadius: '8px', 
              cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 500, width: '100%' 
            }}>
            {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </button>
        </div>

        {/* KARTU 2: PARAMETER PERINGATAN */}
        <div className="card-dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
          <div>
            <div className="big-card-header"><span className="big-card-title">Parameter Peringatan Dini</span></div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>MIN SpO2 (%)</label>
                <input 
                  type="number" 
                  value={minSpo2} 
                  onChange={(e) => setMinSpo2(Number(e.target.value))} 
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>MAX SUHU (°C)</label>
                <input 
                  type="number" 
                  value={maxSuhu} 
                  onChange={(e) => setMaxSuhu(Number(e.target.value))} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>MIN HR (BPM)</label>
                <input 
                  type="number" 
                  value={minHr} 
                  onChange={(e) => setMinHr(Number(e.target.value))} 
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>MAX HR (BPM)</label>
                <input 
                  type="number" 
                  value={maxHr} 
                  onChange={(e) => setMaxHr(Number(e.target.value))} 
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '12px', background: 'rgba(252,165,165,0.04)', border: '1px solid rgba(252,165,165,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fca5a5', lineHeight: 1.5 }}>
              <strong>Perhatian:</strong> Perubahan batas pada panel ini akan langsung tersinkronisasi dengan Firebase. Pastikan batas normal disetujui oleh anggota kelompok.
            </div>
          </div>

          {/* 🚀 BUTTON LOGOUT BARU — Diletakkan rapi di bagian paling bawah kartu */}
          <button 
            onClick={handleLogout}
            style={{
              marginTop: 'auto',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
            }}
          >
            Keluar dari Sistem (Logout)
          </button>
        </div>

      </div>
    </>
  );
}