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

// 2. Panggil API Key Gemini dari .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// 3. Panggil konfigurasi MQTT dari .env
const mqttUrl = process.env.MQTT_BROKER_URL as string;
const mqttClient = mqtt.connect(mqttUrl);
const TOPIC_SENSOR = process.env.MQTT_TOPIC as string;

async function analyzeHealthData(suhu: number, hr: number, spo2: number) {
  console.log(`[AI] Meminta analisis Gemini untuk T:${suhu}°C, HR:${hr}bpm, SpO2:${spo2}%...`);
  
  const systemPrompt = `
    Kamu adalah asisten dokter digital profesional.
    Pasien melaporkan data sensor fisik berikut:
    - Suhu Permukaan Tubuh (T_obj): ${suhu} °C
    - Detak Jantung (HR): ${hr} BPM
    - Saturasi Oksigen Darah (SpO2): ${spo2} %

    Tugasmu:
    1. Evaluasi apakah ketiga parameter ini dalam batas normal atau ada indikasi bahaya (misal: SpO2 rendah, takikardia, atau demam).
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
    
    if (sensorData.IR_raw > 50000) {
        aiAdvice = await analyzeHealthData(sensorData.T_obj, sensorData.HR, sensorData.SpO2);
        console.log(`[AI] Analisis selesai.`);
    } else {
        console.log(`[Status] Jari tidak terdeteksi (IR_raw: ${sensorData.IR_raw}). AI di-skip.`);
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