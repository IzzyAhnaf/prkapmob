import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../Config/firebase'; 
import Swal from 'sweetalert2';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        title: 'Input Kosong',
        text: 'Silakan isi email dan password terlebih dahulu.',
        icon: 'warning',
        background: '#191917',
        color: '#fff',
        confirmButtonColor: '#fca5a5'
      });
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      Swal.fire({
        title: 'Berhasil Masuk!',
        text: 'Selamat datang di Dashboard Robot Kesehatan.',
        icon: 'success',
        background: '#191917',
        color: '#fff',
        confirmButtonColor: '#86efac',
        timer: 1500,
        showConfirmButton: false
      });

      setTimeout(() => {
        onLoginSuccess();
      }, 1500);

    } catch (error: any) {
      console.error("Login Error:", error.code);
      let errorMessage = 'Email atau password salah.';
      if (error.code === 'auth/user-not-found') errorMessage = 'Akun tidak ditemukan.';
      if (error.code === 'auth/wrong-password') errorMessage = 'Password yang Anda masukkan salah.';
      
      Swal.fire({
        title: 'Gagal Masuk',
        text: errorMessage,
        icon: 'error',
        background: '#191917',
        color: '#fff',
        confirmButtonColor: '#fca5a5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-container {
          min-height: 100vh;
          background: #111110;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 50%;
          filter: blur(80px);
          top: 10%;
          left: 10%;
          pointer-events: none;
        }

        .login-box {
          width: 100%;
          max-width: 380px;
          background: #191917;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-sizing: border-box;
        }

        .login-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin: 0 auto 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.25rem;
        }

        .login-header h2 {
          font-size: 24px;
          font-weight: 300;
          letter-spacing: -0.04em;
          color: #fff;
        }

        .login-header p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.35);
          margin-top: 6px;
          letter-spacing: -0.01em;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .input-group label {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .input-group input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          padding: 12px 14px; /* Sedikit dipertebal untuk kenyamanan sentuhan HP */
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .input-group input:focus {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.02);
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.15);
        }

        .login-btn {
          width: 100%;
          background: #ffffff;
          color: #111110;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          margin-top: 1.75rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
        }

        .login-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-0.5px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Responsive tweak untuk HP layar kecil agar padding tidak terlalu sesak */
        @media (max-width: 400px) {
          .login-box {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">♡</div>
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Kelompok 10 • Robot Kesehatan IoT</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="dokter@kelompok10.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="input-group" style={{ marginTop: '1.25rem' }}>
              <label>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Memverifikasi Perangkat...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}