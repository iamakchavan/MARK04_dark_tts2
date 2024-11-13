import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeCurrentPage, askQuestion, defineSelection, elaborateSelection } from './utils/ai';
import { Header } from './components/Header';
import { QuestionInput } from './components/QuestionInput';
import { ContentSection } from './components/ContentSection';
import { FocusModal } from './components/FocusModal';
import { SelectionPopup } from './components/SelectionPopup';
import { AnswerAnimation } from './components/AnswerAnimation';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [answerType, setAnswerType] = useState<'define' | 'elaborate' | 'search' | null>(null);
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [searchScope, setSearchScope] = useState<'all' | 'domain' | 'page'>('page');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{
    position: { x: number; y: number } | null;
    text: string;
    visible: boolean;
  }>({
    position: null,
    text: '',
    visible: false
  });

  const answerRef = useRef<HTMLDivElement>(null);
  const searchAnswerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    summarizeCurrentPage();
    getCurrentUrl();
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToAnswer = () => {
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getCurrentUrl = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.url) {
      setUrl(tabs[0].url);
    }
  };

  const summarizeCurrentPage = async () => {
    setIsSummarizing(true);
    setLoading(true);
    try {
      const summary = await analyzeCurrentPage();
      setSummary(summary);
      setIsSummarized(true);
    } catch (error) {
      console.error('Error analyzing page:', error);
    }
    setLoading(false);
    setIsSummarizing(false);
  };

  const handleTextSelection = useCallback((event: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const popupWidth = 300; // Approximate popup width
        const popupHeight = 150; // Approximate popup height

        // Calculate optimal position
        let x = rect.left + (rect.width / 2);
        let y = rect.top;

        // Adjust horizontal position if too close to screen edges
        if (x - popupWidth/2 < 0) {
          x = popupWidth/2;
        } else if (x + popupWidth/2 > windowWidth) {
          x = windowWidth - popupWidth/2;
        }

        // Adjust vertical position if too close to top or bottom
        if (y - popupHeight < 0) {
          y = rect.bottom + 10; // Show below selection
        } else {
          y = rect.top - 10; // Show above selection
        }

        setSelectionPopup({
          position: { x, y },
          text: selectedText,
          visible: true
        });
      }
    } else {
      setSelectionPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const popup = document.querySelector('.selection-popup');
    if (!popup?.contains(event.target as Node)) {
      setSelectionPopup(prev => ({ ...prev, visible: false }));
    }
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await askQuestion(question, searchScope);
      setAnswer(response);
      setQuestion('');
      scrollToAnswer();
    } catch (error) {
      console.error('Error getting answer:', error);
    }
    setLoading(false);
  };

  const handleSearch = (answer: string) => {
    setSearchAnswer(answer);
    setAnswerType('search');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <Header 
        url={url} 
        onSummarize={summarizeCurrentPage}
        isSummarizing={isSummarizing}
        isSummarized={isSummarized}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <div className="p-4 space-y-4">
        <QuestionInput
          question={question}
          loading={loading}
          onChange={setQuestion}
          onSubmit={handleQuestionSubmit}
          onFocusClick={() => setShowFocusModal(true)}
          searchScope={searchScope}
        />
        
        {summary && <ContentSection title="Page Summary" content={summary} />}
        
        <div ref={answerRef}>
          {loading && answerType && !answer && (
            <AnswerAnimation type={answerType} />
          )}
          {answer && (
            <ContentSection 
              title="Answer" 
              content={answer} 
            />
          )}
        </div>

        <div ref={searchAnswerRef} id="search-answer">
          {searchAnswer && (
            <ContentSection 
              title="Search Results" 
              content={searchAnswer} 
            />
          )}
        </div>
      </div>

      <SelectionPopup
        position={selectionPopup.position}
        selectedText={selectionPopup.text}
        onDefine={() => {}}
        onExplain={() => {}}
        onSearch={handleSearch}
        visible={selectionPopup.visible}
        darkMode={darkMode}
      />

      <FocusModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        onScopeSelect={setSearchScope}
        currentScope={searchScope}
      />
    </div>
  );
};

export default App;