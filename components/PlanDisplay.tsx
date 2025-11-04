import React, { useState, useEffect } from 'react';
import type { TransitionPlan, Milestone, Task, Sprint, Certification, CompanyProspect, GroundingChunk } from '../types';
import { MonthlyActionList } from './MonthlyActionList';
import { TaskList } from './TaskList';
import { CertificationsTracker } from './CertificationsTracker';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ThumbUpIcon } from './icons/ThumbUpIcon';
import { ThumbDownIcon } from './icons/ThumbDownIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { LinkIcon } from './icons/LinkIcon';

interface PlanDisplayProps {
    plan: TransitionPlan;
    sources: GroundingChunk[];
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
            <div className="bg-slate-700 p-2 rounded-full mr-3">{icon}</div>
            <h3 className="text-xl font-bold text-sky-400">{title}</h3>
        </div>
        {children}
    </div>
);


export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, sources }) => {
    const [editablePlan, setEditablePlan] = useState<TransitionPlan>(plan);
    const [feedbackSelection, setFeedbackSelection] = useState<'good' | 'bad' | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    useEffect(() => {
        setEditablePlan(plan);
        setFeedbackSelection(null);
        setFeedbackText('');
        setFeedbackSubmitted(false);
    }, [plan]);

    const handleUpdateMilestone = (updatedMilestone: Milestone) => {
        setEditablePlan(prevPlan => ({
            ...prevPlan,
            milestones: prevPlan.milestones.map(m =>
                m.id === updatedMilestone.id ? updatedMilestone : m
            )
        }));
    };
    
    const handleTaskStatusChange = (taskId: number, status: Task['status']) => {
        setEditablePlan(prevPlan => ({
            ...prevPlan,
            sprints: prevPlan.sprints.map(sprint => ({
                ...sprint,
                tasks: sprint.tasks.map(task =>
                    task.id === taskId ? { ...task, status } : task
                )
            }))
        }));
    };

    const handleTaskDueDateChange = (taskId: number, dueDate: string) => {
        setEditablePlan(prevPlan => ({
            ...prevPlan,
            sprints: prevPlan.sprints.map(sprint => ({
                ...sprint,
                tasks: sprint.tasks.map(task =>
                    task.id === taskId ? { ...task, dueDate } : task
                )
            }))
        }));
    };

    const handleCertificationStatusChange = (certId: number, status: Certification['status']) => {
        setEditablePlan(prevPlan => ({
            ...prevPlan,
            certifications: prevPlan.certifications.map(cert =>
                cert.id === certId ? { ...cert, status } : cert
            )
        }));
    };

    const handleExportDebrief = () => {
        const { overallImpression, resumeFeedback, skillsGapAnalysis } = editablePlan.careerTeamFeedback;
        
        const content = `
AI Advisory Team Debrief
=======================

Overall Impression
------------------
${overallImpression}

Resume & Document Feedback
--------------------------
${resumeFeedback}

Skills Gap Analysis
-------------------
${skillsGapAnalysis}
        `;

        const blob = new Blob([content.trim()], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AI_Debrief.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const { summary, careerTeamFeedback, companyProspects } = editablePlan;

    const probabilityConfig: Record<CompanyProspect['probability'], { color: string, textColor: string }> = {
        'High': { color: 'bg-green-500/20', textColor: 'text-green-400' },
        'Medium': { color: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
        'Low': { color: 'bg-red-500/20', textColor: 'text-red-400' },
    };
    
    const webSources = sources.filter(s => s.web);

    return (
        <div className="space-y-8 mt-8">
            <div className="text-center p-6 bg-slate-900/50 border border-sky-500/30 rounded-xl">
                <h2 className="text-3xl font-extrabold text-white mb-2">Your Personalized Transition Blueprint</h2>
                <p className="text-slate-300 max-w-3xl mx-auto">{summary}</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <UsersIcon className="h-8 w-8 text-sky-300 mr-3" />
                        <h3 className="text-2xl font-bold text-white">AI Advisory Team Debrief</h3>
                    </div>
                    <button 
                        onClick={handleExportDebrief}
                        className="flex items-center px-3 py-1.5 text-sm bg-slate-700 text-slate-300 font-semibold rounded-md hover:bg-slate-600 transition-colors"
                        aria-label="Export debrief as text file"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2"/>
                        Export Debrief
                    </button>
                </div>
                <div className="space-y-4 text-slate-300">
                    <div>
                        <h4 className="font-semibold text-sky-400">Overall Impression</h4>
                        <p>{careerTeamFeedback.overallImpression}</p>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                        <h4 className="font-semibold text-sky-400">Resume & Document Feedback</h4>
                        <p>{careerTeamFeedback.resumeFeedback}</p>
                    </div>
                     <div className="border-t border-slate-700 pt-4">
                        <h4 className="font-semibold text-sky-400">Skills Gap Analysis</h4>
                        <p>{careerTeamFeedback.skillsGapAnalysis}</p>
                    </div>
                    {webSources.length > 0 && (
                        <div className="border-t border-slate-700 pt-4">
                            <h4 className="font-semibold text-sky-400 mb-2">Sources</h4>
                            <ul className="space-y-1">
                                {webSources.map((source, index) => (
                                    <li key={index} className="flex items-center text-sm">
                                        <LinkIcon className="h-4 w-4 mr-2 text-slate-500 flex-shrink-0" />
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 truncate" title={source.web.title}>
                                            {source.web.title || source.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Skills to Develop" icon={<ChartBarIcon className="h-6 w-6 text-sky-400" />}>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {editablePlan.skillsToDevelop.map((skill, i) => <li key={i}>{skill}</li>)}
                    </ul>
                </SectionCard>

                <SectionCard title="Networking Suggestions" icon={<BuildingOfficeIcon className="h-6 w-6 text-sky-400" />}>
                     <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {editablePlan.networkingSuggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                    </ul>
                </SectionCard>

                <SectionCard title="Project Ideas" icon={<DocumentTextIcon className="h-6 w-6 text-sky-400" />}>
                     <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {editablePlan.projectIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                    </ul>
                </SectionCard>

                <SectionCard title="Target Company Analysis" icon={<BuildingStorefrontIcon className="h-6 w-6 text-sky-400" />}>
                    <div className="space-y-3">
                        {companyProspects.map((prospect, i) => (
                            <div key={i} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                     <div>
                                        <h4 className="font-bold text-white">{prospect.companyName}</h4>
                                        <p className="text-xs text-sky-300 font-medium">{prospect.targetLevel}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${probabilityConfig[prospect.probability].color} ${probabilityConfig[prospect.probability].textColor}`}>
                                        {prospect.probability} Probability
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{prospect.compensationRange}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3">
                    <MonthlyActionList milestones={editablePlan.milestones} onUpdateMilestone={handleUpdateMilestone} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <CertificationsTracker certifications={editablePlan.certifications} onStatusChange={handleCertificationStatusChange} />
                </div>
            </div>
             <TaskList 
                sprints={editablePlan.sprints} 
                onStatusChange={handleTaskStatusChange}
                onDueDateChange={handleTaskDueDateChange}
             />

             <div className="mt-8 bg-slate-800/50 border border-slate-700 p-6 rounded-xl text-center">
                <h3 className="text-xl font-bold text-white mb-2">Was this plan helpful?</h3>
                <p className="text-slate-400 mb-4 text-sm max-w-md mx-auto">Your feedback is anonymous and helps improve our AI advisor for everyone.</p>
                {feedbackSubmitted ? (
                    <p className="text-green-400 font-semibold py-2">Thank you for your feedback!</p>
                ) : (
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-center space-x-4 mb-4">
                            <button 
                                onClick={() => setFeedbackSelection('good')}
                                className={`flex items-center px-4 py-2 font-semibold rounded-md transition-colors ${
                                    feedbackSelection === 'good' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                <ThumbUpIcon className="h-5 w-5 mr-2" />
                                <span>Helpful</span>
                            </button>
                            <button 
                                onClick={() => setFeedbackSelection('bad')} 
                                className={`flex items-center px-4 py-2 font-semibold rounded-md transition-colors ${
                                    feedbackSelection === 'bad' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                <ThumbDownIcon className="h-5 w-5 mr-2" />
                                <span>Not Helpful</span>
                            </button>
                        </div>
                        {feedbackSelection && (
                            <div className="space-y-4 animate-fade-in">
                                <textarea
                                    rows={3}
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Tell us more... (optional)"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition text-left"
                                />
                                <button
                                    onClick={() => setFeedbackSubmitted(true)}
                                    className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
