import React from 'react';

interface BarChartProps {
  values: number[];
  barColor?: string;
  bars?: number;
}

export function BarChart({
  values,
  barColor = 'rgba(255,255,255,0.85)',
  bars = 18,
}: BarChartProps) {
  const padded = [...Array(Math.max(0, bars - values.length)).fill(0), ...values].slice(-bars);
  const max = Math.max(...padded, 1);
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: '72px', width: '100%' }}>
      {padded.map((_v, i) => (
        <div key={i} style={{
          flex: 1,
          minWidth: 0,
          height: _v === 0 ? '8%' : `${Math.max(8, (_v / max) * 100)}%`,
          background: _v === 0 ? 'rgba(255,255,255,0.06)' : barColor,
          borderRadius: '1.5px 1.5px 0 0',
          opacity: _v === 0 ? 1 : 0.2 + (i / bars) * 0.8,
          transition: 'height 0.6s ease',
        }} />
      ))}
    </div>
  );
}