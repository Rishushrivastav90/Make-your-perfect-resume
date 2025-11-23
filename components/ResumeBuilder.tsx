
import React, { useState, useRef } from 'react';
import { INITIAL_RESUME_DATA, ResumeData, TemplateType, CustomSection } from '../types';
import { ResumeTemplate } from './ResumeTemplate';
import { generateResume, improveText } from '../services/gemini';
import { Download, Sparkles, Loader2, Printer, Trash2, Plus, ChevronDown, ChevronUp, Upload, FileText, X, Eye, EyeOff, Settings2, Wand2 } from 'lucide-react';

export const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [template, setTemplate] = useState<TemplateType>('compact');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI Modal State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFile, setAiFile] = useState<{ name: string, data: string, type: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const aiFileRef = useRef<HTMLInputElement>(null);

  // Improving Text State
  const [improvingField, setImprovingField] = useState<string | null>(null);
  
  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: true,
    projects: false,
    certifications: false,
    languages: false
  });

  // Visibility state for sections (Manage Sections)
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    languages: true
  });

  // For custom sections
  const [newCustomSectionTitle, setNewCustomSectionTitle] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleVisibility = (section: string) => {
    setSectionVisibility(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('resume-preview');
    if (!element || !window.html2pdf) {
      alert("PDF Generator is initializing, please try again in a second.");
      return;
    }
    
    setIsDownloading(true);

    const opt = {
      margin: 0,
      filename: `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    }).catch((err: any) => {
      console.error(err);
      setIsDownloading(false);
      alert("Failed to generate PDF. Please try standard print.");
    });
  };

  const handleDownloadDoc = () => {
    const content = printRef.current;
    if (!content) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${resumeData.fullName} Resume</title>
        <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; background: white; }
            h1 { font-size: 24pt; font-weight: bold; margin-bottom: 5pt; color: #000; }
            h2 { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #666; margin-top: 15pt; margin-bottom: 5pt; padding-bottom: 2pt; color: #2563eb; }
            p { margin: 0 0 4pt 0; }
            ul { margin-top: 0; margin-bottom: 8pt; padding-left: 20pt; }
            li { margin-bottom: 2pt; }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 800px; margin: 0 auto;">
           ${content.innerHTML}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt && !aiFile) return;
    
    setIsAiLoading(true);
    try {
      const newData = await generateResume({
        text: aiPrompt,
        fileData: aiFile?.data,
        mimeType: aiFile?.type
      });
      setResumeData(newData);
      
      // Update custom sections visibility if AI generated any
      if (newData.customSections) {
         const newVisibility = { ...sectionVisibility };
         newData.customSections.forEach(cs => {
           newVisibility[cs.id] = true;
         });
         setSectionVisibility(newVisibility);
      }

      setShowAiModal(false);
      setAiPrompt('');
      setAiFile(null);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to generate resume: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImproveText = async (text: string, fieldKey: string, type: 'summary' | 'experience' | 'project') => {
    if (!text || text.length < 10) return;
    
    setImprovingField(fieldKey);
    try {
      const improved = await improveText(text, type);
      
      // Update state based on field key structure (simple impl)
      if (fieldKey === 'summary') {
        setResumeData(prev => ({ ...prev, summary: improved }));
      } else if (fieldKey.startsWith('exp-')) {
        const [_, idxStr] = fieldKey.split('-');
        const idx = parseInt(idxStr);
        const newExp = [...resumeData.experience];
        newExp[idx].description = improved.split('\n').map(s => s.replace(/^[•-]\s*/, '').trim());
        setResumeData(prev => ({ ...prev, experience: newExp }));
      } else if (fieldKey.startsWith('proj-')) {
        const [_, idxStr] = fieldKey.split('-');
        const idx = parseInt(idxStr);
        const newProj = [...resumeData.projects];
        newProj[idx].description = improved.split('\n').map(s => s.replace(/^[•-]\s*/, '').trim());
        setResumeData(prev => ({ ...prev, projects: newProj }));
      }

    } catch (err) {
      console.error(err);
      alert("Failed to improve text. Please try again.");
    } finally {
      setImprovingField(null);
    }
  };

  const handleAddCustomSection = () => {
    if (!newCustomSectionTitle.trim()) return;
    const id = `custom-${Date.now()}`;
    const newSection: CustomSection = {
      id,
      title: newCustomSectionTitle,
      // Initialize with a placeholder item so it appears in the resume preview immediately
      items: [{ title: 'Title', subtitle: 'Subtitle', date: 'Year', description: ['Description'] }]
    };
    
    setResumeData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection]
    }));
    setSectionVisibility(prev => ({ ...prev, [id]: true }));
    setOpenSections(prev => ({ ...prev, [id]: true }));
    setNewCustomSectionTitle('');
    setShowAddSection(false);
  };

  const handleDeleteCustomSection = (id: string) => {
     setResumeData(prev => ({
        ...prev,
        customSections: prev.customSections?.filter(cs => cs.id !== id)
     }));
  };

  const updateContact = (field: string, value: string) => {
    setResumeData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const SectionHeader = ({ title, sectionKey, onAdd, isCustom, onDelete }: { title: string, sectionKey: string, onAdd?: () => void, isCustom?: boolean, onDelete?: () => void }) => (
    <div className="flex justify-between items-center mb-4 cursor-pointer select-none group" onClick={() => toggleSection(sectionKey)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</h3>
        {openSections[sectionKey] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </div>
      <div className="flex items-center gap-2">
        {/* Visibility Toggle (Standard Sections) */}
        {!isCustom && sectionKey !== 'personal' && (
           <button 
             onClick={(e) => { e.stopPropagation(); toggleVisibility(sectionKey); }}
             className={`p-1 rounded transition ${sectionVisibility[sectionKey] ? 'text-slate-400 hover:text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
             title={sectionVisibility[sectionKey] ? "Hide Section" : "Show Section"}
           >
             {sectionVisibility[sectionKey] ? <Eye size={16} /> : <EyeOff size={16} />}
           </button>
        )}
        
        {/* Delete Custom Section */}
        {isCustom && onDelete && (
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="text-slate-400 hover:text-red-500 p-1 transition"
             title="Delete Section"
           >
             <Trash2 size={16} />
           </button>
        )}

        {onAdd && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded transition"
            title="Add Item"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-100 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      
      {/* --- Left Sidebar: Editor --- */}
      <div className="w-full lg:w-1/2 flex flex-col h-full border-r border-slate-200 bg-white print:hidden z-10 shadow-xl lg:shadow-none">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowAiModal(true)}
               className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:opacity-90 transition text-sm font-medium"
             >
               <Sparkles size={16} /> AI Auto-Fill
             </button>
          </div>
          <div className="flex items-center gap-2">
             <select 
                value={template} 
                onChange={(e) => setTemplate(e.target.value as TemplateType)}
                className="p-2 text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none max-w-[200px]"
             >
               <optgroup label="Popular">
                 <option value="compact">Compact (One Page)</option>
                 <option value="professional">Professional</option>
                 <option value="modern">Modern Visual</option>
                 <option value="classic">Classic ATS</option>
               </optgroup>
               <optgroup label="Styled">
                 <option value="creative">Creative (Purple)</option>
                 <option value="tech">Tech (Dark/Green)</option>
                 <option value="startup">Startup (Orange)</option>
                 <option value="visual">Visual Timeline</option>
                 <option value="metro">Metro Blocks</option>
               </optgroup>
               <optgroup label="Minimal">
                 <option value="swiss">Swiss Bold</option>
                 <option value="minimalist">Minimalist</option>
                 <option value="global">Global Corporate</option>
                 <option value="executive">Executive</option>
                 <option value="academic">Academic / CV</option>
               </optgroup>
               <optgroup label="Themed">
                 <option value="elegant">Elegant Serif</option>
                 <option value="sky">Sky Blue</option>
                 <option value="verde">Verde Green</option>
                 <option value="navy">Navy Blue</option>
                 <option value="artistic">Artistic Soft</option>
                 <option value="infographic">Infographic</option>
               </optgroup>
             </select>
          </div>
        </div>

        {/* Manage Sections Toggle Area (Compact View) */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mr-2 flex-shrink-0">
                <Settings2 size={14} /> Sections:
            </div>
            {Object.keys(sectionVisibility).map(key => (
                <button
                    key={key}
                    onClick={() => toggleVisibility(key)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition flex items-center gap-1 flex-shrink-0
                        ${sectionVisibility[key] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400'}`}
                >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sectionVisibility[key] ? null : <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>}
                </button>
            ))}
        </div>

        {/* Form Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-slate-50/50">
          
          {/* Personal Info */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <SectionHeader title="Personal Details" sectionKey="personal" />
            {openSections.personal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <input type="text" placeholder="Full Name" value={resumeData.fullName} onChange={e => setResumeData({...resumeData, fullName: e.target.value})} className="input-field" />
                <input type="text" placeholder="Job Title" value={resumeData.jobTitle} onChange={e => setResumeData({...resumeData, jobTitle: e.target.value})} className="input-field" />
                <input type="email" placeholder="Email" value={resumeData.contact.email} onChange={e => updateContact('email', e.target.value)} className="input-field" />
                <input type="tel" placeholder="Phone" value={resumeData.contact.phone} onChange={e => updateContact('phone', e.target.value)} className="input-field" />
                <input type="text" placeholder="Location" value={resumeData.contact.location} onChange={e => updateContact('location', e.target.value)} className="input-field" />
                <input type="text" placeholder="LinkedIn" value={resumeData.contact.linkedin || ''} onChange={e => updateContact('linkedin', e.target.value)} className="input-field" />
                <input type="text" placeholder="Website" value={resumeData.contact.website || ''} onChange={e => updateContact('website', e.target.value)} className="input-field" />
              </div>
            )}
          </section>

          {/* Summary */}
          {sectionVisibility.summary && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader title="Professional Summary" sectionKey="summary" />
               {openSections.summary && (
                <div className="relative">
                  <textarea 
                    value={resumeData.summary} 
                    onChange={e => setResumeData({...resumeData, summary: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px] text-sm pr-10"
                    placeholder="Write a brief summary of your career..."
                  />
                  <button
                    onClick={() => handleImproveText(resumeData.summary, 'summary', 'summary')}
                    className="absolute top-2 right-2 text-slate-400 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50 transition"
                    title="AI Improve Text"
                    disabled={improvingField === 'summary'}
                  >
                    {improvingField === 'summary' ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <Wand2 size={16} />}
                  </button>
                </div>
               )}
            </section>
          )}

          {/* Experience */}
          {sectionVisibility.experience && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                 title="Experience" 
                 sectionKey="experience" 
                 onAdd={() => setResumeData({
                   ...resumeData, 
                   experience: [...resumeData.experience, { company: '', role: '', startDate: '', endDate: '', description: [''] }]
                 })} 
               />
               {openSections.experience && (
                 <div className="space-y-6">
                   {resumeData.experience.map((exp, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group animate-in slide-in-from-top-2">
                        <button 
                          onClick={() => {
                            const newExp = [...resumeData.experience];
                            newExp.splice(idx, 1);
                            setResumeData({...resumeData, experience: newExp});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Company" value={exp.company} onChange={e => {
                            const newExp = [...resumeData.experience];
                            newExp[idx].company = e.target.value;
                            setResumeData({...resumeData, experience: newExp});
                          }} className="input-field bg-white" />
                          <input type="text" placeholder="Role" value={exp.role} onChange={e => {
                            const newExp = [...resumeData.experience];
                            newExp[idx].role = e.target.value;
                            setResumeData({...resumeData, experience: newExp});
                          }} className="input-field bg-white" />
                           <input type="text" placeholder="Start" value={exp.startDate} onChange={e => {
                            const newExp = [...resumeData.experience];
                            newExp[idx].startDate = e.target.value;
                            setResumeData({...resumeData, experience: newExp});
                          }} className="input-field bg-white" />
                           <input type="text" placeholder="End" value={exp.endDate} onChange={e => {
                            const newExp = [...resumeData.experience];
                            newExp[idx].endDate = e.target.value;
                            setResumeData({...resumeData, experience: newExp});
                          }} className="input-field bg-white" />
                        </div>
                        <div className="relative">
                          <textarea 
                            placeholder="Description (one bullet point per line)"
                            value={exp.description.join('\n')}
                            onChange={e => {
                              const newExp = [...resumeData.experience];
                              newExp[idx].description = e.target.value.split('\n');
                              setResumeData({...resumeData, experience: newExp});
                            }}
                            className="w-full p-2 border border-slate-300 rounded bg-white text-sm min-h-[80px] pr-10"
                          />
                          <button
                            onClick={() => handleImproveText(exp.description.join('\n'), `exp-${idx}`, 'experience')}
                            className="absolute top-2 right-2 text-slate-400 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50 transition"
                            title="AI Improve Text"
                            disabled={improvingField === `exp-${idx}`}
                          >
                            {improvingField === `exp-${idx}` ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility.projects && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                 title="Projects" 
                 sectionKey="projects" 
                 onAdd={() => setResumeData({
                   ...resumeData, 
                   projects: [...resumeData.projects, { name: '', technologies: '', description: [''] }]
                 })} 
               />
               {openSections.projects && (
                 <div className="space-y-6">
                   {resumeData.projects.map((proj, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group animate-in slide-in-from-top-2">
                        <button 
                          onClick={() => {
                            const newItems = [...resumeData.projects];
                            newItems.splice(idx, 1);
                            setResumeData({...resumeData, projects: newItems});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Project Name" value={proj.name} onChange={e => {
                            const newItems = [...resumeData.projects];
                            newItems[idx].name = e.target.value;
                            setResumeData({...resumeData, projects: newItems});
                          }} className="input-field bg-white" />
                          <input type="text" placeholder="Technologies" value={proj.technologies} onChange={e => {
                            const newItems = [...resumeData.projects];
                            newItems[idx].technologies = e.target.value;
                            setResumeData({...resumeData, projects: newItems});
                          }} className="input-field bg-white" />
                          <input type="text" placeholder="Link (Optional)" value={proj.link || ''} onChange={e => {
                            const newItems = [...resumeData.projects];
                            newItems[idx].link = e.target.value;
                            setResumeData({...resumeData, projects: newItems});
                          }} className="input-field bg-white md:col-span-2" />
                        </div>
                        <div className="relative">
                          <textarea 
                            placeholder="Description (one bullet point per line)"
                            value={proj.description.join('\n')}
                            onChange={e => {
                              const newItems = [...resumeData.projects];
                              newItems[idx].description = e.target.value.split('\n');
                              setResumeData({...resumeData, projects: newItems});
                            }}
                            className="w-full p-2 border border-slate-300 rounded bg-white text-sm min-h-[60px] pr-10"
                          />
                          <button
                            onClick={() => handleImproveText(proj.description.join('\n'), `proj-${idx}`, 'project')}
                            className="absolute top-2 right-2 text-slate-400 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50 transition"
                            title="AI Improve Text"
                            disabled={improvingField === `proj-${idx}`}
                          >
                            {improvingField === `proj-${idx}` ? <Loader2 size={16} className="animate-spin text-purple-600" /> : <Wand2 size={16} />}
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </section>
          )}

          {/* Skills */}
          {sectionVisibility.skills && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <SectionHeader 
                 title="Skills" 
                 sectionKey="skills" 
                 onAdd={() => setResumeData({
                   ...resumeData, 
                   skills: [...resumeData.skills, { category: '', items: [] }]
                 })}
               />
               {openSections.skills && (
                <div className="space-y-4">
                  {resumeData.skills.map((group, idx) => (
                     <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                        <button 
                          onClick={() => {
                            const newSkills = [...resumeData.skills];
                            newSkills.splice(idx, 1);
                            setResumeData({...resumeData, skills: newSkills});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <input 
                           type="text" 
                           placeholder="Category (e.g. Languages)" 
                           value={group.category}
                           onChange={(e) => {
                              const newSkills = [...resumeData.skills];
                              newSkills[idx].category = e.target.value;
                              setResumeData({...resumeData, skills: newSkills});
                           }}
                           className="input-field bg-white mb-2 font-semibold"
                        />
                        <textarea 
                          value={group.items.join(', ')} 
                          onChange={e => {
                             const newSkills = [...resumeData.skills];
                             newSkills[idx].items = e.target.value.split(',').map(s => s.trim());
                             setResumeData({...resumeData, skills: newSkills});
                          }}
                          className="w-full p-2 border border-slate-300 rounded bg-white text-sm min-h-[50px]"
                          placeholder="Comma separated skills..."
                        />
                     </div>
                  ))}
                </div>
               )}
            </section>
          )}

          {/* Education */}
          {sectionVisibility.education && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                  title="Education" 
                  sectionKey="education" 
                  onAdd={() => setResumeData({
                     ...resumeData,
                     education: [...resumeData.education, { institution: '', degree: '', year: '' }]
                  })}
               />
               {openSections.education && (
                <div className="space-y-4">
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                       <button 
                          onClick={() => {
                            const newEdu = [...resumeData.education];
                            newEdu.splice(idx, 1);
                            setResumeData({...resumeData, education: newEdu});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 gap-2">
                          <input type="text" placeholder="Institution" value={edu.institution} onChange={e => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].institution = e.target.value;
                            setResumeData({...resumeData, education: newEdu});
                          }} className="input-field bg-white" />
                          <input type="text" placeholder="Degree" value={edu.degree} onChange={e => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].degree = e.target.value;
                            setResumeData({...resumeData, education: newEdu});
                          }} className="input-field bg-white" />
                           <input type="text" placeholder="Year" value={edu.year} onChange={e => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].year = e.target.value;
                            setResumeData({...resumeData, education: newEdu});
                          }} className="input-field bg-white" />
                        </div>
                    </div>
                  ))}
                </div>
               )}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility.certifications && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                  title="Certifications" 
                  sectionKey="certifications" 
                  onAdd={() => setResumeData({
                     ...resumeData,
                     certifications: [...resumeData.certifications, { name: '', issuer: '', year: '' }]
                  })}
               />
               {openSections.certifications && (
                <div className="space-y-4">
                  {resumeData.certifications.map((cert, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                       <button 
                          onClick={() => {
                            const newItems = [...resumeData.certifications];
                            newItems.splice(idx, 1);
                            setResumeData({...resumeData, certifications: newItems});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 gap-2">
                          <input type="text" placeholder="Name" value={cert.name} onChange={e => {
                            const newItems = [...resumeData.certifications];
                            newItems[idx].name = e.target.value;
                            setResumeData({...resumeData, certifications: newItems});
                          }} className="input-field bg-white" />
                          <div className="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="Issuer" value={cert.issuer} onChange={e => {
                              const newItems = [...resumeData.certifications];
                              newItems[idx].issuer = e.target.value;
                              setResumeData({...resumeData, certifications: newItems});
                              }} className="input-field bg-white" />
                              <input type="text" placeholder="Year" value={cert.year} onChange={e => {
                              const newItems = [...resumeData.certifications];
                              newItems[idx].year = e.target.value;
                              setResumeData({...resumeData, certifications: newItems});
                              }} className="input-field bg-white" />
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
               )}
            </section>
          )}

          {/* Languages */}
          {sectionVisibility.languages && (
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                  title="Languages" 
                  sectionKey="languages" 
                  onAdd={() => setResumeData({
                     ...resumeData,
                     languages: [...resumeData.languages, { language: '', proficiency: '' }]
                  })}
               />
               {openSections.languages && (
                <div className="space-y-4">
                  {resumeData.languages.map((lang, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                       <button 
                          onClick={() => {
                            const newItems = [...resumeData.languages];
                            newItems.splice(idx, 1);
                            setResumeData({...resumeData, languages: newItems});
                          }}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Language" value={lang.language} onChange={e => {
                            const newItems = [...resumeData.languages];
                            newItems[idx].language = e.target.value;
                            setResumeData({...resumeData, languages: newItems});
                          }} className="input-field bg-white" />
                          <input type="text" placeholder="Proficiency" value={lang.proficiency} onChange={e => {
                            const newItems = [...resumeData.languages];
                            newItems[idx].proficiency = e.target.value;
                            setResumeData({...resumeData, languages: newItems});
                          }} className="input-field bg-white" />
                        </div>
                    </div>
                  ))}
                </div>
               )}
            </section>
          )}

          {/* Custom Sections Render Loop */}
          {resumeData.customSections?.map((section) => (
            <section key={section.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
               <SectionHeader 
                  title={section.title} 
                  sectionKey={section.id}
                  isCustom={true}
                  onDelete={() => handleDeleteCustomSection(section.id)}
                  onAdd={() => {
                     const newCustomSections = [...(resumeData.customSections || [])];
                     const sectionIndex = newCustomSections.findIndex(s => s.id === section.id);
                     if (sectionIndex !== -1) {
                        newCustomSections[sectionIndex].items.push({ title: '', description: [''] });
                        setResumeData({...resumeData, customSections: newCustomSections});
                     }
                  }}
               />
               {openSections[section.id] && (
                 <div className="space-y-6">
                    {section.items.map((item, idx) => (
                       <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                          <button 
                             onClick={() => {
                                const newCustomSections = [...(resumeData.customSections || [])];
                                const sectionIndex = newCustomSections.findIndex(s => s.id === section.id);
                                if (sectionIndex !== -1) {
                                   newCustomSections[sectionIndex].items.splice(idx, 1);
                                   setResumeData({...resumeData, customSections: newCustomSections});
                                }
                             }}
                             className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition"
                          >
                             <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                             <input 
                                type="text" 
                                placeholder="Title (e.g. Award Name, Project)" 
                                value={item.title}
                                onChange={(e) => {
                                   const newCustomSections = [...(resumeData.customSections || [])];
                                   const sIdx = newCustomSections.findIndex(s => s.id === section.id);
                                   newCustomSections[sIdx].items[idx].title = e.target.value;
                                   setResumeData({...resumeData, customSections: newCustomSections});
                                }}
                                className="input-field bg-white"
                             />
                             <input 
                                type="text" 
                                placeholder="Date/Year (Optional)" 
                                value={item.date || ''}
                                onChange={(e) => {
                                   const newCustomSections = [...(resumeData.customSections || [])];
                                   const sIdx = newCustomSections.findIndex(s => s.id === section.id);
                                   newCustomSections[sIdx].items[idx].date = e.target.value;
                                   setResumeData({...resumeData, customSections: newCustomSections});
                                }}
                                className="input-field bg-white"
                             />
                          </div>
                          <input 
                             type="text" 
                             placeholder="Subtitle (e.g. Organization, Role) (Optional)" 
                             value={item.subtitle || ''}
                             onChange={(e) => {
                                const newCustomSections = [...(resumeData.customSections || [])];
                                const sIdx = newCustomSections.findIndex(s => s.id === section.id);
                                newCustomSections[sIdx].items[idx].subtitle = e.target.value;
                                setResumeData({...resumeData, customSections: newCustomSections});
                             }}
                             className="input-field bg-white mb-2"
                          />
                          <textarea 
                             placeholder="Description..."
                             value={item.description.join('\n')}
                             onChange={(e) => {
                                const newCustomSections = [...(resumeData.customSections || [])];
                                const sIdx = newCustomSections.findIndex(s => s.id === section.id);
                                newCustomSections[sIdx].items[idx].description = e.target.value.split('\n');
                                setResumeData({...resumeData, customSections: newCustomSections});
                             }}
                             className="w-full p-2 border border-slate-300 rounded bg-white text-sm min-h-[60px]"
                          />
                       </div>
                    ))}
                 </div>
               )}
            </section>
          ))}

          {/* Add Custom Section Button */}
          <div className="pt-4 pb-10">
            {!showAddSection ? (
              <button 
                onClick={() => setShowAddSection(true)}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Custom Section
              </button>
            ) : (
               <div className="bg-white p-4 rounded-xl shadow-md border border-blue-200 animate-in zoom-in-95">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Name your new section</h4>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={newCustomSectionTitle}
                        onChange={(e) => setNewCustomSectionTitle(e.target.value)}
                        placeholder="e.g. Volunteering, Awards, Publications"
                        className="input-field flex-1"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSection()}
                     />
                     <button onClick={handleAddCustomSection} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700">Add</button>
                     <button onClick={() => setShowAddSection(false)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-200">Cancel</button>
                  </div>
               </div>
            )}
          </div>

        </div>
      </div>

      {/* --- Right Sidebar: Live Preview --- */}
      <div className="w-full lg:w-1/2 bg-slate-300 h-full flex flex-col items-center relative print:w-full print:h-auto print:bg-white print:p-0 print:block">
         
         {/* Live Preview Header */}
         <div className="w-full bg-slate-800 text-white py-2 text-center text-xs font-bold tracking-widest uppercase shadow-md print:hidden flex items-center justify-center gap-2 z-20 flex-shrink-0">
           <Eye size={14} className="text-green-400 animate-pulse" /> Live Preview
         </div>

         {/* Preview Container */}
         <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-8 flex justify-center bg-slate-300/50 print:p-0 print:overflow-visible print:block">
             {/* Floating Action Buttons */}
             <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-3 group print:hidden">
                {/* Download Doc */}
                <button 
                    onClick={handleDownloadDoc}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 flex items-center justify-center relative group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
                    title="Download as Word Doc"
                >
                    <FileText size={20} />
                    <span className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Download .doc
                    </span>
                </button>

                {/* Print / ATS PDF */}
                <button 
                    onClick={handlePrint}
                    className="bg-slate-700 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 flex items-center justify-center relative group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100"
                    title="Standard Print / ATS PDF"
                >
                    <Printer size={20} />
                    <span className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Print / Standard PDF
                    </span>
                </button>

                {/* Main Download PDF */}
                <button 
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center z-20 relative disabled:opacity-70 disabled:cursor-not-allowed"
                    title="Download as PDF"
                >
                    {isDownloading ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                     <span className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition whitespace-nowrap pointer-events-none hidden group-hover:block">
                        Download PDF
                    </span>
                </button>
             </div>

             {/* Resume Paper */}
             <div className="relative">
                <div 
                  className="bg-white shadow-2xl w-[210mm] min-h-[297mm] origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.7] xl:scale-[0.8] 2xl:scale-[0.9] transition-transform duration-300 print:scale-100 print:shadow-none print:m-0 print:w-full print:transform-none" 
                  ref={printRef}
                >
                  <ResumeTemplate data={resumeData} template={template} visibleSections={sectionVisibility} />
                </div>
             </div>
         </div>
      </div>

      {/* --- AI Modal --- */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full">
              <X size={20} />
             </button>
             
             <div className="flex items-center gap-3 mb-4">
               <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Sparkles size={24} /></div>
               <h2 className="text-xl font-bold text-slate-800">AI Resume Generator</h2>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-1">
               <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                 Upload your existing resume (PDF/Image) or paste your details below. Gemini will analyze the content and format it into a professional structure.
               </p>

               {/* File Upload Section */}
               <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resume (PDF or Image)</label>
                  <div 
                    onClick={() => aiFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition
                      ${aiFile ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}`}
                  >
                    <input 
                      type="file" 
                      accept=".pdf,image/*" 
                      ref={aiFileRef} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAiFile({
                              name: file.name,
                              data: reader.result as string,
                              type: file.type
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="hidden" 
                    />
                    {aiFile ? (
                      <div className="flex items-center gap-2 text-purple-700">
                        <FileText size={24} />
                        <span className="font-medium text-sm truncate max-w-[200px]">{aiFile.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAiFile(null); if(aiFileRef.current) aiFileRef.current.value = ''; }}
                          className="ml-2 p-1 bg-purple-200 rounded-full hover:bg-purple-300 text-purple-800"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500">Click to upload PDF or Image</p>
                      </>
                    )}
                  </div>
               </div>

               <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-slate-200"></div>
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-white px-2 text-slate-400">Or paste text</span>
                 </div>
               </div>

               <div className="mt-4 mb-1">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Paste Details</label>
                 <textarea 
                   value={aiPrompt}
                   onChange={(e) => setAiPrompt(e.target.value)}
                   placeholder="Example: I'm a developer with 5 years experience in React... (Leave empty if uploading a file)"
                   className="w-full h-32 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                 />
               </div>
             </div>

             <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || (!aiPrompt && !aiFile)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition shadow-sm"
                >
                  {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate Resume
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};
