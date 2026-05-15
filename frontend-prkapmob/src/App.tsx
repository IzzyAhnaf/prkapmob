import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, limitToLast } from "firebase/database";
import { Activity, Thermometer, Droplets, Battery, Ruler, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const firebaseConfig = {
  apiKey: "AIzaSyBU2GqwAWGaCK4S_C39DF0kPodIh8lLmIA",
  authDomain: "prkapmob.firebaseapp.com",
  databaseURL: "https://prkapmob-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "prkapmob",
  storageBucket: "prkapmob.firebasestorage.app",
  messagingSenderId: "138502937374",
  appId: "1:138502937374:web:32f14573ffe91aca67c70f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = query(ref(db, 'riwayat_sensor'), limitToLast(1));
    
    // Mendengarkan perubahan data secara Real-time
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const id = Object.keys(data)[0];
        setLatestData(data[id]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      Memuat data kesehatan...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Robot Kesehatan Dashboard
          </h1>
          <p className="text-slate-400">Pemantauan Real-time & Analisis Gemini AI</p>
        </div>
        <div className={`px-4 py-1 rounded-full text-sm font-medium ${latestData?.IR_raw > 50000 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {latestData?.IR_raw > 50000 ? '● Jari Terdeteksi' : '○ Menunggu Jari'}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Detak Jantung */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><Activity size={24} /></div>
            <h3 className="font-semibold text-slate-300">Heart Rate</h3>
          </div>
          <div className="text-5xl font-black">{latestData?.HR || '--'} <span className="text-xl text-slate-500 font-normal">BPM</span></div>
        </div>

        {/* Card: SpO2 */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Droplets size={24} /></div>
            <h3 className="font-semibold text-slate-300">Saturasi Oksigen</h3>
          </div>
          <div className="text-5xl font-black">{latestData?.SpO2 || '--'} <span className="text-xl text-slate-500 font-normal">%</span></div>
        </div>

        {/* Card: Suhu Tubuh */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><Thermometer size={24} /></div>
            <h3 className="font-semibold text-slate-300">Suhu Permukaan</h3>
          </div>
          <div className="text-5xl font-black">{latestData?.T_obj || '--'} <span className="text-xl text-slate-500 font-normal">°C</span></div>
        </div>

        {/* Section: AI Analysis */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="text-indigo-400" />
            <h2 className="text-xl font-bold">Analisis Asisten Gemini AI</h2>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm">
            {latestData?.analisis_ai ? (
              <ReactMarkdown>
                {latestData.analisis_ai}
              </ReactMarkdown>
            ) : (
              <p className="italic">Silakan tempelkan jari pada sensor untuk memulai analisis medis...</p>
            )}
          </div>
        </div>

        {/* Sidebar Status Alat */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4 text-slate-400">
              <div className="flex items-center gap-2"><Ruler size={18} /> Jarak Objek</div>
              <span className="font-mono">{latestData?.d || '0'} cm</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2"><Battery size={18} /> Baterai LiPo</div>
              <span className="font-mono">{latestData?.V_batt || '0'} V</span>
            </div>
          </div>
          
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-6 rounded-2xl text-center">
            <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-1">Terakhir Diperbarui</p>
            <p className="text-sm text-slate-400">
              {latestData?.timestamp ? new Date(latestData.timestamp).toLocaleTimeString() : '--:--'}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;