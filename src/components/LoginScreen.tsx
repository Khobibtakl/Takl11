import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, User, Lock, ArrowRight, ShieldAlert, Phone, Mail, Send } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'KhubaibTakl' && password === 'Takl556...') {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[var(--bg-canvas)] flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl shadow-2xl ring-1 ring-[var(--line-color)] p-6 md:p-8 relative z-10 my-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-strong)] tracking-tight">خوش راغلاست</h2>
          <p className="text-[var(--text-subtle)] text-sm mt-1">همکار خبيب تکل ته ننوځئ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-strong)]">نوم</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-subtle)]">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-[var(--bg-canvas)] border border-[var(--line-color)] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-[var(--text-strong)] outline-none"
                placeholder="خپل نوم دننه کړئ"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-strong)]">پټنوم (فاسورډ)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-subtle)]">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-[var(--bg-canvas)] border border-[var(--line-color)] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-[var(--text-strong)] outline-none"
                placeholder="خپل پټنوم دننه کړئ"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all mt-6 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            ننوځئ
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-4">
                <div className="flex items-start gap-3 text-red-500">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">
                    د اپلکيشن داستفادي لپاره له خبيب تکل سره اړیکه ونیسئ په لاندې ادرسونو باندې:
                  </p>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-red-500/10">
                  <a href="https://wa.me/93765443156" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] hover:bg-green-500/10 rounded-lg transition-colors border border-[var(--line-color)] group">
                    <div className="text-green-500 group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--text-strong)]" dir="ltr">+93 76 544 3156</span>
                    <span className="text-xs text-[var(--text-subtle)] mr-auto">واټساپ</span>
                  </a>
                  
                  <a href="tel:+93777233699" className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] hover:bg-blue-500/10 rounded-lg transition-colors border border-[var(--line-color)] group">
                    <div className="text-blue-500 group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--text-strong)]" dir="ltr">+93 77 723 3699</span>
                    <span className="text-xs text-[var(--text-subtle)] mr-auto">ټلیفون</span>
                  </a>
                  
                  <a href="mailto:khobibtakl@gmail.com" className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] hover:bg-orange-500/10 rounded-lg transition-colors border border-[var(--line-color)] group">
                    <div className="text-orange-500 group-hover:scale-110 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--text-strong)] truncate max-w-[150px]" dir="ltr">khobibtakl@gmail.com</span>
                    <span className="text-xs text-[var(--text-subtle)] mr-auto">جیمیل</span>
                  </a>
                  
                  <a href="https://t.me/khubaib_taki" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] hover:bg-sky-500/10 rounded-lg transition-colors border border-[var(--line-color)] group">
                    <div className="text-sky-500 group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-[var(--text-strong)]" dir="ltr">@khubaib_taki</span>
                    <span className="text-xs text-[var(--text-subtle)] mr-auto">ټلګرام</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
