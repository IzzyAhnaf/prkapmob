import { Elysia } from 'elysia';
import * as mqtt from 'mqtt';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { GoogleGenerativeAI } from '@google/generative-ai';
import serviceAccount from '../firebase-key.json';

// 1. Panggil URL Database dari .env
initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL: process.env.FIREBASE_DB_URL as string
});

const db = getDatabase(); 

let currentConfig = {
  batas_ir: 50000,
  peringatan_dini: {
    spo2_minimal: 95,
    suhu_maksimal: 37.5,
    hr_minimal: 60,
    hr_maksimal: 100
  }
};

// Dengarkan perubahan konfigurasi dari Firebase terus-menerus
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

// 3. Panggil konfigurasi MQTT dari .env
const mqttUrl = process.env.MQTT_BROKER_URL as string;
const mqttClient = mqtt.connect(mqttUrl);
const TOPIC_SENSOR = process.env.MQTT_TOPIC as string;

async function analyzeHealthData(suhu: number, hr: number, spo2: number) {
  console.log(`[AI] Meminta analisis Gemini untuk T:${suhu}°C, HR:${hr}bpm, SpO2:${spo2}%...`);
  
  // Mengambil batas dinamis dari konfigurasi terkini
  const { spo2_minimal, suhu_maksimal, hr_minimal, hr_maksimal } = currentConfig.peringatan_dini;
  
  const systemPrompt = `
    Kamu adalah asisten dokter digital profesional.
    Pasien melaporkan data sensor fisik berikut:
    - Suhu Permukaan Tubuh: ${suhu} °C (Batas normal maks: ${suhu_maksimal}°C)
    - Detak Jantung: ${hr} BPM (Batas normal: ${hr_minimal} - ${hr_maksimal} BPM)
    - Saturasi Oksigen: ${spo2} % (Batas normal min: ${spo2_minimal}%)

    Tugasmu:
    1. Evaluasi apakah ketiga parameter ini dalam batas normal atau ada indikasi bahaya berdasarkan panduan batas normal yang diberikan.
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
  mqttClient.subscribe(TOPIC_SENSOR, (err) => {
    if (!err) console.log(`📡 Mendengarkan topik: ${TOPIC_SENSOR}`);
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log("📩 MQTT Menerima pesan mentah:", message.toString());

  try {
    const rawData = message.toString();
    const sensorData = JSON.parse(rawData);
    
    console.log(`\n📥 Data masuk: HR=${sensorData.HR}, SpO2=${sensorData.SpO2}, T_obj=${sensorData.T_obj}`);

    let aiAdvice = "Menunggu jari ditempelkan ke sensor dengan benar...";
    
    // 🚀 Menggunakan batas IR dinamis dari Firebase, bukan angka mati lagi
    if (sensorData.IR_raw > currentConfig.batas_ir) {
        aiAdvice = await analyzeHealthData(sensorData.T_obj, sensorData.HR, sensorData.SpO2);
        console.log(`[AI] Analisis selesai.`);
    } else {
        console.log(`[Status] Jari tidak terdeteksi (IR_raw: ${sensorData.IR_raw} < ${currentConfig.batas_ir}). AI di-skip.`);
    }

    const recordData = {
      ...sensorData,
      analisis_ai: aiAdvice,
      timestamp: ServerValue.TIMESTAMP
    };

    const dbRef = db.ref('riwayat_sensor');
    await dbRef.push(recordData);
    console.log(`☁️ Data berhasil di-push ke Firebase Realtime Database!`);

  } catch (error) {
    console.error("❌ Gagal memproses pesan:", error);
  }
});

const app = new Elysia()
  .get('/', () => 'Backend Robot Kesehatan Berjalan Normal! 🤖')
  .listen(3000);

console.log(`🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`);