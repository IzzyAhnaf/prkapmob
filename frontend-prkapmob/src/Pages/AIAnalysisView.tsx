import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { SensorData } from '../Types/sensor';

interface AIAnalysisViewProps {
  latest: SensorData | null;
}

export function AIAnalysisView({ latest }: AIAnalysisViewProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
      <div className="card-dark" style={{ height: 'fit-content' }}>
        <div style={{ width: 48, height: 48, background: '#e8e8e0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: '1rem' }}>
          ✨
        </div>
        <div style={{ fontSize: '16px', marginBottom: '0.5rem' }}>Gemini 2.5 Flash</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Sistem AI menganalisis anomali pada detak jantung, kadar oksigen, dan suhu secara *real-time* untuk memberikan rekomendasi medis awal.
        </div>
      </div>
      
      <div className="card-light" style={{ minHeight: '60vh' }}>
        <div style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
          Laporan Medis Digital
        </div>
        {latest?.analisis_ai ? (
          <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.8)', lineHeight: 1.8 }}>
            <ReactMarkdown>{latest.analisis_ai}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '3rem' }}>
            Belum ada data analisis AI yang tersedia.<br/>Silakan letakkan jari pada sensor.
          </div>
        )}
      </div>
    </div>
  );
}