"use client";

import { useState, useEffect } from 'react';
import { 
  Trash2, Users, Award, TrendingUp, 
  Search, FileDown, CheckCircle, XCircle, Mail, Phone 
} from 'lucide-react';

type Result = {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: number;
  totalQ: number;
  createdAt: string;
};

export default function AdminResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data dari Database
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/admin/results');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data nilai ini secara permanen?')) return;
    
    await fetch(`/api/admin/results?id=${id}`, { method: 'DELETE' });
    fetchResults(); // Refresh tabel otomatis
  };

  // 2. Fungsi Export ke CSV (Excel)
  const downloadCSV = () => {
    if (results.length === 0) return alert("Belum ada data untuk diekspor.");

    // Header CSV
    const headers = ["Nama Peserta,Email,No HP,Skor Benar,Total Soal,Tanggal Tes,Status"];
    
    // Isi Data
    const rows = results.map(r => {
      const status = (r.score / r.totalQ) * 100 >= 50 ? "Lulus" : "Tidak Lulus";
      const date = new Date(r.createdAt).toLocaleDateString('id-ID');
      return `"${r.name}","${r.email}","${r.phone}",${r.score},${r.totalQ},"${date}","${status}"`;
    });

    // Gabungkan & Download
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Nilai_TOEFL_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Logika Kelulusan (Passing Grade 50%)
  const isPass = (score: number, total: number) => {
    return (score / total) * 100 >= 50; 
  };

  // Filter Pencarian (Berdasarkan Nama)
  const filteredData = results.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistik Ringkas
  const totalPeserta = results.length;
  const lulusCount = results.filter(r => isPass(r.score, r.totalQ)).length;
  const avgScore = totalPeserta > 0 
    ? (results.reduce((a, b) => a + b.score, 0) / totalPeserta).toFixed(1) 
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-slate-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      Memuat Data Nilai...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Rekap Hasil Ujian</h1>
            <p className="text-slate-500 mt-1">Data real-time peserta yang telah menyelesaikan tes.</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:-translate-y-1"
          >
            <FileDown className="w-5 h-5" /> Export Data (CSV)
          </button>
        </div>

        {/* STATISTIK KARTU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Peserta</p>
              <p className="text-3xl font-black text-slate-800">{totalPeserta}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lulus (Grade &gt; 50%)</p>
              <p className="text-3xl font-black text-slate-800">
                {totalPeserta > 0 ? Math.round((lulusCount / totalPeserta) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rata-Rata Skor</p>
              <p className="text-3xl font-black text-slate-800">{avgScore}</p>
            </div>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Search Bar */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari Nama Peserta..." 
              className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-5 border-b border-slate-200">Tanggal</th>
                  <th className="p-5 border-b border-slate-200">Identitas Peserta</th>
                  <th className="p-5 border-b border-slate-200 text-center">Skor</th>
                  <th className="p-5 border-b border-slate-200 text-center">Status</th>
                  <th className="p-5 border-b border-slate-200 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.map((res) => {
                    const passed = isPass(res.score, res.totalQ);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-5 text-sm text-slate-500 font-medium whitespace-nowrap">
                          {new Date(res.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                          <div className="text-xs text-slate-400 mt-1">
                             {new Date(res.createdAt).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                          </div>
                        </td>
                        
                        <td className="p-5">
                          <div className="font-bold text-slate-800 text-base">{res.name}</div>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="flex items-center text-xs text-slate-500">
                              <Mail className="w-3 h-3 mr-1.5 text-blue-400" /> {res.email}
                            </span>
                            <span className="flex items-center text-xs text-slate-500">
                              <Phone className="w-3 h-3 mr-1.5 text-green-400" /> {res.phone}
                            </span>
                          </div>
                        </td>

                        <td className="p-5 text-center">
                          <span className="text-2xl font-black text-slate-800">{res.score}</span>
                          <span className="text-xs text-slate-400 font-semibold block uppercase">Benar</span>
                        </td>

                        <td className="p-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            passed 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {passed ? 'LULUS' : 'GAGAL'}
                          </span>
                        </td>

                        <td className="p-5 text-right">
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Data Permanen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400 italic bg-slate-50/50">
                      Belum ada data ujian yang masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}