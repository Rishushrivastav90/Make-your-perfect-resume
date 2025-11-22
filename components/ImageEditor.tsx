import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/gemini';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null); // Reset generated image on new upload
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;

    setLoading(true);
    setError(null);
    try {
      const result = await editImageWithGemini(originalImage, prompt);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6 gap-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800">AI Image Studio</h2>
        <p className="text-slate-500">Edit your images with natural language prompts using Gemini 2.5 Flash.</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
           <input
            type="text"
            placeholder="Describe your edit (e.g., 'Make it a van gogh painting', 'Add fireworks in sky')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <button
            onClick={handleGenerate}
            disabled={!originalImage || !prompt || loading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition shadow-md
              ${!originalImage || !prompt || loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            Generate
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
          Error: {error}
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
        {/* Original */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
             <ImageIcon size={16} /> Original
          </h3>
          <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
             {originalImage ? (
               <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
             ) : (
               <div className="text-center text-slate-400">
                 <Upload size={48} className="mx-auto mb-2 opacity-50" />
                 <p>Upload an image to start</p>
               </div>
             )}
          </div>
        </div>

        {/* Generated */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Wand2 size={16} /> Result
            </h3>
            {generatedImage && (
               <a 
                 href={generatedImage} 
                 download="gemini-edit.png"
                 className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
               >
                 <Download size={14} /> Save
               </a>
            )}
          </div>
          
          <div className="flex-1 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
            {loading ? (
               <div className="text-center">
                 <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                 <p className="text-slate-500 animate-pulse">Gemini is reimagining your image...</p>
               </div>
            ) : generatedImage ? (
               <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain" />
            ) : (
               <div className="text-center text-slate-400">
                 <Wand2 size={48} className="mx-auto mb-2 opacity-50" />
                 <p>Edited image will appear here</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
