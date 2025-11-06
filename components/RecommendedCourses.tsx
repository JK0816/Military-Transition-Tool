import React from 'react';
import type { RecommendedCourse } from '../types';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { LinkIcon } from './icons/LinkIcon';

interface RecommendedCoursesProps {
    courses: RecommendedCourse[];
}

export const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ courses }) => {
    if (!courses || courses.length === 0) {
        return null; 
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center mb-4 border-b border-slate-700 pb-3">
                <div className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg mr-4">
                    <AcademicCapIcon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="text-lg font-semibold text-sky-300">Recommended Courses</h3>
            </div>
            <div className="text-sm text-slate-300 space-y-3">
                {courses.map(course => (
                    <div key={course.id} className="p-3 bg-slate-900/40 rounded-lg border border-slate-700/70 group">
                        <a 
                            href={course.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-semibold text-slate-100 hover:text-sky-400 group-hover:text-sky-300 transition-colors flex items-center"
                        >
                            <span>{course.courseName}</span>
                            <LinkIcon className="h-4 w-4 inline-block ml-2 text-slate-500 group-hover:text-sky-400 transition-colors" />
                        </a>
                        <p className="text-xs text-slate-400 mt-1">by {course.provider}</p>
                        <p className="text-xs text-slate-400 italic mt-2 bg-slate-800/50 p-2 rounded-md border border-slate-700/50">
                            "{course.reasoning}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};