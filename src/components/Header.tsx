import React from 'react';
import { Brain, Moon, Sun, Loader2, Check } from 'lucide-react';

interface HeaderProps {
  url: string;
  onSummarize: () => void;
  isSummarizing: boolean;
  isSummarized: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  url, 
  onSummarize, 
  isSummarizing,
  isSummarized,
  darkMode,
  onToggleDarkMode
}) => (
  <div className="border-b border-gray-100 dark:border-gray-800">
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">HARVv1</h1>
        <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">MARK04-Experimental</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
        <button 
          onClick={onSummarize} 
          disabled={isSummarizing}
          className={`button-primary flex items-center gap-2 ${
            isSummarizing ? 'opacity-75 cursor-not-allowed' : ''
          } ${
            isSummarized ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70' : ''
          }`}
        >
          {isSummarizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Summarizing...
            </>
          ) : isSummarized ? (
            <>
              <Check className="w-4 h-4" />
              Summarized
            </>
          ) : (
            'Summarize'
          )}
        </button>
      </div>
    </div>
    {url && (
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={url}>
          {url}
        </p>
      </div>
    )}
  </div>
);