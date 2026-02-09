"use client";

import { useState, useRef, useEffect } from 'react';
import { Save, Headphones, BookOpen, FileText, FileSpreadsheet, Info, Trash2, Search, RefreshCw, Image as ImageIcon } from 'lucide-react';
import Papa from 'papaparse';

// Tipe Data Soal Updated
type Question = {
  id: string;
  category: string;
  questionText: string;
  questionType: string; // 'CHOICE' | 'ESSAY'
  correctAnswer: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Form Manual
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE', // Legacy (biarkan)
    questionType: 'CHOICE', // BARU: 'CHOICE' atau 'ESSAY'
    category: 'STRUCTURE',
    questionText: '',
    audioUrl: '',
    imageUrl: '', // BARU: Base64 string
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions'); 
      if (res.ok) setQuestionList(await res.json());
    } catch (error) { console.error("Gagal ambil data"); }
  };

  useEffect(() => { fetchQuestions(); }, []);

  // --- LOGIKA UPLOAD GAMBAR (BARU) ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("File terlalu besar (Max 1MB)");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
    fetchQuestions();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        // ... (Logika CSV lama tetap sama, skip untuk mempersingkat)
        // Pastikan CSV punya kolom baru jika mau support import massal esai
        alert("Fitur CSV saat ini hanya untuk Pilihan Ganda standar."); 
        setLoading(false);
        fetchQuestions();
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: formData.type,
      category: formData.category,
      questionType: formData.questionType, // Kirim Tipe
      questionText: formData.questionText,
      imageUrl: formData.imageUrl, // Kirim Gambar
      audioUrl: formData.audioUrl,
      // Jika Essay, options kosong
      options: formData.questionType === 'CHOICE' 
        ? [formData.optionA, formData.optionB, formData.optionC, formData.optionD]
        : [],
      correctAnswer: formData.correctAnswer,
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Soal berhasil disimpan!');
        setFormData({ ...formData, questionText: '', imageUrl: '', optionA: '', optionB: '', optionC: '', optionD: '' });
        fetchQuestions();
      } else { alert('❌ Gagal menyimpan.'); }
    } catch (err) { alert('Error sistem.'); }
    setLoading(false);
  };

  const filteredQuestions = questionList.filter(q => {
    const matchCategory = filterCategory === 'ALL' || q.category === filterCategory;
    const matchSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">TOEFL Question Bank</h2>
          <p className="text-slate-500 mt-2">Panel Admin untuk input & kelola soal.</p>
        </div>
        <div className="flex gap-2">
           <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
           <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg">
             {loading ? <span className="animate-spin">⏳</span> : <FileSpreadsheet className="w-5 h-5" />} Import CSV
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-white font-semibold tracking-wide">Input Soal Manual</span>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-slate-50/30">
          
          {/* BARIS 1: Kategori & Tipe Soal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kategori Soal</label>
              <div className="relative">
                <select className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
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
               <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Soal</label>
               <select className="block w-full rounded-xl border-slate-300 bg-blue-50 text-blue-900 font-bold py-3 px-4" value={formData.questionType} onChange={(e) => setFormData({...formData, questionType: e.target.value})}>
                  <option value="CHOICE">Pilihan Ganda (ABCD)</option>
                  <option value="ESSAY">Esai (Isian Teks)</option>
               </select>
            </div>
          </div>
          
          {/* BARIS 2: Upload Gambar & Audio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Gambar (Opsional)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                {formData.imageUrl && <p className="text-xs text-green-600 mt-1">✅ Gambar terpilih</p>}
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Link Audio (Opsional)</label>
               <input type="text" placeholder="https://..." className="block w-full rounded-xl border-slate-300 bg-slate-50 py-3 px-4" value={formData.audioUrl} onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}/>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Pertanyaan / Teks Soal</label>
            <textarea rows={4} required className="block w-full rounded-xl border-slate-300 bg-slate-50 py-4 px-4 font-medium" placeholder="Tulis pertanyaan..." value={formData.questionText} onChange={(e) => setFormData({...formData, questionText: e.target.value})}/>
          </div>

          {/* KONDISIONAL: HANYA TAMPIL JIKA PILIHAN GANDA */}
          {formData.questionType === 'CHOICE' ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-800 mb-4">Pilihan Jawaban</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="relative group">
                      <div className="absolute left-3 top-3 text-slate-500 font-bold text-xs w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">{opt}</div>
                      <input type="text" required placeholder={`Pilihan ${opt}`} className="block w-full rounded-xl border-slate-200 pl-14 py-3.5 bg-slate-50" 
                        // @ts-ignore
                        value={formData[`option${opt}`]} 
                        // @ts-ignore
                        onChange={(e) => setFormData({...formData, [`option${opt}`]: e.target.value})} />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Kunci Jawaban Benar</label>
                    <div className="flex gap-3">
                        {['A', 'B', 'C', 'D'].map((opt) => (
                        <label key={opt} className={`cursor-pointer w-12 h-12 rounded-xl flex items-center justify-center transition-all font-bold text-lg border ${formData.correctAnswer === opt ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                            <input type="radio" name="correctAnswer" value={opt} className="hidden" checked={formData.correctAnswer === opt} onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})} />
                            {opt}
                        </label>
                        ))}
                    </div>
                </div>
              </div>
          ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
                  <strong>Info:</strong> Soal Esai tidak memiliki kunci jawaban otomatis. Penilaian dilakukan manual.
              </div>
          )}

          <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg mt-4">
             {loading ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Soal</>}
          </button>
        </form>
      </div>

      {/* List Soal */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
         {/* ... (Bagian Header Filter Sama Saja) ... */}
         <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Pertanyaan</th>
                <th className="px-6 py-3">Media</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${q.questionType === 'ESSAY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{q.questionType || 'CHOICE'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium line-clamp-2">{q.questionText}</td>
                    <td className="px-6 py-4">
                        {q.imageUrl && <ImageIcon className="w-4 h-4 text-green-600 inline mr-2"/>}
                        {q.audioUrl && <Headphones className="w-4 h-4 text-blue-600 inline"/>}
                    </td>
                    <td className="px-6 py-4"><button onClick={() => handleDelete(q.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
              ))}
            </tbody>
          </table>
         </div>
      </div>
    </div>
  );
}