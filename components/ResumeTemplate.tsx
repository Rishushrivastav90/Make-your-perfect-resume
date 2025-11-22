
import React from 'react';
import { ResumeData, TemplateType, CustomSection } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe, Briefcase, GraduationCap, Code, Award, User, Languages as LangIcon, Star, FileText, Calendar, Circle, ExternalLink } from 'lucide-react';

interface ResumeTemplateProps {
  data: ResumeData;
  template: TemplateType;
  visibleSections?: Record<string, boolean>;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, template, visibleSections }) => {
  
  const isVisible = (key: string) => {
    if (visibleSections && visibleSections[key] === false) return false;
    // Also hide empty arrays to keep it clean
    if (key === 'experience' && data.experience.length === 0) return false;
    if (key === 'education' && data.education.length === 0) return false;
    if (key === 'projects' && data.projects.length === 0) return false;
    if (key === 'skills' && data.skills.length === 0) return false;
    if (key === 'certifications' && data.certifications.length === 0) return false;
    if (key === 'languages' && data.languages.length === 0) return false;
    return true;
  };

  const isCustomVisible = (section: CustomSection) => {
     if (visibleSections && visibleSections[section.id] === false) return false;
     return section.items.length > 0;
  };

  // Common A4 Container Class
  const containerClass = "w-full min-h-[297mm] bg-white text-slate-900 shadow-sm printable-content font-sans relative overflow-hidden";

  // --- Visual Template (Timeline & Graphics) ---
  if (template === 'visual') {
    return (
      <div className={`${containerClass} flex`} id="resume-preview">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-slate-900 text-white p-6 flex flex-col gap-8 min-h-[297mm]">
           <div className="text-center border-b border-slate-700 pb-6">
              {/* Placeholder for user photo if we had one, using initials for now */}
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border-2 border-slate-500">
                {data.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <h1 className="text-2xl font-bold uppercase leading-tight tracking-wide mb-2">{data.fullName}</h1>
              <p className="text-blue-400 font-medium">{data.jobTitle}</p>
           </div>

           <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3"><Mail size={16} className="text-blue-400" /> <span className="break-all">{data.contact.email}</span></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-blue-400" /> {data.contact.phone}</div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-blue-400" /> {data.contact.location}</div>
              {data.contact.linkedin && <div className="flex items-center gap-3"><Linkedin size={16} className="text-blue-400" /> <span className="break-all text-xs">{data.contact.linkedin.replace(/^https?:\/\//, '')}</span></div>}
              {data.contact.website && <div className="flex items-center gap-3"><Globe size={16} className="text-blue-400" /> <span className="break-all text-xs">{data.contact.website.replace(/^https?:\/\//, '')}</span></div>}
           </div>

           {isVisible('skills') && (
             <div className="space-y-4">
               <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-700 pb-2 text-white">Skills</h2>
               {data.skills.map((group, idx) => (
                 <div key={idx}>
                   <p className="text-xs font-bold text-slate-400 mb-2 uppercase">{group.category}</p>
                   <div className="flex flex-wrap gap-2">
                      {group.items.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700">
                          {skill}
                        </span>
                      ))}
                   </div>
                 </div>
               ))}
             </div>
           )}

           {isVisible('languages') && (
             <div className="space-y-3">
               <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-700 pb-2 text-white">Languages</h2>
               {data.languages.map((lang, idx) => (
                 <div key={idx}>
                   <div className="flex justify-between text-sm mb-1">
                      <span>{lang.language}</span>
                      <span className="text-slate-400 text-xs">{lang.proficiency}</span>
                   </div>
                   {/* Fake progress bar for visuals */}
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: lang.proficiency.includes('Native') ? '100%' : lang.proficiency.includes('Advanced') ? '80%' : '60%' }}></div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-8 bg-white">
           {isVisible('summary') && (
             <section className="mb-8">
               <h2 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-blue-500 pb-2 mb-4">Profile</h2>
               <p className="text-sm text-slate-600 leading-relaxed text-justify">{data.summary}</p>
             </section>
           )}

           {isVisible('experience') && (
             <section className="mb-8">
               <h2 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-blue-500 pb-2 mb-4">Experience</h2>
               <div className="border-l-2 border-slate-200 ml-2 space-y-8">
                 {data.experience.map((exp, idx) => (
                   <div key={idx} className="relative pl-6">
                     <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-blue-500 bg-white"></div>
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                       <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                       <span className="text-xs font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                     </div>
                     <p className="text-sm font-semibold text-slate-500 mb-2 italic">{exp.company}</p>
                     <ul className="list-disc ml-4 space-y-1">
                       {exp.description.map((desc, i) => (
                         <li key={i} className="text-sm text-slate-600 leading-snug">{desc}</li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
             </section>
           )}

           {isVisible('projects') && (
             <section className="mb-8">
               <h2 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-blue-500 pb-2 mb-4">Projects</h2>
               <div className="grid grid-cols-1 gap-4">
                 {data.projects.map((proj, idx) => (
                   <div key={idx} className="bg-slate-50 p-4 rounded border-l-4 border-blue-500 shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800">{proj.name}</h3>
                        {proj.link && <span className="text-blue-500"><ExternalLink size={14} /></span>}
                      </div>
                      <p className="text-xs font-mono text-slate-500 mb-2 mt-1">{proj.technologies}</p>
                      <ul className="list-disc ml-4 space-y-1">
                         {proj.description.map((desc, i) => (
                            <li key={i} className="text-sm text-slate-600 leading-snug">{desc}</li>
                         ))}
                      </ul>
                   </div>
                 ))}
               </div>
             </section>
           )}

           {isVisible('education') && (
             <section className="mb-8">
               <h2 className="text-xl font-bold text-slate-800 uppercase border-b-2 border-blue-500 pb-2 mb-4">Education</h2>
               <div className="space-y-4">
                 {data.education.map((edu, idx) => (
                   <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 p-1.5 rounded text-blue-600"><GraduationCap size={18} /></div>
                      <div>
                        <h3 className="font-bold text-slate-800">{edu.institution}</h3>
                        <p className="text-sm text-slate-600">{edu.degree}</p>
                        <p className="text-xs text-slate-400 font-medium">{edu.year}</p>
                      </div>
                   </div>
                 ))}
               </div>
             </section>
           )}
           
           {renderCustomSections(data, visibleSections, isCustomVisible)}
        </div>
      </div>
    );
  }

  // --- Professional Template (New - Robust & Clean) ---
  if (template === 'professional') {
    return (
      <div className={`${containerClass} p-10`} id="resume-preview">
         {/* Header */}
         <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
               <h1 className="text-4xl font-bold text-slate-900 mb-2">{data.fullName}</h1>
               <p className="text-xl text-slate-600">{data.jobTitle}</p>
            </div>
            <div className="text-right text-sm space-y-1">
               <div className="font-medium">{data.contact.email}</div>
               <div>{data.contact.phone}</div>
               <div>{data.contact.location}</div>
               {data.contact.linkedin && <div className="text-blue-600 text-xs">{data.contact.linkedin}</div>}
            </div>
         </div>

         <div className="grid grid-cols-12 gap-10">
            {/* Main Left Column */}
            <div className="col-span-8 space-y-8">
               {isVisible('summary') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-3 text-slate-800 border-b border-slate-200 pb-1">Professional Profile</h2>
                     <p className="text-sm leading-relaxed text-slate-700 text-justify">{data.summary}</p>
                  </section>
               )}

               {isVisible('experience') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Experience</h2>
                     <div className="space-y-6">
                        {data.experience.map((exp, idx) => (
                           <div key={idx}>
                              <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-lg text-slate-800">{exp.role}</h3>
                                 <span className="text-sm font-medium text-slate-500">{exp.startDate} - {exp.endDate}</span>
                              </div>
                              <div className="text-slate-700 font-semibold mb-2">{exp.company}</div>
                              <ul className="list-disc ml-5 space-y-1.5">
                                 {exp.description.map((desc, i) => (
                                    <li key={i} className="text-sm text-slate-600 leading-snug">{desc}</li>
                                 ))}
                              </ul>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {isVisible('projects') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Key Projects</h2>
                     <div className="space-y-5">
                        {data.projects.map((proj, idx) => (
                           <div key={idx}>
                              <div className="flex justify-between items-baseline mb-1">
                                 <h3 className="font-bold text-base text-slate-800">{proj.name}</h3>
                                 <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{proj.technologies}</span>
                              </div>
                              <ul className="list-disc ml-5 space-y-1">
                                 {proj.description.map((desc, i) => (
                                    <li key={i} className="text-sm text-slate-600 leading-snug">{desc}</li>
                                 ))}
                              </ul>
                           </div>
                        ))}
                     </div>
                  </section>
               )}
               
               {renderCustomSections(data, visibleSections, isCustomVisible)}
            </div>

            {/* Right Sidebar Column */}
            <div className="col-span-4 space-y-8">
               {isVisible('skills') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Skills</h2>
                     <div className="space-y-4">
                        {data.skills.map((group, idx) => (
                           <div key={idx}>
                              <h3 className="font-bold text-sm text-slate-700 mb-2">{group.category}</h3>
                              <div className="flex flex-wrap gap-2">
                                 {group.items.map((skill, sIdx) => (
                                    <span key={sIdx} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                                       {skill}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {isVisible('education') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Education</h2>
                     <div className="space-y-4">
                        {data.education.map((edu, idx) => (
                           <div key={idx}>
                              <div className="font-bold text-slate-800">{edu.institution}</div>
                              <div className="text-sm text-slate-600">{edu.degree}</div>
                              <div className="text-xs text-slate-400 mt-1">{edu.year}</div>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {isVisible('certifications') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Certifications</h2>
                     <div className="space-y-3">
                        {data.certifications.map((cert, idx) => (
                           <div key={idx} className="border-l-2 border-slate-300 pl-3">
                              <div className="font-bold text-sm text-slate-800">{cert.name}</div>
                              <div className="text-xs text-slate-500">{cert.issuer} • {cert.year}</div>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {isVisible('languages') && (
                  <section>
                     <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-slate-800 border-b border-slate-200 pb-1">Languages</h2>
                     <div className="space-y-2">
                        {data.languages.map((lang, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-slate-700">{lang.language}</span>
                              <span className="text-slate-500 text-xs">{lang.proficiency}</span>
                           </div>
                        ))}
                     </div>
                  </section>
               )}
            </div>
         </div>
      </div>
    );
  }

  // --- Global Template (Corporate / Professional) ---
  if (template === 'global') {
    return (
      <div className={`${containerClass} p-10`} id="resume-preview">
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6 mb-8">
           <h1 className="text-5xl font-serif font-bold text-slate-900 mb-2 tracking-tight">{data.fullName}</h1>
           <div className="flex justify-between items-end">
              <p className="text-xl text-slate-600 uppercase tracking-widest font-light">{data.jobTitle}</p>
              <div className="text-right text-sm text-slate-500 space-y-1">
                 <div className="flex items-center justify-end gap-2"><span>{data.contact.email}</span> <span className="text-slate-300">|</span> <span>{data.contact.phone}</span></div>
                 <div className="flex items-center justify-end gap-2"><span>{data.contact.location}</span> {data.contact.linkedin && <><span className="text-slate-300">|</span> <span>{data.contact.linkedin}</span></>}</div>
              </div>
           </div>
        </header>

        {/* Content Grid */}
        <div className="space-y-8">
          {isVisible('summary') && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-slate-300"></span> Summary
              </h2>
              <p className="text-base leading-relaxed text-slate-800 font-serif">{data.summary}</p>
            </section>
          )}

          {isVisible('skills') && (
             <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-300"></span> Core Competencies
                </h2>
                <div className="grid grid-cols-3 gap-6">
                   {data.skills.map((group, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 border-t-2 border-slate-200">
                         <h3 className="font-bold text-sm text-slate-700 mb-2">{group.category}</h3>
                         <p className="text-sm text-slate-600 leading-relaxed">{group.items.join(', ')}</p>
                      </div>
                   ))}
                </div>
             </section>
          )}

          {isVisible('experience') && (
             <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-300"></span> Professional Experience
                </h2>
                <div className="space-y-6">
                   {data.experience.map((exp, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-4">
                         <div className="col-span-3">
                            <p className="text-sm font-bold text-slate-400">{exp.startDate} — {exp.endDate}</p>
                            <p className="text-sm font-bold text-slate-900 mt-1">{exp.company}</p>
                         </div>
                         <div className="col-span-9 border-l border-slate-200 pl-6">
                            <h3 className="text-lg font-bold font-serif text-slate-800 mb-2">{exp.role}</h3>
                            <ul className="space-y-1.5">
                               {exp.description.map((desc, i) => (
                                  <li key={i} className="text-sm text-slate-600 leading-relaxed relative pl-4">
                                    <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                    {desc}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          )}

          {isVisible('projects') && (
             <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-300"></span> Significant Projects
                </h2>
                <div className="grid grid-cols-2 gap-6">
                   {data.projects.map((proj, idx) => (
                      <div key={idx}>
                         <div className="flex justify-between items-baseline border-b border-slate-100 pb-1 mb-2">
                            <h3 className="font-bold text-slate-800">{proj.name}</h3>
                            <span className="text-xs font-mono text-slate-500">{proj.technologies}</span>
                         </div>
                         <ul className="list-none space-y-1">
                            {proj.description.map((desc, i) => (
                               <li key={i} className="text-sm text-slate-600 leading-snug">- {desc}</li>
                            ))}
                         </ul>
                      </div>
                   ))}
                </div>
             </section>
          )}

          <div className="grid grid-cols-2 gap-8">
             {isVisible('education') && (
                <section>
                   <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-slate-300"></span> Education
                   </h2>
                   <div className="space-y-3">
                      {data.education.map((edu, idx) => (
                         <div key={idx}>
                            <h3 className="font-bold text-slate-800">{edu.institution}</h3>
                            <p className="text-sm text-slate-600">{edu.degree}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{edu.year}</p>
                         </div>
                      ))}
                   </div>
                </section>
             )}
             {isVisible('certifications') && (
                <section>
                   <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                     <span className="w-8 h-[1px] bg-slate-300"></span> Certifications
                   </h2>
                   <div className="space-y-2">
                      {data.certifications.map((cert, idx) => (
                         <div key={idx} className="flex justify-between items-baseline border-b border-dashed border-slate-200 pb-1">
                            <span className="font-bold text-sm text-slate-700">{cert.name}</span>
                            <span className="text-xs text-slate-500">{cert.year}</span>
                         </div>
                      ))}
                   </div>
                </section>
             )}
          </div>
          
          {renderCustomSections(data, visibleSections, isCustomVisible)}
        </div>
      </div>
    );
  }

  // --- Compact Template (One Page, 3 Columns, Dense) ---
  if (template === 'compact') {
    return (
      <div className={`${containerClass} p-6 text-[10px]`} id="resume-preview">
        <header className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase leading-none">{data.fullName}</h1>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mt-1">{data.jobTitle}</p>
          </div>
          <div className="text-right text-[9px] font-medium text-slate-500 space-y-0.5">
             <div className="flex items-center justify-end gap-1"><Mail size={10} /> {data.contact.email}</div>
             <div className="flex items-center justify-end gap-1"><Phone size={10} /> {data.contact.phone}</div>
             <div className="flex items-center justify-end gap-1"><MapPin size={10} /> {data.contact.location}</div>
             {data.contact.linkedin && <div className="flex items-center justify-end gap-1"><Linkedin size={10} /> {data.contact.linkedin}</div>}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
           {/* Left Col (Skills, Contact, Langs) - 3 Cols */}
           <div className="col-span-3 space-y-4 border-r border-slate-200 pr-2">
              {isVisible('skills') && (
                <section>
                  <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Skills</h2>
                  <div className="space-y-2">
                    {data.skills.map((group, idx) => (
                      <div key={idx}>
                        <p className="font-bold text-[9px] text-slate-600 mb-0.5">{group.category}</p>
                        <p className="leading-tight">{group.items.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {isVisible('education') && (
                <section>
                  <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Education</h2>
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="font-bold leading-tight">{edu.institution}</p>
                      <p className="italic text-slate-600">{edu.degree}</p>
                      <p className="text-[9px] text-slate-400">{edu.year}</p>
                    </div>
                  ))}
                </section>
              )}

               {isVisible('languages') && (
                <section>
                  <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Languages</h2>
                  {data.languages.map((lang, idx) => (
                    <div key={idx} className="flex justify-between mb-0.5">
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-slate-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </section>
              )}

              {isVisible('certifications') && (
                <section>
                  <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Certifications</h2>
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} className="mb-1">
                      <p className="font-bold">{cert.name}</p>
                      <p className="text-[9px] text-slate-500">{cert.year}</p>
                    </div>
                  ))}
                </section>
              )}
           </div>

           {/* Middle & Right Col (Exp, Proj) - 9 Cols */}
           <div className="col-span-9 space-y-4">
              {isVisible('summary') && (
                 <section>
                    <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Profile</h2>
                    <p className="text-justify leading-snug">{data.summary}</p>
                 </section>
              )}

              {isVisible('experience') && (
                 <section>
                    <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Experience</h2>
                    <div className="space-y-3">
                       {data.experience.map((exp, idx) => (
                          <div key={idx}>
                             <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-sm">{exp.role}</h3>
                                <span className="font-mono text-[9px] bg-slate-100 px-1 rounded">{exp.startDate} - {exp.endDate}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-600 mb-1">{exp.company}</p>
                             <ul className="list-disc ml-3 space-y-0.5">
                                {exp.description.map((desc, i) => (
                                   <li key={i} className="pl-1 leading-snug">{desc}</li>
                                ))}
                             </ul>
                          </div>
                       ))}
                    </div>
                 </section>
              )}

              {isVisible('projects') && (
                 <section>
                    <h2 className="text-xs font-black uppercase mb-2 border-b border-slate-300 pb-1">Projects</h2>
                    <div className="grid grid-cols-2 gap-3">
                       {data.projects.map((proj, idx) => (
                          <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100">
                             <h3 className="font-bold">{proj.name}</h3>
                             <p className="text-[9px] font-mono text-slate-500 mb-1">{proj.technologies}</p>
                             <ul className="list-disc ml-3">
                                {proj.description.map((desc, i) => (
                                   <li key={i} className="leading-tight text-slate-700">{desc}</li>
                                ))}
                             </ul>
                          </div>
                       ))}
                    </div>
                 </section>
              )}

              {renderCustomSections(data, visibleSections, isCustomVisible)}
           </div>
        </div>
      </div>
    );
  }

  // --- Modern Template ---
  if (template === 'modern') {
    return (
      <div className={`${containerClass} p-8 text-slate-800`} id="resume-preview">
        <header className="border-b-4 border-blue-600 pb-6 mb-8 bg-slate-50 -mx-8 -mt-8 px-8 pt-8">
          <h1 className="text-4xl font-extrabold text-slate-900 uppercase tracking-wide">{data.fullName}</h1>
          <p className="text-xl text-blue-600 font-medium mt-1">{data.jobTitle}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
            {data.contact.email && <div className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /> {data.contact.email}</div>}
            {data.contact.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {data.contact.phone}</div>}
            {data.contact.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {data.contact.location}</div>}
            {data.contact.linkedin && <div className="flex items-center gap-2"><Linkedin size={14} className="text-blue-500" /> {data.contact.linkedin}</div>}
            {data.contact.website && <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> {data.contact.website}</div>}
          </div>
        </header>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-7">
            {isVisible('summary') && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-3 pb-2">
                <div className="bg-blue-100 p-1.5 rounded text-blue-600"><User size={16} /></div>
                Summary
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 text-justify">{data.summary}</p>
            </section>
            )}

            {isVisible('experience') && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-4 pb-2">
                <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Briefcase size={16} /></div>
                Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="relative border-l-2 border-slate-200 pl-4 ml-2">
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{exp.role}</h3>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <p className="text-slate-600 font-semibold text-sm mb-2">{exp.company}</p>
                    <ul className="list-disc list-outside ml-4 space-y-1.5">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm text-slate-600 leading-snug pl-1">{desc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            )}

            {isVisible('projects') && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-4 pb-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Code size={16} /></div>
                  Projects
                </h2>
                <div className="space-y-5">
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                       <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-800">{proj.name}</h3>
                        {proj.link && <a href={proj.link} className="text-blue-500 text-xs hover:underline font-medium">View Project</a>}
                      </div>
                      <p className="text-xs text-slate-500 mb-2 font-mono bg-white inline-block px-2 py-1 rounded border border-slate-200">{proj.technologies}</p>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {proj.description.map((desc, i) => (
                          <li key={i} className="text-sm text-slate-600 leading-snug">{desc}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {renderCustomSections(data, visibleSections, isCustomVisible)}
          </div>

          <div className="col-span-1 space-y-7">
            {isVisible('skills') && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-3 pb-2">
                <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Code size={16} /></div>
                Skills
              </h2>
              <div className="space-y-4">
                {data.skills.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{group.category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            )}

            {isVisible('education') && (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-3 pb-2">
                 <div className="bg-blue-100 p-1.5 rounded text-blue-600"><GraduationCap size={16} /></div>
                 Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="border-l-2 border-blue-100 pl-3">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{edu.institution}</h3>
                    <p className="text-sm text-slate-600 mt-1">{edu.degree}</p>
                    <p className="text-xs text-blue-500 mt-1 font-medium">{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
            )}

             {isVisible('certifications') && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-3 pb-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Award size={16} /></div>
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="font-semibold text-slate-800">{cert.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{cert.issuer} • {cert.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {isVisible('languages') && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 uppercase border-b-2 border-slate-100 mb-3 pb-2">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-600"><LangIcon size={16} /></div>
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1 last:border-0">
                      <span className="text-slate-700 font-medium">{lang.language}</span>
                      <span className="text-slate-400 text-xs">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Classic Template ---
  if (template === 'classic') {
    return (
      <div className={`${containerClass} p-8 text-black font-serif`} id="resume-preview">
        {/* ... Header ... */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-2 uppercase tracking-wider">{data.fullName}</h1>
          <p className="text-base mb-2">{data.jobTitle}</p>
          <div className="flex justify-center flex-wrap gap-3 text-xs">
            <span>{data.contact.email}</span>
            <span>•</span>
            <span>{data.contact.phone}</span>
            <span>•</span>
            <span>{data.contact.location}</span>
          </div>
        </div>

        {isVisible('summary') && <section className="mb-4"><h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 tracking-wide">Professional Summary</h2><p className="text-xs leading-relaxed text-justify">{data.summary}</p></section>}
        
        {isVisible('skills') && <section className="mb-4"><h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 tracking-wide">Technical Skills</h2><div className="grid grid-cols-1 gap-1">{data.skills.map((group, idx) => (<div key={idx} className="text-xs flex"><span className="font-bold min-w-[120px]">{group.category}:</span><span>{group.items.join(', ')}</span></div>))}</div></section>}

        {isVisible('experience') && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 tracking-wide">Professional Experience</h2>
          <div className="space-y-3">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-bold text-sm mb-1">
                  <span className="text-sm">{exp.role}</span>
                  <span>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div className="text-xs italic mb-1">{exp.company}</div>
                <ul className="list-disc ml-5 space-y-0.5">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-xs leading-snug">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        )}

        {isVisible('projects') && (
          <section className="mb-4">
            <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 tracking-wide">Projects</h2>
            <div className="space-y-2">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline">
                     <span className="font-bold text-sm">{proj.name}</span>
                     <span className="text-xs italic">{proj.technologies}</span>
                  </div>
                  <ul className="list-disc ml-5 mt-1 space-y-0.5">
                    {proj.description.map((desc, i) => (
                      <li key={i} className="text-xs">{desc}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {isVisible('education') && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 mb-2 tracking-wide">Education</h2>
          {data.education.map((edu, idx) => (
            <div key={idx} className="mb-1 flex justify-between text-xs">
              <span><span className="font-bold">{edu.institution}</span>, {edu.degree}</span>
              <span>{edu.year}</span>
            </div>
          ))}
        </section>
        )}

        {renderCustomSections(data, visibleSections, isCustomVisible)}
      </div>
    );
  }

   // --- Swiss Template (Fixed Full Height) ---
   if (template === 'swiss') {
    return (
      <div className={`${containerClass} flex`} id="resume-preview">
         {/* Left Content Column (65%) */}
         <div className="w-[65%] p-8 flex flex-col min-h-[297mm]">
            <header className="mb-8">
               <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase leading-none">{data.fullName}</h1>
               <div className="h-3 w-24 bg-black mb-4"></div>
               <p className="text-2xl font-bold text-slate-700">{data.jobTitle}</p>
            </header>

            <div className="flex-1 space-y-8">
               {isVisible('summary') && (
               <section>
                  <h2 className="text-base font-black uppercase tracking-tight mb-3 flex items-center gap-2">
                     <div className="w-4 h-4 bg-black"></div> Profile
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-slate-800 text-justify">{data.summary}</p>
               </section>
               )}

               {isVisible('experience') && (
               <section>
                  <h2 className="text-base font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                     <div className="w-4 h-4 bg-black"></div> Experience
                  </h2>
                  <div className="space-y-6">
                     {data.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-5 border-l-4 border-black">
                           <div className="flex justify-between items-baseline mb-1">
                             <h3 className="font-black text-base leading-none">{exp.role}</h3>
                             <span className="text-xs font-bold text-slate-500">{exp.startDate} – {exp.endDate}</span>
                           </div>
                           <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">{exp.company}</p>
                           <ul className="list-none space-y-1.5">
                              {exp.description.map((desc, i) => (
                                 <li key={i} className="text-sm font-medium text-slate-700 flex gap-2 leading-tight">
                                    <span className="text-black mt-1.5 w-1.5 h-1.5 bg-black block shrink-0"></span>
                                    {desc}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </div>
               </section>
               )}

               {isVisible('projects') && (
                  <section>
                     <h2 className="text-base font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                        <div className="w-4 h-4 bg-black"></div> Projects
                     </h2>
                     <div className="space-y-4">
                        {data.projects.map((proj, idx) => (
                           <div key={idx} className="group">
                              <div className="flex items-baseline justify-between mb-1">
                                 <h3 className="font-black text-sm">{proj.name}</h3>
                              </div>
                              <div className="text-xs font-bold font-mono bg-black text-white px-2 py-1 inline-block mb-2">{proj.technologies}</div>
                              <ul className="list-disc ml-5 space-y-1">
                                 {proj.description.map((desc, i) => (
                                    <li key={i} className="text-sm font-medium text-slate-600 leading-tight">{desc}</li>
                                 ))}
                              </ul>
                           </div>
                        ))}
                     </div>
                  </section>
               )}
               
               {renderCustomSections(data, visibleSections, isCustomVisible)}
            </div>
         </div>

         {/* Right Sidebar Column (35%) */}
         <div className="w-[35%] bg-slate-100 p-8 flex flex-col min-h-[297mm] border-l border-slate-200">
             <div className="mb-8 text-right">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider flex flex-col gap-2">
                  <div className="pb-2 border-b border-slate-300">{data.contact.email}</div>
                  <div className="pb-2 border-b border-slate-300">{data.contact.phone}</div>
                  <div className="pb-2 border-b border-slate-300">{data.contact.location}</div>
                  {data.contact.linkedin && <div className="text-xs pt-1">{data.contact.linkedin}</div>}
               </div>
             </div>

             <div className="space-y-10">
               {isVisible('education') && (
               <section>
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-4 border-black pb-1">Education</h2>
                  <div className="space-y-6">
                     {data.education.map((edu, idx) => (
                        <div key={idx}>
                           <div className="font-black text-base leading-tight">{edu.institution}</div>
                           <div className="text-sm font-bold text-slate-500 mt-1">{edu.degree}</div>
                           <div className="text-xs font-black bg-white border border-black inline-block px-2 py-1 mt-2">{edu.year}</div>
                        </div>
                     ))}
                  </div>
               </section>
               )}

               {isVisible('skills') && (
               <section>
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-4 border-black pb-1">Skills</h2>
                  <div className="space-y-4">
                     {data.skills.map((group, idx) => (
                        <div key={idx}>
                           <div className="text-xs font-black uppercase text-slate-400 mb-1">{group.category}</div>
                           <div className="text-sm font-bold text-slate-900 leading-snug pl-2 border-l-2 border-slate-300">
                              {group.items.join(', ')}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
               )}

               {isVisible('certifications') && (
               <section>
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-4 border-black pb-1">Certifications</h2>
                  <div className="space-y-3">
                     {data.certifications.map((cert, idx) => (
                        <div key={idx} className="text-sm">
                           <div className="font-black">{cert.name}</div>
                           <div className="text-xs font-bold text-slate-500 mt-0.5">{cert.issuer}, {cert.year}</div>
                        </div>
                     ))}
                  </div>
               </section>
               )}
               
               {isVisible('languages') && (
               <section>
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-b-4 border-black pb-1">Languages</h2>
                   <div className="space-y-2">
                     {data.languages.map((lang, idx) => (
                        <div key={idx} className="flex justify-between text-sm border-b border-slate-200 pb-1">
                           <span className="font-bold">{lang.language}</span>
                           <span className="text-slate-500 text-xs">{lang.proficiency}</span>
                        </div>
                     ))}
                  </div>
               </section>
               )}
             </div>
         </div>
      </div>
    );
  }

  // Default Fallback (Minimalist - adjusted for font size consistency)
  return (
    <div className={`${containerClass} p-8 text-slate-800 text-sm`} id="resume-preview">
       <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">{data.fullName}</h1>
          <p className="text-base text-slate-400 tracking-[0.2em] uppercase">{data.jobTitle}</p>
        </div>
        <div className="text-right text-xs text-slate-500 space-y-1 font-light">
          <p>{data.contact.email}</p>
          <p>{data.contact.phone}</p>
          <p>{data.contact.location}</p>
        </div>
      </div>
      
      <div className="flex gap-8">
          <div className="w-2/3 space-y-6">
             {isVisible('experience') && <section> <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Experience</h3> {data.experience.map((exp, idx) => <div key={idx} className="mb-4"><h4 className="font-medium text-base">{exp.role}</h4><p className="text-xs text-slate-400 mb-1">{exp.company} | {exp.startDate} - {exp.endDate}</p><ul className="text-xs text-slate-600 space-y-0.5">{exp.description.map((d, i) => <li key={i}>- {d}</li>)}</ul></div>)} </section>}
             {renderCustomSections(data, visibleSections, isCustomVisible)}
          </div>
          <div className="w-1/3 space-y-6">
              {isVisible('skills') && <section> <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Skills</h3> {data.skills.map((g, i) => <div key={i} className="mb-3"><p className="font-bold text-[10px]">{g.category}</p><p className="text-xs text-slate-500">{g.items.join(', ')}</p></div>)} </section>}
              {isVisible('education') && <section> <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Education</h3> {data.education.map((e, i) => <div key={i} className="mb-3"><p className="font-bold text-xs">{e.institution}</p><p className="text-[10px] text-slate-500">{e.degree}, {e.year}</p></div>)} </section>}
          </div>
      </div>
    </div>
  );
};

// Helper function for custom sections (to avoid code duplication)
const renderCustomSections = (data: ResumeData, visibleSections: Record<string, boolean> | undefined, isCustomVisible: (s: CustomSection) => boolean) => {
    if (!data.customSections) return null;
    return data.customSections.map((section) => {
       if (!isCustomVisible(section)) return null;
       return (
        <section key={section.id} className="mb-4">
           <h2 className="text-lg font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">{section.title}</h2>
           <div className="space-y-4">
              {section.items.map((item, idx) => (
                 <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                       <span className="font-bold text-base text-slate-800">{item.title}</span>
                       {item.date && <span className="text-xs italic text-slate-500">{item.date}</span>}
                    </div>
                    {item.subtitle && <div className="text-sm font-medium text-slate-600 mb-1">{item.subtitle}</div>}
                    <ul className="list-disc ml-5 space-y-1">
                       {item.description.map((desc, i) => (
                          <li key={i} className="text-sm text-slate-700">{desc}</li>
                       ))}
                    </ul>
                 </div>
              ))}
           </div>
        </section>
       );
    });
  };
