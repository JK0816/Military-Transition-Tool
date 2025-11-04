import React from 'react';
import type { Certification } from '../types';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LinkIcon } from './icons/LinkIcon';

interface CertificationsTrackerProps {
    certifications: Certification[];
    onStatusChange: (id: number, status: Certification['status']) => void;
}

const statusConfig: Record<Certification['status'], { color: string, textColor: string }> = {
    'Recommended': { color: 'bg-slate-600', textColor: 'text-slate-300' },
    'In Progress': { color: 'bg-yellow-600', textColor: 'text-yellow-200' },
    'Completed': { color: 'bg-green-600', textColor: 'text-green-200' },
};

const CertificationItem: React.FC<{ cert: Certification; onStatusChange: (id: number, status: Certification['status']) => void; }> = ({ cert, onStatusChange }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleSelectStatus = (status: Certification['status']) => {
        onStatusChange(cert.id, status);
        setIsMenuOpen(false);
    }

    return (
        <div className="p-3 bg-slate-800 rounded-md border border-slate-700/50">
            <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                    <a href={cert.courseUrl} target="_blank" rel="noopener noreferrer" className="text-slate-200 text-sm font-semibold hover:text-sky-400 group transition-colors">
                        {cert.name}
                        <LinkIcon className="h-3 w-3 inline-block ml-1.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                    </a>
                    {cert.courseProvider && (
                         <p className="text-xs text-slate-400">via {cert.courseProvider}</p>
                    )}
                </div>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        onBlur={() => setIsMenuOpen(false)}
                        className={`inline-flex items-center text-xs px-2 py-1 rounded-md hover:opacity-80 transition-opacity ${statusConfig[cert.status].color} ${statusConfig[cert.status].textColor}`}
                    >
                        {cert.status} <ChevronDownIcon className={`h-3 w-3 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-600 rounded-md shadow-lg z-10">
                            {Object.keys(statusConfig).map((status) => (
                                <button
                                    key={status}
                                    onMouseDown={() => handleSelectStatus(status as Certification['status'])}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {cert.reasoning && (
                 <p className="text-xs text-slate-500 italic mt-2 bg-slate-900/40 p-2 rounded-md">"{cert.reasoning}"</p>
            )}
        </div>
    );
};

export const CertificationsTracker: React.FC<CertificationsTrackerProps> = ({ certifications, onStatusChange }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg h-full">
            <div className="flex items-center mb-4">
                <div className="bg-slate-700 p-2 rounded-full mr-3">
                    <AcademicCapIcon className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-sky-400">Certifications & Training</h3>
            </div>
            {certifications.length > 0 ? (
                <div className="space-y-3">
                    {certifications.map(cert => (
                        <CertificationItem key={cert.id} cert={cert} onStatusChange={onStatusChange} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-slate-500 py-4">
                    No specific certifications were recommended.
                </div>
            )}
        </div>
    );
};
