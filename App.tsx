import React, { useState } from 'react';
import { Header } from './components/Header';
import { ProfileUploader } from './components/ProfileUploader';
import { PlanDisplay } from './components/PlanDisplay';
import type { TransitionPlan, UserProfile } from './types';
import { generateTransitionPlan } from './services/geminiService';

const App: React.FC = () => {
    const [plan, setPlan] = useState<TransitionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async (profile: UserProfile) => {
        setIsLoading(true);
        setError(null);
        setPlan(null);

        try {
            const generatedPlan = await generateTransitionPlan(profile);
            setPlan(generatedPlan);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen font-sans">
            <Header />
            <main className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl">
                <ProfileUploader onGeneratePlan={handleGeneratePlan} isLoading={isLoading} />
                
                {error && (
                    <div className="mt-8 bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg text-center">
                        <p className="font-bold">Generation Failed</p>
                        <p>{error}</p>
                    </div>
                )}

                {plan && !isLoading && (
                    <PlanDisplay plan={plan} />
                )}

                {!plan && !isLoading && !error && (
                    <div className="text-center py-16 px-6 mt-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl">
                        <h2 className="text-xl font-semibold text-slate-300">Your Blueprint Awaits</h2>
                        <p className="text-slate-500 mt-2">Fill out the form above to generate your personalized career transition plan.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
