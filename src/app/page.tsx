"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  User, 
  Mail, 
  Phone 
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Harap lengkapi semua data diri Anda.");
      return;
    }
    localStorage.setItem("cbt_user", JSON.stringify(formData));
    router.push("/test");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-800">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">CBT TOEFL SYSTEM</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-widest">UNIVERSITAS IBN KHALDUN BOGOR</p>
            </div>
          </div>
          <div className="hidden md:block text-sm text-slate-500 font-medium">
            Tahun Akademik 2025/2026
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider mb-4 border border-blue-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SISTEM UJIAN ONLINE AKTIF
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            TOEFL <span className="text-blue-600">Prediction Test</span>
          </h1>
          
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Selamat datang di portal ujian berbasis komputer. Silakan persiapkan diri Anda, pastikan koneksi internet stabil, dan klik tombol di bawah untuk memulai sesi.
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-slate-500 py-4">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Listening Audio</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Auto Timer</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Instant Result</span>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1"
            >
              Mulai Ujian Sekarang
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-slate-400">
              *Data diri akan diminta sebelum masuk ke soal.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 px-6 text-center border-t border-slate-200 bg-white relative">
        <p className="text-slate-400 text-sm">&copy; 2026 Lab Komputer UIKA Bogor. Developed by Mahasiswa IT.</p>
        <a 
          href="/admin/login" 
          className="absolute bottom-6 right-6 p-2 text-slate-300 hover:text-blue-600 transition-colors rounded-full hover:bg-slate-100"
          title="Admin Login"
        >
          <Lock className="w-4 h-4" />
        </a>
      </footer>

      {/* MODAL FORM (INI YANG DIPERBAIKI) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 text-center">
              <h2 className="text-xl font-bold text-slate-800">Data Peserta Ujian</h2>
              <p className="text-sm text-slate-500">Isi identitas Anda dengan benar.</p>
            </div>

            <form onSubmit={handleStart} className="p-8 space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Muhamad Virzha"
                    // PERBAIKAN: text-slate-900
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-slate-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none placeholder:text-slate-400"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="nama@email.com"
                    // PERBAIKAN: text-slate-900
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-slate-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none placeholder:text-slate-400"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    required
                    placeholder="0812xxxx"
                    // PERBAIKAN: text-slate-900
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 text-slate-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none placeholder:text-slate-400"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95"
                >
                  Lanjut ke Soal Ujian
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-800 font-medium"
                >
                  Batal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}