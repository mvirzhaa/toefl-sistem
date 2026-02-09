"use client";

import { useState, useEffect } from 'react';
import { 
  Server, ShieldAlert, Trash2, Save, 
  RefreshCw, Database, Activity, Lock, Clock 
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState({ old: '', new: '' });
  
  // STATE BARU: Durasi Ujian
  const [duration, setDuration] = useState(120); // Default 120 menit

  // 1. Load Durasi saat halaman dibuka
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.duration) setDuration(data.duration);
      });
  }, []);

  // 2. Simpan Durasi
  const handleSaveDuration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
      if (res.ok) alert("✅ Durasi ujian berhasil diupdate!");
      else alert("Gagal menyimpan.");
    } catch (err) { alert("Error koneksi."); }
    setLoading(false);
  };

  const handleReset = async (type: 'results' | 'questions') => {
    const label = type === 'results' ? 'SEMUA HASIL UJIAN' : 'SEMUA BANK SOAL';
    const confirmText = prompt(`⚠️ BAHAYA! \n\nAnda akan menghapus ${label}.\nKetik "SETUJU" untuk lanjut:`);
    if (confirmText !== "SETUJU") return;

    setLoading(true);
    try {
      await fetch(`/api/admin/reset?type=${type}`, { method: 'DELETE' });
      alert(`✅ Sukses! ${label} telah dikosongkan.`);
    } catch (err) { alert("Error."); }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">System Settings</h2>
        <p className="text-slate-500 mt-2">Pusat kontrol konfigurasi sistem CBT.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. SYSTEM HEALTH (Tetap Sama) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> System Health</h3>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold animate-pulse">Online</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-4 bg-slate-50 rounded-xl text-center"><Server className="mx-auto mb-2 text-slate-400"/><p className="text-xs font-bold text-slate-500">SERVER</p><p className="font-bold text-slate-800">Vercel</p></div>
               <div className="p-4 bg-slate-50 rounded-xl text-center"><Database className="mx-auto mb-2 text-slate-400"/><p className="text-xs font-bold text-slate-500">DATABASE</p><p className="font-bold text-green-600">Connected</p></div>
               <div className="p-4 bg-slate-50 rounded-xl text-center"><RefreshCw className="mx-auto mb-2 text-slate-400"/><p className="text-xs font-bold text-slate-500">LATENCY</p><p className="font-bold text-slate-800">24ms</p></div>
               <div className="p-4 bg-slate-50 rounded-xl text-center"><Lock className="mx-auto mb-2 text-slate-400"/><p className="text-xs font-bold text-slate-500">SECURITY</p><p className="font-bold text-blue-600">Active</p></div>
            </div>
          </div>

          {/* 2. KONFIGURASI UJIAN (BARU!) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
             <div className="px-6 py-4 border-b border-slate-100 bg-blue-50">
               <h3 className="font-bold text-blue-800 flex items-center gap-2">
                 <Clock className="w-5 h-5" /> Konfigurasi Durasi Ujian
               </h3>
             </div>
             <form onSubmit={handleSaveDuration} className="p-6">
                <div className="flex items-end gap-4">
                   <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Waktu Pengerjaan (Menit)</label>
                      <input 
                        type="number" 
                        min="10"
                        required
                        className="w-full p-3 border border-slate-300 rounded-xl font-bold text-lg text-slate-800"
                        placeholder="Contoh: 120"
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        *Default TOEFL PBT biasanya <strong>120 Menit (2 Jam)</strong>.
                      </p>
                   </div>
                   <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 mb-0.5 shadow-lg shadow-blue-200 transition-all">
                     {loading ? 'Menyimpan...' : <><Save className="w-5 h-5" /> Simpan Durasi</>}
                   </button>
                </div>
             </form>
          </div>

        </div>

        {/* KOLOM KANAN: DANGER ZONE */}
        <div className="space-y-8">
           <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100 bg-red-100/50">
                <h3 className="font-bold text-red-700 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Danger Zone</h3>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">Reset Data Nilai</h4>
                    <p className="text-xs text-slate-500 mb-3">Hapus semua hasil ujian siswa.</p>
                    <button onClick={() => handleReset('results')} disabled={loading} className="w-full py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Hapus Semua Nilai</button>
                 </div>
                 <hr className="border-red-200" />
                 <div>
                    <h4 className="font-bold text-slate-800 text-sm">Kosongkan Bank Soal</h4>
                    <p className="text-xs text-slate-500 mb-3">Hapus semua soal dari database.</p>
                    <button onClick={() => handleReset('questions')} disabled={loading} className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"><Trash2 className="w-4 h-4" /> Format Bank Soal</button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}