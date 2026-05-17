import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileText, Download, Loader2, ArrowRight, BookOpen, Send, Bot, User, Trash2, LayoutDashboard, MessageSquare, Settings, LogOut, Info, ShieldCheck, Phone, Mail, MessageCircle, Menu, X, Camera } from 'lucide-react';
import Markdown from 'react-markdown';
import { extractTextFromFile, downloadTextAsFile } from './lib/file-utils';
import { chatWithDocumentStream, ChatMessage } from './services/geminiService';
import { themes } from './themes';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoginScreen } from './components/LoginScreen';
import { SmartScan } from './components/SmartScan';

export interface ChatSession {
  id: string;
  date: string;
  fileName: string;
  documentText: string;
  messages: ChatMessage[];
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  const [activeMenu, setActiveMenu] = useState<'files' | 'chat' | 'scan' | 'settings'>('files');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handle dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#15151e' }).catch(() => {});
    } else {
      document.documentElement.classList.remove('dark');
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
    }
  }, [isDarkMode]);

  // Handle Capacitor hardware back button
  useEffect(() => {
    const setupBackButton = async () => {
      try {
        await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (activeMenu !== 'files') {
            setActiveMenu('files');
          } else {
            CapacitorApp.exitApp();
          }
        });
      } catch (err) {
        // App plugin not available (e.g. running on web)
      }
    };
    setupBackButton();
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [activeMenu]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', activeTheme.primary);
    document.documentElement.style.setProperty('--primary-hover', activeTheme.hover);
    document.documentElement.style.setProperty('--primary-light', activeTheme.light);
    document.documentElement.style.setProperty('--primary-border', activeTheme.border);
  }, [activeTheme]);

  const [showSplash, setShowSplash] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [activeMenu]);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [documentText, setDocumentText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractError, setExtractError] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('khubaibSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const currentSessionId = useRef<string | null>(null);

  // Auto-save session
  useEffect(() => {
    if (messages.length > 0 && documentText && file) {
      if (!currentSessionId.current) {
        currentSessionId.current = Date.now().toString();
      }
      const updatedSession: ChatSession = {
        id: currentSessionId.current,
        date: new Date().toISOString(),
        fileName: file.name,
        documentText,
        messages
      };
      
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === updatedSession.id);
        let newSessions: ChatSession[];
        if (idx >= 0) {
          newSessions = [...prev];
          newSessions[idx] = updatedSession;
        } else {
          newSessions = [updatedSession, ...prev];
        }
        localStorage.setItem('khubaibSessions', JSON.stringify(newSessions));
        return newSessions;
      });
    }
  }, [messages, documentText, file]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  const [isDownloading, setIsDownloading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, activeMenu]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
      setExtractError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setFile(selectedFile);
    setExtractError('');
    setDocumentText('');
    setMessages([]);
    setIsExtracting(true);
    setUploadProgress(0);
    currentSessionId.current = null;
    
    try {
      const text = await extractTextFromFile(selectedFile, (percent) => {
        setUploadProgress(percent);
      });
      if (!text.trim()) {
        throw new Error("له فایل څخه هیڅ متن ونشو لوستلی (کیدای شي فایل تش وي یا یوازې عکسونه ولري).");
      }
      setDocumentText(text);
      setMessages([
        { role: 'assistant', content: `سلام! ما ستا فایل (${selectedFile.name}) ولولست. اوس کولی شې راته ووایې چې څه ورسره وکړم؟ مثلاً: "دا په پښتو وژباړه"، یا "د دې فایل لنډیز راته ولیکه".` }
      ]);
      // Switch to Chat menu after successful upload
      setActiveMenu('chat');
    } catch (err: any) {
      setExtractError(err.message || 'An upload error occurred.');
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    e?.preventDefault();
    const msg = (presetMsg || inputValue).trim();
    if (!msg || !documentText || isTyping) return;

    setInputValue('');
    setIsTyping(true);
    setStreamingMessage('');
    
    const newHistory = [...messages, { role: 'user', content: msg } as ChatMessage];
    setMessages(newHistory);

    try {
      const finalMsg = await chatWithDocumentStream(documentText, messages, msg, (chunk) => {
        setStreamingMessage(chunk);
      });
      
      setMessages([...newHistory, { role: 'assistant', content: finalMsg }]);
      setStreamingMessage('');
    } catch (err: any) {
      console.error(err);
      setMessages([...newHistory, { role: 'assistant', content: `وبښئ، یوه ستونزه رامنځته شوه: ${err.message}` }]);
      setStreamingMessage('');
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadChat = async () => {
    if (messages.length === 0) return;
    setIsDownloading(true);
    
    // Simulate slight delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    const textData = messages.map(m => `${m.role === 'user' ? 'شما (You)' : 'همکار خبيب تکل'}:\n${m.content}\n\n`).join('');
    downloadTextAsFile(textData, 'chat_history.txt');
    
    setIsDownloading(false);
  };

  // Quick action chips
  const quickActions = [
    "دا فایل په پښتو وژباړه",
    "لنډیز یې راته ولیکه",
    "مهم ټکي یې راته ووایه",
    "د دې فایل اصلي هدف څه دی؟",
    "له دې فایل څخه ۱۰ مهمې پوښتنې جوړې کړه",
    "دا فایل په ساده ژبه تشریح کړه",
    "مثبت او منفي ټکي څه دي؟",
    "نیوکه پرې ولیکه",
    "په دري ژبه یې وژباړه",
    "په انګلیسي ژبه یې وژباړه"
  ];
  
  // Splash Component to be reused
  const renderSplash = () => (
     <motion.div 
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-primary flex-col gap-4 text-white"
      >
         <motion.div 
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: 'spring', bounce: 0.5 }}
           className="w-24 h-24 bg-[var(--bg-surface)]/20 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-2xl"
         >
           <BookOpen className="w-12 h-12 text-white" />
         </motion.div>
         <motion.h1 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-3xl md:text-4xl font-bold tracking-tight mt-4 text-center"
         >
           همکار خبيب تکل
         </motion.h1>
         <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="text-primary-hover mt-2 text-lg"
         >
           کاریال جوړونکی : طالب العلم حبيب تكل
         </motion.p>
      </motion.div>
  );

  if (!isLoggedIn) {
    return (
      <>
        {!showSplash && (
          <LoginScreen 
            onLoginSuccess={() => {
              localStorage.setItem('isLoggedIn', 'true');
              setIsLoggedIn(true);
            }} 
          />
        )}
        <AnimatePresence>
          {showSplash && renderSplash()}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[var(--bg-canvas)] text-[var(--text-strong)] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--line-color)] z-20 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--text-strong)]">همکار خبيب تکل</span>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -mr-2 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation / Drawer */}
      <nav className={`
        fixed md:relative inset-y-0 right-0 w-64 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-l border-[var(--line-color)] flex flex-col z-40 shadow-2xl md:shadow-sm md:bg-[var(--bg-surface)]/80 transition-transform duration-300 transform shrink-0
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-[var(--line-color)]/60 mb-4 md:h-[72px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-strong)]">همکار خبيب تکل</span>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="md:hidden p-2 -ml-2 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-3 md:px-4 gap-2 overflow-y-auto pb-4">
          <MenuButton 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="فایلونه او اسناد" 
            subLabel="PDF او خطي اسنادو شننه"
            isActive={activeMenu === 'files'} 
            onClick={() => { setActiveMenu('files'); setIsDrawerOpen(false); }} 
          />
          <MenuButton 
            icon={<Camera className="w-5 h-5" />} 
            label="هوښیار سکن" 
            subLabel="له انځور څخه متن ایستل"
            isActive={activeMenu === 'scan'} 
            onClick={() => { setActiveMenu('scan'); setIsDrawerOpen(false); }} 
          />
          <MenuButton 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="له سند سره چټ" 
            subLabel="د خپل سند په اړه وپوښتئ"
            isActive={activeMenu === 'chat'} 
            onClick={() => { setActiveMenu('chat'); setIsDrawerOpen(false); }} 
            disabled={!documentText}
          />
          
          <div className="mt-auto pt-4 border-t border-[var(--line-color)]/60 flex flex-col gap-2">
            <MenuButton 
              icon={<Settings className="w-5 h-5" />} 
              label="ترتیبات" 
              subLabel="رنګونه او اپلیکیشن بدلول"
              isActive={activeMenu === 'settings'} 
              onClick={() => { setActiveMenu('settings'); setIsDrawerOpen(false); }} 
            />
             <MenuButton 
               icon={<LogOut className="w-5 h-5 text-red-500" />} 
               label="وتل" 
               isActive={false} 
               onClick={() => { setShowExitModal(true); setIsDrawerOpen(false); }} 
             />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col w-full h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-0 md:p-4 flex justify-center">
          <div className="w-full h-full flex flex-col">
            
            <AnimatePresence mode="wait">
              {/* === FILES TAB === */}
              {activeMenu === 'files' && (
                <motion.div 
                  key="files-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center min-h-0 py-8 px-4"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[var(--text-strong)] mb-3">فایل اپلوډ کړئ</h2>
                    <p className="text-[var(--text-subtle)] text-sm max-w-sm mx-auto">خپل PDF، DOCX، یا TXT فایلونه اپلوډ کړئ ترڅو زموږ هوښیار سیسټم یې تحلیل او وژباړي.</p>
                  </div>

                  <div className="w-full max-w-lg shrink-0">
                    <div
                      className={`
                        relative group flex flex-col items-center justify-center p-10 md:p-12 text-center border-2 border-dashed rounded-3xl transition-all duration-300
                        ${dragActive ? 'border-indigo-500 bg-primary-light scale-[1.02]' : 'border-[var(--line-color)] bg-[var(--bg-surface)]/80 backdrop-blur hover:border-indigo-300'}
                        ${file ? 'border-none bg-[var(--bg-surface)] shadow-sm ring-1 ring-[var(--ring-shine)]' : ''}
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) handleFileSelected(e.target.files[0]);
                        }}
                      />
                      
                      <AnimatePresence mode="wait">
                        {!file ? (
                          <motion.div 
                            key="upload"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                            className="flex flex-col items-center w-full min-h-[160px]"
                          >
                            <div className="w-16 h-16 mb-5 rounded-2xl bg-primary-light flex items-center justify-center text-primary-hover group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                               <UploadCloud className="w-8 h-8" />
                            </div>
                            <p className="text-[var(--text-strong)] font-semibold text-lg mb-1">
                              فایل دلته کش کړئ
                            </p>
                            <p className="text-sm text-[var(--text-subtle)] mb-8">
                              یوازې PDF, DOCX, او TXT
                            </p>
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover shadow-sm transition-all focus:ring-4 focus:ring-primary-border"
                            >
                              فایل وټاکئ
                            </button>
                            {extractError && <p className="text-red-400 text-sm mt-4 bg-red-500/10 p-3 rounded-xl border border-red-100 font-medium">{extractError}</p>}
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="file"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center w-full min-h-[160px]"
                          >
                            <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center text-primary-hover mb-4 relative group shadow-sm ring-1 ring-primary-border">
                              <FileText className="w-10 h-10" />
                              {isExtracting && (
                                <div className="absolute inset-0 bg-[var(--bg-surface)]/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-1">
                                  <Loader2 className="w-5 h-5 text-primary-hover animate-spin" />
                                  <span className="text-[10px] font-bold text-primary-hover">{uploadProgress}%</span>
                                </div>
                              )}
                            </div>
                            <p className="text-base font-semibold text-[var(--text-strong)] truncate w-full px-2" title={file.name}>
                              {file.name}
                            </p>
                            
                            {isExtracting ? (
                              <div className="w-full max-w-[200px] mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-medium px-1">
                                  <span className="text-primary-hover">فایل لوستل کیږي...</span>
                                  <span className="text-primary-hover">{uploadProgress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--line-color)] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-300 ease-out rounded-full" 
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-4 text-sm font-medium">
                                 <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-600/10 px-3 py-1 rounded-full border border-emerald-100">
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                   فایل چمتو دی
                                 </span>
                              </div>
                            )}
                            <div className="flex gap-2 w-full mt-6 justify-center">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all focus:ring-4 focus:ring-primary-border flex-1"
                              >
                                <UploadCloud className="w-4 h-4" />
                                نوی فایل وټاکئ
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFile(null);
                                  setDocumentText('');
                                  setMessages([]);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                ړنګول
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Previous Sessions */}
                    {sessions.length > 0 && (
                      <div className="mt-6 w-full max-w-xl mx-auto space-y-3">
                        <h3 className="text-lg font-bold tracking-tight text-[var(--text-strong)] px-2 mb-4">وروستي تنظیم شوي فایلونه</h3>
                        {sessions.map((session) => (
                          <motion.button 
                            key={session.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                               currentSessionId.current = session.id;
                               setFile(new File([], session.fileName));
                               setDocumentText(session.documentText);
                               setMessages(session.messages);
                               setActiveMenu('chat');
                            }}
                            className="w-full flex items-center justify-between p-4 bg-[var(--bg-canvas)] border border-[var(--line-color)] rounded-2xl hover:border-primary-light transition-colors text-right group"
                          >
                            <div className="flex items-center gap-4 overflow-hidden flex-1">
                              <div className="w-12 h-12 rounded-xl bg-primary-light/50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                <MessageCircle className="w-6 h-6" />
                              </div>
                              <div className="flex flex-col truncate items-start">
                                <span className="font-semibold text-[var(--text-strong)] truncate text-base">{session.fileName}</span>
                                <span className="text-sm border min-w-0 border-transparent text-[var(--text-subtle)] truncate mt-0.5">{new Date(session.date).toLocaleString('fa-AF')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                               <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary text-sm font-semibold bg-primary-light/40 group-hover:bg-primary group-hover:text-white transition-colors">
                                  <span>خلاصول</span>
                                  <ArrowRight className="w-4 h-4 rotate-180" />
                               </div>
                               <ArrowRight className="sm:hidden w-5 h-5 text-[var(--text-subtle)] group-hover:text-primary transition-colors rotate-180 shrink-0" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* === CHAT TAB === */}
              {activeMenu === 'chat' && (
                <motion.div 
                  key="chat-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-surface)] shadow-sm ring-1 ring-[var(--ring-shine)] rounded-3xl"
                >
                  <div className="px-6 py-4 border-b border-[var(--line-color)]/60 bg-[var(--bg-header)] shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <FileText className="w-5 h-5 text-primary-hover" />
                       <div>
                         <h3 className="text-sm font-semibold text-[var(--text-strong)] truncate max-w-[200px] md:max-w-md">
                           {file?.name || "فایل"}
                         </h3>
                         <p className="text-[11px] text-[var(--text-subtle)]">فعال سند</p>
                       </div>
                    </div>
                    {/* Header Tools */}
                    <div className="flex items-center gap-2">
			          <button 
                         onClick={() => {
                           setFile(null);
                           setDocumentText('');
                           setMessages([]);
                           setActiveMenu('files');
                         }}
                         className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors ring-1 ring-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:block text-xs font-medium">نوی فایل</span>
                      </button>
                      {messages.length > 0 && (
                        <button 
                           onClick={handleDownloadChat}
                           disabled={isDownloading}
                           className="flex items-center gap-2 px-3 py-1.5 bg-primary-light text-primary-hover rounded-lg hover:bg-primary-border transition-colors ring-1 ring-primary-border disabled:opacity-50"
                        >
                          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          <span className="hidden sm:block text-xs font-medium">ډونلوډ</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Header quick actions (Scrollable row for all devices) */}
                  {documentText && !isTyping && messages.length === 1 && (
                    <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[var(--line-color)]/60 bg-[var(--bg-header)]/50 py-2 px-4 shadow-inner">
                      <div className="flex gap-2 w-max items-center">
                        {quickActions.map((action, i) => (
                           <button
                             key={i}
                             onClick={() => handleSendMessage(undefined, action)}
                             className="px-3 py-1.5 bg-[var(--bg-surface)] shadow-sm ring-1 ring-[var(--line-color)] hover:ring-primary-border rounded-lg text-[13px] font-medium text-[var(--text-main)] hover:text-primary-hover hover:bg-[var(--bg-surface)]/80 transition-all shrink-0"
                           >
                             {action}
                           </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 opacity-90" style={{ backgroundColor: 'var(--bg-canvas)', backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    <AnimatePresence initial={false}>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-br from-indigo-50 to-white text-primary-hover ring-1 ring-[var(--line-color)]'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-5 h-5 md:w-6 md:h-6" />}
                          </div>
                          <div className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-start'} max-w-[90%] md:max-w-[85%]`}>
                            <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-[15px] leading-relaxed
                              ${msg.role === 'user' 
                                ? 'bg-primary text-white rounded-tr-sm rtl:rounded-tr-2xl rtl:rounded-tl-sm' 
                                : 'bg-[var(--bg-surface)] text-[var(--text-main)] ring-1 ring-[var(--line-color)]/80 rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm markdown-body overflow-x-auto shadow-sm'
                              }`}
                              dir={msg.role === 'user' ? 'rtl' : 'auto'} // Auto direction for bot to support LTR languages nicely
                            >
                              {msg.role === 'assistant' ? (
                                 <Markdown>{msg.content}</Markdown>
                              ) : (
                                 msg.content
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Streaming Message */}
                      {streamingMessage && (
                         <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="flex gap-3 md:gap-4"
                         >
                           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white text-primary-hover ring-1 ring-[var(--line-color)]">
                             <Bot className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div className="flex flex-col items-start max-w-[90%] md:max-w-[85%]">
                             <div className="px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-[15px] leading-relaxed bg-[var(--bg-surface)] text-[var(--text-main)] ring-1 ring-[var(--line-color)]/80 rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm markdown-body overflow-x-auto min-w-[60px]" dir="auto">
                                <Markdown>{streamingMessage}</Markdown>
                             </div>
                           </div>
                         </motion.div>
                      )}

                      {/* Typing Indicator */}
                      {isTyping && !streamingMessage && (
                         <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex gap-3 md:gap-4"
                         >
                           <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white text-primary-hover ring-1 ring-[var(--line-color)]">
                             <Bot className="w-5 h-5 md:w-6 md:h-6" />
                           </div>
                           <div className="px-5 py-4 bg-[var(--bg-surface)] rounded-2xl rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm shadow-sm ring-1 ring-[var(--line-color)]/80 flex items-center gap-1.5 h-[46px]">
                             <div className="w-2 h-2 bg-primary-hover rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                             <div className="w-2 h-2 bg-primary-hover rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                             <div className="w-2 h-2 bg-primary-hover rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                           </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-2" />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 md:p-4 bg-[var(--bg-surface)] border-t border-[var(--line-color)]/60 shrink-0">
                    <form 
                      onSubmit={handleSendMessage}
                      className="flex gap-2 md:gap-3 bg-[var(--bg-canvas)] focus-within:bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-primary-hover rounded-2xl p-1.5 md:p-2 transition-all ring-1 ring-[var(--line-color)]/80"
                    >
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none px-3 text-[var(--text-main)] placeholder-gray-400 text-sm md:text-[15px]"
                        placeholder="خپله پوښتنه دلته ولیکئ..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isTyping}
                      />
                      <button 
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="p-2.5 md:p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:hover:bg-primary shrink-0 shadow-sm"
                      >
                        <Send className="w-5 h-5 -rotate-90 rtl:rotate-180" />
                      </button>
                    </form>
                    <p className="text-center text-[10px] md:text-[11px] text-[var(--text-subtle)] mt-2 md:mt-3 px-4">
                      د هوښیار چټ (AI) معلومات ممکن کله ناکله تیروتنې ولري. مهرباني وکړئ مهم معلومات بیا کتنه وکړئ.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* === SCAN TAB === */}
              {activeMenu === 'scan' && (
                <motion.div 
                  key="scan-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col items-center justify-center min-h-0 w-full"
                >
                  <SmartScan />
                </motion.div>
              )}

              {/* === SETTINGS TAB === */}
              {activeMenu === 'settings' && (
                <motion.div 
                  key="settings-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 flex flex-col p-4 md:p-8"
                >
                  <div className="max-w-2xl w-full mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--text-strong)] mb-6">ترتیبات</h2>
                    
                    <div className="bg-[var(--bg-surface)] rounded-3xl p-4 md:p-6 shadow-sm ring-1 ring-[var(--ring-shine)] space-y-6">
                      
                      {/* Themes Section */}
                      <div>
                        <div className="flex items-center justify-between px-2 mb-4">
                          <h3 className="text-lg font-bold text-[var(--text-strong)]">د اپلکیشن ډیزاین او رنګونه</h3>
                          
                          <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-[var(--line-color)] text-[var(--text-main)] hover:text-[var(--text-strong)] transition-colors text-sm font-medium shadow-sm"
                          >
                            {isDarkMode ? 'د ورځې حالت (Light)' : 'د شپې حالت (Dark)'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {themes.map(theme => (
                            <button
                              key={theme.id}
                              onClick={() => setActiveTheme(theme)}
                              className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
                                activeTheme.id === theme.id 
                                  ? 'border-transparent bg-[var(--surface-hover)] ring-2 ring-primary ring-offset-2 ring-offset-[#1a1a24] shadow-md'
                                  : 'border-[var(--line-color)]/60 hover:bg-[var(--surface-hover)]/50 hover:border-gray-700'
                              }`}
                            >
                              <div 
                                className="w-6 h-6 rounded-full shadow-sm flex-shrink-0" 
                                style={{ backgroundColor: theme.primary }} 
                              />
                              <span className={`text-sm font-medium ${activeTheme.id === theme.id ? 'text-[var(--text-strong)]' : 'text-[var(--text-subtle)]'}`}>
                                {theme.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-px w-full bg-[var(--surface-hover)]/60" />

                      <div className="space-y-4">
                       <button
                         onClick={() => setShowAboutDialog(true)}
                         className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-canvas)] rounded-2xl transition-colors border border-[var(--line-color)]/60 group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary-light text-primary-hover rounded-xl group-hover:scale-110 transition-transform">
                             <Info className="w-6 h-6" />
                           </div>
                           <div className="text-right flex flex-col items-start font-medium">
                             <span className="text-[var(--text-strong)] text-lg">د کاریال په اړه (About App)</span>
                             <span className="text-sm text-[var(--text-subtle)]">د کاریال جوړونکي او نور معلومات</span>
                           </div>
                         </div>
                         <ArrowRight className="w-5 h-5 text-[var(--text-subtle)] rotate-180" />
                       </button>

                       <button
                         onClick={() => setShowAuthDialog(true)}
                         className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-canvas)] rounded-2xl transition-colors border border-[var(--line-color)]/60 group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                             <ShieldCheck className="w-6 h-6" />
                           </div>
                           <div className="text-right flex flex-col items-start font-medium">
                             <span className="text-[var(--text-strong)] text-lg">سرچینې او باوريوالی</span>
                             <span className="text-sm text-[var(--text-subtle)]">د معلوماتو او منبعو د اعتبار په اړه</span>
                           </div>
                         </div>
                         <ArrowRight className="w-5 h-5 text-[var(--text-subtle)] rotate-180" />
                       </button>
                      </div>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
            
          </div>
        </div>
      </main>

      {/* Pop-up Dialogs */}
      <AnimatePresence>
        {showSplash && renderSplash()}

        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowExitModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl overflow-hidden p-6 max-w-sm w-full relative z-10"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-red-500/100/20 rounded-2xl flex items-center justify-center text-red-400 mb-6 mx-auto">
                <LogOut className="w-8 h-8 ml-1" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-strong)] text-center mb-2">ايا غواړئ چې له اپلکیشن څخه ووځئ؟</h3>
              <p className="text-center text-[var(--text-subtle)] mb-8 text-sm">که تاسو ووځئ، ستاسو اوسنی چټ به له منځه لاړ شي.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-3 bg-[var(--surface-hover)] hover:bg-gray-700 text-[var(--text-main)] rounded-xl font-medium transition-colors"
                >
                  نه
                </button>
                <button 
                  onClick={() => window.close()}
                  className="flex-1 px-4 py-3 bg-red-500/100 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  هو
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* About App Dialog */}
        {showAboutDialog && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowAboutDialog(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl overflow-hidden p-6 max-w-md w-full relative z-10"
              dir="rtl"
            >
              <h3 className="text-xl font-bold text-[var(--text-strong)] mb-4 flex items-center gap-2 border-b border-[var(--line-color)]/60 pb-3">
                <Info className="w-5 h-5 text-primary-hover" />
                د کاریال په اړه
              </h3>
              <p className="text-[var(--text-main)] text-[15px] leading-relaxed mb-6 font-medium">
                ددغه کاریال جوړونکی طالب العلم <span className="font-bold text-primary-hover">حبيب تكل</span> ده چی فی الحال د لوګر ولایت په مرکزی جهادی مدرسي خپلی دیني زده کړي دوري په کچه سرته رسولی نوموړی هیله لری خپل اسلام مقدس دین ته خدمت تر سره کړی نو له څخه مو هیله ده چی د کاریال حدیثونه اول خپله مطالعه او عمل پرې وکړئ بیایي له نورو مسلمانانو سره شریک کړی په درنښت داسلامی کاریالونو څانګه
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a href="https://wa.me/93765443156" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-xl hover:bg-green-100 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium text-sm">واټساپ اړیکه</span>
                </a>
                <a href="tel:+93777233699" className="flex items-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-xl hover:bg-blue-100 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span className="font-medium text-sm">ټلیفون اړیکه</span>
                </a>
                <a href="mailto:khobibtakl@gmail.com" className="flex items-center gap-2 bg-red-500/10 text-red-700 p-3 rounded-xl hover:bg-red-500/100/20 transition-colors">
                  <Mail className="w-5 h-5" />
                  <span className="font-medium text-sm">جیمیل آدرس</span>
                </a>
                <a href="https://t.me/khubaib_taki" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-sky-50 text-sky-700 p-3 rounded-xl hover:bg-sky-100 transition-colors">
                  <Send className="w-5 h-5" />
                  <span className="font-medium text-sm">ټلګرام آدرس</span>
                </a>
              </div>

              <button 
                onClick={() => setShowAboutDialog(false)}
                className="w-full px-4 py-3 bg-[var(--surface-hover)] hover:bg-gray-700 text-[var(--text-main)] rounded-xl font-bold transition-colors"
              >
                تړل
              </button>
            </motion.div>
          </div>
        )}

        {/* Authenticity Dialog */}
        {showAuthDialog && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowAuthDialog(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl overflow-hidden p-6 max-w-md w-full relative z-10"
              dir="rtl"
            >
              <h3 className="text-xl font-bold text-[var(--text-strong)] mb-4 flex items-center gap-2 border-b border-[var(--line-color)]/60 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                سرچینې او باوريوالی
              </h3>
              <p className="text-[var(--text-main)] text-sm leading-relaxed mb-6">
                مونږ تر ډیره کوشش کړی چی په اپلکیشن کی داسی احادیث را یو ځای کړو چی صحیح وي بیا هم انسان او بشر سره خطا کیدل لازم دي نو که چېرته کوم حدیث غلط یا ضعیف وی او یا هم په سند کی یی مشکل وی نو مونږ سره اړیکه ونیسی ترڅو یاد حدیث اصلاح کړو په درنښت: ستاسو ورور طالب العلم حبيب تكل
              </p>
              
              <button 
                onClick={() => setShowAuthDialog(false)}
                className="w-full px-4 py-3 bg-emerald-600/100 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
              >
                پوه شوم
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable menu button component
function MenuButton({ 
  icon, 
  label, 
  subLabel,
  isActive, 
  onClick,
  disabled = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  subLabel?: string;
  isActive: boolean; 
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex-col md:flex-row flex items-start md:items-center py-3 px-4 rounded-2xl transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed text-[var(--text-subtle)]' : 
          isActive 
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
            : 'text-[var(--text-strong)] hover:bg-[var(--surface-hover)] hover:scale-[1.01]'
        }
      `}
      title={label}
    >
      <div className={`flex items-center gap-3 w-full ${!isActive && 'text-[var(--text-subtle)] group-hover:text-primary'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-[var(--bg-canvas)]'}`}>
          {icon}
        </div>
        <div className="flex flex-col items-start flex-1 text-right overflow-hidden">
          <span className="font-bold text-[14px] truncate w-full">{label}</span>
          {subLabel && (
            <span className={`text-[11px] font-medium truncate w-full ${isActive ? 'text-white/80' : 'text-[var(--text-subtle)]'}`}>
              {subLabel}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

