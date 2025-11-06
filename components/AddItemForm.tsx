import React, { useState } from 'react';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface AddItemFormProps {
    onAdd: (text: string) => void;
    placeholder: string;
    buttonText: string;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, placeholder, buttonText }) => {
    const [text, setText] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setIsEditing(false);
            return;
        };
        onAdd(text);
        setText('');
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center w-full text-left text-sm text-slate-400 hover:text-sky-400 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
            >
                <PlusCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                {buttonText}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="flex-grow bg-slate-900 border border-slate-600 rounded-lg py-1.5 px-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                autoFocus
                onBlur={handleSubmit} // Submit when focus is lost
            />
            <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 text-sm"
            >
                Add
            </button>
        </form>
    );
};