import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { SensorData } from '../Types/sensor';

interface AIAnalysisViewProps {
  latest: SensorData | null;
}

export function AIAnalysisView({ latest }: AIAnalysisViewProps) {
  return (
    <div style={{ 
      width: '100%',
      boxSizing: 'border-box',
      padding: '4px'
    }}>
      
      <div className="card-light" style={{ 
        minHeight: '60vh',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 500, 
          letterSpacing: '-0.02em', 
          marginBottom: '1.5rem', 
          borderBottom: '1px solid rgba(0,0,0,0.1)', 
          paddingBottom: '1rem',
          color: '#111'
        }}>
          Laporan Medis Digital
        </div>
        
        {latest?.analisis_ai ? (
          <div style={{ 
            fontSize: '14px', 
            color: 'rgba(0,0,0,0.8)', 
            lineHeight: 1.8,      
            wordBreak: 'break-word'
          }}>
            <ReactMarkdown>{latest.analisis_ai}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '4rem', color: '#111' }}>
            Belum ada data analisis AI yang tersedia.<br/>Silakan lakukan pemindaian pada alat Kelompok 10.
          </div>
        )}
      </div>

    </div>
  );
}