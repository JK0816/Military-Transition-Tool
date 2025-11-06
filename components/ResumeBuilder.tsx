import React, { useState, useReducer } from 'react';
import type { TransitionPlan, UserProfile, AiGeneratedResumeExperience } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

// --- TYPE DEFINITIONS ---
interface ResumeState {
    name: string;
    contact: {
        location: string;
        phone: string;
        email: string;
        linkedin: string;
    };
    summary: string;
    skills: string;
    certifications: string;
    experience: ExperienceItem[];
    education: EducationItem[];
}

interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  location: string;
  dates: string;
  description: string;
}

interface EducationItem {
  id: number;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
}

type ResumeAction =
  | { type: 'UPDATE_FIELD'; field: 'name' | 'summary' | 'skills' | 'certifications'; value: string }
  | { type: 'UPDATE_CONTACT'; field: keyof ResumeState['contact']; value: string }
  | { type: 'UPDATE_EXPERIENCE'; id: number; field: keyof Omit<ExperienceItem, 'id'>; value: string }
  | { type: 'ADD_EXPERIENCE' }
  | { type: 'DELETE_EXPERIENCE'; id: number }
  | { type: 'UPDATE_EDUCATION'; id: number; field: keyof Omit<EducationItem, 'id'>; value: string }
  | { type: 'ADD_EDUCATION' }
  | { type: 'DELETE_EDUCATION'; id: number };

// --- REDUCER LOGIC ---
const resumeReducer = (state: ResumeState, action: ResumeAction): ResumeState => {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'UPDATE_CONTACT':
            return { ...state, contact: { ...state.contact, [action.field]: action.value } };
        case 'UPDATE_EXPERIENCE':
            return {
                ...state,
                experience: state.experience.map(exp =>
                    exp.id === action.id ? { ...exp, [action.field]: action.value } : exp
                ),
            };
        case 'ADD_EXPERIENCE':
            const newExp: ExperienceItem = {
                id: Date.now(),
                title: '[Job Title]', company: '[Company]', location: '[City, ST]', dates: '[Dates]', description: '• [Achievement]'
            };
            return { ...state, experience: [...state.experience, newExp] };
        case 'DELETE_EXPERIENCE':
            return { ...state, experience: state.experience.filter(exp => exp.id !== action.id) };
        case 'UPDATE_EDUCATION':
            return {
                ...state,
                education: state.education.map(edu =>
                    edu.id === action.id ? { ...edu, [action.field]: action.value } : edu
                ),
            };
        case 'ADD_EDUCATION':
             const newEdu: EducationItem = {
                id: Date.now(),
                degree: '[Degree]', school: '[School]', location: '[City, ST]', graduationDate: '[Year]'
            };
            return { ...state, education: [...state.education, newEdu] };
        case 'DELETE_EDUCATION':
            return { ...state, education: state.education.filter(edu => edu.id !== action.id) };
        default:
            return state;
    }
};

// --- EDITABLE FIELD COMPONENT ---
const EditableResumeField: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    tag?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
    inputType?: 'input' | 'textarea';
    className?: string;
    placeholder?: string;
}> = ({ value, onChange, tag = 'p', inputType = 'input', className, placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const Tag = tag;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
        setIsEditing(false);
    };
    
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        onChange(e.currentTarget.value);
        if (inputType === 'textarea') {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
        }
    };

    if (isEditing) {
        if (inputType === 'textarea') {
            return (
                <textarea
                    value={value}
                    onChange={handleInput}
                    onBlur={handleBlur}
                    autoFocus
                    placeholder={placeholder}
                    className={`bg-slate-100 border border-sky-500 rounded-sm p-1 w-full text-black focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed print-resume-p ${className}`}
                />
            );
        }
        return (
             <input
                type="text"
                value={value}
                onChange={handleInput}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                autoFocus
                placeholder={placeholder}
                className={`bg-slate-100 border border-sky-500 rounded-sm p-1 w-full text-black focus:outline-none focus:ring-1 focus:ring-sky-500 ${className}`}
            />
        );
    }
    
    return (
        <div className="relative group/edit w-full">
            <Tag
                onClick={() => setIsEditing(true)}
                className={`cursor-pointer hover:bg-slate-200/70 p-1 rounded-sm transition-colors whitespace-pre-wrap w-full ${!value ? 'text-gray-400 italic' : ''} ${className}`}
            >
                {value || placeholder}
            </Tag>
            <PencilIcon className="h-4 w-4 absolute top-1/2 right-1 -translate-y-1/2 text-slate-400 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
        </div>
    );
};

