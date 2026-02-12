"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 1. Tambah useRouter
import { 
  FileQuestion, BarChart3, Settings, LogOut, Menu, X, GraduationCap
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname(); 
  const router = useRouter(); // 2. Inisialisasi Router

  // --- PERBAIKAN: Gunakan startsWith agar lebih aman ---
  if (pathname && pathname.startsWith('/admin/login')) {
      return <>{children}</>;
  }
  // ----------------------------------------------------

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Bank Soal', href: '/admin', icon: FileQuestion },
    { name: 'Hasil Ujian', href: '/admin/results', icon: BarChart3 },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    // 3. Gunakan router.replace supaya user tidak bisa tekan tombol Back
    router.replace('/admin/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <GraduationCap className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <h1 className="text-lg font-bold tracking-wider">CBT ADMIN</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Administrator Panel</p>
          </div>
          <button className="lg:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          {/* 4. Tambahkan onClick={handleLogout} di sini */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-900 transition-colors text-slate-400 hover:text-red-400 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold group-hover:bg-red-900/30">A</div>
            <div className="text-left flex-1"><p className="text-sm font-medium text-white">Super Admin</p><p className="text-xs text-slate-500">admin@uika.ac.id</p></div>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between lg:hidden shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-slate-800">CBT System</span>
          <div className="w-10"></div> 
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}