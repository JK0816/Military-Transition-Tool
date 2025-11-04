import React from 'react';

const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 1.5 3L12 9l1.5 3L15 9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v.01" />
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="bg-slate-900/70 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between max-w-7xl">
                <div className="flex items-center space-x-3">
                    <CompassIcon className="h-8 w-8 text-sky-400" />
                    <h1 className="text-xl md:text-2xl font-bold text-white">
                        Transition Blueprint
                    </h1>
                </div>
            </div>
        </header>
    );
};