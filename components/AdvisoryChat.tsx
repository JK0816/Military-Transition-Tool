import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { UserIcon } from './icons/UserIcon';
import { HiringManagerIcon } from './icons/HiringManagerIcon';


interface AdvisoryChatProps {
    history: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
    streamingResponse: string;
}

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isModel ? 'bg-slate-700' : 'bg-sky-600'}`}>
                {isModel ? <HiringManagerIcon className="h-5 w-5 text-sky-300" /> : <UserIcon className="h-5 w-5 text-white" />}
            </div>
            <div className={`p-3 rounded-xl max-w-sm md:max-w-md ${isModel ? 'bg-slate-700/70 text-slate-200 rounded-bl-none' : 'bg-sky-700 text-white rounded-br-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );
};

export const AdvisoryChat: React.FC<AdvisoryChatProps> = ({ history, onSendMessage, isResponding, streamingResponse }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, streamingResponse]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isResponding) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-0 rounded-2xl shadow-xl flex flex-col h-[600px] max-h-[70vh]">
            <div className="flex items-center p-4 border-b border-slate-700 flex-shrink-0">
                <div className="bg-slate-900/50 border border-slate-700 p-2 rounded-lg mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-sky-300">Chat with AI Advisor</h3>
                    <p className="text-xs text-slate-400">Ask follow-up questions about your plan.</p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}
                 {isResponding && (
                    <div className="flex items-start gap-3">
                         <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-slate-700">
                             <HiringManagerIcon className="h-5 w-5 text-sky-300" />
                         </div>
                         <div className="p-3 rounded-xl max-w-sm md:max-w-md bg-slate-700/70 text-slate-200 rounded-bl-none">
                            <p className="text-sm whitespace-pre-wrap">{streamingResponse}<span className="inline-block w-1 h-4 bg-sky-400 ml-1 animate-pulse"></span></p>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex items-center gap-3 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isResponding}
                    className="w-full bg-slate-900/70 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-300 shadow-sm disabled:opacity-50"
                />
                <button type="submit" disabled={isResponding || !input.trim()} className="p-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    {isResponding ? <SpinnerIcon className="h-6 w-6" /> : <PaperAirplaneIcon className="h-6 w-6" />}
                </button>
            </form>
        </div>
    );
};
