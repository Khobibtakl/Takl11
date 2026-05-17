import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileImage, Image as ImageIcon, Download, Loader2, ArrowRight, Send, Bot, User, Trash2, Copy, Share2, Camera, FileText } from 'lucide-react';
import Markdown from 'react-markdown';
import { extractTextFromImageStream, chatWithImageStream, generateOrEditImage, ChatMessage } from '../services/geminiService';

export function SmartScan() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractError, setExtractError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

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
    if (!selectedFile.type.startsWith('image/')) {
      setExtractError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setExtractError('');
    setExtractedText('');
    setMessages([]);
    
    // Read file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      // Result is like: data:image/jpeg;base64,/9j/4AA...
      const base64Data = result.split(',')[1];
      setImageBase64(base64Data);
      setImageMimeType(selectedFile.type);
      
      // Auto extract
      await extractText(base64Data, selectedFile.type);
    };
    reader.onerror = () => {
      setExtractError('Failed to read image.');
    }
    reader.readAsDataURL(selectedFile);
  };

  const extractText = async (base64: string, mimeType: string) => {
    setIsExtracting(true);
    setExtractProgress(10);
    try {
      const prompt = "Please extract all text from this image as accurately as possible. Output ONLY the extracted text. Support Pashto, Arabic, Persian, Urdu, and English. Include both printed text and handwriting. If there is no text, just say NO_TEXT_FOUND.";
      let fullText = '';
      setExtractProgress(40);
      await extractTextFromImageStream(base64, mimeType, prompt, (chunk) => {
         fullText = chunk;
         setExtractProgress(prev => Math.min(prev + 5, 95));
      });
      setExtractProgress(100);
      if (fullText.includes("NO_TEXT_FOUND")) {
          setExtractedText("");
          setMessages([{ role: 'assistant', content: 'هیڅ متن په عکس کې ونه موندل شو، خو تاسو لا هم کولی شئ د عکس په اړه پوښتنې وکړئ.' }]);
      } else {
          setExtractedText(fullText);
          setMessages([
              { role: 'assistant', content: `ما متن په بریالیتوب سره استخراج کړ. اوس کولی شې راته ووایې چې څه ورسره وکړم؟ مثلاً: "دا په پښتو وژباړه"، "لنډیز یې ولیکه"، یا د عکس په اړه پوښتنه وکړه.` }
          ]);
      }
    } catch (err: any) {
      console.error(err);
      setExtractError(err.message || 'Error parsing image.');
    } finally {
      setIsExtracting(false);
      setExtractProgress(0);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    e?.preventDefault();
    const msg = (presetMsg || inputValue).trim();
    if (!msg || !imageBase64 || !imageMimeType || isTyping) return;

    setInputValue('');
    setIsTyping(true);
    setStreamingMessage('');

    const newHistory = [...messages, { role: 'user', content: msg } as ChatMessage];
    setMessages(newHistory);

    const shouldUseImageMode = isImageMode || msg.includes('ورته انځور') || msg.includes('انځور کې بدلون') || msg.includes('نوی انځور') || msg.includes('انځور جوړ');

    try {
      if (shouldUseImageMode) {
        setStreamingMessage('انځور جوړیږي... مهرباني وکړئ لږ انتظار وکړئ.'); // Generating image... please wait.
        const response = await generateOrEditImage(msg, imageBase64, imageMimeType);
        setMessages([...newHistory, { role: 'assistant', content: response.text || 'ستاسو انځور چمتو دی.', imageUrl: response.imageUrl }]);
        setStreamingMessage('');
      } else {
        const finalMsg = await chatWithImageStream(imageBase64, imageMimeType, newHistory, extractedText, (chunk) => {
          setStreamingMessage(chunk);
        });
        setMessages([...newHistory, { role: 'assistant', content: finalMsg }]);
        setStreamingMessage('');
      }
    } catch (err: any) {
      console.error(err);
      setMessages([...newHistory, { role: 'assistant', content: `وبښئ، یوه ستونزه رامنځته شوه: ${err.message}` }]);
      setStreamingMessage('');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) navigator.clipboard.writeText(extractedText);
  };

  const handleShare = async () => {
    if (navigator.share && extractedText) {
      try {
         await navigator.share({
           title: 'Extracted Text',
           text: extractedText,
         });
      } catch (e) {
         console.error(e);
      }
    }
  };

  // Quick action chips
  const quickActions = [
    "دا په پښتو وژباړه",
    "لنډیز یې راته ولیکه",
    "مشکل کلمات تشریح کړه",
    "نوی ورته انځور جوړ کړه",
    "انځور کې بدلون راوړه"
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[var(--bg-canvas)]">
      {/* Top Header */}
      <div className="text-center mb-6 px-4 shrink-0">
         <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-strong)] mb-2 mt-4">هوښیار سکن (Smart Scan)</h2>
         <p className="text-[var(--text-subtle)] text-sm max-w-md mx-auto">عکس اپلوډ یا کیمره خلاصه کړئ ترڅو متن ځینې راوباسو او د AI سره پرې خبرې وکړو.</p>
      </div>

      {!imageFile ? (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 flex justify-center items-start pt-4">
           <div className="w-full max-w-xl shrink-0">
             <div
               className={`
                 relative flex flex-col items-center justify-center p-8 md:p-12 text-center border-2 border-dashed rounded-3xl transition-all duration-300
                 ${dragActive ? 'border-primary bg-primary-light scale-[1.02]' : 'border-[var(--line-color)] bg-[var(--bg-surface)] hover:border-primary-border'}
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
                 accept="image/*"
                 onChange={(e) => {
                   if (e.target.files && e.target.files[0]) handleFileSelected(e.target.files[0]);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                 }}
               />
               <input
                 ref={cameraInputRef}
                 type="file"
                 className="hidden"
                 accept="image/*"
                 capture="environment"
                 onChange={(e) => {
                   if (e.target.files && e.target.files[0]) handleFileSelected(e.target.files[0]);
                   if (cameraInputRef.current) cameraInputRef.current.value = '';
                 }}
               />
               
               <div className="w-20 h-20 mb-6 rounded-3xl bg-primary-light flex items-center justify-center text-primary-hover shadow-sm">
                 <ImageIcon className="w-10 h-10" />
               </div>
               
               <p className="text-[var(--text-strong)] font-bold text-xl mb-2">
                 عکس دلته کش کړئ
               </p>
               <p className="text-sm text-[var(--text-subtle)] mb-8">
                 یا له لاندې غوراویو کار واخلئ
               </p>
               
               <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                 <button 
                   onClick={() => cameraInputRef.current?.click()}
                   className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--surface-hover)] text-[var(--text-strong)] border border-[var(--line-color)] text-sm font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm transition-all"
                 >
                   <Camera className="w-5 h-5" />
                   کیمره خلاصه کړه
                 </button>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-hover shadow-sm transition-all"
                 >
                   <UploadCloud className="w-5 h-5" />
                   ګالري ته لاړ شه
                 </button>
               </div>
               
               {extractError && <p className="text-red-400 text-sm mt-6 p-3 bg-red-500/10 rounded-xl border border-red-100/20">{extractError}</p>}
             </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto md:overflow-hidden max-w-7xl mx-auto w-full">
          
          {/* Left Panel: Image & Text Result */}
          <div className="w-full md:w-1/3 flex flex-col gap-3 md:gap-6 shrink-0 md:h-full md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide border-b md:border-b-0 border-[var(--line-color)]/60">
             {/* Image Preview Card */}
             <div className="w-full bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl border border-[var(--line-color)]/60 overflow-hidden shadow-sm relative group shrink-0">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <button 
                    onClick={() => setImageFile(null)}
                    className="p-1.5 md:p-2 bg-red-500/90 text-white rounded-lg md:rounded-xl backdrop-blur-md shadow-md hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className={`w-full h-32 md:h-56 object-cover transition-transform duration-500 ${isExtracting ? 'blur-sm opacity-60' : 'group-hover:scale-105'}`} />
                    {isExtracting && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
                          <div className="relative flex items-center justify-center bg-white rounded-full p-2 shadow-lg mb-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{Math.round(extractProgress)}%</span>
                          </div>
                          <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full">معلومات لوستل کیږي...</span>
                       </div>
                    )}
                  </div>
                )}
             </div>

             {/* Extracted Text Card */}
             <div className="w-full bg-[var(--bg-surface)] rounded-2xl md:rounded-3xl border border-[var(--line-color)]/60 shadow-sm flex flex-col min-h-[120px] md:flex-1 md:min-h-0 shrink-0">
               <div className="px-3 md:px-5 py-2.5 md:py-4 border-b border-[var(--line-color)]/60 flex items-center justify-between shrink-0 bg-[var(--bg-header)] rounded-t-2xl md:rounded-t-3xl">
                 <h3 className="font-bold text-[var(--text-strong)] flex items-center gap-2 text-[13px] md:text-sm">
                   <FileText className="w-4 h-4 text-primary" />
                   <span>استخراج شوی متن</span>
                 </h3>
                 {extractedText && (
                   <div className="flex items-center gap-1">
                     <button onClick={handleCopy} className="p-1.5 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-primary rounded-lg transition-colors">
                       <Copy className="w-4 h-4" />
                     </button>
                     <button onClick={handleShare} className="p-1.5 text-[var(--text-subtle)] hover:bg-[var(--surface-hover)] hover:text-primary rounded-lg transition-colors">
                       <Share2 className="w-4 h-4" />
                     </button>
                   </div>
                 )}
               </div>
               <div className="p-3 md:p-5 overflow-y-auto flex-1 text-[13px] md:text-sm text-[var(--text-main)] rtl:text-right" dir="auto">
                  {isExtracting ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                       <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-[var(--line-color)] animate-spin" />
                    </div>
                  ) : extractedText ? (
                    <p className="whitespace-pre-wrap">{extractedText}</p>
                  ) : (
                    <p className="text-[var(--text-subtle)] italic text-center mt-2">متن دلته ښکاري.</p>
                  )}
               </div>
             </div>
          </div>

          {/* Right Panel: Chat Interface */}
          <div className="w-full md:w-2/3 flex flex-col bg-[var(--bg-surface)] border border-[var(--line-color)]/60 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex-1 shrink min-h-[400px] relative">
             <div className="px-5 py-3 border-b border-[var(--line-color)]/60 flex items-center justify-between shrink-0 bg-[var(--bg-header)]/50">
                <span className="font-bold text-[var(--text-strong)] flex items-center gap-2 text-sm">
                   <Bot className="w-5 h-5 text-primary" />
                   د عکس په اړه خبرې وکړئ
                </span>
             </div>

             {/* Quick Actions for Chat */}
             {messages.length === 1 && !isExtracting && (
               <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-[var(--line-color)]/60 bg-[var(--bg-header)]/30 py-2 px-4 shadow-inner shrink-0">
                  <div className="flex gap-2 w-max items-center">
                    {quickActions.map((action, i) => (
                       <button
                         key={i}
                         onClick={() => handleSendMessage(undefined, action)}
                         className="px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--line-color)] hover:border-primary-border rounded-lg text-[13px] font-medium text-[var(--text-main)] hover:text-primary-hover hover:bg-[var(--bg-surface)]/80 transition-all shrink-0"
                       >
                         {action}
                       </button>
                    ))}
                  </div>
               </div>
             )}

             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5" style={{ backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
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
                          dir={msg.role === 'user' ? 'rtl' : 'auto'}
                        >
                          {msg.role === 'assistant' ? (
                             <div className="flex flex-col gap-3">
                               <Markdown>{msg.content}</Markdown>
                               {msg.imageUrl && (
                                  <img src={msg.imageUrl} referrerPolicy="no-referrer" alt="Generated by AI" className="rounded-xl w-full max-w-[280px] shadow-sm border border-[var(--line-color)]" />
                               )}
                             </div>
                          ) : (
                             msg.content
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
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

             {/* Input Area */}
             <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--line-color)]/60 shrink-0">
               <form 
                 onSubmit={handleSendMessage}
                 className="flex gap-2 bg-[var(--bg-canvas)] focus-within:bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-primary-hover rounded-2xl p-1.5 transition-all ring-1 ring-[var(--line-color)]/80"
               >
                 <button
                   type="button"
                   onClick={() => setIsImageMode(!isImageMode)}
                   className={`px-3 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 text-xs font-bold ${isImageMode ? 'bg-indigo-500 text-white scale-[1.02]' : 'bg-[var(--surface-hover)] text-[var(--text-strong)] hover:bg-[var(--line-color)]'}`}
                   title={isImageMode ? "متني چټ ته ستنیدل" : "د انځور بدلولو حالت"}
                 >
                   <ImageIcon className="w-4 h-4" />
                   <span className="hidden sm:inline">{isImageMode ? 'چټ حالت' : 'انځور جوړول'}</span>
                 </button>
                 <input
                   type="text"
                   className="flex-1 bg-transparent border-none outline-none px-2 text-[var(--text-main)] placeholder-gray-400 text-sm"
                   placeholder={isImageMode ? "څنګه انځور غواړئ؟..." : "پوښتنه وکړئ..."}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   disabled={isTyping || isExtracting}
                 />
                 <button 
                   type="submit"
                   disabled={!inputValue.trim() || isTyping || isExtracting}
                   className={`p-2.5 text-white rounded-xl transition-colors disabled:opacity-50 shadow-sm shrink-0 ${isImageMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-primary hover:bg-primary-hover'}`}
                 >
                   <Send className="w-4 h-4 -rotate-90 rtl:rotate-180" />
                 </button>
               </form>
             </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
