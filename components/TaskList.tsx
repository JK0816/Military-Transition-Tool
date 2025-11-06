import React, { useMemo, useState } from 'react';
import type { Task, Phase } from '../types';
import { ProgressDonutChart } from './ProgressDonutChart';
import { BoltIcon } from './icons/BoltIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { parseDateAsUTC } from '../utils/dateUtils';

interface TaskListProps {
    phases: Phase[];
    onStatusChange: (id: number, status: Task['status']) => void;
    onDueDateChange: (taskId: number, dueDate: string) => void;
    onAddTask: (phaseIndex: number, task: Omit<Task, 'id' | 'status'>) => void;
    onDeleteTask: (taskId: number) => void;
}

const statusConfig: Record<Task['status'], { color: string, textColor: string }> = {
    'To Do': { color: 'bg-slate-600/50', textColor: 'text-slate-300' },
    'In Progress': { color: 'bg-yellow-600/50', textColor: 'text-yellow-200' },
    'Completed': { color: 'bg-green-600/50', textColor: 'text-green-200' },
};

const defaultStatusConfig = statusConfig['To Do'];

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

const TaskCard: React.FC<{ task: Task; onStatusChange: (id: number, status: Task['status']) => void; onDueDateChange: (taskId: number, dueDate: string) => void; onDeleteTask: (taskId: number) => void; }> = ({ task, onStatusChange, onDueDateChange, onDeleteTask }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const currentStatusConfig = statusConfig[task.status] || defaultStatusConfig;

    const handleSelectStatus = (status: Task['status']) => {
        onStatusChange(task.id, status);
        setIsMenuOpen(false);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDueDateChange(task.id, e.target.value);
    };

    const today = new Date();
    today.setHours(0,0,0,0); // Set to start of day for accurate comparison
    const dueDate = task.dueDate ? parseDateAsUTC(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && task.status !== 'Completed';

    return (
        <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/80 hover:border-slate-600 transition-all space-y-3 group">
            <div className="flex justify-between items-start">
                 <p className="text-slate-200 text-sm pr-4 flex-1">{task.text}</p>
                 <div className="relative flex-shrink-0 flex items-center">
                     <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100 mr-2"
                        aria-label={`Delete task: ${task.text}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)}
                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-80 transition-opacity ${currentStatusConfig.color} ${currentStatusConfig.textColor}`}
                    >
                        {task.status} <ChevronDownIcon className={`h-4 w-4 ml-1.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-8 w-32 bg-slate-900 border border-slate-600 rounded-md shadow-lg z-10 animate-fade-in">
                            {Object.keys(statusConfig).map((status) => (
                                <button
                                    key={status}
                                    onMouseDown={() => handleSelectStatus(status as Task['status'])}
                                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                <div className="flex items-center text-xs">
                    <CalendarIcon className={`h-4 w-4 mr-2 flex-shrink-0 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} />
                     <input
                        type="date"
                        id={`due-date-${task.id}`}
                        value={task.dueDate || ''}
                        onChange={handleDateChange}
                        aria-label="Due date"
                        className={`bg-transparent border-none rounded p-0 focus:outline-none focus:ring-0 w-[120px] ${isOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'}`}
                        style={{ colorScheme: 'dark' }}
                    />
                </div>

                {task.status !== 'Completed' && task.inertiaAction && (
                    <div className="text-xs text-amber-300 bg-amber-900/40 border border-amber-500/30 rounded-full px-3 py-1 flex items-center">
                        <BoltIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <strong className="font-semibold mr-1">First Step:</strong><span className="italic">{task.inertiaAction}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const AddTaskForm: React.FC<{ phaseIndex: number, onAddTask: TaskListProps['onAddTask'], onCancel: () => void }> = ({ phaseIndex, onAddTask, onCancel }) => {
    const [text, setText] = useState('');
    const [inertiaAction, setInertiaAction] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAddTask(phaseIndex, { text, inertiaAction, dueDate });
        setText('');
        setInertiaAction('');
        setDueDate('');
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 space-y-3 animate-fade-in">
             <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="New task description..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition"
                required
            />
             <div className="grid sm:grid-cols-2 gap-3 text-sm">
                 <input
                    type="text"
                    value={inertiaAction}
                    onChange={e => setInertiaAction(e.target.value)}
                    placeholder="Inertia breaker (optional)..."
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition"
                />
                 <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 transition"
                    style={{ colorScheme: 'dark' }}
                />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors">Save Task</button>
            </div>
        </form>
    );
}


export const TaskList: React.FC<TaskListProps> = ({ phases, onStatusChange, onDueDateChange, onAddTask, onDeleteTask }) => {
    const [openPhaseIndex, setOpenPhaseIndex] = useState<number | null>(0);
    const [addingTaskToPhase, setAddingTaskToPhase] = useState<number | null>(null);

    const { completedCount, totalCount, progress } = useMemo(() => {
        const allTasks = phases.flatMap(p => p.tasks);
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const total = allTasks.length;
        const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
        return { completedCount: completed, totalCount: total, progress: progressPercentage };
    }, [phases]);
    
    const togglePhase = (index: number) => {
        setOpenPhaseIndex(openPhaseIndex === index ? null : index);
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl h-full flex flex-col animate-fade-in">
            <h3 className="text-2xl font-bold text-sky-300 mb-6">Action Task Manager</h3>

            <div className="mb-6 flex items-center gap-x-6 gap-y-4 flex-wrap">
                <ProgressDonutChart progress={progress} />
                <div className="flex-1 min-w-[200px]">
                    <div className="flex justify-between items-center text-sm text-slate-300 mb-2">
                        <span>Overall Progress</span>
                        <span className="font-semibold">{completedCount} / {totalCount} Tasks Completed</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-sky-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>


            <div className="space-y-3">
                {phases.map((phase, index) => (
                    <div key={index} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden transition-all">
                        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-slate-700/30" onClick={() => togglePhase(index)}>
                            <div className="flex-grow mb-2 sm:mb-0">
                                <h4 className="font-semibold text-white">{phase.title}</h4>
                                <p className="text-xs text-slate-400">{formatDateRange(phase.startDate, phase.endDate)}</p>
                            </div>
                            <div className="flex items-center flex-shrink-0 w-full sm:w-auto">
                                <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1 mr-3">{phase.tasks.length} tasks</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setAddingTaskToPhase(index); setOpenPhaseIndex(index); }}
                                    className="p-1.5 text-slate-400 hover:text-sky-400 rounded-full hover:bg-slate-700/50 transition-colors mr-2"
                                    aria-label={`Add task to ${phase.title}`}
                                >
                                    <PlusCircleIcon className="h-5 w-5" />
                                </button>
                                <div className="p-1.5">
                                    {openPhaseIndex === index ? <ChevronDownIcon className="h-5 w-5 text-slate-400" /> : <ChevronRightIcon className="h-5 w-5 text-slate-400" />}
                                </div >
                            </div>
                        </div>
                         {(openPhaseIndex === index || addingTaskToPhase === index) && (
                             <div className="p-4 border-t border-slate-700/80 bg-slate-900/30">
                                <div className="space-y-3">
                                    {addingTaskToPhase === index && (
                                        <AddTaskForm 
                                            phaseIndex={index} 
                                            onAddTask={onAddTask} 
                                            onCancel={() => setAddingTaskToPhase(null)} 
                                        />
                                    )}
                                    {phase.tasks.length > 0 ? (
                                        phase.tasks.map(task => (
                                            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onDueDateChange={onDueDateChange} onDeleteTask={onDeleteTask} />
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-slate-500 py-4">No tasks in this phase yet.</p>
                                    )}
                                </div>
                            </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};
