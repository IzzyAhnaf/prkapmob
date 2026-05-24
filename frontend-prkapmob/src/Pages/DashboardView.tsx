import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { SensorData } from '../Types/sensor';
import { VitalColumn } from '../Components/VitalColumn';
import { BarChart } from '../Components/BarChart';

interface DashboardViewProps {
  latest: SensorData | null;
  fingerDetected: boolean;
  hrVals: number[];
  spo2Vals: number[];
  tempVals: number[];
  hr: { min: number; max: number };
  spo2: { min: number; max: number };
  temp: { min: number; max: number };
  battPct: number;
  trend: (arr: number[]) => 'up' | 'down' | 'stable';
  setActiveTab: (tab: string) => void;
}

export function DashboardView({
  latest, fingerDetected, hrVals, spo2Vals, tempVals, hr, spo2, temp, battPct, trend, setActiveTab
}: DashboardViewProps) {
  return (
    <>
      <div className="top-row">
        <div className="card-dark">
          <div className="big-card-header">
            <span className="big-card-title">Tanda Vital Real-time</span>
            <span className="change-btn" onClick={() => setActiveTab('Vitals')}>Lihat Detail</span>
          </div>
          <div className="vitals-inner">
            <VitalColumn label="Heart Rate" trend={trend(hrVals)} values={hrVals} min={hr.min} max={hr.max} unit="BPM per pembacaan" barColor="rgba(252,165,165,0.9)" />
            <div className="vital-divider" />
            <VitalColumn label="Saturasi O₂" trend={trend(spo2Vals)} values={spo2Vals} min={spo2.min} max={spo2.max} unit="% per pembacaan" barColor="rgba(147,197,253,0.9)" />
            <div className="vital-divider" />
            <VitalColumn label="Suhu Permukaan" trend={trend(tempVals)} values={tempVals} min={parseFloat(temp.min.toFixed(1))} max={parseFloat(temp.max.toFixed(1))} unit="°C per pembacaan" barColor="rgba(253,186,116,0.9)" />
          </div>
        </div>

        <div className="right-col">
          <div className="card-dark" style={{ flex: 1 }}>
            <div className="big-card-header" style={{ marginBottom: '0.75rem' }}>
              <span className="big-card-title" style={{ fontSize: '14px' }}>Status Sensor</span>
            </div>
            <div className="status-row">
              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>MAX30102</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{fingerDetected ? 'Terdeteksi' : 'Menunggu'}</div>
              </div>
              <div className={`toggle-wrap ${fingerDetected ? 'on' : 'off'}`}><div className="toggle-knob" /></div>
            </div>
            <div className="status-row" style={{ marginBottom: 0 }}>
              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>MLX90614</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Suhu IR</div>
              </div>
              <div className="toggle-wrap on"><div className="toggle-knob" /></div>
            </div>
            <div className="energy-row" style={{ marginTop: '1.25rem' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Baterai</span>
              <div className="energy-bar"><div className="energy-fill" style={{ width: `${battPct}%` }} /></div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', minWidth: '36px', textAlign: 'right' }}>{battPct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="card-dark">
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>JARAK OBJEK</div>
            <div className="stat-big">{latest?.d ?? '–'}</div>
            <div className="stat-sub">cm dari sensor</div>
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="card-light" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('AI Analysis')}>
          <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Analisis AI</div>
          <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', marginBottom: '1rem', letterSpacing: '0.01em' }}>Interpretasi Gemini</div>
          {latest?.analisis_ai ? (
            <div style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              <ReactMarkdown>{latest.analisis_ai}</ReactMarkdown>
            </div>
          ) : (
            <>
              <div className="ai-tip"><strong>Menunggu data sensor</strong><div className="ai-tag">Tempelkan jari untuk memulai</div></div>
            </>
          )}
        </div>

        <div className="card-dark">
          <div className="big-card-header">
            <span className="big-card-title" style={{ fontSize: '14px' }}>Riwayat Pembacaan</span>
          </div>
          <BarChart values={hrVals} barColor="rgba(255,255,255,0.5)" bars={20} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card-light" style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em', color: '#111', marginBottom: '0.25rem' }}>Saturasi Oksigen</div>
            <div className="stat-big-light">{latest?.SpO2 ?? '–'}%</div>
          </div>
          <div className="card-dark" style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SUHU PERMUKAAN</div>
            <div className="stat-big">{latest?.T_obj ?? '–'}°</div>
          </div>
        </div>
      </div>
    </>
  );
}