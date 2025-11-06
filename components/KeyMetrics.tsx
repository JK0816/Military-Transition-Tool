import React from 'react';
import { TransitionPlan, UserProfile } from '../types';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { parseDateAsUTC } from '../utils/dateUtils';

interface KeyMetricsProps {
    plan: TransitionPlan;
    userProfile: UserProfile | null;
}

const MetricItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="flex items-center p-3 bg-slate-900/50 rounded-lg">
        <div className="flex-shrink-0 mr-3 text-sky-400">
            {icon}
        </div>
        <div>
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-base font-bold text-white">{value}</div>
        </div>
    </div>
);

export const KeyMetrics: React.FC<KeyMetricsProps> = ({ plan, userProfile }) => {
    const totalTasks = plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    const totalCerts = plan.certifications.length;
    const terminalLeaveDays = plan.careerTeamFeedback.calculatedTerminalLeaveDays;

    const getFinalWorkDay = (): string => {
        if (!userProfile?.retirementDate || terminalLeaveDays === undefined) {
            return 'N/A';
        }
        try {
            const retirementDate = parseDateAsUTC(userProfile.retirementDate);
            
            const totalDaysToSubtract = terminalLeaveDays + (userProfile.ptdyDays || 0) + (userProfile.cspDays || 0);
            
            const finalDay = new Date(retirementDate);
            finalDay.setUTCDate(finalDay.getUTCDate() - totalDaysToSubtract);
            
            return finalDay.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

        } catch (e) {
            return "Invalid Date";
        }
    };

    return (
        <div className="bg-slate-800/70 border border-slate-700 p-4 rounded-xl h-full">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                <PresentationChartLineIcon className="h-5 w-5 mr-2 text-sky-400"/>
                Key Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {terminalLeaveDays !== undefined && (
                     <MetricItem 
                        icon={<ClockIcon className="h-6 w-6"/>}
                        label="Terminal Leave"
                        value={<>{terminalLeaveDays} Days</>}
                    />
                )}
                 <MetricItem 
                    icon={<CalendarDaysIcon className="h-6 w-6"/>}
                    label="Est. Final Work Day"
                    value={getFinalWorkDay()}
                />
                <MetricItem 
                    icon={<CheckCircleIcon className="h-6 w-6"/>}
                    label="Total Tasks"
                    value={<>{totalTasks} Items</>}
                />
                <MetricItem 
                    icon={<AcademicCapIcon className="h-6 w-6"/>}
                    label="Certifications"
                    value={<>{totalCerts} Goals</>}
                />
            </div>
        </div>
    );
};
