import { useEffect, useState } from 'react';
import { ref, onValue, query, limitToLast } from "firebase/database";
import { onAuthStateChanged } from 'firebase/auth'; // 👈 Cukup import ini saja
import { db, auth } from './Config/firebase'; // 👈 Import auth langsung dari sini, 'app' sudah tidak perlu di-import
import type { SensorData } from './Types/sensor';
import { Nav } from './Components/Nav';
import { LoginView } from './Pages/LoginView';
import { DashboardView } from './Pages/DashboardView';
import { VitalsView } from './Pages/VitalsView';
import { AIAnalysisView } from './Pages/AIAnalysisView';
import { SettingsView } from './Pages/SettingsView';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null artinya mengecek status session
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Dashboard');

  // 🚀 1. CEK APAKAH USER SUDAH LOGIN SEBELUMNYA (SESSION)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Mengambil data sensor jika user sudah terautentikasi
  useEffect(() => {
    if (!isLoggedIn) return;

    const dataRef = query(ref(db, 'riwayat_sensor'), limitToLast(20));
    const unsubscribeData = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.values(data) as SensorData[];
        setHistory(entries);
      }
      setLoading(false);
    });
    return () => unsubscribeData();
  }, [isLoggedIn]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Proteksi Loading Awal saat cek Session Firebase Auth
  if (isLoggedIn === null) {
    return (
      <div style={{ minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }} />
    );
  }

  // 🔒 3. JIKA BELUM LOGIN, LEMPAR KE HALAMAN LOGIN
  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // 🔓 4. JIKA SUDAH LOGIN, TAMPILKAN DASHBOARD UTAMA
  const latest = history[history.length - 1] ?? null;
  const fingerDetected = (latest?.IR_raw ?? 0) > 50000;
  const hrVals   = history.map(h => h.HR    ?? 0);
  const spo2Vals = history.map(h => h.SpO2  ?? 0);
  const tempVals = history.map(h => h.T_obj ?? 0);

  const safeRange = (arr: number[]) => {
    const valid = arr.filter(Boolean);
    if (!valid.length) return { min: 0, max: 0 };
    return { min: Math.min(...valid), max: Math.max(...valid) };
  };

  const hr   = safeRange(hrVals);
  const spo2 = safeRange(spo2Vals);
  const temp = safeRange(tempVals);
  const battPct = Math.min(100, Math.max(0, ((latest?.V_batt ?? 0) - 3.0) / 1.2 * 100));
  
  const trend = (arr: number[]): 'up' | 'down' | 'stable' => {
    const valid = arr.filter(Boolean);
    if (valid.length < 4) return 'stable';
    const half = Math.floor(valid.length / 2);
    const avgNew = valid.slice(-half).reduce((a,b) => a+b,0) / half;
    const avgOld = valid.slice(0, half).reduce((a,b) => a+b,0) / half;
    if (avgNew > avgOld + 1) return 'up';
    if (avgNew < avgOld - 1) return 'down';
    return 'stable';
  };

  if (loading && history.length === 0) return (
    <div style={{ minHeight:'100vh', background:'#111', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid #333', borderTopColor:'#666', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap](https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap)');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #111; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .root { min-height: 100vh; background: #111; color: #fff; font-family: 'DM Sans', system-ui, sans-serif; font-size: 14px; }
        .page { max-width: 1280px; margin: 0 auto; padding: 2rem 2rem 3rem; animation: fadeUp 0.35s ease both; }
        .overview-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 1.5rem; }
        .overview-title { font-size: 28px; font-weight: 300; letter-spacing: -0.04em; }
        .card-dark { background: #191917; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); padding: 1.5rem; }
        .card-light { background: #e8e8e0; border-radius: 16px; border: 1px solid rgba(0,0,0,0.06); padding: 1.5rem; color: #111; }
        .top-row { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px; }
        .bottom-row { display: grid; grid-template-columns: 1fr 1.6fr 1fr; gap: 12px; }
        .vitals-inner { display: flex; gap: 0; }
        .vital-divider { width: 1px; background: rgba(255,255,255,0.06); margin: 0 1.5rem; flex-shrink: 0; }
        .big-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .big-card-title { font-size: 16px; font-weight: 400; letter-spacing: -0.02em; color: rgba(255,255,255,0.85); }
        .change-btn { font-size: 11px; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.12); padding: 4px 12px; border-radius: 999px; cursor: pointer; letter-spacing: 0.01em; }
        .right-col { display: flex; flex-direction: column; gap: 12px; }
        .status-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .toggle-wrap { width: 44px; height: 24px; border-radius: 12px; background: rgba(255,255,255,0.1); position: relative; cursor: pointer; transition: background 0.3s; }
        .toggle-wrap.on { background: #86efac; }
        .toggle-knob { position: absolute; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: left 0.3s; }
        .toggle-wrap.on .toggle-knob { left: 23px; }
        .toggle-wrap.off .toggle-knob { left: 3px; }
        .energy-row { display: flex; align-items: center; gap: 10px; margin-top: auto; }
        .energy-bar { flex: 1; height: 1px; background: rgba(255,255,255,0.15); position: relative; }
        .energy-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(255,255,255,0.6); }
        .ai-tip { background: rgba(0,0,0,0.04); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; font-size: 12.5px; color: rgba(0,0,0,0.6); line-height: 1.5; }
        .ai-tip strong { color: #111; }
        .ai-tag { font-size: 10px; color: rgba(0,0,0,0.35); margin-top: 4px; letter-spacing: 0.04em; }
        .report-table { width: 100%; border-collapse: collapse; font-size: 12px; color: rgba(255,255,255,0.5); }
        .report-table th { font-weight: 400; padding: 6px 8px; text-align: center; font-size: 11px; letter-spacing: 0.03em; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .report-table td { text-align: center; padding: 10px 8px; font-variant-numeric: tabular-nums; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .col-label { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 2px; }
        .stat-big { font-size: 52px; font-weight: 300; letter-spacing: -0.05em; line-height: 1; }
        .stat-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .stat-big-light { font-size: 52px; font-weight: 300; letter-spacing: -0.05em; line-height: 1; color: #111; }
        .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1rem; }
        .input-group label { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; }
        .input-group input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px 14px; border-radius: 8px; font-family: inherit; font-size: 13px; outline: none; transition: border 0.2s; }
        .input-group input:focus { border-color: rgba(255,255,255,0.3); }
        @media (max-width: 900px) { .top-row, .bottom-row { grid-template-columns: 1fr; } .vitals-inner { flex-direction: column; gap: 1.5rem; } .vital-divider { width: 100%; height: 1px; margin: 0; } }
      `}</style>

      <div className="root">
        <Nav time={now} fingerDetected={fingerDetected} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="page" key={activeTab}>
          <div className="overview-header">
            <h1 className="overview-title">{activeTab}</h1>
            {latest?.timestamp && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>
                Diperbarui {new Date(latest.timestamp).toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>

          {/* Perutean halaman berbasis Tab Aktif */}
          {activeTab === 'Dashboard' && (
            <DashboardView 
              latest={latest} fingerDetected={fingerDetected} 
              hrVals={hrVals} spo2Vals={spo2Vals} tempVals={tempVals} 
              hr={hr} spo2={spo2} temp={temp} battPct={battPct} 
              trend={trend} setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'Vitals' && <VitalsView history={history} />}

          {activeTab === 'AI Analysis' && <AIAnalysisView latest={latest} />}

          {activeTab === 'Settings' && <SettingsView />}
        </div>
      </div>
    </>
  );
}

export default App;