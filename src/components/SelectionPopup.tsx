import React, { useState, useEffect } from 'react';
import { Search, Copy, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { queryGemini } from '../utils/ai-providers/gemini';

interface SelectionPopupProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  onDefine: () => void;
  onExplain: () => void;
  visible: boolean;
  onSearch: (answer: string) => void;
  darkMode: boolean;
}

export const SelectionPopup: React.FC<SelectionPopupProps> = ({
  position,
  selectedText,
  visible,
  onSearch,
  darkMode
}) => {
  const [showExtended, setShowExtended] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (visible && position) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const popupWidth = 300; // Approximate popup width
      const popupHeight = showExtended ? 150 : 48; // Approximate popup heights

      let x = position.x;
      let y = position.y;
      let transformOrigin = 'center bottom';
      let translate = 'translate(-50%, -100%) translateY(-10px)';

      // Horizontal position adjustments
      if (x - popupWidth/2 < 0) {
        x = popupWidth/2;
      } else if (x + popupWidth/2 > windowWidth) {
        x = windowWidth - popupWidth/2;
      }

      // Vertical position adjustments
      if (y - popupHeight < 0) {
        y += popupHeight + 20; // Show below selection
        transformOrigin = 'center top';
        translate = 'translate(-50%, 0) translateY(10px)';
      }

      setPopupStyle({
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        transform: translate,
        transformOrigin,
        zIndex: 50,
      });
    }
  }, [position, visible, showExtended]);

  if (!visible || !position) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const prompt = `
Please analyze and provide detailed information about: "${selectedText}"

Your response should:
1. Provide comprehensive context and explanation
2. Include relevant facts and details
3. Cite sources when possible
4. Use clear, concise language
5. Format with markdown for readability
`;

    try {
      const answer = await queryGemini(prompt);
      onSearch(answer);
      
      setTimeout(() => {
        const answerElement = document.getElementById('search-answer');
        if (answerElement) {
          answerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBack = () => {
    setShowExtended(false);
  };

  const baseClasses = `
    selection-popup
    ${darkMode ? 'dark bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    shadow-xl border rounded-xl overflow-hidden
  `;

  const buttonClasses = `
    flex items-center gap-2 px-4 py-2 text-sm font-medium
    ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}
    transition-colors
  `;

  return (
    <div className={baseClasses} style={popupStyle}>
      <div className={`flex items-center ${darkMode ? 'divide-gray-700' : 'divide-gray-100'} divide-x`}>
        {showExtended && (
          <button
            onClick={handleBack}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-50 text-gray-400'}`}
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex">
          <button
            onClick={handleSearch}
            className={buttonClasses}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCopy}
            className={buttonClasses}
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => setShowExtended(true)}
            className={buttonClasses}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showExtended && (
        <div className={`p-2 space-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Translate
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Summarize
          </button>
          <button
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
              ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Explain
          </button>
        </div>
      )}
    </div>
  );
};