import React, { useState, useMemo } from 'react';
import type { Milestone } from '../types';
import { EditMilestoneModal } from './EditMilestoneModal';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { StarIcon } from './icons/StarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface TimelineGanttChartProps {
    milestones: Milestone[];
    onUpdateMilestone: (updatedMilestone: Milestone) => void;
}

const milestoneConfig: Record<Milestone['type'], { icon: React.ReactNode; color: string; bgColor: string; }> = {
    'Skill Development': { icon: <CodeBracketIcon className="h-5 w-5" />, color: 'text-purple-300', bgColor: 'bg-purple-500/20' },
    'Networking': { icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, color: 'text-green-300', bgColor: 'bg-green-500/20' },
    'Application': { icon: <PaperAirplaneIcon className="h-5 w-5" />, color: 'text-blue-300', bgColor: 'bg-blue-500/20' },
    'Project Work': { icon: <LightBulbIcon className="h-5 w-5" />, color: 'text-yellow-300', bgColor: 'bg-yellow-500/20' },
    'Personal Branding': { icon: <StarIcon className="h-5 w-5" />, color: 'text-pink-300', bgColor: 'bg-pink-500/20' }
};

const monthDiff = (d1: Date, d2: Date): number => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export const TimelineGanttChart: React.FC<TimelineGanttChartProps> = ({ milestones, onUpdateMilestone }) => {
    const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

    const { timelineStart, timelineEnd, totalMonths, monthLabels } = useMemo(() => {
        if (milestones.length === 0) {
            const now = new Date();
            return {
                timelineStart: now,
                timelineEnd: addMonths(now, 5),
                totalMonths: 6,
                monthLabels: Array.from({ length: 6 }, (_, i) => addMonths(now, i))
            };
        }
        
        const sorted = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const startDate = new Date();
        const endDate = new Date(sorted[sorted.length - 1].date);

        const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

        const totalMonths = monthDiff(start, end) + 1;
        const labels = Array.from({ length: totalMonths }, (_, i) => addMonths(start, i));
        
        return { timelineStart: start, timelineEnd: end, totalMonths, monthLabels: labels };
    }, [milestones]);

    const getMilestonePosition = (dateStr: string) => {
        const date = new Date(dateStr);
        const diffTime = Math.abs(date.getTime() - timelineStart.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        const totalDurationDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
        
        return (diffDays / totalDurationDays) * 100;
    };

    const handleSaveMilestone = (updatedMilestone: Milestone) => {
        onUpdateMilestone(updatedMilestone);
        setEditingMilestone(null);
    };

    return (
        <>
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg h-full">
                <div className="flex items-center mb-6">
                    <div className="bg-slate-700 p-2 rounded-full mr-3">
                        <CalendarDaysIcon className="h-6 w-6 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold text-sky-400">Transition Timeline</h3>
                </div>
                
                <div className="relative overflow-x-auto">
                    {/* Month Headers */}
                    <div className="flex w-full text-xs text-slate-400 border-b border-slate-600">
                        {monthLabels.map((month, i) => (
                             <div key={i} className="flex-1 text-center py-1 font-semibold" style={{ minWidth: '100px' }}>
                                {month.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                            </div>
                        ))}
                    </div>

                    {/* Timeline Rail */}
                     <div className="h-24 w-full flex relative mt-2">
                        {monthLabels.map((_, i) => (
                             <div key={i} className="flex-1 border-r border-slate-700 h-full"></div>
                        ))}
                         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-600 -translate-y-1/2"></div>
                    </div>
                    
                    {/* Milestones */}
                    <div className="relative h-full w-full -mt-24">
                        {milestones.map((m, index) => {
                            const config = milestoneConfig[m.type];
                            const position = getMilestonePosition(m.date);
                            const verticalOffset = (index % 5) * 20; // Stagger vertically to avoid overlap

                            return (
                                <div 
                                    key={m.id} 
                                    className="absolute group"
                                    style={{ left: `${position}%`, top: `${verticalOffset}px` }}
                                >
                                    <div className="relative">
                                        <button 
                                            onClick={() => setEditingMilestone(m)}
                                            className={`flex items-center justify-center h-8 w-8 rounded-full border-2 border-slate-500 cursor-pointer transition-all ${config.bgColor} hover:scale-110 hover:border-sky-400`}
                                            aria-label={`Edit milestone: ${m.title}`}
                                        >
                                            <span className={config.color}>{config.icon}</span>
                                        </button>
                                        <div className="absolute bottom-full mb-2 w-48 p-2 bg-slate-900 border border-slate-600 rounded-md shadow-lg text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none left-1/2 -translate-x-1/2 z-10">
                                            <p className="font-bold text-sm text-white">{m.title}</p>
                                            <p className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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