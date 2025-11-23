
export interface ResumeData {
  fullName: string;
  jobTitle: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  customSections?: CustomSection[]; // Flexible custom sections
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string[]; // Bullet points
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

export interface ProjectItem {
  name: string;
  technologies: string;
  description: string[];
  link?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year: string;
}

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  title: string; // e.g. "Volunteer Lead"
  subtitle?: string; // e.g. "Red Cross"
  date?: string; // e.g. "2020 - 2021"
  description: string[];
}

export type TemplateType = 
  | 'compact' 
  | 'professional' 
  | 'visual' 
  | 'global' 
  | 'modern' 
  | 'classic' 
  | 'minimalist' 
  | 'executive' 
  | 'swiss' 
  | 'elegant'
  | 'creative'
  | 'tech'
  | 'infographic'
  | 'startup'
  | 'artistic'
  | 'academic'
  | 'metro'
  | 'sky'
  | 'verde'
  | 'navy';

// Add html2pdf definition
declare global {
  interface Window {
    html2pdf: any;
  }
}

export const INITIAL_RESUME_DATA: ResumeData = {
  fullName: "James Carter",
  jobTitle: "Senior Financial Analyst",
  contact: {
    email: "j.carter@fintech.io",
    phone: "+1 (212) 555-0199",
    location: "New York, NY",
    linkedin: "linkedin.com/in/jamescarter-cfa",
    website: "jcarterfinance.com"
  },
  summary: "CFA Charterholder with 6+ years of experience in financial modeling, equity research, and portfolio management. Proven track record of identifying high-growth investment opportunities and optimizing asset allocation strategies. Adept at leveraging Python and SQL for large-scale data analysis to drive investment decisions.",
  experience: [
    {
      company: "Goldman Sachs",
      role: "Equity Research Associate",
      startDate: "Jun 2021",
      endDate: "Present",
      description: [
        "Conduct comprehensive fundamental analysis on TMT sector equities, contributing to coverage of 15+ large-cap stocks.",
        "Build and maintain complex financial models to forecast earnings and valuation multiples (DCF, Comparable Company Analysis).",
        "Publish quarterly research reports that are distributed to institutional clients managing over $5B in assets.",
        "Automated data extraction processes using Python, reducing manual data entry time by 40%."
      ]
    },
    {
      company: "JP Morgan Chase",
      role: "Financial Analyst",
      startDate: "Jul 2018",
      endDate: "May 2021",
      description: [
        "Supported the Wealth Management division in portfolio construction and rebalancing for high-net-worth individuals.",
        "Prepared monthly performance attribution reports and presented findings to senior portfolio managers.",
        "Collaborated with the risk management team to stress-test portfolios against various market scenarios."
      ]
    }
  ],
  education: [
    {
      institution: "New York University (Stern)",
      degree: "B.S. Finance & Data Science",
      year: "2018"
    }
  ],
  skills: [
    { category: "Financial Analysis", items: ["Financial Modeling", "Valuation (DCF, LBO)", "Risk Management", "Portfolio Strategy"] },
    { category: "Technical Skills", items: ["Python (Pandas, NumPy)", "SQL", "Tableau", "Bloomberg Terminal", "Excel VBA"] },
    { category: "Soft Skills", items: ["Presentation", "Client Relations", "Critical Thinking", "Team Leadership"] }
  ],
  projects: [
    {
      name: "Algorithmic Trading Bot",
      technologies: "Python, API Integration",
      description: [
        "Developed a mean-reversion trading algorithm using Python backtested on 5 years of S&P 500 data.",
        "Achieved a Sharpe Ratio of 1.8 in simulated trading environments."
      ]
    }
  ],
  certifications: [
    { name: "Chartered Financial Analyst (CFA)", issuer: "CFA Institute", year: "2022" },
    { name: "Financial Modeling & Valuation Analyst", issuer: "CFI", year: "2019" }
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Mandarin", proficiency: "Professional Working" }
  ],
  customSections: [
    {
      id: "awards",
      title: "Awards & Honors",
      items: [
        {
          title: "Analyst of the Year",
          subtitle: "JP Morgan Chase",
          date: "2020",
          description: ["Awarded for exceptional performance in Q4 2020 portfolio restructuring."]
        }
      ]
    }
  ]
};
