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

interface ProfileUploaderProps {
    onGeneratePlan: (profile: UserProfile) => void;
    isLoading: boolean;
}

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
    const [isDragging, setIsDragging] = useState(false);
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
            } catch (error) {
                console.error("Error converting files to base64:", error);
                // Handle error (e.g., show a notification to the user)
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userProfile: UserProfile = {
            targetRole,
            targetLocations,
            additionalConsiderations,
            documents: uploadedFiles
        };
        onGeneratePlan(userProfile);
    };

    const isFormValid = targetRole.trim() !== '' && uploadedFiles.length > 0;

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 md:p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-6">
                <SparklesIcon className="h-8 w-8 text-sky-400 mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Create Your Transition Plan</h2>
            </div>
            <p className="text-slate-400 mb-6">
                Enter your target role, then upload your professional documents (like a resume or performance reviews). Our AI will infer your experience and generate a personalized, step-by-step blueprint for your career move.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="targetRole" className="block text-sm font-medium text-slate-300 mb-2">Target Role(s)</label>
                        <div className="relative">
                            <BriefcaseIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3 transform -translate-y-1/2" />
                            <input
                                type="text"
                                id="targetRole"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g., Software Engineer, Product Manager"
                                className="w-full bg-slate-900 border border-slate-600 rounded-md py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="targetLocations" className="block text-sm font-medium text-slate-300 mb-2">Target Geographic Areas (Optional)</label>
                        <div className="relative">
                            <MapPinIcon className="h-5 w-5 text-slate-500 absolute top-1/2 left-3 transform -translate-y-1/2" />
                            <input
                                type="text"
                                id="targetLocations"
                                value={targetLocations}
                                onChange={(e) => setTargetLocations(e.target.value)}
                                placeholder="e.g., Austin, TX; Remote"
                                className="w-full bg-slate-900 border border-slate-600 rounded-md py-2.5 pl-10 pr-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
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
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        multiple
                    />
                     <div
                        className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-md cursor-pointer transition-colors ${isDragging ? 'border-sky-500 bg-sky-900/20' : 'border-slate-600 hover:border-sky-500 hover:bg-slate-800'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <UploadIcon className="mx-auto h-10 w-10 text-slate-500" />
                            <p className="mt-2 text-sm text-slate-400">
                                <span className="font-semibold text-sky-400">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">PDF, DOCX, TXT, JPG, PNG, etc.</p>
                        </div>
                    </div>
                    
                    {uploadedFiles.length > 0 && (
                       <div className="mt-4 space-y-2">
                           {uploadedFiles.map((file) => (
                               <div key={file.fileName} className="bg-slate-900 border border-slate-700 rounded-md p-2 flex items-center justify-between text-sm">
                                   <div className="flex items-center overflow-hidden">
                                       <DocumentTextIcon className="h-5 w-5 text-sky-400 flex-shrink-0" />
                                       <div className="ml-2 overflow-hidden">
                                           <p className="font-medium text-white truncate">{file.fileName}</p>
                                           <p className="text-xs text-slate-400">Uploaded on {new Date(file.uploadDate).toLocaleDateString()}</p>
                                       </div>
                                   </div>
                                   <button
                                       type="button"
                                       onClick={() => handleRemoveFile(file.fileName)}
                                       className="ml-2 p-1 text-slate-500 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
                                       aria-label={`Remove ${file.fileName}`}
                                   >
                                       <XCircleIcon className="h-5 w-5" />
                                   </button>
                               </div>
                           ))}
                       </div>
                    )}
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
                        className="w-full bg-slate-900 border border-slate-600 rounded-md py-3 px-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerIcon className="h-5 w-5 mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Generate Blueprint
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};