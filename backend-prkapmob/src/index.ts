import { Elysia } from 'elysia';
import * as mqtt from 'mqtt';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import serviceAccount from '../firebase-key.json';

initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: process.env.FIREBASE_DB_URL as string
});

const db = getDatabase(); 

let currentConfig = {
  peringatan_dini: {
    spo2_minimal: 95,
    suhu_maksimal: 37.5,
    hr_minimal: 60,
    hr_maksimal: 100
  }
};

const configRef = db.ref('konfigurasi_sistem');
configRef.on('value', (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    currentConfig = { 
      ...currentConfig, 
      ...data,
      peringatan_dini: { ...currentConfig.peringatan_dini, ...data.peringatan_dini }
    };
    console.log("⚙️ [Sistem] Konfigurasi berhasil diperbarui dari Firebase!");
  }
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const mqttUrl = process.env.MQTT_BROKER_URL as string;
const mqttClient = mqtt.connect(mqttUrl);

// STATE Penampung
let sensorState = { 
  HR: 0, 
  SpO2: 0, 
  T_obj: 0, 
  ambient: 0, 
  jarak: 0,
  finger: false 
};
let dataBaruMasuk = false;

async function analyzeHealthData(suhu: number, hr: number, spo2: number) {
  console.log(`[AI] Meminta analisis Gemini untuk T:${suhu}°C, HR:${hr}bpm, SpO2:${spo2}%...`);
  const { spo2_minimal, suhu_maksimal, hr_minimal, hr_maksimal } = currentConfig.peringatan_dini;
  
  const systemPrompt = `
    Kamu adalah asisten dokter digital profesional.
    Pasien melaporkan data sensor fisik berikut:
    - Suhu Tubuh: ${suhu} °C (Batas normal maks: ${suhu_maksimal}°C)
    - Detak Jantung: ${hr} BPM (Batas normal: ${hr_minimal} - ${hr_maksimal} BPM)
    - Saturasi Oksigen: ${spo2} % (Batas normal min: ${spo2_minimal}%)

    Tugasmu:
    1. Evaluasi apakah ketiga parameter ini dalam batas normal atau ada indikasi bahaya.
    2. Berikan saran pertolongan pertama atau tindakan selanjutnya.
    3. Gunakan bahasa Indonesia yang ramah, profesional, dan ringkas.
  `;

  try {
    const result = await geminiModel.generateContent(systemPrompt);
    return result.response.text();
  } catch (error) {
    console.error("[AI Error]:", error);
    return "Maaf, sistem AI sedang gangguan. Jika pasien merasa sesak atau detak jantung tidak beraturan, segera ke IGD.";
  }
}

mqttClient.on('connect', () => {
  console.log('✅ Terhubung ke MQTT Broker');
  const mainTopic = process.env.MQTT_TOPIC || 'robot/sensor/data';
  mqttClient.subscribe(mainTopic, (err) => {
    if (!err) console.log(`📡 Mendengarkan topik JSON tunggal: ${mainTopic}`);
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const payload = message.toString();
    console.log(`[DEBUG] Pesan masuk dari ${topic} -> ${payload}`);
    
    if (topic.endsWith('data')) {
      const parsedData = JSON.parse(payload);
      
      sensorState.HR = parsedData.bpm ?? sensorState.HR;
      sensorState.SpO2 = parsedData.spo2 ?? sensorState.SpO2;
      sensorState.T_obj = parsedData.suhu ?? sensorState.T_obj;
      sensorState.ambient = parsedData.ambient ?? sensorState.ambient;
      
      sensorState.finger = parsedData.finger ?? false; 
      
      if (parsedData.jarak !== undefined) sensorState.jarak = parsedData.jarak;
      
      dataBaruMasuk = true;
    } 
    else if (topic.endsWith('jarak')) {
      sensorState.jarak = parseFloat(payload) || 0;
      dataBaruMasuk = true;
    }

  } catch (error) {
    console.error("❌ Gagal membaca JSON!", error);
  }
});

let jariSebelumnyaMenempel = false; 

let akumulasiData = { HR: 0, SpO2: 0, T_obj: 0, ambient: 0, jumlahData: 0 };

async function jalankanSiklusEvaluasi() {
  const jedaDetik = (currentConfig as any).interval_detik ?? 1; // Rekomendasi: set ke 1 detik di Firebase biar responsif
  const jedaMilidetik = jedaDetik * 1000;

  if (dataBaruMasuk) {
    
    if (sensorState.finger === true) {
      console.log(`[Scanning] Jari menempel. Mengunci data... HR=${sensorState.HR}, SpO2=${sensorState.SpO2}`);
      
      if (sensorState.HR > 0 && sensorState.SpO2 > 0) {
        akumulasiData.HR += sensorState.HR;
        akumulasiData.SpO2 += sensorState.SpO2;
        akumulasiData.T_obj += sensorState.T_obj;
        akumulasiData.ambient += sensorState.ambient;
        akumulasiData.jumlahData++;
      }
      
      jariSebelumnyaMenempel = true;
    } 
    
    else if (sensorState.finger === false && jariSebelumnyaMenempel === true) {
      console.log(`\n🚨 [Trigger] Jari dilepas! Memulai kalkulasi rata-rata & Analisis AI...`);

      const totalSampel = akumulasiData.jumlahData > 0 ? akumulasiData.jumlahData : 1;
      const finalHR = Math.round(akumulasiData.HR / totalSampel);
      const finalSpO2 = Math.round(akumulasiData.SpO2 / totalSampel);
      const finalT_obj = parseFloat((akumulasiData.T_obj / totalSampel).toFixed(1));
      const finalAmbient = parseFloat((akumulasiData.ambient / totalSampel).toFixed(1));

      if (finalHR > 0 && finalSpO2 > 0) {
        const aiAdvice = await analyzeHealthData(finalT_obj, finalHR, finalSpO2);
        console.log(`[AI] Analisis pasca-scan selesai.`);

        const recordData = {
          HR: finalHR,
          SpO2: finalSpO2,
          T_obj: finalT_obj,
          ambient: finalAmbient,
          jarak: sensorState.jarak,
          finger: false, 
          analisis_ai: aiAdvice,
          timestamp: ServerValue.TIMESTAMP
        };

        try {
          const dbRef = db.ref('riwayat_sensor');
          await dbRef.push(recordData);
          console.log(`☁️ Hasil Analisis AI sukses di-push ke Firebase!`);
        } catch (err) {
          console.error("❌ Gagal push ke Firebase:", err);
        }
      } else {
        console.log(`[Batal] Data scan tidak valid/terlalu cepat dilepas. Skip AI.`);
      }

      akumulasiData = { HR: 0, SpO2: 0, T_obj: 0, ambient: 0, jumlahData: 0 };
      jariSebelumnyaMenempel = false;
    } 
    
    dataBaruMasuk = false; 
  }

  setTimeout(jalankanSiklusEvaluasi, jedaMilidetik);
}

// Jalankan pertama kali saat backend dinyalakan
jalankanSiklusEvaluasi();

const app = new Elysia()
  .get('/', () => 'Backend APMOB Kel1 Berjalan Normal! 🤖')
  .listen(3000);

console.log(`🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`);