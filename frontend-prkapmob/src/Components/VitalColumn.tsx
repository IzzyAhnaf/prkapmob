import React from 'react';
import { BarChart } from './BarChart';

interface VitalColumnProps {
  label: string;
  trend: 'up' | 'down' | 'stable';
  values: number[];
  min: number;
  max: number;
  unit: string;
  barColor?: string;
}

export function VitalColumn({
  label, trend, values, min, max, unit, barColor,
}: VitalColumnProps) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justify_content: 'space-between' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '-0.01em' }}>
          {label} <span style={{ opacity: 0.6 }}>{arrow}</span>
        </span>
        <span style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2px 8px', borderRadius: '999px', cursor: 'pointer',
        }}>• • •</span>
      </div>
      <BarChart values={values} barColor={barColor} />
      <div>
        <div style={{ fontSize: '44px', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {min && max ? `${min}–${max}` : '--'}
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
          {unit}
        </div>
      </div>
    </div>
  );
}