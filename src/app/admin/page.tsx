"use client";

import { useState, useRef } from 'react';
import { Save, Headphones, BookOpen, FileText, FileSpreadsheet, Info } from 'lucide-react';
import Papa from 'papaparse';

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

  // --- 1. LOGIKA IMPORT CSV (BARU) ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];

        // Validasi Header CSV
        if (!rows[0] || !rows[0].questionText || !rows[0].correctAnswer) {
          alert("Format CSV salah! Pastikan header kolom: category, questionText, optionA, optionB, optionC, optionD, correctAnswer");
          setLoading(false);
          return;
        }

        let successCount = 0;
        let failCount = 0;

        // Loop upload data
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
      },
      error: (err) => {
        alert("Gagal membaca file CSV: " + err.message);
        setLoading(false);
      }
    });
  };

  // --- 2. LOGIKA INPUT MANUAL (LAMA - TETAP SAMA) ---
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
      } else {
        alert('❌ Gagal menyimpan soal.');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* HEADER HALAMAN (Update: Ada Tombol Import di Kanan) */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">TOEFL Question Bank</h2>
          <p className="text-slate-500 mt-2">Panel Admin untuk input soal Listening, Structure, dan Reading.</p>
        </div>

        {/* TOMBOL IMPORT CSV (BARU) */}
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

      {/* INFO BOX (Panduan CSV) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Panduan Import Massal:</p>
          <p>Siapkan file CSV dengan header kolom (huruf kecil semua):</p>
          <code className="bg-white px-2 py-1 rounded border border-blue-200 text-xs font-mono mt-1 block w-fit text-slate-700">
            category, questionText, optionA, optionB, optionC, optionD, correctAnswer, audioUrl
          </code>
        </div>
      </div>

      {/* --- FORM CARD PREMIUM (DESAIN ANDA YG DIPERTAHANKAN) --- */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* HEADER KARTU (Gaya Executive Dark Mode - TETAP SAMA) */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <FileText className="text-blue-400 w-5 h-5" />
              <span className="text-white font-semibold tracking-wide">Input Soal Manual</span>
           </div>
           {/* Hiasan Titik Ala Mac */}
           <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-slate-50/30">
          
          {/* Baris 1: Kategori & Audio */}
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

          {/* Area Soal */}
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

          {/* Pilihan Jawaban */}
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

          {/* Kunci Jawaban & Submit */}
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
    </div>
  );
}