import React from 'react';
import type { SensorData } from '../Types/sensor';

interface VitalsViewProps {
  history: SensorData[];
}

export function VitalsView({ history }: VitalsViewProps) {
  
  const handleExportCSV = () => {
    if (!history || history.length === 0) {
      alert("Belum ada data sensor yang bisa diexport, cuk!");
      return;
    }

    const headers = ["Waktu", "Heart Rate (BPM)", "Saturasi Oksigen (%)", "Suhu Tubuh (C)", "Suhu Sensor (C)", "Jarak Objek (cm)", "Status"];
    
    const rows = [...history].reverse().map(row => {
      const waktu = row.timestamp ? new Date(row.timestamp).toLocaleTimeString('id-ID') : '-';
      const hr = row.HR && row.HR > 0 ? row.HR : 0;
      const spo2 = row.SpO2 && row.SpO2 > 0 ? row.SpO2 : 0;
      const tempTubuh = row.T_obj ? row.T_obj.toFixed(1) : '-';
      const tempSensor = row.ambient ? row.ambient.toFixed(1) : '-';
      const jarak = row.jarak ?? '-';
      
      let status = "Standby";
      if (hr > 0) {
        status = spo2 >= 95 ? "Normal" : "Abnormal";
      }

      return [waktu, hr, spo2, tempTubuh, tempSensor, jarak, status];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const fileName = `Log_Sensor_Kelompok10_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute("download", fileName);
    
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
  };

  return (
    <div className="card-dark" style={{ 
      minHeight: '60vh',
      width: '100%',
      boxSizing: 'border-box',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="big-card-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        width: '100%',
        marginBottom: '15px'
      }}>
        <span className="big-card-title">Log Data Sensor Lengkap</span>
        <span 
          className="change-btn" 
          onClick={handleExportCSV} 
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
        >
          Export CSV
        </span>
      </div>

      <div style={{ 
        overflowX: 'auto', 
        width: '100%',
        WebkitOverflowScrolling: 'touch', 
        borderRadius: '6px'
      }}>
        <table className="report-table" style={{ 
          textAlign: 'left', 
          width: '100%',
          minWidth: '650px', 
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px' }}>WAKTU</th>
              <th style={{ padding: '12px 8px' }}>HEART RATE</th>
              <th style={{ padding: '12px 8px' }}>OXYGEN</th>
              <th style={{ padding: '12px 8px' }}>TEMP TUBUH</th>
              <th style={{ padding: '12px 8px' }}>TEMP SENSOR</th>
              <th style={{ padding: '12px 8px' }}>JARAK OBJEK</th>
              <th style={{ padding: '12px 8px', textAlign: 'center' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((row, i) => (
              <tr key={i} style={{ 
                background: i === 0 ? 'rgba(134,239,172,0.05)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ textAlign: 'left', color: i === 0 ? '#86efac' : 'inherit', padding: '12px 8px', whiteSpace: 'nowrap' }}>
                  {row.timestamp ? new Date(row.timestamp).toLocaleTimeString('id-ID') : '-'}
                  {i === 0 && <span style={{ marginLeft: 8, fontSize: '10px', background: 'rgba(134,239,172,0.15)', padding: '2px 6px', borderRadius: 4 }}>New</span>}
                </td>
                <td style={{ padding: '12px 8px' }}>{row.HR && row.HR > 0 ? `${row.HR} BPM` : '-'}</td>
                <td style={{ padding: '12px 8px' }}>{row.SpO2 && row.SpO2 > 0 ? `${row.SpO2}%` : '-'}</td>
                <td style={{ padding: '12px 8px' }}>{row.T_obj ? `${row.T_obj.toFixed(1)}°C` : '-'}</td>
                <td style={{ padding: '12px 8px', color: 'rgba(255,255,255,0.6)' }}>
                  {row.ambient ? `${row.ambient.toFixed(1)}°C` : '-'}
                </td>
                <td style={{ color: 'rgba(255,255,255,0.4)', padding: '12px 8px' }}>
                  {row.jarak ? `${row.jarak} cm` : '-'}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <span style={{ 
                    width: 10, height: 10, display: 'inline-block', borderRadius: '50%', 
                    background: (row.HR ?? 0) === 0 ? '#6b7280' : ((row.SpO2 ?? 0) >= 95 ? '#86efac' : '#fca5a5')
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