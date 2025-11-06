import React from 'react';
import type { Phase, RecommendedCourse, Task } from '../types';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LinkIcon } from './icons/LinkIcon';
import { BoltIcon } from './icons/BoltIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TimelineGanttChart } from './TimelineGanttChart';
import { parseDateAsUTC } from '../utils/dateUtils';

interface ActionableTimelineProps {
    phases: Phase[];
    recommendedCourses: RecommendedCourse[];
    onTaskStatusChange: (taskId: number, status: Task['status']) => void;
    onTaskDueDateChange: (taskId: number, dueDate: string) => void;
    onDeleteTask: (taskId: number) => void;
}

const statusConfig: Record<Task['status'], { ring: string, text: string, bg: string, icon: string }> = {
    'To Do': { ring: 'ring-slate-500', text: 'text-slate-400', bg: 'bg-slate-800', icon: 'border-slate-500' },
    'In Progress': { ring: 'ring-yellow-500', text: 'text-yellow-300', bg: 'bg-yellow-900/50', icon: 'border-yellow-500 animate-pulse' },
    'Completed': { ring: 'ring-green-500', text: 'text-green-400', bg: 'bg-green-900/40', icon: 'bg-green-500 border-green-500' },
};

const TaskItem: React.FC<{ task: Task, onStatusChange: ActionableTimelineProps['onTaskStatusChange'], onDueDateChange: ActionableTimelineProps['onTaskDueDateChange'], onDeleteTask: ActionableTimelineProps['onDeleteTask'] }> = ({ task, onStatusChange, onDueDateChange, onDeleteTask }) => {
    const currentStatus = statusConfig[task.status];
    
    const toggleStatus = () => {
        if (task.status === 'Completed') onStatusChange(task.id, 'To Do');
        else if (task.status === 'To Do') onStatusChange(task.id, 'In Progress');
        else if (task.status === 'In Progress') onStatusChange(task.id, 'Completed');
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDueDateChange(task.id, e.target.value);
    };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = task.dueDate ? parseDateAsUTC(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && task.status !== 'Completed';

    return (
        <div className={`p-3 rounded-lg transition-colors border border-transparent hover:bg-slate-700/40 hover:border-slate-600 ${currentStatus.bg}`}>
            <div className="flex items-start justify-between group">
                <div className="flex items-start flex-grow">
                    <button onClick={toggleStatus} className="flex-shrink-0 h-5 w-5 mt-0.5 mr-3 rounded-full border-2 flex items-center justify-center transition-all" aria-label={`Toggle status for ${task.text}`}>
                        <div className={`h-5 w-5 rounded-full border-2 ${currentStatus.icon}`}>
                             {task.status === 'Completed' && <CheckCircleIcon className="h-4 w-4 text-white" />}
                        </div>
                    </button>
                    <div className="flex-grow">
                        <p className={`text-sm ${currentStatus.text} ${task.status === 'Completed' ? 'line-through' : ''}`}>{task.text}</p>
                    </div>
                </div>
                <button onClick={() => onDeleteTask(task.id)} className="ml-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label={`Delete task: ${task.text}`}>
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
            <div className="pl-8 mt-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                 <div className="flex items-center text-xs">
                    <CalendarIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} />
                     <input
                        type="date"
                        id={`timeline-due-date-${task.id}`}
                        value={task.dueDate || ''}
                        onChange={handleDateChange}
                        aria-label="Due date"
                        className={`bg-transparent border-none rounded p-0 focus:outline-none focus:ring-0 w-[120px] ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
                {task.inertiaAction && task.status !== 'Completed' && (
                    <div className="text-xs text-amber-300/80 flex items-center">
                        <BoltIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span><strong className="font-semibold">First step:</strong> {task.inertiaAction}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// A utility to format date ranges for display
const formatDateRange = (start: string, end: string): string => {
    try {
        const startDate = parseDateAsUTC(start);
        const endDate = parseDateAsUTC(end);
        
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };

        if (start === end) {
            return startDate.toLocaleDateString('en-US', { ...options, year: 'numeric', timeZone: 'UTC' });
        }
        
        const yearOpt: Intl.DateTimeFormatOptions = { year: 'numeric', timeZone: 'UTC' };

        if (startDate.getUTCFullYear() !== endDate.getUTCFullYear()) {
            return `${startDate.toLocaleDateString('en-US', { ...options, ...yearOpt })} - ${endDate.toLocaleDateString('en-US', { ...options, ...yearOpt })}`;
        }
        
        if (startDate.getUTCMonth() !== endDate.getUTCMonth()) {
            return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, ...yearOpt })}`;
        }
        
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${endDate.getUTCDate()}, ${endDate.getUTCFullYear()}`;
    } catch (e) {
        return "Invalid date range";
    }
};

export const ActionableTimeline: React.FC<ActionableTimelineProps> = ({ phases, recommendedCourses, onTaskStatusChange, onTaskDueDateChange, onDeleteTask }) => {

    const isCurrentPhase = (phase: Phase): boolean => {
        try {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const startDate = parseDateAsUTC(phase.startDate);
            const endDate = parseDateAsUTC(phase.endDate);
            endDate.setUTCHours(23, 59, 59, 999);

            return today >= startDate && today <= endDate;
        } catch (e) {
            console.error("Invalid date format in phase:", phase);
            return false;
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center mb-4 pb-3 border-b border-slate-700">
                <div className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg mr-4">
                    <CalendarDaysIcon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="text-lg font-semibold text-sky-300">Actionable Timeline & Training Plan</h3>
            </div>
            
            <div className="mb-8">
                <TimelineGanttChart phases={phases} />
            </div>

            <div className="relative pl-6">
                <div className="absolute left-6 top-0 h-full w-0.5 bg-slate-700" />

                {phases.map((phase, index) => {
                    const coursesForPhase = recommendedCourses.filter(c => phase.recommendedCourseIds.includes(c.id));
                    const current = isCurrentPhase(phase);

                    return (
                        <div key={phase.id} className="relative mb-8 pl-8">
                            <div className={`absolute -left-2.5 top-1 h-5 w-5 rounded-full border-4 border-slate-800 ${current ? 'bg-sky-400 animate-pulse' : 'bg-slate-500'}`} title={current ? "Current Phase" : ""} />

                            <div className={`p-5 rounded-2xl border ${current ? 'bg-slate-800 border-sky-500/50 shadow-glow-sky' : 'bg-slate-800/60 border-slate-700'}`}>
                                <p className="text-sm text-slate-400">{formatDateRange(phase.startDate, phase.endDate)}</p>
                                <h4 className="text-lg font-bold text-white mt-1">{phase.title}</h4>
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{phase.objective}</p>
                                
                                {coursesForPhase.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-semibold text-sky-300 text-sm mb-2 flex items-center"><AcademicCapIcon className="h-4 w-4 mr-2" /> Recommended Courses</h5>
                                        <div className="space-y-2">
                                            {coursesForPhase.map(course => (
                                                <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-900/60 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors group">
                                                    <p className="font-semibold text-slate-200 group-hover:text-sky-400">{course.courseName} <LinkIcon className="h-3.5 w-3.5 inline-block ml-1 opacity-60" /></p>
                                                    <p className="text-xs text-slate-400">by {course.provider}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {phase.tasks.length > 0 && (
                                     <div className="mt-4">
                                        <h5 className="font-semibold text-sky-300 text-sm mb-2 flex items-center"><CheckCircleIcon className="h-4 w-4 mr-2" /> Action Items</h5>
                                         <div className="space-y-1">
                                            {phase.tasks.map(task => (
                                                <TaskItem key={task.id} task={task} onStatusChange={onTaskStatusChange} onDueDateChange={onTaskDueDateChange} onDeleteTask={onDeleteTask} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
