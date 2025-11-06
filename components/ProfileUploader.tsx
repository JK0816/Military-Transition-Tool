import React, { useState, useRef } from 'react';
import type { UserProfile, DocumentFile } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UploadIcon } from './icons/UploadIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ProfileUploaderProps {
    onGeneratePlan: (profile: UserProfile) => void;
    isLoading: boolean;
}

type FormErrors = {
    targetRole?: string;
    documents?: string;
    retirementDate?: string;
    currentLeaveBalance?: string;
    ptdyDays?: string;
    cspDays?: string;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

export const ProfileUploader: React.FC<ProfileUploaderProps> = ({ onGeneratePlan, isLoading }) => {
    const [targetRole, setTargetRole] = useState('');
    const [targetLocations, setTargetLocations] = useState('');
    const [additionalConsiderations, setAdditionalConsiderations] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
    
    const [retirementDate, setRetirementDate] = useState('');
    const [currentLeaveBalance, setCurrentLeaveBalance] = useState<number | ''>(60);
    const [ptdyDays, setPtdyDays] = useState<number | ''>(10);
    const [cspDays, setCspDays] = useState<number | ''>(0);

    const [isDragging, setIsDragging] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (files: FileList | null) => {
        if (files && files.length > 0) {
            try {
                const newFiles = await Promise.all(
                    Array.from(files).map(async (file) => {
                        const base64Data = await fileToBase64(file);
                        return {
                            fileName: file.name,
                            mimeType: file.type,
                            data: base64Data,
                            uploadDate: new Date().toISOString(),
                        };
                    })
                );
                setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
                setFormErrors(prev => ({...prev, documents: undefined }));
            } catch (error) {
                console.error("Error converting files to base64:", error);
                 setFormErrors(prev => ({...prev, documents: "There was an error processing your files." }));
            }
        }
    };
    
    const handleRemoveFile = (fileName: string) => {
        setUploadedFiles(prevFiles => prevFiles.filter(f => f.fileName !== fileName));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        if (!targetRole.trim()) {
            errors.targetRole = 'Target role is required.';
        }
        if (uploadedFiles.length === 0) {
            errors.documents = 'At least one document is required.';
        }
        if (retirementDate && new Date(retirementDate) < new Date(new Date().toDateString())) {
            errors.retirementDate = 'Retirement date cannot be in the past.';
        }
        if (currentLeaveBalance !== '' && Number(currentLeaveBalance) < 0) {
            errors.currentLeaveBalance = 'Leave balance cannot be negative.';
        }
         if (ptdyDays !== '' && Number(ptdyDays) < 0) {
            errors.ptdyDays = 'PTDY days cannot be negative.';
        }
         if (cspDays !== '' && Number(cspDays) < 0) {
            errors.cspDays = 'CSP days cannot be negative.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const userProfile: UserProfile = {
            targetRole,
            targetLocations,
            additionalConsiderations,
            documents: uploadedFiles,
            retirementDate,
            currentLeaveBalance: currentLeaveBalance === '' ? undefined : Number(currentLeaveBalance),
            ptdyDays: ptdyDays === '' ? undefined : Number(ptdyDays),
            cspDays: cspDays === '' ? undefined : Number(cspDays),
        };
        onGeneratePlan(userProfile);
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 md:p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
                <SparklesIcon className="h-10 w-10 text-sky-400 mx-auto mb-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Create Your Transition Blueprint</h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
                    Enter your goals, upload your professional documents, and let our AI generate a personalized, step-by-step plan for your career move.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6 border-b border-slate-700 pb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="targetRole" className="block text-sm font-medium text-slate-300 mb-2">Target Role(s)</label>
                            <div className="relative">
                                <BriefcaseIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    id="targetRole"
                                    value={targetRole}
                                    onChange={(e) => { setTargetRole(e.target.value); setFormErrors(p => ({...p, targetRole: undefined})) }}
                                    placeholder="e.g., Software Engineer, Product Manager"
                                    className={`w-full bg-slate-900/70 border rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm ${formErrors.targetRole ? 'border-red-500' : 'border-slate-700'}`}
                                    required
                                    aria-invalid={!!formErrors.targetRole}
                                    aria-describedby={formErrors.targetRole ? "targetRole-error" : undefined}
                                />
                            </div>
                            {formErrors.targetRole && <p id="targetRole-error" className="mt-2 text-sm text-red-400">{formErrors.targetRole}</p>}
                        </div>
                        <div>
                            <label htmlFor="targetLocations" className="block text-sm font-medium text-slate-300 mb-2">Target Geographic Areas (Optional)</label>
                            <div className="relative">
                                <MapPinIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    id="targetLocations"
                                    value={targetLocations}
                                    onChange={(e) => setTargetLocations(e.target.value)}
                                    placeholder="e.g., Austin, TX; Remote"
                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Upload Your Professional Documents</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files)}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png"
                            multiple
                        />
                         <div
                            className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-900/20 scale-105' : formErrors.documents ? 'border-red-500' : 'border-slate-600 hover:border-sky-500 hover:bg-slate-800/60'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            aria-describedby={formErrors.documents ? "documents-error" : undefined}
                        >
                            <div className="text-center">
                                <UploadIcon className="mx-auto h-10 w-10 text-slate-500" />
                                <p className="mt-2 text-sm text-slate-400">
                                    <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">PDF, DOCX, TXT, RTF, ODT, images, etc.</p>
                            </div>
                        </div>
                        {formErrors.documents && <p id="documents-error" className="mt-2 text-sm text-red-400">{formErrors.documents}</p>}
                        
                        {uploadedFiles.length > 0 && (
                           <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {uploadedFiles.map((file) => (
                                   <div key={file.fileName} className="bg-slate-900/80 border border-slate-700 rounded-lg p-2.5 flex items-center justify-between text-sm">
                                       <div className="flex items-center overflow-hidden">
                                           <DocumentTextIcon className="h-6 w-6 text-sky-400 flex-shrink-0" />
                                           <div className="ml-3 overflow-hidden">
                                               <p className="font-medium text-white truncate">{file.fileName}</p>
                                               <p className="text-xs text-slate-400">Uploaded on {new Date(file.uploadDate).toLocaleDateString()}</p>
                                           </div>
                                       </div>
                                       <button
                                           type="button"
                                           onClick={() => handleRemoveFile(file.fileName)}
                                           className="ml-2 p-1 text-slate-500 hover:text-white rounded-full hover:bg-slate-700 transition-colors flex-shrink-0"
                                           aria-label={`Remove ${file.fileName}`}
                                       >
                                           <XCircleIcon className="h-5 w-5" />
                                       </button>
                                   </div>
                               ))}
                           </div>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                     <div className="flex items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-200">Retirement & Leave Details</h3>
                        <div className="relative group ml-2">
                            <InformationCircleIcon className="h-5 w-5 text-slate-500" />
                            <div className="absolute bottom-full mb-2 w-64 bg-slate-900 text-slate-300 text-xs rounded-lg p-3 border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Providing these details allows the AI to calculate your terminal leave and generate a highly accurate, reverse-engineered timeline.
                            </div>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="md:col-span-2 lg:col-span-1">
                             <label htmlFor="retirementDate" className="block text-sm font-medium text-slate-300 mb-2">Retirement Date</label>
                             <div className="relative">
                                 <CalendarDaysIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                 <input type="date" id="retirementDate" value={retirementDate} onChange={e => { setRetirementDate(e.target.value); setFormErrors(p => ({...p, retirementDate: undefined})) }} min={new Date().toISOString().split('T')[0]} className={`w-full bg-slate-900/70 border rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm ${formErrors.retirementDate ? 'border-red-500' : 'border-slate-700'}`} style={{colorScheme: 'dark'}} />
                             </div>
                             {formErrors.retirementDate && <p className="mt-2 text-sm text-red-400">{formErrors.retirementDate}</p>}
                        </div>
                         <div>
                             <label htmlFor="currentLeaveBalance" className="block text-sm font-medium text-slate-300 mb-2">Current Leave</label>
                             <div className="relative">
                                 <ClockIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                 <input type="number" id="currentLeaveBalance" value={currentLeaveBalance} onChange={e => {setCurrentLeaveBalance(e.target.value === '' ? '' : parseInt(e.target.value, 10)); setFormErrors(p => ({...p, currentLeaveBalance: undefined}))}} placeholder="e.g., 60" min="0" className={`w-full bg-slate-900/70 border rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm ${formErrors.currentLeaveBalance ? 'border-red-500' : 'border-slate-700'}`} />
                             </div>
                              {formErrors.currentLeaveBalance && <p className="mt-2 text-sm text-red-400">{formErrors.currentLeaveBalance}</p>}
                        </div>
                         <div>
                             <label htmlFor="ptdyDays" className="block text-sm font-medium text-slate-300 mb-2">PTDY Days</label>
                             <div className="relative">
                                 <ClockIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                 <input type="number" id="ptdyDays" value={ptdyDays} onChange={e => {setPtdyDays(e.target.value === '' ? '' : parseInt(e.target.value, 10)); setFormErrors(p => ({...p, ptdyDays: undefined}))}} placeholder="e.g., 10" min="0" className={`w-full bg-slate-900/70 border rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm ${formErrors.ptdyDays ? 'border-red-500' : 'border-slate-700'}`} />
                             </div>
                             {formErrors.ptdyDays && <p className="mt-2 text-sm text-red-400">{formErrors.ptdyDays}</p>}
                        </div>
                         <div>
                             <label htmlFor="cspDays" className="block text-sm font-medium text-slate-300 mb-2">CSP Days</label>
                             <div className="relative">
                                 <ClockIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3.5 transform -translate-y-1/2" />
                                 <input type="number" id="cspDays" value={cspDays} onChange={e => {setCspDays(e.target.value === '' ? '' : parseInt(e.target.value, 10)); setFormErrors(p => ({...p, cspDays: undefined}))}} placeholder="e.g., 120" min="0" className={`w-full bg-slate-900/70 border rounded-lg py-2.5 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm ${formErrors.cspDays ? 'border-red-500' : 'border-slate-700'}`} />
                             </div>
                             {formErrors.cspDays && <p className="mt-2 text-sm text-red-400">{formErrors.cspDays}</p>}
                        </div>
                     </div>
                </div>

                <div>
                    <label htmlFor="additionalConsiderations" className="flex items-center text-sm font-medium text-slate-300 mb-2">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-slate-400" />
                        Additional Considerations (Optional)
                    </label>
                    <textarea
                        id="additionalConsiderations"
                        rows={6}
                        value={additionalConsiderations}
                        onChange={(e) => setAdditionalConsiderations(e.target.value)}
                        placeholder="Mention any specific goals, constraints, or other factors for the AI to consider (e.g., desire for remote work, specific companies of interest, personal projects not on resume)..."
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-glow-sky disabled:from-slate-600 disabled:to-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="h-5 w-5 mr-2.5" />
                                Generating Blueprint...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="h-5 w-5 mr-2.5" />
                                Generate Blueprint
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
