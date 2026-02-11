"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";
import { 
  Download, Calendar, TrendingUp, Users, Award, AlertCircle, Loader2 
} from "lucide-react";

// Tipe Data
type TestResult = {
  score: number;
  createdAt: string;
};

export default function AdminDashboard() {
  const [rawData, setRawData] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Default Filter: 30 Hari Terakhir
  const [startDate, setStartDate] = useState(""); 
  const [endDate, setEndDate] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRawData(data);
          
          // Set default date range (Bulan ini)
          const today = new Date();
          const lastMonth = new Date();
          lastMonth.setMonth(today.getMonth() - 1);
          
          setEndDate(today.toISOString().split('T')[0]);
          setStartDate(lastMonth.toISOString().split('T')[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Logika Filter & Pengolahan Data (Otomatis jalan saat tanggal berubah)
  const dashboardStats = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Sampai akhir hari

    // A. Filter Data Sesuai Tanggal
    const filtered = rawData.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });

    // B. Hitung Statistik Dasar
    const totalPeserta = filtered.length;
    const totalScore = filtered.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = totalPeserta > 0 ? Math.round(totalScore / totalPeserta) : 0;
    
    // Nilai Tertinggi & Terendah
    const maxScore = totalPeserta > 0 ? Math.max(...filtered.map(d => d.score)) : 0;
    const minScore = totalPeserta > 0 ? Math.min(...filtered.map(d => d.score)) : 0;

    // C. Siapkan Data Grafik (Smart Grouping)
    // Jika range > 31 hari, kelompokkan per BULAN. Jika tidak, per HARI.
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const isMonthlyView = diffDays > 35;

    const chartMap: Record<string, { date: string; peserta: number; score: number; count: number }> = {};

    filtered.forEach(item => {
      const d = new Date(item.createdAt);
      // Kunci grouping (Tanggal atau Bulan)
      const key = isMonthlyView 
        ? d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) // "Jan 2026"
        : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }); // "12 Feb"

      if (!chartMap[key]) {
        chartMap[key] = { date: key, peserta: 0, score: 0, count: 0 };
      }
      chartMap[key].peserta += 1;
      chartMap[key].score += item.score;
      chartMap[key].count += 1;
    });

    const chartData = Object.values(chartMap).map(d => ({
      name: d.date,
      Peserta: d.peserta,
      RataRata: Math.round(d.score / d.count)
    }));

    return { totalPeserta, avgScore, maxScore, minScore, chartData, isMonthlyView };
  }, [rawData, startDate, endDate]);


  // Fungsi Print/Export
  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans print:bg-white print:p-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Laporan</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor performa tes TOEFL secara real-time.</p>
        </div>

        {/* TOOLBAR: FILTER & EXPORT */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm print:hidden">
          {/* Input Tanggal */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
            />
          </div>

          {/* Tombol Export */}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-blue-200"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* CONTENT DASHBOARD */}
      {dashboardStats && (
        <>
          {/* 1. STATS CARDS (GRID 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard 
              label="Total Peserta" 
              value={dashboardStats.totalPeserta} 
              icon={<Users className="w-5 h-5 text-blue-600" />} 
              trend="Orang"
              color="bg-blue-50 border-blue-100"
            />
            <StatCard 
              label="Rata-Rata Skor" 
              value={dashboardStats.avgScore} 
              icon={<Award className="w-5 h-5 text-indigo-600" />} 
              trend="Poin"
              color="bg-indigo-50 border-indigo-100"
            />
            <StatCard 
              label="Skor Tertinggi" 
              value={dashboardStats.maxScore} 
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} 
              trend="Max"
              color="bg-emerald-50 border-emerald-100"
            />
             <StatCard 
              label="Skor Terendah" 
              value={dashboardStats.minScore} 
              icon={<AlertCircle className="w-5 h-5 text-orange-600" />} 
              trend="Min"
              color="bg-orange-50 border-orange-100"
            />
          </div>

          {/* 2. CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-6">
            
            {/* Grafik 1: Tren Peserta */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-none">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800">Tren Jumlah Peserta</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500">
                  {dashboardStats.isMonthlyView ? 'Bulanan' : 'Harian'}
                </span>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="Peserta" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={dashboardStats.isMonthlyView ? 40 : 20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 2: Tren Nilai */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-none">
               <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800">Tren Nilai Rata-Rata</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardStats.chartData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis domain={[310, 677]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                    <Area type="monotone" dataKey="RataRata" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

// Komponen Kecil untuk Kartu Statistik
function StatCard({ label, value, icon, trend, color }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${color} bg-opacity-30 print:border-gray-200 print:bg-white`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{trend}</span>
      </div>
      <div>
        <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}