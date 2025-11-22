import React, { useState } from 'react';
import { ImageEditor } from './components/ImageEditor';
import { ResumeBuilder } from './components/ResumeBuilder';
import { FileText, Image as ImageIcon, Banana } from 'lucide-react';

type ActiveTab = 'resume' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('resume');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="bg-blue-100 p-2 rounded-full">
            <Banana size={20} className="text-blue-600" /> 
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Make Your <span className="text-blue-600">Perfect Resume</span></h1>
        </div>
        
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'resume' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText size={16} />
            <span className="hidden sm:inline">Resume Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'image' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ImageIcon size={16} />
            <span className="hidden sm:inline">Image Studio</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden print:overflow-visible print:h-auto">
        {activeTab === 'resume' ? <ResumeBuilder /> : <ImageEditor />}
      </main>
    </div>
  );
};

export default App;