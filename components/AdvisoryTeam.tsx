import React from 'react';
import { HiringManagerIcon } from './icons/HiringManagerIcon';
import { RecruiterIcon } from './icons/RecruiterIcon';
import { CareerCounselorIcon } from './icons/CareerCounselorIcon';
import { ResumeWriterIcon } from './icons/ResumeWriterIcon';
import { HrHeadIcon } from './icons/HrHeadIcon';


const advisors = [
    { name: 'Senior Hiring Manager', role: 'Team Lead', icon: <HiringManagerIcon className="h-8 w-8 text-sky-300" /> },
    { name: 'Technical Recruiter', role: 'Talent Acquisition', icon: <RecruiterIcon className="h-8 w-8 text-sky-300" /> },
    { name: 'Head of HR', role: 'Compliance & Culture', icon: <HrHeadIcon className="h-8 w-8 text-sky-300" /> },
    { name: 'Career Counselor', role: 'Strategy & Growth', icon: <CareerCounselorIcon className="h-8 w-8 text-sky-300" /> },
    { name: 'Resume Writer', role: 'Professional Branding', icon: <ResumeWriterIcon className="h-8 w-8 text-sky-300" /> },
];

export const AdvisoryTeam: React.FC = () => {
    return (
        <div className="no-print">
            <h4 className="font-semibold text-sky-400 mb-3">Your AI Advisory Team:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {advisors.map(advisor => (
                    <div key={advisor.name} className="text-center bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                        <div className="w-16 h-16 mx-auto bg-slate-900/50 rounded-full flex items-center justify-center border-2 border-slate-600">
                            {advisor.icon}
                        </div>
                        <p className="text-sm font-semibold text-white mt-2">{advisor.name}</p>
                        <p className="text-xs text-slate-400">{advisor.role}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};