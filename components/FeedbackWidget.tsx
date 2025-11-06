import React, { useState } from 'react';
import { submitFeedback } from '../services/feedbackService';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronUpDownIcon } from './icons/ChevronUpDownIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

type FeedbackType = 'General Feedback' | 'Bug Report' | 'Feature Request' | 'Content Issue';
const feedbackTypes: FeedbackType[] = ['General Feedback', 'Bug Report', 'Feature Request', 'Content Issue'];

export const FeedbackWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('General Feedback');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setIsSubmitted(false);
        setMessage('');
        setFeedbackType('General Feedback');
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setIsOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await submitFeedback(feedbackType, message);
            setIsSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 2000); // Close modal after 2 seconds
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            // Optionally show an error message to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-3 rounded-full shadow-lg hover:shadow-glow-sky transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400"
                aria-label="Open feedback form"
            >
                <ChatBubbleLeftRightIcon className="h-7 w-7" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" onClick={handleClose}>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                        {isSubmitted ? (
                            <div className="p-8 text-center">
                                <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-white">Feedback Sent!</h2>
                                <p className="text-slate-400 mt-2">Thank you for helping us improve.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-white">Submit Feedback</h2>
                                        <button type="button" onClick={handleClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="feedbackType" className="block text-sm font-medium text-slate-300 mb-1">
                                                Feedback Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="feedbackType"
                                                    value={feedbackType}
                                                    onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                                                    className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2 px-3 text-white appearance-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                                >
                                                    {feedbackTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <ChevronUpDownIcon className="h-5 w-5 text-slate-400 absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="feedbackMessage" className="block text-sm font-medium text-slate-300 mb-1">
                                                Message
                                            </label>
                                            <textarea
                                                id="feedbackMessage"
                                                rows={5}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Please provide as much detail as possible..."
                                                className="w-full bg-slate-900/70 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 px-6 py-4 flex justify-end items-center border-t border-slate-700 rounded-b-lg">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="flex items-center justify-center px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <SpinnerIcon className="h-5 w-5 mr-2" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                                Submit
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};