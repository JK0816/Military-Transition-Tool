import React, { useState, useEffect, useMemo } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const loadingMessages = [
    "Consulting with AI advisory team...",
    "Analyzing your professional documents...",
    "Calculating leave based on AR 600-8-10...",
    "Identifying key skill gaps...",
    "Searching for up-to-date market data...",
    "Building your personalized timeline...",
    "Finalizing your transition blueprint...",
];

const generationSteps = [
    { key: 'careerTeamFeedback', label: 'AI Advisory Team Debrief' },
    { key: 'skillsToDevelop', label: 'Skill Development Plan' },
    { key: 'phases', label: 'Actionable Timeline' },
    { key: 'recommendedCourses', label: 'Course Recommendations' },
    { key: 'certifications', label: 'Certifications & Training' },
    { key: 'companyProspects', label: 'Target Company Analysis' }
];

export const LoadingIndicator: React.FC<{ streamedContent: string }> = ({ streamedContent }) => {
    const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3500);

        return () => clearInterval(intervalId);
    }, []);

    const completedSteps = useMemo(() => {
        const steps = new Set<string>();
        generationSteps.forEach(step => {
            if (streamedContent.includes(`"${step.key}"`)) {
                steps.add(step.key);
            }
        });
        return steps;
    }, [streamedContent]);

    return (
        <div className="text-center py-16 px-6 mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl animate-fade-in">
            <div className="relative inline-flex">
                <SpinnerIcon className="h-16 w-16 text-sky-400/80" />
                <div className="absolute inset-0 flex items-center justify-center text-sky-400 font-bold text-lg">
                    {Math.round((completedSteps.size / generationSteps.length) * 100)}%
                </div>
            </div>
            
            <h2 className="text-xl font-semibold text-slate-200 mt-6">{currentMessage}</h2>
            <p className="text-slate-500 mt-2">Please wait, this may take a minute or two.</p>

            <div className="mt-8 max-w-sm mx-auto text-left space-y-3">
                <p className="text-sm font-semibold text-slate-400 mb-2">Generation Progress:</p>
                {generationSteps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.key);
                    return (
                        <div key={step.key} className={`flex items-center text-sm transition-all duration-300 ${isCompleted ? 'text-green-400' : 'text-slate-500'}`} style={{ transitionDelay: `${index * 50}ms` }}>
                            {isCompleted ? (
                                <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                            ) : (
                                <div className="h-5 w-5 mr-3 flex-shrink-0 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-slate-700 animate-pulse"></div>
                                </div>
                            )}
                            <span className={`${isCompleted ? 'font-semibold' : ''}`}>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};