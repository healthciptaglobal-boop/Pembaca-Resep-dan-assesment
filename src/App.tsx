import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera as CameraIcon, 
  Stethoscope, 
  ChevronLeft, 
  Send, 
  Plus, 
  Trash2, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Camera } from './components/Camera';
import { analyzePrescription, analyzeManualPrescription, assessPatientComplaint } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'home' | 'scan' | 'manual' | 'result' | 'assessment';

interface PrescriptionItem {
  drug: string;
  dose: string;
  time: string;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [complaint, setComplaint] = useState('');
  const [manualItems, setManualItems] = useState<PrescriptionItem[]>(
    Array(8).fill({ drug: '', dose: '', time: '' })
  );

  const handleScan = async (imageB64: string) => {
    setLoading(true);
    setView('result');
    try {
      const res = await analyzePrescription(imageB64);
      setResult(res || "Gagal menganalisis resep.");
    } catch (err) {
      setResult("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const validItems = manualItems.filter(item => item.drug.trim() !== '');
    if (validItems.length === 0) {
      alert("Harap isi setidaknya satu baris obat.");
      return;
    }
    setLoading(true);
    setView('result');
    try {
      const res = await analyzeManualPrescription(validItems);
      setResult(res || "Gagal menganalisis resep.");
    } catch (err) {
      setResult("Terjadi kesalahan saat memproses data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async () => {
    if (!complaint.trim()) return;
    setLoading(true);
    try {
      const res = await assessPatientComplaint(complaint);
      setResult(res || "Gagal melakukan asesmen.");
      setView('result');
    } catch (err) {
      alert("Terjadi kesalahan saat melakukan asesmen.");
    } finally {
      setLoading(false);
    }
  };

  const updateManualItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...manualItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setManualItems(newItems);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col items-center">
      {/* Mobile Container */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-8 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
          {view !== 'home' && (
            <button 
              onClick={() => {
                setView('home');
                setResult(null);
                setComplaint('');
              }}
              className="p-2 -ml-2 hover:bg-stone-50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold tracking-tight text-center flex-1">
            {view === 'home' ? 'Resep & Assessment' : 
             view === 'scan' ? 'Scan Resep' :
             view === 'manual' ? 'Input Manual' :
             view === 'assessment' ? 'Asesmen Pasien' : 'Hasil Analisis'}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <h2 className="text-emerald-900 font-medium mb-2">Selamat Datang, Apoteker</h2>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    Gunakan aplikasi ini untuk membantu pembacaan resep dan asesmen keluhan pasien secara cepat.
                  </p>
                </div>

                <div className="grid gap-4">
                  <button 
                    onClick={() => setView('scan')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-stone-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                      <CameraIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-stone-800">Scan Resep</span>
                    <span className="text-xs text-stone-400 mt-1">Gunakan kamera ponsel</span>
                  </button>

                  <button 
                    onClick={() => setView('assessment')}
                    className="flex flex-col items-center justify-center p-8 bg-white border-2 border-stone-100 rounded-3xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <Stethoscope className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="font-semibold text-stone-800">Keluhan Pasien</span>
                    <span className="text-xs text-stone-400 mt-1">Asesmen swamedikasi</span>
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'scan' && (
              <Camera 
                onCapture={handleScan}
                onCancel={() => setView('home')}
              />
            )}

            {view === 'manual' && (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 pb-20"
              >
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-xs font-medium">Tulisan tidak jelas? Silakan input manual di bawah ini.</p>
                </div>

                <div className="space-y-4">
                  {manualItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-stone-50 rounded-2xl space-y-3 border border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Obat #{idx + 1}</span>
                      </div>
                      <input 
                        placeholder="Nama Obat"
                        value={item.drug}
                        onChange={(e) => updateManualItem(idx, 'drug', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          placeholder="Dosis (misal: 500mg)"
                          value={item.dose}
                          onChange={(e) => updateManualItem(idx, 'dose', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input 
                          placeholder="Waktu (misal: 3x1)"
                          value={item.time}
                          onChange={(e) => updateManualItem(idx, 'time', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 max-w-md mx-auto">
                  <button 
                    onClick={handleManualSubmit}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    Lanjut Analisis <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'assessment' && (
              <motion.div 
                key="assessment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-600 ml-1">Apa keluhan pasien?</label>
                  <textarea 
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Contoh: Pasien batuk berdahak sudah 3 hari, ada demam sedikit..."
                    className="w-full h-40 bg-stone-50 border border-stone-200 rounded-3xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleAssessmentSubmit}
                  disabled={!complaint.trim() || loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Mulai Asesmen <Send className="w-4 h-4" /></>}
                </button>

                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <h3 className="text-blue-900 font-medium text-sm mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Tips Asesmen
                  </h3>
                  <ul className="text-blue-700 text-xs space-y-2 list-disc ml-4">
                    <li>Tanyakan durasi gejala</li>
                    <li>Tanyakan riwayat alergi</li>
                    <li>Pastikan pasien bukan ibu hamil/menyusui</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {view === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 pb-20"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="text-stone-500 font-medium animate-pulse">Menganalisis data...</p>
                  </div>
                ) : (
                  <div className="prose prose-stone max-w-none">
                    <div className="markdown-body p-2">
                      <Markdown>{result || ""}</Markdown>
                    </div>
                  </div>
                )}

                {!loading && (
                  <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 max-w-md mx-auto flex gap-3">
                    {/* If AI thinks it's unclear, it might suggest manual input */}
                    <button 
                      onClick={() => setView('manual')}
                      className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-amber-200"
                    >
                      Input Manual
                    </button>
                    <button 
                      onClick={() => setView('home')}
                      className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-stone-200"
                    >
                      Selesai
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Nav Hint */}
        {view === 'home' && (
          <footer className="px-6 py-4 border-t border-stone-50 bg-stone-50/50">
            <p className="text-[10px] text-center text-stone-400 uppercase tracking-widest font-bold">
              POWERED BY UNMAS . BPOM . FDA
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
