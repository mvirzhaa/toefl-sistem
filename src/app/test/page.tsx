"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Clock, Volume2, ChevronRight, ChevronLeft, 
  CheckCircle, LayoutGrid, Flag, Download, Home, GraduationCap 
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// --- 1. TABEL KONVERSI TOEFL ITP (STANDAR ETS) ---
// Format: [Raw Score]: Scaled Score
const LISTENING_CONVERSION: Record<number, number> = {
  50:68, 49:67, 48:66, 47:65, 46:63, 45:62, 44:61, 43:60, 42:59, 41:58, 40:57,
  39:57, 38:56, 37:55, 36:54, 35:54, 34:53, 33:52, 32:52, 31:51, 30:51,
  29:50, 28:49, 27:49, 26:48, 25:48, 24:47, 23:47, 22:46, 21:45, 20:45,
  19:44, 18:43, 17:42, 16:41, 15:41, 14:39, 13:38, 12:37, 11:35, 10:33,
  9:32, 8:32, 7:31, 6:30, 5:29, 4:28, 3:27, 2:26, 1:25, 0:24
};

const STRUCTURE_CONVERSION: Record<number, number> = {
  40:68, 39:67, 38:65, 37:63, 36:61, 35:60, 34:58, 33:57, 32:56, 31:55,
  30:54, 29:53, 28:52, 27:51, 26:50, 25:49, 24:48, 23:47, 22:46, 21:45,
  20:44, 19:43, 18:42, 17:41, 16:40, 15:40, 14:38, 13:37, 12:36, 11:35,
  10:33, 9:31, 8:29, 7:27, 6:26, 5:25, 4:23, 3:22, 2:21, 1:20, 0:20
};

const READING_CONVERSION: Record<number, number> = {
  50:67, 49:66, 48:65, 47:64, 46:63, 45:61, 44:60, 43:59, 42:58, 41:57, 40:56,
  39:55, 38:54, 37:53, 36:52, 35:52, 34:51, 33:50, 32:49, 31:48, 30:48,
  29:47, 28:46, 27:46, 26:45, 25:44, 24:43, 23:43, 22:42, 21:41, 20:40,
  19:39, 18:38, 17:37, 16:36, 15:35, 14:34, 13:32, 12:31, 11:30, 10:29,
  9:28, 8:28, 7:27, 6:26, 5:25, 4:24, 3:23, 2:23, 1:22, 0:21
};

