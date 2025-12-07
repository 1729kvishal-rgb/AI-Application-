import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { AnalysisView } from './components/AnalysisView';
import { analyzeHomeImages } from './services/geminiService';
import { AppState, UploadedImage, SecurityPlan } from './types';
import { Upload, Image as ImageIcon, X, Loader2, Camera } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [plan, setPlan] = useState<SecurityPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      Array.from(event.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              file,
              previewUrl: URL.createObjectURL(file),
              base64: e.target?.result as string
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const startAnalysis = async () => {
    if (images.length === 0) return;

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const base64List = images.map(img => img.base64);
      const result = await analyzeHomeImages(base64List);
      setPlan(result);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      setError(err.message || "Failed to analyze images. Please check your API key and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setImages([]);
    setPlan(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-7xl">
        
        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 flex items-center justify-between">
            <p>{error}</p>
            <button onClick={() => setAppState(AppState.IDLE)} className="text-sm underline hover:text-white">Try Again</button>
          </div>
        )}

        {/* Idle / Upload State */}
        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto text-center space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Design Your Ultimate <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Home Security Ecosystem
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload photos of your home's exterior, entryways, or specific rooms. 
                Our AI will identify vulnerabilities and generate a professional security plan with cost estimates.
              </p>
            </div>

            <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-colors group relative overflow-hidden">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">Click to upload or drag and drop</p>
                  <p className="text-slate-500 text-sm mt-1">Supports JPG, PNG (Max 5 images recommended)</p>
                </div>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
                      <img src={img.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* Add More Button (Visual only as input covers drag area, but good for UX hints) */}
                  <div className="aspect-square rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-6 h-6 mb-2" />
                    <span className="text-xs font-medium">Add More</span>
                  </div>
                </div>

                <button 
                  onClick={startAnalysis}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-semibold shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all"
                >
                  Analyze & Generate Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analyzing State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
              <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Analyzing Architecture...</h3>
              <p className="text-slate-400">Identifying entry points, assessing lighting, and calculating BOM.</p>
            </div>
          </div>
        )}

        {/* Results State */}
        {appState === AppState.RESULTS && plan && (
          <AnalysisView plan={plan} onReset={handleReset} />
        )}

      </main>
    </div>
  );
};

export default App;