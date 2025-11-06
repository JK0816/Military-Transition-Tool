import React, { useState, useEffect, useReducer } from 'react';
import { Header } from './components/Header';
import { ProfileUploader } from './components/ProfileUploader';
import { PlanDisplay } from './components/PlanDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import type { TransitionPlan, UserProfile, Task, Certification, ChatMessage } from './types';
import { generateTransitionPlan, startChatSession, continueChatStream } from './services/geminiService';
import { FeedbackWidget } from './components/FeedbackWidget';
import { Toast } from './components/Toast';

type SimpleListType = 'skillsToDevelop' | 'networkingSuggestions' | 'projectIdeas';

// --- Reducer Logic ---

type PlanAction =
    | { type: 'SET_PLAN'; payload: TransitionPlan }
    | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: number; status: Task['status'] } }
    | { type: 'UPDATE_TASK_DUEDATE'; payload: { taskId: number; dueDate: string } }
    | { type: 'UPDATE_CERT_STATUS'; payload: { certId: number; status: Certification['status'] } }
    | { type: 'ADD_TASK'; payload: { phaseIndex: number; taskData: Omit<Task, 'id' | 'status'> } }
    | { type: 'ADD_CERTIFICATION'; payload: Omit<Certification, 'id' | 'status'> }
    | { type: 'ADD_SIMPLE_LIST_ITEM'; payload: { listType: SimpleListType; itemText: string } }
    | { type: 'DELETE_TASK'; payload: { taskId: number } }
    | { type: 'DELETE_CERTIFICATION'; payload: { certId: number } }
    | { type: 'DELETE_SIMPLE_LIST_ITEM'; payload: { listType: SimpleListType; itemIndex: number } };


const planReducer = (state: TransitionPlan | null, action: PlanAction): TransitionPlan | null => {
    if (!state) {
        if (action.type === 'SET_PLAN') return action.payload;
        return null;
    }

    switch (action.type) {
        case 'SET_PLAN':
            return action.payload;

        case 'UPDATE_TASK_STATUS': {
            const { taskId, status } = action.payload;
            const updatedPhases = state.phases.map(phase => ({
                ...phase,
                tasks: phase.tasks.map(task =>
                    task.id === taskId ? { ...task, status } : task
                ),
            }));
            return { ...state, phases: updatedPhases };
        }

        case 'UPDATE_TASK_DUEDATE': {
            const { taskId, dueDate } = action.payload;
            const updatedPhases = state.phases.map(phase => ({
                ...phase,
                tasks: phase.tasks.map(task =>
                    task.id === taskId ? { ...task, dueDate } : task
                ),
            }));
            return { ...state, phases: updatedPhases };
        }
        
        case 'UPDATE_CERT_STATUS': {
            const { certId, status } = action.payload;
            const updatedCerts = state.certifications.map(cert =>
                cert.id === certId ? { ...cert, status } : cert
            );
            return { ...state, certifications: updatedCerts };
        }

        case 'ADD_TASK': {
            const { phaseIndex, taskData } = action.payload;
            const maxId = state.phases.flatMap(s => s.tasks).reduce((max, t) => Math.max(max, t.id), 0);
            const newTask: Task = { ...taskData, id: maxId + 1, status: 'To Do' };
            const updatedPhases = state.phases.map((phase, index) => {
                if (index === phaseIndex) {
                    return { ...phase, tasks: [...phase.tasks, newTask] };
                }
                return phase;
            });
            return { ...state, phases: updatedPhases };
        }

        case 'ADD_CERTIFICATION': {
            const maxId = state.certifications.reduce((max, c) => Math.max(max, c.id), 0);
            const newCert: Certification = { ...action.payload, id: maxId + 1, status: 'Recommended' };
            return { ...state, certifications: [...state.certifications, newCert] };
        }

        case 'ADD_SIMPLE_LIST_ITEM': {
            const { listType, itemText } = action.payload;
            return { ...state, [listType]: [...state[listType], itemText] };
        }

        case 'DELETE_TASK': {
            const { taskId } = action.payload;
            const updatedPhases = state.phases.map(phase => ({
                ...phase,
                tasks: phase.tasks.filter(task => task.id !== taskId),
            }));
            return { ...state, phases: updatedPhases };
        }

        case 'DELETE_CERTIFICATION': {
            const { certId } = action.payload;
            const updatedCerts = state.certifications.filter(cert => cert.id !== certId);
            return { ...state, certifications: updatedCerts };
        }

        case 'DELETE_SIMPLE_LIST_ITEM': {
            const { listType, itemIndex } = action.payload;
            const updatedList = state[listType].filter((_, index) => index !== itemIndex);
            return { ...state, [listType]: updatedList };
        }

        default:
            return state;
    }
};

