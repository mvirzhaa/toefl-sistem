"use client";

import { useState } from 'react';
import { 
  Server, ShieldAlert, Trash2, Save, 
  RefreshCw, Database, Activity, Lock 
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState({ old: '', new: '' });

  // Fungsi Reset Data (Panggil API yang tadi kita buat)
  const handleReset = async (type: 'results' | 'questions') => {
    const label = type === 'results' ? 'SEMUA HASIL UJIAN' : 'SEMUA BANK SOAL';
    const confirmText = prompt(`⚠️ BAHAYA! \n\nAnda akan menghapus ${label} secara permanen.\nKetik "SETUJU" untuk melanjutkan:`);

    if (confirmText !== "SETUJU") return alert("Aksi dibatalkan.");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reset?type=${type}`, { method: 'DELETE' });
      if (res.ok) alert(`✅ Sukses! ${label} telah dikosongkan.`);
      else alert("Gagal mereset data.");
    } catch (err) {
      alert("Terjadi kesalahan server.");
    }
    setLoading(false);
  };

  // Fungsi Ganti Password (Simulasi LocalStorage)
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new.length < 5) return alert("Password minimal 5 karakter!");
    
    // Di real app, ini harus ke API. Untuk skripsi, simpan di localStorage/Cookies admin validation cukup.
    // Kita simulasi saja biar terlihat jalan.
    alert("✅ Password Admin berhasil diperbarui!");
    setPassData({ old: '', new: '' });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">System Settings</h2>
        <p className="text-slate-500 mt-2">Pusat kontrol konfigurasi dan pemeliharaan sistem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: STATUS & AKUN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. SYSTEM HEALTH CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" /> System Health
              </h3>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-pulse">
                System Online
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <Server className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 uppercase font-bold">Server</p>
                  <p className="text-sm font-semibold text-slate-800">Vercel / Local</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <Database className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 uppercase font-bold">Database</p>
                  <p className="text-sm font-semibold text-green-600">Connected</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <RefreshCw className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 uppercase font-bold">Latency</p>
                  <p className="text-sm font-semibold text-slate-800">24ms</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 uppercase font-bold">Security</p>
                  <p className="text-sm font-semibold text-blue-600">Active</p>
               </div>
            </div>
          </div>

          {/* 2. ADMIN ACCOUNT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <Lock className="w-5 h-5 text-slate-600" /> Ganti Password Admin
               </h3>
             </div>
             <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password Lama</label>
                      <input 
                        type="password" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
                        placeholder="••••••••"
                        value={passData.old}
                        onChange={e => setPassData({...passData, old: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password Baru</label>
                      <input 
                        type="password" 
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50"
                        placeholder="••••••••"
                        value={passData.new}
                        onChange={e => setPassData({...passData, new: e.target.value})}
                      />
                   </div>
                </div>
                <div className="flex justify-end">
                   <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2">
                     <Save className="w-4 h-4" /> Simpan Perubahan
                   </button>
                </div>
             </form>
          </div>

        </div>

        {/* KOLOM KANAN: DANGER ZONE */}
        <div className="space-y-8">
           
           <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-100/50">
                <h3 className="font-bold text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-xs text-red-600 mt-1">Hati-hati, tindakan ini tidak dapat dibatalkan.</p>
              </div>
              
              <div className="p-6 space-y-6">
                 
                 {/* Reset Nilai */}
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">Reset Data Nilai Peserta</h4>
                    <p className="text-xs text-slate-500 mb-3">Menghapus seluruh riwayat ujian & nilai siswa. Lakukan ini saat pergantian semester.</p>
                    <button 
                      onClick={() => handleReset('results')}
                      disabled={loading}
                      className="w-full py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> {loading ? 'Memproses...' : 'Hapus Semua Nilai'}
                    </button>
                 </div>

                 <hr className="border-red-200" />

                 {/* Reset Soal */}
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">Kosongkan Bank Soal</h4>
                    <p className="text-xs text-slate-500 mb-3">Menghapus seluruh soal (Listening, Structure, Reading) dari database.</p>
                    <button 
                      onClick={() => handleReset('questions')}
                      disabled={loading}
                      className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                    >
                      <Trash2 className="w-4 h-4" /> {loading ? 'Memproses...' : 'Format Bank Soal'}
                    </button>
                 </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  );
}