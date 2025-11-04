import React, { useState, useMemo } from 'react';
import type { Milestone } from '../types';
import { EditMilestoneModal } from './EditMilestoneModal';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { StarIcon } from './icons/StarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface MonthlyActionListProps {
    milestones: Milestone[];
    onUpdateMilestone: (updatedMilestone: Milestone) => void;
}

const milestoneConfig: Record<Milestone['type'], { icon: React.ReactNode; color: string; }> = {
    'Skill Development': { icon: <CodeBracketIcon className="h-5 w-5 text-purple-300" />, color: 'border-purple-500' },
    'Networking': { icon: <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-300" />, color: 'border-green-500' },
    'Application': { icon: <PaperAirplaneIcon className="h-5 w-5 text-blue-300" />, color: 'border-blue-500' },
    'Project Work': { icon: <LightBulbIcon className="h-5 w-5 text-yellow-300" />, color: 'border-yellow-500' },
    'Personal Branding': { icon: <StarIcon className="h-5 w-5 text-pink-300" />, color: 'border-pink-500' }
};

export const MonthlyActionList: React.FC<MonthlyActionListProps> = ({ milestones, onUpdateMilestone }) => {
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    const milestonesByMonth = useMemo(() => {
        const grouped: Record<string, Milestone[]> = {};
        const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        sortedMilestones.forEach(m => {
            const monthKey = new Date(m.date).toLocaleDateString('default', { year: 'numeric', month: 'long' });
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(m);
        });
        return grouped;
    }, [milestones]);

    const handleSaveMilestone = (updatedMilestone: Milestone) => {
        onUpdateMilestone(updatedMilestone);
        setEditingMilestone(null);
    };

    return (
        <>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg h-full">
                <div className="flex items-center mb-4">
                    <div className="bg-slate-700 p-2 rounded-full mr-3">
                        <CalendarDaysIcon className="h-6 w-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold text-sky-400">Monthly Action List</h3>
                </div>
                <div className="space-y-6">
                    {Object.entries(milestonesByMonth).map(([month, monthMilestones]) => (
                        <div key={month}>
                            <h4 className="text-lg font-semibold text-white mb-2">{month}</h4>
                            <div className="space-y-3">
                                {monthMilestones.map(m => (
                                    <div key={m.id} className={`p-3 bg-slate-800 rounded-md border-l-4 ${milestoneConfig[m.type]?.color}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex">
                                                <div className="mr-3 flex-shrink-0 mt-1">{milestoneConfig[m.type]?.icon}</div>
                                                <div>
                                                    <p className="font-semibold text-slate-200">{m.title}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEditingMilestone(m)}
                                                className="ml-2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 flex-shrink-0"
                                                aria-label="Edit milestone"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <EditMilestoneModal
                milestone={editingMilestone}
                onSave={handleSaveMilestone}
                onClose={() => setEditingMilestone(null)}
            />
        </>
    );
};
