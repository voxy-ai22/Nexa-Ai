/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {User, Lock, ArrowRight, Sparkles} from 'lucide-react';
import {LOADING_IMAGES} from '../types';

export default function Auth({onLogin}: {onLogin: (username: string) => void}) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);

  // Frame by frame animation logic (Video/GIF style)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % LOADING_IMAGES.length);
    }, 100); // 100ms interval for smoother video feel
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Harap isi semua kolom');
      return;
    }

    const users = JSON.parse(localStorage.getItem('nexa_users') || '[]');

    if (isLogin) {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin(username);
      } else {
        setError('Username atau password salah');
      }
    } else {
      if (users.find((u: any) => u.username === username)) {
        setError('Username sudah digunakan');
        return;
      }
      users.push({username, password});
      localStorage.setItem('nexa_users', JSON.stringify(users));
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-sacred-blue overflow-hidden">
      {/* Hidden preloader for images */}
      <div className="hidden">
        {LOADING_IMAGES.slice(0, 20).map((src, i) => (
          <img key={i} src={src} />
        ))}
      </div>
      
      {/* Left Side: Video Style Frame by Frame Animation */}
      <div className="w-full lg:w-1/2 relative h-[40vh] lg:h-screen overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5 bg-black">
        <div className="absolute inset-0">
          <img
            src={LOADING_IMAGES[frameIndex]}
            alt="Nexa Stream"
            className="w-full h-full object-cover transition-none brightness-75 drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sacred-blue/80 via-transparent to-sacred-blue/80 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-sacred-blue via-transparent to-sacred-blue/20" />
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,2px_100%]" />
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-10 hidden lg:block">
          <h1 
            className="text-5xl font-black text-white leading-tight font-sans tracking-tight drop-shadow-2xl text-center lg:text-left"
          >
            KECERDASAN <br/>
            <span className="text-gold">NEXA AI</span>
          </h1>
          <p className="mt-4 text-white/60 max-w-sm font-medium leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
            Nikmati perpaduan kebijaksanaan mendalam dan kecerdasan buatan masa depan.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{opacity: 0, x: 20}}
          animate={{opacity: 1, x: 0}}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 lg:hidden text-center">
            <h2 className="text-3xl font-black text-white tracking-tight">NEXA AI</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold font-sans tracking-tight text-white mb-3">
              {isLogin ? 'Gerbang Masuk' : 'Pendaftaran'}
            </h2>
            <p className="text-sacred-white/40 font-medium">
              {isLogin ? 'Masuk ke dalam ekosistem kecerdasan Nexa AI' : 'Buat akun aman Anda di dalam jaringan Nexa AI'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{opacity: 0, scale: 0.95}} 
                animate={{opacity: 1, scale: 1}}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-3"
              >
                <div className="w-1 h-1 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
                <input
                  type="text"
                  placeholder="Nama Pengguna / Identitas"
                  className="w-full glass-input py-4 pl-12 pr-4 rounded-2xl text-white font-sans text-sm"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
                <input
                  type="password"
                  placeholder="Kata Sandi Rahasia"
                  className="w-full glass-input py-4 pl-12 pr-4 rounded-2xl text-white font-sans text-sm"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gold hover:bg-gold/90 text-sacred-blue font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 group shadow-2xl shadow-gold/20 tracking-widest text-sm uppercase"
            >
              {isLogin ? 'AUTENTIKASI' : 'INISIALISASI'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="group flex items-center justify-center gap-2 w-full text-sacred-white/40 hover:text-white transition-all text-xs font-bold tracking-[0.2em] uppercase"
            >
              <div className="h-[1px] w-8 bg-white/10 group-hover:bg-gold/50 transition-colors" />
              {isLogin ? "Daftar Akun Baru" : "Sudah Punya Akun"}
              <div className="h-[1px] w-8 bg-white/10 group-hover:bg-gold/50 transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
