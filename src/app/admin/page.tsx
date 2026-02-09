"use client";

import { useState, useRef, useEffect } from 'react';
import { Save, Headphones, BookOpen, FileText, FileSpreadsheet, Info, Trash2, Search, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';

// Tipe Data Soal
type Question = {
  id: string;
  category: string;
  questionText: string;
  correctAnswer: string;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Form Manual
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE',
    category: 'STRUCTURE',
    questionText: '',
    audioUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  // State Daftar Soal (BARU)
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // --- 1. FETCH DATA SOAL (BARU) ---
  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions'); // Pastikan API GET tersedia
      if (res.ok) {
        const data = await res.json();
        setQuestionList(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data soal");
    }
  };

  // Ambil data saat halaman dibuka
  useEffect(() => {
    fetchQuestions();
  }, []);

  // --- 2. HAPUS SOAL (BARU) ---
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus soal ini?")) return;
    
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert("Soal dihapus!");
        fetchQuestions(); // Refresh tabel
      } else {
        alert("Gagal menghapus.");
      }
    } catch (err) {
      alert("Error sistem.");
    }
  };

  // --- 3. LOGIKA IMPORT CSV ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];

        if (!rows[0] || !rows[0].questionText || !rows[0].correctAnswer) {
          alert("Format CSV salah! Pastikan header kolom: category, questionText, optionA, optionB, optionC, optionD, correctAnswer");
          setLoading(false);
          return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const row of rows) {
          const payload = {
            type: 'MULTIPLE_CHOICE',
            category: row.category?.toUpperCase() || 'STRUCTURE',
            questionText: row.questionText,
            audioUrl: row.audioUrl || '',
            options: [row.optionA, row.optionB, row.optionC, row.optionD],
            correctAnswer: row.correctAnswer.toUpperCase(),
          };

          try {
            const res = await fetch('/api/questions', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            if (res.ok) successCount++;
            else failCount++;
          } catch (err) {
            failCount++;
          }
        }

        alert(`Proses Selesai!\n✅ Berhasil: ${successCount}\n❌ Gagal: ${failCount}`);
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        fetchQuestions(); // Refresh tabel setelah import
      },
      error: (err) => {
        alert("Gagal membaca file CSV: " + err.message);
        setLoading(false);
      }
    });
  };

  // --- 4. INPUT MANUAL ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: formData.type,
      category: formData.category,
      questionText: formData.questionText,
      audioUrl: formData.audioUrl,
      options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
      correctAnswer: formData.correctAnswer,
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Soal berhasil disimpan!');
        setFormData({ ...formData, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '' });
        fetchQuestions(); // Refresh tabel
      } else {
        alert('❌ Gagal menyimpan soal.');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem.');
    }
    setLoading(false);
  };

  // Filter Logika untuk Tabel
  const filteredQuestions = questionList.filter(q => {
    const matchCategory = filterCategory === 'ALL' || q.category === filterCategory;
    const matchSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER HALAMAN */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">TOEFL Question Bank</h2>
          <p className="text-slate-500 mt-2">Panel Admin untuk input & kelola soal.</p>
        </div>

        {/* TOMBOL IMPORT CSV */}
        <div className="flex gap-2">
           <input 
             type="file" 
             accept=".csv" 
             ref={fileInputRef}
             className="hidden" 
             onChange={handleFileUpload}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={loading}
             className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 hover:-translate-y-1 transition shadow-lg disabled:opacity-50"
           >
             {loading ? <span className="animate-spin">⏳</span> : <FileSpreadsheet className="w-5 h-5" />}
             Import CSV
           </button>
        </div>
      </div>

      {/* INFO BOX */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Panduan Import Massal:</p>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-xs font-mono mt-1 block w-fit text-slate-700">
            category, questionText, optionA, optionB, optionC, optionD, correctAnswer, audioUrl
          </code>
        </div>
      </div>

      {/* --- FORM CARD PREMIUM (TIDAK BERUBAH) --- */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-white font-semibold tracking-wide">Input Soal Manual</span>
           </div>
           <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Soal</label>
              <div className="relative">
                <select 
                  className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-slate-900 focus:ring-slate-900 transition-all font-medium"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="LISTENING">Listening Comprehension</option>
                  <option value="STRUCTURE">Structure & Written Expression</option>
                  <option value="READING">Reading Comprehension</option>
                </select>
                <div className="absolute right-4 top-3.5 text-slate-400 pointer-events-none">
                  {formData.category === 'LISTENING' ? <Headphones className="w-5 h-5"/> : <BookOpen className="w-5 h-5"/>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Link Audio <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input 
                type="text" 
                placeholder="https://contoh.com/audio.mp3"
                className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4 text-slate-900 focus:border-slate-900 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                value={formData.audioUrl}
                onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pertanyaan / Teks Soal</label>
            <textarea 
              rows={4}
              required
              className="block w-full rounded-xl border-slate-300 bg-slate-50 py-4 px-4 text-slate-900 focus:border-slate-900 focus:ring-slate-900 transition-all resize-y placeholder:text-slate-400 font-medium leading-relaxed"
              placeholder="Tulis pertanyaan di sini..."
              value={formData.questionText}
              onChange={(e) => setFormData({...formData, questionText: e.target.value})}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-bold text-slate-800 mb-4">Pilihan Jawaban</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className="relative group">
                  <div className="absolute left-3 top-3 text-slate-500 font-bold text-xs w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200 group-focus-within:bg-slate-900 group-focus-within:text-white transition-colors">
                    {opt}
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder={`Pilihan ${opt}`}
                    className="block w-full rounded-xl border-slate-200 pl-14 py-3.5 text-slate-900 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-300"
                    // @ts-ignore
                    value={formData[`option${opt}`]}
                    // @ts-ignore
                    onChange={(e) => setFormData({...formData, [`option${opt}`]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-bold text-slate-700 mb-3">Kunci Jawaban Benar</label>
              <div className="flex gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <label key={opt} className={`cursor-pointer w-12 h-12 rounded-xl flex items-center justify-center transition-all font-bold text-lg shadow-sm border ${formData.correctAnswer === opt ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="correctAnswer" 
                      value={opt}
                      className="hidden"
                      checked={formData.correctAnswer === opt}
                      onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex justify-center items-center py-4 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 md:mt-0"
            >
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Menyimpan...</span>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Simpan Soal ke Database
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- BAGIAN BARU: LIST SOAL --- */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-500" /> Daftar Soal Database
           </h3>
           
           <div className="flex gap-2 w-full md:w-auto">
             {/* Filter Kategori */}
             <select 
               className="p-2 rounded-lg border border-slate-300 text-sm font-medium bg-white"
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
             >
               <option value="ALL">Semua Kategori</option>
               <option value="LISTENING">Listening</option>
               <option value="STRUCTURE">Structure</option>
               <option value="READING">Reading</option>
             </select>

             {/* Search */}
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Cari soal..." 
                 className="w-full pl-9 p-2 rounded-lg border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             
             <button onClick={fetchQuestions} className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600" title="Refresh">
               <RefreshCw className="w-4 h-4" />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-10">No</th>
                <th className="px-6 py-3 w-32">Kategori</th>
                <th className="px-6 py-3">Pertanyaan</th>
                <th className="px-6 py-3 w-20 text-center">Kunci</th>
                <th className="px-6 py-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        q.category === 'LISTENING' ? 'bg-purple-100 text-purple-700' :
                        q.category === 'STRUCTURE' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium line-clamp-2 max-w-lg">
                      {q.questionText}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 bg-slate-50/50">
                      {q.correctAnswer}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                    Belum ada data soal yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Tabel */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
           <span>Total Soal: <strong>{questionList.length}</strong></span>
           <span>Menampilkan: <strong>{filteredQuestions.length}</strong></span>
        </div>
      </div>

    </div>
  );
}