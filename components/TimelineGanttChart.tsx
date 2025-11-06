import React, { useMemo } from 'react';
import type { Phase } from '../types';
import { parseDateAsUTC } from '../utils/dateUtils';

interface TimelineGanttChartProps {
    phases: Phase[];
}

const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const colors = ['bg-sky-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-indigo-500'];

export const TimelineGanttChart: React.FC<TimelineGanttChartProps> = ({ phases }) => {
    const chartData = useMemo(() => {
        if (!phases || phases.length === 0) return null;

        try {
            const phaseDates = phases.map(p => ({
                start: parseDateAsUTC(p.startDate),
                end: parseDateAsUTC(p.endDate)
            }));

            const overallStart = new Date(Math.min(...phaseDates.map(p => p.start.getTime())));
            const overallEnd = new Date(Math.max(...phaseDates.map(p => p.end.getTime())));

            const totalDurationDays = Math.round((overallEnd.getTime() - overallStart.getTime()) / ONE_DAY_MS) + 1;

            if (totalDurationDays <= 0) return null;

            const calculatedPhases = phases.map((phase, index) => {
                const phaseStart = phaseDates[index].start;
                const phaseEnd = phaseDates[index].end;
                
                const startOffsetDays = Math.round((phaseStart.getTime() - overallStart.getTime()) / ONE_DAY_MS);
                const durationDays = Math.round((phaseEnd.getTime() - phaseStart.getTime()) / ONE_DAY_MS) + 1;
                
                const left = (startOffsetDays / totalDurationDays) * 100;
                const width = (durationDays / totalDurationDays) * 100;

                return {
                    ...phase,
                    left,
                    width,
                    color: colors[index % colors.length],
                };
            });
            
            // Generate month markers
            const months = [];
            let currentMonth = new Date(Date.UTC(overallStart.getUTCFullYear(), overallStart.getUTCMonth(), 1));
            while(currentMonth <= overallEnd) {
                const startOffsetDays = Math.round((currentMonth.getTime() - overallStart.getTime()) / ONE_DAY_MS);
                const left = (startOffsetDays / totalDurationDays) * 100;
                 if (left >= 0 && left < 100) {
                    months.push({
                        name: currentMonth.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
                        left: left,
                    });
                }
                currentMonth.setUTCMonth(currentMonth.getUTCMonth() + 1);
            }

            return { calculatedPhases, months };

        } catch (e) {
            console.error("Failed to calculate Gantt chart data:", e);
            return null;
        }
    }, [phases]);

    if (!chartData) {
        return <div className="text-sm text-slate-500">Timeline visualization unavailable due to invalid date formats.</div>;
    }

    const { calculatedPhases, months } = chartData;

    return (
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-2">
             <div className="relative h-12 w-full">
                {calculatedPhases.map(phase => (
                     <div
                        key={phase.id}
                        className={`absolute h-8 top-2 rounded-md ${phase.color} opacity-80 flex items-center justify-start px-3 overflow-hidden group`}
                        style={{ left: `${phase.left}%`, width: `${phase.width}%` }}
                    >
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <span className="text-xs font-semibold text-white truncate z-10">{phase.title}</span>
                         <div className="absolute top-full mt-2 w-max p-2 bg-slate-800 text-xs text-white rounded-md border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {phase.title}
                        </div>
                    </div>
                ))}
            </div>
            <div className="relative h-4 w-full border-t border-slate-600 pt-1">
                 {months.map(month => (
                    <div key={month.name + month.left} className="absolute top-1" style={{ left: `${month.left}%` }}>
                        <div className="h-1.5 w-px bg-slate-500"></div>
                        <span className="text-xs text-slate-500 absolute left-0 top-1.5 transform -translate-x-1/2">{month.name}</span>
                    </div>
                 ))}
            </div>
        </div>
    );
};
