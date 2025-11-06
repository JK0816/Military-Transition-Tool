import React from 'react';
import type { UserProfile } from '../types';
import { CompassIcon } from './icons/CompassIcon';

interface HeaderProps {
    userProfile: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ userProfile }) => {
    return (
        <header className="bg-slate-900/70 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50 no-print">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between max-w-screen-2xl">
                <div className="flex items-center space-x-4">
                     <div className="p-2 bg-slate-800 rounded-full border border-slate-700">
                        <CompassIcon className="h-8 w-8 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">
                            Military Transition Blueprint
                        </h1>
                        <p className="text-xs text-slate-400">
                            {userProfile ? `For: ${userProfile.targetRole}` : 'AI-Powered Career Planning'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};