// --- Helper Functions ---
const isValidPlan = (data: any): data is TransitionPlan => {
    return (
        data &&
        typeof data.summary === 'string' &&
        typeof data.careerTeamFeedback === 'object' && data.careerTeamFeedback !== null &&
        Array.isArray(data.skillsToDevelop) &&
        Array.isArray(data.networkingSuggestions) &&
        Array.isArray(data.projectIdeas) &&
        Array.isArray(data.phases) &&
        Array.isArray(data.certifications) &&
        Array.isArray(data.recommendedCourses) &&
        Array.isArray(data.companyProspects)
    );
};

const isValidProfile = (data: any): data is UserProfile => {
    return (
        data &&
        typeof data.targetRole === 'string' &&
        Array.isArray(data.documents)
    );
};


const App: React.FC = () => {
    const [plan, dispatch] = useReducer(planReducer, null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [streamedContent, setStreamedContent] = useState('');
    const [hasSavedPlan, setHasSavedPlan] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatResponding, setIsChatResponding] = useState(false);
    const [streamingChatResponse, setStreamingChatResponse] = useState('');

    const LOCAL_STORAGE_KEY = 'transitionPlan';
    const USER_PROFILE_KEY = 'userProfile';

    useEffect(() => {
        const savedPlanJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedPlanJson) {
            setHasSavedPlan(true);
        }
    }, []);
    
    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 3000);
    };

    const handleGeneratePlan = async (profile: UserProfile) => {
        setIsLoading(true);
        setError(null);
        dispatch({ type: 'SET_PLAN', payload: null! });
        setStreamedContent('');
        setUserProfile(profile);
        setChatHistory([]); // Reset chat history for a new plan
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

        try {
            const generatedPlan = await generateTransitionPlan(profile, (text) => {
                setStreamedContent(text);
            });
            dispatch({ type: 'SET_PLAN', payload: generatedPlan });
            startChatSession(profile, generatedPlan);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(generatedPlan));
            setHasSavedPlan(true);
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

    const handleLoadPlan = () => {
        const savedPlanJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        const savedProfileJson = localStorage.getItem(USER_PROFILE_KEY);

        if (savedPlanJson && savedProfileJson) {
            try {
                const savedPlan = JSON.parse(savedPlanJson);
                const savedProfile = JSON.parse(savedProfileJson);

                if (isValidPlan(savedPlan) && isValidProfile(savedProfile)) {
                    dispatch({ type: 'SET_PLAN', payload: savedPlan });
                    setUserProfile(savedProfile);
                    startChatSession(savedProfile, savedPlan);
                    setChatHistory([]); // Reset chat display on load
                    setError(null);
                } else {
                    throw new Error("Saved data is corrupted or from an older version of the app.");
                }
                
            } catch (e) {
                console.error("Failed to parse or validate saved plan/profile:", e);
                const errorMessage = e instanceof Error ? e.message : "Could not load saved plan. It might be corrupted.";
                setError(errorMessage);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                localStorage.removeItem(USER_PROFILE_KEY);
                setHasSavedPlan(false);
            }
        }
    };
    
    const handleStartNew = () => {
        dispatch({ type: 'SET_PLAN', payload: null! });
        setUserProfile(null);
        setError(null);
        setStreamedContent('');
        setChatHistory([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
        setHasSavedPlan(false);
    };

    const handleSendMessage = async (message: string) => {
        const userMessage: ChatMessage = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setIsChatResponding(true);
        setStreamingChatResponse('');
    
        try {
            const stream = await continueChatStream(message);
            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponse += chunkText;
                    setStreamingChatResponse(fullResponse);
                }
            }
            const modelMessage: ChatMessage = { role: 'model', text: fullResponse };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setChatHistory(prev => [...prev, errorMessage]);
            console.error("Chat error:", err);
        } finally {
            setIsChatResponding(false);
            setStreamingChatResponse('');
        }
    };
    
    // The reducer updates the state, and this effect saves it.
    useEffect(() => {
        if (plan) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plan));
        }
    }, [plan]);

    return (
        <div className="min-h-screen text-slate-200">
            <Header userProfile={userProfile} />
            <main className="container mx-auto px-4 md:px-8 py-8 max-w-screen-2xl main-content-area">
                <Toast message={toast.message} show={toast.show} />
                {isLoading ? (
                    <LoadingIndicator streamedContent={streamedContent} />
                ) : error ? (
                    <div className="text-center py-12 px-6 bg-red-900/20 border border-dashed border-red-500/50 rounded-xl">
                        <h2 className="text-2xl font-bold text-red-300">Generation Failed</h2>
                        <p className="text-red-400/80 mt-2">{error}</p>
                        <button onClick={handleStartNew} className="mt-6 px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : plan ? (
                    <PlanDisplay 
                        plan={plan}
                        userProfile={userProfile}
                        onTaskStatusChange={(taskId, status) => { dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } }); showToast('Task updated!'); }}
                        onTaskDueDateChange={(taskId, dueDate) => dispatch({ type: 'UPDATE_TASK_DUEDATE', payload: { taskId, dueDate } })}
                        onCertificationStatusChange={(certId, status) => { dispatch({ type: 'UPDATE_CERT_STATUS', payload: { certId, status } }); showToast('Certification updated!'); }}
                        onAddTask={(phaseIndex, taskData) => dispatch({ type: 'ADD_TASK', payload: { phaseIndex, taskData } })}
                        onAddCertification={(certData) => dispatch({ type: 'ADD_CERTIFICATION', payload: certData })}
                        onAddSimpleListItem={(listType, itemText) => dispatch({ type: 'ADD_SIMPLE_LIST_ITEM', payload: { listType, itemText } })}
                        onDeleteTask={(taskId) => dispatch({ type: 'DELETE_TASK', payload: { taskId } })}
                        onDeleteCertification={(certId) => dispatch({ type: 'DELETE_CERTIFICATION', payload: { certId } })}
                        onDeleteSimpleListItem={(listType, itemIndex) => dispatch({ type: 'DELETE_SIMPLE_LIST_ITEM', payload: { listType, itemIndex } })}
                        // Chat Props
                        onSendMessage={handleSendMessage}
                        chatHistory={chatHistory}
                        isChatResponding={isChatResponding}
                        streamingChatResponse={streamingChatResponse}
                    />
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {hasSavedPlan && (
                            <div className="text-center p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl mb-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
                                <p className="text-slate-400 mt-2">You have a saved transition blueprint. You can load it or start a new one.</p>
                                <div className="mt-6 flex justify-center space-x-4">
                                    <button onClick={handleLoadPlan} className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold rounded-md hover:shadow-glow-sky transition-shadow">
                                        Load Saved Blueprint
                                    </button>
                                    <button onClick={handleStartNew} className="px-5 py-2.5 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors">
                                        Start New
                                    </button>
                                </div>
                            </div>
                        )}
                        <ProfileUploader onGeneratePlan={handleGeneratePlan} isLoading={isLoading} />
                    </div>
                )}
            </main>
            <FeedbackWidget />
        </div>
    );
};

export default App;