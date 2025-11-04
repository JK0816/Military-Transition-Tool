import React, { useMemo, useState } from 'react';
import type { Task, Sprint } from '../types';
import { ProgressDonutChart } from './ProgressDonutChart';
import { BoltIcon } from './icons/BoltIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface TaskListProps {
    sprints: Sprint[];
    onStatusChange: (id: number, status: Task['status']) => void;
    onDueDateChange: (taskId: number, dueDate: string) => void;
}

const statusConfig: Record<Task['status'], { color: string, textColor: string }> = {
    'To Do': { color: 'bg-slate-600', textColor: 'text-slate-300' },
    'In Progress': { color: 'bg-yellow-600', textColor: 'text-yellow-200' },
    'Completed': { color: 'bg-green-600', textColor: 'text-green-200' },
};

const TaskCard: React.FC<{ task: Task; onStatusChange: (id: number, status: Task['status']) => void; onDueDateChange: (taskId: number, dueDate: string) => void; }> = ({ task, onStatusChange, onDueDateChange }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleSelectStatus = (status: Task['status']) => {
        onStatusChange(task.id, status);
        setIsMenuOpen(false);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDueDateChange(task.id, e.target.value);
    };

    const today = new Date();
    today.setHours(0,0,0,0); // Set to start of day for accurate comparison
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && task.status !== 'Completed';

    return (
        <div className="bg-slate-800 p-3 rounded-md border border-slate-700/50 hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                 <p className="text-slate-200 text-sm pr-4">{task.text}</p>
                 <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        onBlur={() => setIsMenuOpen(false)}
                        className={`inline-flex items-center text-xs px-2 py-1 rounded-md hover:opacity-80 transition-opacity ${statusConfig[task.status].color} ${statusConfig[task.status].textColor}`}
                    >
                        {task.status} <ChevronDownIcon className={`h-3 w-3 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-slate-600 rounded-md shadow-lg z-10">
                            {Object.keys(statusConfig).map((status) => (
                                <button
                                    key={status}
                                    onMouseDown={() => handleSelectStatus(status as Task['status'])}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-2">
                <div className="flex items-center text-xs">
                    <CalendarIcon className={`h-4 w-4 mr-1.5 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                        type="date"
                        id={`due-date-${task.id}`}
                        value={task.dueDate || ''}
                        onChange={handleDateChange}
                        aria-label="Due date"
                        className={`bg-slate-700/50 border border-transparent rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-[130px] ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}
                        style={{ colorScheme: 'dark' }}
                    />
                </div>

                {task.status !== 'Completed' && task.inertiaAction && (
                    <div className="text-xs text-amber-300 bg-amber-900/30 border border-amber-500/20 rounded-full px-2 py-1 flex items-center">
                        <BoltIcon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <strong className="hidden xs:inline mr-1">Breaker:</strong><span className="italic">{task.inertiaAction}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TaskList: React.FC<TaskListProps> = ({ sprints, onStatusChange, onDueDateChange }) => {
    const [openSprintIndex, setOpenSprintIndex] = useState<number | null>(0);

    const { completedCount, totalCount, progress } = useMemo(() => {
        const allTasks = sprints.flatMap(s => s.tasks);
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const total = allTasks.length;
        const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
        return { completedCount: completed, totalCount: total, progress: progressPercentage };
    }, [sprints]);
    
    const toggleSprint = (index: number) => {
        setOpenSprintIndex(openSprintIndex === index ? null : index);
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg h-full flex flex-col">
            <h3 className="text-2xl font-bold text-sky-400 mb-4">Action Sprints</h3>

            <div className="mb-4 flex items-center gap-4">
                <ProgressDonutChart progress={progress} />
                <div className="flex-1">
                    <div className="flex justify-between items-center text-sm text-slate-300 mb-1">
                        <span>Overall Progress</span>
                        <span>{completedCount} / {totalCount} Tasks Completed</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>


            <div className="space-y-2">
                {sprints.map((sprint, index) => (
                    <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                        <button onClick={() => toggleSprint(index)} className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-700/50 transition-colors">
                             <div>
                                <h4 className="font-semibold text-white">{sprint.title}</h4>
                                <p className="text-xs text-slate-400">{sprint.dateRange}</p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xs bg-slate-700 text-slate-400 rounded-full px-2 py-0.5 mr-3">{sprint.tasks.length} tasks</span>
                                {openSprintIndex === index ? <ChevronDownIcon className="h-5 w-5 text-slate-400" /> : <ChevronRightIcon className="h-5 w-5 text-slate-400" />}
                            </div>
                        </button>
                         {openSprintIndex === index && (
                             <div className="p-3 border-t border-slate-700">
                                <div className="space-y-2">
                                    {sprint.tasks.map(task => (
                                        <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onDueDateChange={onDueDateChange} />
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};