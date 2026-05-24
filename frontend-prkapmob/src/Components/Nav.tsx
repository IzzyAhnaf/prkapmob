import React from 'react';

interface NavProps {
  time: Date;
  fingerDetected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Nav({ time, fingerDetected, activeTab, setActiveTab }: NavProps) {
  return (
    <nav style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '1rem 1.5rem', 
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexWrap: 'wrap', 
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
          color: '#fff'
        }}>♡</div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {['Dashboard', 'Vitals', 'AI Analysis', 'Settings'].map(label => (
            <span key={label} 
              onClick={() => setActiveTab(label)}
              style={{
                fontSize: '13px', 
                color: label === activeTab ? '#fff' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer', 
                letterSpacing: '-0.01em',
                transition: 'color 0.2s',
                fontWeight: label === activeTab ? 500 : 400,
                padding: '4px 2px',
                whiteSpace: 'nowrap' 
            }}>{label}</span>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem',
        marginLeft: 'auto', 
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '999px',
          border: `1px solid ${fingerDetected ? 'rgba(134,239,172,0.3)' : 'rgba(255,255,255,0.08)'}`,
          background: fingerDetected ? 'rgba(134,239,172,0.08)' : 'transparent',
          fontSize: '11px',
          color: fingerDetected ? '#86efac' : 'rgba(255,255,255,0.3)',
          transition: 'all 0.4s',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: fingerDetected ? '#86efac' : 'rgba(255,255,255,0.15)',
            animation: fingerDetected ? 'blink 2s ease infinite' : 'none',
          }} />
          {fingerDetected ? 'Sensor Aktif' : 'Standby'}
        </div>

        {/* Jam Digital */}
        <div style={{ textAlign: 'right', minWidth: '60px' }}>
          <div style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', letterSpacing: '0.08em' }}>
            WAKTU
          </div>
        </div>
      </div>
      
    </nav>
  );
}