import React from 'react';
import type { SensorData } from '../Types/sensor';

interface VitalsViewProps {
  history: SensorData[];
}

export function VitalsView({ history }: VitalsViewProps) {
  return (
    <div className="card-dark" style={{ minHeight: '60vh' }}>
      <div className="big-card-header">
        <span className="big-card-title">Log Data Sensor Lengkap</span>
        <span className="change-btn">Export CSV</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="report-table" style={{ textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>WAKTU</th>
              <th>HEART RATE (BPM)</th>
              <th>OXYGEN (SpO2%)</th>
              <th>TEMP (°C)</th>
              <th>IR RAW</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((row, i) => (
              <tr key={i} style={{ background: i === 0 ? 'rgba(134,239,172,0.05)' : 'transparent' }}>
                <td style={{ textAlign: 'left', color: i === 0 ? '#86efac' : 'inherit' }}>
                  {row.timestamp ? new Date(row.timestamp).toLocaleTimeString('id-ID') : '-'}
                  {i === 0 && <span style={{ marginLeft: 8, fontSize: '10px', background: 'rgba(134,239,172,0.15)', padding: '2px 6px', borderRadius: 4 }}>New</span>}
                </td>
                <td>{row.HR ?? '-'}</td>
                <td>{row.SpO2 ?? '-'}</td>
                <td>{row.T_obj ?? '-'}</td>
                <td style={{ color: 'rgba(255,255,255,0.3)' }}>{row.IR_raw ?? '-'}</td>
                <td>
                  <span style={{ 
                    width: 8, height: 8, display: 'inline-block', borderRadius: '50%', 
                    background: (row.SpO2 ?? 0) >= 95 ? '#86efac' : '#fca5a5' 
                  }}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}