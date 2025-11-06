import React, { useState } from 'react';
import type { TransitionPlan, Task, Phase, Certification, CompanyProspect, UserProfile } from '../types';
import { ActionableTimeline } from './ActionableTimeline';
import { TaskList } from './TaskList';
import { CertificationsTracker } from './CertificationsTracker';
import { SkillsChart } from './SkillsChart';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { AddItemForm } from './AddItemForm';
import { PrinterIcon } from './icons/PrinterIcon';
import { GroundingSourcesDisplay } from './GroundingSourcesDisplay';
import { TrashIcon } from './icons/TrashIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { ResumeBuilder } from './ResumeBuilder';
import { RecommendedCourses } from './RecommendedCourses';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { AdvisoryTeam } from './AdvisoryTeam';
import { KeyMetrics } from './KeyMetrics';


type SimpleListType = 'skillsToDevelop' | 'networkingSuggestions' | 'projectIdeas';
type ActiveTab = 'blueprint' | 'tasks' | 'resume';

interface PlanDisplayProps {
    plan: TransitionPlan;
    userProfile: UserProfile | null;
    onTaskStatusChange: (taskId: number, status: Task['status']) => void;
    onTaskDueDateChange: (taskId: number, dueDate: string) => void;
    onCertificationStatusChange: (certId: number, status: Certification['status']) => void;
    onAddTask: (phaseIndex: number, task: Omit<Task, 'id' | 'status'>) => void;
    onAddCertification: (certification: Omit<Certification, 'id' | 'status'>) => void;
    onAddSimpleListItem: (listType: SimpleListType, itemText: string) => void;
    onDeleteTask: (taskId: number) => void;
    onDeleteCertification: (certId: number) => void;
    onDeleteSimpleListItem: (listType: SimpleListType, itemIndex: number) => void;
}


