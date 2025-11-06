import React, { useState } from 'react';
import type { Certification } from '../types';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LinkIcon } from './icons/LinkIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CertificationsTrackerProps {
    certifications: Certification[];
    onStatusChange: (id: number, status: Certification['status']) => void;
    onAddCertification: (certification: Omit<Certification, 'id' | 'status'>) => void;
    onDeleteCertification: (certId: number) => void;
}

const statusConfig: Record<Certification['status'], { color: string, textColor: string }> = {
    'Recommended': { color: 'bg-slate-600/50', textColor: 'text-slate-300' },
    'In Progress': { color: 'bg-yellow-600/50', textColor: 'text-yellow-200' },
    'Completed': { color: 'bg-green-600/50', textColor: 'text-green-200' },
};

const defaultStatusConfig = statusConfig['Recommended'];

const CertificationItem: React.FC<{ cert: Certification; onStatusChange: (id: number, status: Certification['status']) => void; onDelete: (id: number) => void; }> = ({ cert, onStatusChange, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const currentStatusConfig = statusConfig[cert.status] || defaultStatusConfig;

    const handleSelectStatus = (status: Certification['status']) => {
        onStatusChange(cert.id, status);
        setIsMenuOpen(false);
    }

    return (
        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700/80 group">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                    <a href={cert.courseUrl} target="_blank" rel="noopener noreferrer" className="text-slate-200 text-sm font-semibold hover:text-sky-400 group-hover:text-sky-300 transition-colors">
                        {cert.name}
                        {cert.courseUrl && <LinkIcon className="h-3.5 w-3.5 inline-block ml-1.5 text-slate-500 group-hover:text-sky-400 transition-colors" />}
                    </a>
                    {cert.courseProvider && (
                         <p className="text-xs text-slate-400 mt-0.5">via {cert.courseProvider}</p>
                    )}
                </div>
                <div className="relative flex-shrink-0 flex items-center">
                     <button
                        onClick={() => onDelete(cert.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100 mr-2"
                        aria-label={`Delete certification: ${cert.name}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-80 transition-opacity ${currentStatusConfig.color} ${currentStatusConfig.textColor}`}
                    >
                        {cert.status} <ChevronDownIcon className={`h-4 w-4 ml-1.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-8 w-32 bg-slate-900 border border-slate-600 rounded-md shadow-lg z-10 animate-fade-in">
                            {Object.keys(statusConfig).map((status) => (
                                <button
                                    key={status}
                                    onMouseDown={() => handleSelectStatus(status as Certification['status'])}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {cert.reasoning && (
                 <p className="text-xs text-slate-400 italic mt-2 bg-slate-900/40 p-2 rounded-md border border-slate-700/50">"{cert.reasoning}"</p>
            )}
        </div>
    );
};

const AddCertificationForm: React.FC<{ onAdd: CertificationsTrackerProps['onAddCertification'], onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [name, setName] = useState('');
    const [courseProvider, setCourseProvider] = useState('');
    const [courseUrl, setCourseUrl] = useState('');
    const [reasoning, setReasoning] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd({ name, courseProvider, courseUrl, reasoning });
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 rounded-lg border border-slate-600 space-y-3 mb-3 animate-fade-in">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Certification Name*" required className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition" />
            <input type="text" value={courseProvider} onChange={e => setCourseProvider(e.target.value)} placeholder="Course Provider" className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition" />
            <input type="url" value={courseUrl} onChange={e => setCourseUrl(e.target.value)} placeholder="Course URL" className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition" />
            <textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Reasoning (optional)" rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition" />
            <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors">Add</button>
            </div>
        </form>
    );
};


export const CertificationsTracker: React.FC<CertificationsTrackerProps> = ({ certifications, onStatusChange, onAddCertification, onDeleteCertification }) => {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl h-full">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center">
                    <div className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg mr-4">
                        <AcademicCapIcon className="h-6 w-6 text-sky-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-sky-300">Certifications & Training</h3>
                </div>
                 <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center text-sm text-slate-400 hover:text-sky-400 transition-colors"
                    aria-label={isAdding ? 'Cancel adding certification' : 'Add new certification'}
                >
                    <PlusCircleIcon className="h-5 w-5 mr-1" /> Add
                </button>
            </div>

            {isAdding && <AddCertificationForm onAdd={onAddCertification} onCancel={() => setIsAdding(false)} />}
            
            {certifications.length > 0 ? (
                <div className="space-y-3">
                    {certifications.map(cert => (
                        <CertificationItem key={cert.id} cert={cert} onStatusChange={onStatusChange} onDelete={onDeleteCertification} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-sm text-slate-500 py-6">
                    No specific certifications were recommended.
                </div>
            )}
        </div>
    );
};