type Question = {
  id: string;
  questionType?: string;
  imageUrl?: string;
  category: string;
  questionText: string;
  audioUrl?: string;
  options: string[];
  correctAnswer: string;
};

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [flags, setFlags] = useState<Record<string, boolean>>({}); 
  
  // Waktu default 0, nanti diisi dari database settings
  const [timeLeft, setTimeLeft] = useState(0); 
  
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  // STATE HASIL SCORE (Diganti logicnya)
  const [finalScore, setFinalScore] = useState(0);
  const [sectionScores, setSectionScores] = useState({ listening: 0, structure: 0, reading: 0 }); // Nilai Konversi
  const [rawScores, setRawScores] = useState({ listening: 0, structure: 0, reading: 0 }); // Jumlah Benar
  
  const [showSidebar, setShowSidebar] = useState(true); 
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
  const certificateRef = useRef<HTMLDivElement>(null); 

  // 1. Fetch Data Soal & SETTING DURASI
  useEffect(() => {
    async function initTest() {
      try {
        // Ambil Soal
        const resQ = await fetch('/api/test');
        const dataQ: Question[] = await resQ.json();
        
        // Ambil Durasi dari Settings
        const resS = await fetch('/api/settings');
        const dataS = await resS.json();
        
        // Set Waktu (Menit -> Detik)
        const durationInSeconds = (dataS.duration || 120) * 60;
        setTimeLeft(durationInSeconds);

        // Shuffle Soal
        const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
        const listening = shuffle(dataQ.filter(q => q.category === 'LISTENING'));
        const structure = shuffle(dataQ.filter(q => q.category === 'STRUCTURE'));
        const reading = shuffle(dataQ.filter(q => q.category === 'READING'));
        
        setQuestions([...listening, ...structure, ...reading]);
        setLoading(false);
      } catch (err) { 
        console.error("Error init", err);
        setTimeLeft(7200); 
        setLoading(false);
      }
    }
    initTest();
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    if (loading || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (val: string) => {
    if (!questions[currentIdx]) return;
    setAnswers({ ...answers, [questions[currentIdx].id]: val });
  };

  // --- LOGIKA HITUNG SKOR BARU (TOEFL STANDARD) ---
  const calculateSectionScore = (category: string, conversionTable: Record<number, number>, maxQuestions: number) => {
    // 1. Ambil soal berdasarkan kategori (hanya Pilihan Ganda)
    const sectionQuestions = questions.filter(q => q.category === category && q.questionType !== 'ESSAY');
    const totalQ = sectionQuestions.length;
    
    // 2. Hitung jawaban benar (Raw Score)
    const correctCount = sectionQuestions.filter(q => answers[q.id] === q.correctAnswer).length;

    // 3. PROYEKSI (Jika soal < standar TOEFL, kita proyeksikan)
    // Contoh: Soal cuma 10, Benar 8. Maka proyeksi ke 50 soal = (8/10)*50 = 40.
    let projectedRaw = correctCount;
    if (totalQ > 0 && totalQ < maxQuestions) {
        projectedRaw = Math.round((correctCount / totalQ) * maxQuestions);
    }
    
    // 4. Konversi menggunakan tabel
    // Pastikan tidak melebihi max key di tabel
    const lookupKey = projectedRaw > maxQuestions ? maxQuestions : projectedRaw;
    // Fallback ke nilai 0 jika key tidak ditemukan
    const convertedScore = conversionTable[lookupKey] || conversionTable[0] || 20;

    return { raw: correctCount, total: totalQ, converted: convertedScore };
  };

  const finishTest = async () => {
    // Hitung per sesi menggunakan helper function di atas
    // Listening Max 50, Structure Max 40, Reading Max 50
    const listening = calculateSectionScore('LISTENING', LISTENING_CONVERSION, 50);
    const structure = calculateSectionScore('STRUCTURE', STRUCTURE_CONVERSION, 40);
    const reading = calculateSectionScore('READING', READING_CONVERSION, 50);

    // Rumus TOEFL ITP: (L + S + R) * 10 / 3
    const totalScore = Math.floor(((listening.converted + structure.converted + reading.converted) * 10) / 3);

    // Update State
    setRawScores({ listening: listening.raw, structure: structure.raw, reading: reading.raw });
    setSectionScores({ listening: listening.converted, structure: structure.converted, reading: reading.converted });
    setFinalScore(totalScore);
    setIsFinished(true);

    const userString = localStorage.getItem("cbt_user");
    const uData = userString ? JSON.parse(userString) : { name: "Anonim", email: "", phone: "-" };
    setUserData(uData);

    try {
      await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answers, userData: uData })
      });

      if (uData.email) {
        await fetch('/api/test/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: uData.name,
            email: uData.email,
            score: totalScore,
            details: { listening: listening.raw, structure: structure.raw, reading: reading.raw }
          })
        });
      }
    } catch (err) { console.error(err); }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (certificateRef.current.offsetHeight * pdfWidth) / certificateRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sertifikat_TOEFL_${userData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { alert("Gagal membuat PDF."); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Ruang Ujian...</p>
      <p className="text-xs text-slate-400 mt-2">Memuat konfigurasi & soal...</p>
    </div>
  );

  // --- TAMPILAN HASIL (SERTIFIKAT LENGKAP) ---
  if (isFinished) {
     return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center justify-center font-sans">
             <div ref={certificateRef} style={{ backgroundColor: '#ffffff' }} className="p-10 w-full max-w-3xl shadow-2xl rounded-xl border-4 border-double border-slate-200 relative overflow-hidden text-slate-900">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <GraduationCap className="w-96 h-96 text-slate-900" />
                </div>
                <div className="text-center border-b-2 border-slate-800 pb-6 mb-8 relative z-10">
                    <div className="flex justify-center mb-4"><GraduationCap className="w-16 h-16 text-blue-900" /></div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-wide uppercase">Statement of Result</h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium tracking-widest">TOEFL PREDICTION TEST - COMPUTER BASED</p>
                    <p className="text-blue-900 font-bold mt-1">UNIVERSITAS IBN KHALDUN BOGOR</p>
                </div>
                <div className="relative z-10">
                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div>
                            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Name of Candidate</p>
                            <p className="text-xl font-bold text-slate-900 capitalize">{userData.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 uppercase text-xs font-bold mb-1">Date of Test</p>
                            <p className="text-xl font-bold text-slate-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                    
                    {/* TABEL NILAI DETAIL */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                                    <th className="pb-3 font-bold">Section</th>
                                    <th className="pb-3 font-bold text-right">Raw Score (Benar)</th>
                                    <th className="pb-3 font-bold text-right">Converted Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-800">
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-medium">Listening Comprehension</td>
                                    {/* Menggunakan sectionScores dari hasil hitungan baru */}
                                    <td className="py-3 text-right font-mono">{rawScores.listening}</td>
                                    <td className="py-3 text-right font-bold text-blue-900">{sectionScores.listening}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-3 font-medium">Structure & Written Exp.</td>
                                    <td className="py-3 text-right font-mono">{rawScores.structure}</td>
                                    <td className="py-3 text-right font-bold text-blue-900">{sectionScores.structure}</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">Reading Comprehension</td>
                                    <td className="py-3 text-right font-mono">{rawScores.reading}</td>
                                    <td className="py-3 text-right font-bold text-blue-900">{sectionScores.reading}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL SCORE */}
                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                        <div>
                            <p className="text-slate-300 text-sm font-medium uppercase tracking-wider">Total Prediction Score</p>
                            <p className="text-[10px] text-slate-400">*Calculated using standard ITP conversion</p>
                        </div>
                        <div className="text-5xl font-black tracking-tighter">
                            {finalScore > 677 ? 677 : finalScore}
                        </div>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-end">
                       <div className="text-xs text-slate-400">
                          ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}<br/>
                          Verified by System
                       </div>
                       <div className="text-center">
                          <div className="h-10 w-32 border-b border-slate-800 mb-2"></div>
                          <p className="text-xs font-bold text-slate-700 uppercase">Head of Language Center</p>
                       </div>
                    </div>
                </div>
             </div>
             <div className="mt-8 flex gap-4 w-full max-w-3xl">
                <button onClick={downloadPDF} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-lg transition-all">
                    <Download className="w-5 h-5" /> Download Sertifikat PDF
                </button>
                <button onClick={() => window.location.href = "/"} className="flex-1 bg-white border border-slate-300 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    <Home className="w-5 h-5" /> Kembali ke Home
                </button>
             </div>
        </div>
     );
  }

  // --- TAMPILAN SOAL UJIAN (DESAIN TETAP SAMA) ---
  const currentQ = questions[currentIdx];
  if (!currentQ) return <div>Soal tidak ditemukan.</div>;
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden font-sans">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><LayoutGrid className="w-5 h-5" /></div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight hidden sm:block">TOEFL Prediction Test</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">SESSION ID: #USER-2026</p>
          </div>
        </div>
        <div className={`flex items-center gap-3 px-5 py-2 rounded-full font-mono text-xl font-bold shadow-inner border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
          <Clock className="w-5 h-5" />{formatTime(timeLeft)}
        </div>
        <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"><LayoutGrid className="w-6 h-6" /></button>
      </header>
      <div className="h-1 bg-slate-200 w-full"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div></div>
      
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-2">SECTION: {currentQ.category}</span>
                <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Question {currentIdx + 1} of {questions.length}</h2>
              </div>
              <button onClick={() => setFlags({...flags, [currentQ.id]: !flags[currentQ.id]})} className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${flags[currentQ.id] ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400 hover:bg-slate-100'}`}><Flag className="w-4 h-4" />{flags[currentQ.id] ? 'Ditandai' : 'Tandai Ragu'}</button>
            </div>

            {currentQ.audioUrl && (
              <div className="mb-8 p-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-xl">
                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl flex flex-col items-center justify-center text-white border border-white/10">
                  <div className="flex items-center gap-3 mb-4 text-cyan-400"><Volume2 className="w-6 h-6 animate-pulse" /><span className="font-semibold tracking-wide text-sm">LISTENING SECTION</span></div>
                  <audio controls className="w-full max-w-md h-10 accent-blue-500"><source src={currentQ.audioUrl} type="audio/mpeg" /></audio>
                </div>
              </div>
            )}

            {currentQ.imageUrl && (
                <div className="mb-6 flex justify-center">
                    <img src={currentQ.imageUrl} alt="Soal Gambar" className="max-w-full h-auto max-h-[400px] rounded-lg border border-slate-200 shadow-sm object-contain" />
                </div>
            )}

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                <p className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-medium">{currentQ.questionText}</p>
            </div>

            {currentQ.questionType === 'ESSAY' ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-bold text-slate-500 mb-3">Jawaban Esai Anda:</label>
                    <textarea 
                        rows={6}
                        className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-lg leading-relaxed shadow-inner bg-slate-50"
                        placeholder="Ketik jawaban Anda di sini..."
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleSelectAnswer(e.target.value)}
                    />
                </div>
            ) : (
                <div className="grid gap-4">
                  {currentQ.options && currentQ.options.length > 0 ? (
                    currentQ.options.map((opt, idx) => {
                        const label = ['A', 'B', 'C', 'D'][idx];
                        const isSelected = answers[currentQ.id] === label;
                        return (
                        <div key={idx} onClick={() => handleSelectAnswer(label)} className={`group relative cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ${isSelected ? 'bg-blue-50 border-blue-500 shadow-md translate-x-1' : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                            <div className="flex items-start gap-5">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-200 group-hover:text-blue-700'}`}>{label}</div>
                            <span className={`text-lg pt-0.5 ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-600'}`}>{opt}</span>
                            </div>
                            {isSelected && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"><CheckCircle className="w-6 h-6"/></div>}
                        </div>
                        )
                    })
                  ) : (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                        Error: Opsi jawaban tidak ditemukan.
                    </div>
                  )}
                </div>
            )}

          </div>
        </main>
        
        <aside className={`absolute lg:relative top-0 right-0 h-full w-80 bg-white border-l border-slate-200 z-10 transform transition-transform duration-300 ease-in-out flex flex-col ${showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
           <div className="p-6 bg-slate-50 border-b border-slate-100"><h3 className="font-bold text-slate-800 flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-500" /> Navigasi Soal</h3></div>
           <div className="flex-1 overflow-y-auto p-6"><div className="grid grid-cols-5 gap-3">{questions.map((q, idx) => { const isAnswered = !!answers[q.id]; const isCurrent = idx === currentIdx; const isFlagged = flags[q.id]; return (<button key={q.id} onClick={() => setCurrentIdx(idx)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-all relative ${isCurrent ? 'bg-slate-800 text-white ring-2 ring-blue-400 ring-offset-2 scale-110 z-10' : ''} ${!isCurrent && isAnswered ? 'bg-blue-100 text-blue-700 border border-blue-200' : ''} ${!isCurrent && !isAnswered ? 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300' : ''}`}>{idx + 1}{isFlagged && <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></span>}</button>) })}</div></div>
           <div className="p-6 border-t border-slate-100 bg-slate-50"><button onClick={finishTest} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all">Selesai & Kumpulkan</button></div>
        </aside>
      </div>

      <div className="bg-white border-t border-slate-200 p-4 lg:hidden flex justify-between z-20">
         <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-medium disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
         <span className="font-bold text-slate-700 pt-2">{currentIdx + 1} / {questions.length}</span>
         <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(prev => prev + 1)} className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
      </div>
    </div>
  );
}