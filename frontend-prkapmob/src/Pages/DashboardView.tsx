import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
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

function Kucing3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.2; 
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={[0.8, 0.8, 0.8]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#8e8e8e" roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.9, 0.6]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.3} />
      </mesh>

      <mesh position={[-0.2, 1.2, 0.5]}>
        <coneGeometry args={[0.12, 0.25, 4]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>

      <mesh position={[0.2, 1.2, 0.5]}>
        <coneGeometry args={[0.12, 0.25, 4]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>

      <mesh position={[-0.15, 0.95, 0.86]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>

      <mesh position={[0.15, 0.95, 0.86]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.1} />
      </mesh>

      <mesh position={[0, 0.85, 0.86]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#fca5a5" />
      </mesh>

      <mesh position={[0, 0.7, -0.7]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#6a6a6a" />
      </mesh>

      <mesh position={[-0.3, 0, 0.4]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0.3, 0, 0.4]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[-0.3, 0, -0.4]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[0.3, 0, -0.4]}><boxGeometry args={[0.15, 0.4, 0.15]} /><meshStandardMaterial color="#fff" /></mesh>
    </group>
  );
}

export function DashboardView({
  latest, fingerDetected, hrVals, spo2Vals, tempVals, hr, spo2, temp, battPct, trend, setActiveTab
}: DashboardViewProps) {
  
  const isFingerPlaced = latest?.finger ?? fingerDetected;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      boxSizing: 'border-box',
      padding: '10px'
    }}>
      
      <div className="card-dark" style={{ 
        width: '100%', 
        minHeight: 'auto',
        boxSizing: 'border-box'
      }}>
        <div className="big-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span className="big-card-title">Tanda Vital Real-time</span>
          <span className="change-btn" onClick={() => setActiveTab('Vitals')} style={{ cursor: 'pointer' }}>Lihat Detail</span>
        </div>

        <div style={{
          width: '100%',
          height: '220px', 
          background: 'radial-gradient(circle, rgba(30,30,30,1) 0%, rgba(15,15,15,1) 100%)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.03)',
          cursor: 'grab' 
        }}>
          <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <directionalLight position={[-5, 5, -5]} intensity={1} />
            
            <Kucing3D />
            
            <OrbitControls enableZoom={true} maxDistance={5} minDistance={1.5} />
          </Canvas>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'wrap', 
          gap: '20px',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
            <VitalColumn label="Heart Rate" trend={isFingerPlaced ? trend(hrVals) : 'stable'} values={isFingerPlaced ? hrVals : []} min={hr.min} max={hr.max} unit="BPM per pembacaan" barColor="rgba(252,165,165,0.9)" />
          </div>
          <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
            <VitalColumn label="Saturasi O₂" trend={isFingerPlaced ? trend(spo2Vals) : 'stable'} values={isFingerPlaced ? spo2Vals : []} min={spo2.min} max={spo2.max} unit="% per pembacaan" barColor="rgba(147,197,253,0.9)" />
          </div>
          <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
            <VitalColumn label="Suhu Tubuh" trend={trend(tempVals)} values={tempVals} min={parseFloat(temp.min.toFixed(1))} max={parseFloat(temp.max.toFixed(1))} unit="°C per pembacaan" barColor="rgba(253,186,116,0.9)" />
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <div className="card-dark" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
          <div className="big-card-header">
            <span className="big-card-title" style={{ fontSize: '14px' }}>Status Hardware</span>
          </div>
          <div className="status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>MAX30102</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                {isFingerPlaced ? 'Terdeteksi' : 'Menunggu Jari'}
              </div>
            </div>
            <div className={`toggle-wrap ${isFingerPlaced ? 'on' : 'off'}`}><div className="toggle-knob" /></div>
          </div>
          <div className="status-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 0 }}>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>MLX90614</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Suhu Infra Merah</div>
            </div>
            <div className="toggle-wrap on"><div className="toggle-knob" /></div>
          </div>
          <div className="energy-row" style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Baterai</span>
            <div className="energy-bar" style={{ flex: 1 }}><div className="energy-fill" style={{ width: `${battPct}%` }} /></div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', minWidth: '35px', textAlign: 'right' }}>{battPct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="card-dark" style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>JARAK OBJEK TRIGER</div>
          <div className="stat-big">{latest?.jarak ?? '–'}</div>
          <div className="stat-sub">cm dari objek sensor</div>
        </div>

        <div className="card-dark" style={{ width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div className="big-card-header">
            <span className="big-card-title" style={{ fontSize: '14px' }}>Grafik Riwayat</span>
          </div>
          <div style={{ width: '100%', marginTop: 'auto', overflow: 'hidden' }}>
            <BarChart values={isFingerPlaced ? hrVals : []} barColor="rgba(255,255,255,0.5)" bars={20} />
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <div className="card-light" style={{ 
          cursor: 'pointer', 
          gridColumn: 'span 1',
          width: '100%',
          boxSizing: 'border-box'
        }} onClick={() => setActiveTab('AI Analysis')}>
          <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Analisis AI</div>
          <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', marginBottom: '1rem', letterSpacing: '0.01em' }}>Interpretasi Gemini</div>
          {latest?.analisis_ai ? (
            <div style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.65)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              <ReactMarkdown>{latest.analisis_ai}</ReactMarkdown>
            </div>
          ) : (
            <div className="ai-tip">
              <strong>Menunggu data pemindaian</strong>
              <div className="ai-tag" style={{ marginTop: '5px' }}>Lepas jari untuk memicu resep AI</div>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          width: '100%'
        }}>
          <div className="card-light" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em', color: '#111', marginBottom: '0.25rem' }}>Saturasi Oksigen</div>
            <div className="stat-big-light">{latest?.SpO2 ? `${latest.SpO2}%` : '–'}</div>
          </div>
          
          <div className="card-dark" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                SUHU TUBUH PATIENT
              </div>
              <div className="stat-big">
                {latest?.T_obj ? `${latest.T_obj.toFixed(1)}°C` : '–'}
              </div>
            </div>
            <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Suhu Fisik Sensor:</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                {latest?.ambient ? `${latest.ambient.toFixed(1)}°C` : '–'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}