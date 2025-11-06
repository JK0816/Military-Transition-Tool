import React from 'react';
import type { SkillAssessment } from '../types';

interface SkillsChartProps {
    assessments: SkillAssessment[];
}

export const SkillsChart: React.FC<SkillsChartProps> = ({ assessments }) => {
    if (!assessments || assessments.length === 0) {
        return <p className="text-sm text-slate-500">No skill assessment data available.</p>;
    }

    return (
        <div className="space-y-4 rounded-lg bg-slate-900/30 p-4 border border-slate-700/50">
            <div className="flex items-center text-xs text-slate-400">
                <div className="flex items-center mr-4">
                    <span className="h-3 w-3 rounded-sm bg-slate-500 mr-1.5 skills-chart-bar-current"></span>
                    <span>Current Level</span>
                </div>
                <div className="flex items-center">
                    <span className="h-3 w-3 rounded-sm bg-sky-500 mr-1.5 skills-chart-bar-required"></span>
                    <span>Required Level</span>
                </div>
            </div>
            {assessments.map((item, index) => (
                <div key={index}>
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-slate-300">{item.skillName}</span>
                        <span className="text-xs text-slate-400 font-mono">{item.currentLevel}/10 vs {item.requiredLevel}/10</span>
                    </div>
                    <div className="h-3 w-full bg-slate-700 rounded-full relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-3 bg-sky-500 rounded-full skills-chart-bar-required"
                            style={{ width: `${(item.requiredLevel / 10) * 100}%` }}
                            title={`Required: ${item.requiredLevel}/10`}
                        />
                        <div
                            className="absolute top-0 left-0 h-3 bg-slate-500 rounded-full skills-chart-bar-current"
                            style={{ width: `${(item.currentLevel / 10) * 100}%` }}
                             title={`Current: ${item.currentLevel}/10`}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};