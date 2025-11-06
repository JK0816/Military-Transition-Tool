import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ToastProps {
  message: string;
  show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, show }) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <div className="flex items-center bg-slate-900/80 backdrop-blur-sm text-white py-2.5 px-5 rounded-full shadow-lg border border-green-500/30">
        <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
        <span className="text-sm font-semibold">{message}</span>
      </div>
    </div>
  );
};
