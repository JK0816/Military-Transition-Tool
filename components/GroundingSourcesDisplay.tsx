import React from 'react';
import type { GroundingChunk } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface GroundingSourcesDisplayProps {
    sources: GroundingChunk[];
}

export const GroundingSourcesDisplay: React.FC<GroundingSourcesDisplayProps> = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h4 className="font-semibold text-sky-400 text-lg mb-3 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Information Sources
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.web?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-sky-500 transition-colors group"
                    >
                        <p className="text-sky-400 font-medium truncate group-hover:underline">
                            {source.web?.title || 'Untitled Source'}
                        </p>
                        <p className="text-slate-500 text-xs truncate">
                            {source.web?.uri}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
};