// --- MAIN RESUME BUILDER COMPONENT ---
interface ResumeBuilderProps {
    plan: TransitionPlan;
    userProfile: UserProfile;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ plan, userProfile }) => {
    
    const getInitialState = (): ResumeState => {
        const assessedSkills = plan.careerTeamFeedback.skillAssessments
            .filter(s => s.currentLevel >= 5) // Get skills where they are somewhat proficient
            .map(s => s.skillName);
        const allSkills = [...new Set([...assessedSkills, ...plan.skillsToDevelop])];

        const suggestedExperience = plan.careerTeamFeedback.suggestedResumeExperience;

        return {
            name: '[Your Name]',
            contact: {
                location: userProfile.targetLocations || '[City, State, Zip]',
                phone: '[Phone Number]',
                email: '[Email Address]',
                linkedin: '[LinkedIn Profile URL]'
            },
            summary: plan.careerTeamFeedback.overallImpression || 'AI-generated professional summary based on your profile and target role.',
            skills: allSkills.join(' | '),
            certifications: plan.certifications.map(c => `${c.name}${c.courseProvider ? ` - ${c.courseProvider}` : ''}`).join('\n'),
            experience: suggestedExperience && suggestedExperience.length > 0
                ? suggestedExperience.map((exp, index) => ({
                    ...exp,
                    id: Date.now() + index, // Generate a unique ID for React keys
                }))
                : [ // Fallback if AI doesn't provide a structured response
                    {
                        id: Date.now(),
                        title: '[CIVILIAN-EQUIVALENT JOB TITLE]',
                        company: '[Company/Unit Name]',
                        location: '[City, ST]',
                        dates: '[Start Date] – [End Date]',
                        description: `• Bullet point achievement 1. (e.g., Led a team of X personnel to achieve Y, resulting in a Z% improvement in efficiency.)
• Bullet point achievement 2. (e.g., Managed and maintained equipment valued at over $X million with 100% accountability.)
• Bullet point achievement 3. (e.g., Developed and implemented a new training program that increased team proficiency by X%.)
---
AI Suggestion: ${plan.careerTeamFeedback.resumeFeedback}`
                    }
                ],
            education: [
                {
                    id: Date.now(),
                    degree: '[Degree or Field of Study]',
                    school: '[University or Institution Name]',
                    location: '[City, ST]',
                    graduationDate: '[Graduation Year]'
                }
            ]
        };
    };

    const [state, dispatch] = useReducer(resumeReducer, undefined, getInitialState);

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl animate-fade-in">
             <div className="mb-6 pb-4 border-b border-slate-700 no-print">
                <div className="flex items-center">
                    <PencilIcon className="h-8 w-8 text-sky-300 mr-4" />
                    <div>
                        <h3 className="text-2xl font-bold text-white">AI-Assisted Resume Builder</h3>
                        <p className="text-sm text-slate-400">Click any section to edit the AI-generated content. Use the main 'Print' button above to export to PDF.</p>
                    </div>
                </div>
            </div>
            
            <div id="resume-content" className="bg-white text-black p-8 rounded-lg shadow-2xl font-serif print-resume">
                {/* Header */}
                <header className="text-center border-b-2 border-gray-700 pb-4 mb-6 print-resume-header">
                    <EditableResumeField value={state.name} onChange={v => dispatch({ type: 'UPDATE_FIELD', field: 'name', value: v })} tag="h1" inputType="input" className="text-4xl font-bold tracking-widest uppercase print-resume-name" placeholder="Your Name" />
                     <div className="flex justify-center items-center flex-wrap gap-x-4 text-sm mt-2 text-gray-600 print-resume-contact">
                        <EditableResumeField value={state.contact.location} onChange={v => dispatch({ type: 'UPDATE_CONTACT', field: 'location', value: v })} inputType="input" placeholder="City, State" />
                        <span>|</span>
                        <EditableResumeField value={state.contact.phone} onChange={v => dispatch({ type: 'UPDATE_CONTACT', field: 'phone', value: v })} inputType="input" placeholder="Phone" />
                         <span>|</span>
                        <EditableResumeField value={state.contact.email} onChange={v => dispatch({ type: 'UPDATE_CONTACT', field: 'email', value: v })} inputType="input" placeholder="Email" />
                         <span>|</span>
                        <EditableResumeField value={state.contact.linkedin} onChange={v => dispatch({ type: 'UPDATE_CONTACT', field: 'linkedin', value: v })} inputType="input" placeholder="LinkedIn URL" />
                    </div>
                </header>

                {/* Summary Section */}
                <section>
                    <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-3 uppercase tracking-wider print-resume-section-title">Professional Summary</h2>
                     <EditableResumeField value={state.summary} onChange={v => dispatch({ type: 'UPDATE_FIELD', field: 'summary', value: v })} tag="p" inputType="textarea" className="text-gray-800 leading-relaxed print-resume-p" />
                </section>

                 {/* Skills Section */}
                <section className="mt-6">
                    <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-3 uppercase tracking-wider print-resume-section-title">Core Competencies</h2>
                    <EditableResumeField value={state.skills} onChange={v => dispatch({ type: 'UPDATE_FIELD', field: 'skills', value: v })} tag="p" inputType="textarea" className="text-gray-800 leading-relaxed print-resume-p" />
                </section>

                {/* Professional Experience Section */}
                <section className="mt-6">
                    <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-3 uppercase tracking-wider print-resume-section-title">Professional Experience</h2>
                    <div className="space-y-5">
                         {state.experience.map(exp => (
                            <div key={exp.id} className="relative group/exp">
                                <div className="flex justify-between items-start gap-4">
                                    <EditableResumeField value={exp.title} onChange={v => dispatch({ type: 'UPDATE_EXPERIENCE', id: exp.id, field: 'title', value: v })} tag="h3" inputType="input" className="font-bold text-lg" placeholder="Job Title" />
                                    <EditableResumeField value={exp.dates} onChange={v => dispatch({ type: 'UPDATE_EXPERIENCE', id: exp.id, field: 'dates', value: v })} inputType="input" className="font-semibold text-right flex-shrink-0" placeholder="Dates" />
                                </div>
                                 <div className="flex justify-between items-start -mt-1 gap-4">
                                    <EditableResumeField value={exp.company} onChange={v => dispatch({ type: 'UPDATE_EXPERIENCE', id: exp.id, field: 'company', value: v })} inputType="input" className="italic" placeholder="Company Name" />
                                    <EditableResumeField value={exp.location} onChange={v => dispatch({ type: 'UPDATE_EXPERIENCE', id: exp.id, field: 'location', value: v })} inputType="input" className="italic text-right flex-shrink-0" placeholder="Location" />
                                </div>
                                <EditableResumeField value={exp.description} onChange={v => dispatch({ type: 'UPDATE_EXPERIENCE', id: exp.id, field: 'description', value: v })} inputType="textarea" className="mt-1 text-gray-800 leading-relaxed print-resume-p" placeholder="Describe your achievements..." />
                                <button onClick={() => dispatch({ type: 'DELETE_EXPERIENCE', id: exp.id })} className="no-print absolute top-0 -right-8 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/exp:opacity-100 transition-opacity" aria-label="Delete experience">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                         ))}
                    </div>
                     <button onClick={() => dispatch({ type: 'ADD_EXPERIENCE' })} className="no-print mt-4 flex items-center text-sm text-sky-600 hover:text-sky-800 font-semibold">
                        <PlusCircleIcon className="h-5 w-5 mr-1" /> Add Experience
                    </button>
                </section>

                {/* Education Section */}
                 <section className="mt-6">
                    <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-3 uppercase tracking-wider print-resume-section-title">Education</h2>
                    <div className="space-y-4">
                        {state.education.map(edu => (
                            <div key={edu.id} className="relative group/edu">
                                 <div className="flex justify-between items-start gap-4">
                                    <EditableResumeField value={edu.degree} onChange={v => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'degree', value: v })} tag="h3" inputType="input" className="font-bold text-lg" placeholder="Degree / Field of Study" />
                                    <EditableResumeField value={edu.graduationDate} onChange={v => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'graduationDate', value: v })} inputType="input" className="font-semibold text-right flex-shrink-0" placeholder="Graduation Year" />
                                </div>
                                <div className="flex justify-between items-start -mt-1 gap-4">
                                    <EditableResumeField value={edu.school} onChange={v => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'school', value: v })} inputType="input" className="italic" placeholder="School Name" />
                                    <EditableResumeField value={edu.location} onChange={v => dispatch({ type: 'UPDATE_EDUCATION', id: edu.id, field: 'location', value: v })} inputType="input" className="italic text-right flex-shrink-0" placeholder="Location" />
                                </div>
                                <button onClick={() => dispatch({ type: 'DELETE_EDUCATION', id: edu.id })} className="no-print absolute top-0 -right-8 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover/edu:opacity-100 transition-opacity" aria-label="Delete education">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => dispatch({ type: 'ADD_EDUCATION' })} className="no-print mt-3 flex items-center text-sm text-sky-600 hover:text-sky-800 font-semibold">
                        <PlusCircleIcon className="h-5 w-5 mr-1" /> Add Education
                    </button>
                </section>


                {/* Certifications Section */}
                {plan.certifications.length > 0 && (
                     <section className="mt-6">
                        <h2 className="text-xl font-bold border-b border-gray-400 pb-2 mb-3 uppercase tracking-wider print-resume-section-title">Certifications & Training</h2>
                         <EditableResumeField value={state.certifications} onChange={v => dispatch({ type: 'UPDATE_FIELD', field: 'certifications', value: v })} inputType="textarea" tag="div" className="text-gray-800 print-resume-p" />
                    </section>
                )}
            </div>
        </div>
    );
};