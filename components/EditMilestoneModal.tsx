import React, { useState, useEffect } from 'react';
import type { Milestone } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface EditMilestoneModalProps {
    milestone: Milestone | null;
    onSave: (updatedMilestone: Milestone) => void;
    onClose: () => void;
}

export const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({ milestone, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (milestone) {
            setTitle(milestone.title);
            setDescription(milestone.description);
        }
    }, [milestone]);

    if (!milestone) return null;

    const handleSave = () => {
        onSave({ ...milestone, title, description });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-lg p-6 m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Edit Milestone</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="milestoneTitle" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                        <input
                            id="milestoneTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="milestoneDescription" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                        <textarea
                            id="milestoneDescription"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
