"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Username: admin, Password: admin123
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      document.cookie = "isAdmin=true; path=/"; 
      localStorage.setItem("isAdmin", "true");
      router.push('/admin'); 
    } else {
      setError('Username atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola sistem CBT.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              // PERBAIKAN DI SINI: Tambah 'bg-white text-slate-900'
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Masukkan username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              // PERBAIKAN DI SINI JUGA
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Masukkan password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2">
            Masuk Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-400 hover:text-slate-600">Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  );
}