const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl ${className}`}>
        <div className="flex items-center mb-4 border-b border-slate-700 pb-3">
            <div className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg mr-4">{icon}</div>
            <h3 className="text-lg font-semibold text-sky-300">{title}</h3>
        </div>
        <div className="text-sm text-slate-300 space-y-3">{children}</div>
    </div>
);

const SimpleList: React.FC<{ items: string[]; listType: SimpleListType; onAdd: (listType: SimpleListType, item: string) => void; onDelete: (listType: SimpleListType, index: number) => void; }> = ({ items, listType, onAdd, onDelete }) => {
    return (
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start justify-between group bg-slate-900/40 p-2.5 rounded-md border border-transparent hover:border-slate-700">
                    <span className="pr-2">{item}</span>
                     <button onClick={() => onDelete(listType, index)} className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </li>
            ))}
             <li>
                <AddItemForm
                    onAdd={(text) => onAdd(listType, text)}
                    placeholder="Add new item..."
                    buttonText="Add item"
                />
            </li>
        </ul>
    );
};

const DebriefPanel: React.FC<{ feedback: TransitionPlan['careerTeamFeedback'] }> = ({ feedback }) => (
    <SectionCard title="AI Advisor Debrief" icon={<DocumentTextIcon className="h-6 w-6 text-sky-300" />}>
        <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-sky-400 mb-2">Overall Impression:</h4>
                <p className="text-slate-400 whitespace-pre-wrap text-sm">{feedback.overallImpression}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-sky-400 mb-2">Resume Feedback:</h4>
                <p className="text-slate-400 whitespace-pre-wrap text-sm">{feedback.resumeFeedback}</p>
            </div>
             {feedback.leaveCalculationBreakdown && (
                <div>
                    <h4 className="font-semibold text-sky-400">Leave & Timeline Calculation:</h4>
                    <p className="text-slate-400 whitespace-pre-wrap font-mono text-xs bg-slate-800/70 p-3 rounded-md mt-2">{feedback.leaveCalculationBreakdown}</p>
                </div>
            )}
            <div>
                <AdvisoryTeam />
            </div>
        </div>
    </SectionCard>
);


const PlanOverview: React.FC<{ plan: TransitionPlan; userProfile: UserProfile }> = ({ plan, userProfile }) => (
    <div className="lg:col-span-5 bg-gradient-to-br from-slate-800/60 to-slate-900/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
                <p className="text-sky-400 font-semibold">Your Transition Blueprint For:</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{userProfile.targetRole}</h2>
                <p className="text-base leading-relaxed text-slate-300 mt-4 max-w-4xl">{plan.summary}</p>
            </div>
            <div className="xl:col-span-1">
                <KeyMetrics plan={plan} userProfile={userProfile} />
            </div>
        </div>
    </div>
);


export const PlanDisplay: React.FC<PlanDisplayProps> = (props) => {
    const { plan, userProfile, onAddSimpleListItem, onDeleteSimpleListItem } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('blueprint');
    
    const renderContent = () => {
        if (!userProfile) return null;

        switch(activeTab) {
            case 'resume':
                return <ResumeBuilder plan={plan} userProfile={userProfile} />;
            case 'tasks':
                return <TaskList 
                    phases={plan.phases}
                    onStatusChange={props.onTaskStatusChange}
                    onDueDateChange={props.onTaskDueDateChange}
                    onAddTask={props.onAddTask}
                    onDeleteTask={props.onDeleteTask}
                />;
            case 'blueprint':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 animate-fade-in">
                        
                        <PlanOverview plan={plan} userProfile={userProfile} />
                        
                        {/* Left Column: Timeline and Action Items */}
                        <div className="lg:col-span-3 space-y-6 lg:space-y-8">
                            <ActionableTimeline 
                                phases={plan.phases}
                                recommendedCourses={plan.recommendedCourses}
                                onTaskStatusChange={props.onTaskStatusChange}
                                onDueDateChange={props.onTaskDueDateChange}
                                onDeleteTask={props.onDeleteTask}
                            />
                             <RecommendedCourses courses={plan.recommendedCourses} />
                             <CertificationsTracker
                                certifications={plan.certifications}
                                onStatusChange={props.onCertificationStatusChange}
                                onAddCertification={props.onAddCertification}
                                onDeleteCertification={props.onDeleteCertification}
                            />
                        </div>

                        {/* Right Column: Key Insights & Recommendations */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                             <DebriefPanel feedback={plan.careerTeamFeedback} />
                            <SectionCard title="Skills Gap Analysis" icon={<ChartBarIcon className="h-6 w-6 text-sky-300" />}>
                                 <p className="pb-3 text-slate-400">{plan.careerTeamFeedback.skillsGapAnalysis}</p>
                                <SkillsChart assessments={plan.careerTeamFeedback.skillAssessments} />
                            </SectionCard>
                             <SectionCard title="Skills to Develop" icon={<CodeBracketIcon className="h-6 w-6 text-sky-300" />}>
                                <SimpleList items={plan.skillsToDevelop} listType="skillsToDevelop" onAdd={onAddSimpleListItem} onDelete={onDeleteSimpleListItem} />
                            </SectionCard>
                            <SectionCard title="Networking Suggestions" icon={<UsersIcon className="h-6 w-6 text-sky-300" />}>
                                <SimpleList items={plan.networkingSuggestions} listType="networkingSuggestions" onAdd={onAddSimpleListItem} onDelete={onDeleteSimpleListItem} />
                            </SectionCard>
                            <SectionCard title="Portfolio Project Ideas" icon={<LightBulbIcon className="h-6 w-6 text-sky-300" />}>
                                <SimpleList items={plan.projectIdeas} listType="projectIdeas" onAdd={onAddSimpleListItem} onDelete={onDeleteSimpleListItem} />
                            </SectionCard>
                            <SectionCard title="Target Company Prospects" icon={<BuildingStorefrontIcon className="h-6 w-6 text-sky-300" />}>
                                <div className="space-y-3">
                                    {plan.companyProspects.map(prospect => (
                                        <div key={prospect.id} className="p-3 bg-slate-900/40 rounded-md border border-slate-700/70">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-slate-100">{prospect.companyName}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${prospect.probability === 'High' ? 'bg-green-500/20 text-green-300' : prospect.probability === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                                                    {prospect.probability}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                <span>Level: {prospect.targetLevel}</span>
                                                <span className="mx-2">|</span>
                                                <span>Est. Comp: {prospect.compensationRange}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 italic mt-2">"{prospect.reasoning}"</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>
                        </div>
                        
                         <div className="lg:col-span-5">
                            <GroundingSourcesDisplay sources={plan.groundingSources || []} />
                         </div>

                    </div>
                );
        }
    };


    return (
        <div>
             <div className="bg-slate-900/70 backdrop-blur-lg border border-slate-700 p-3 rounded-xl mb-6 flex items-center justify-between sticky top-20 z-40 no-print">
                <nav className="flex items-center space-x-2">
                    {(['blueprint', 'tasks', 'resume'] as ActiveTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'}`}
                        >
                            {tab === 'blueprint' && <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />}
                            {tab === 'tasks' && <ChartBarIcon className="h-5 w-5 inline-block mr-2" />}
                            {tab === 'resume' && <IdentificationIcon className="h-5 w-5 inline-block mr-2" />}
                            <span className="capitalize">{tab}</span>
                        </button>
                    ))}
                </nav>
                <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/70 transition-colors"
                >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Print
                </button>
            </div>
            {renderContent()}
            <div className="printable-area hidden">
                 <ResumeBuilder plan={plan} userProfile={userProfile!} />
            </div>
        </div>
    );
};
