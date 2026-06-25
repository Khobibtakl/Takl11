import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  ArrowRight, 
  User, 
  MessageSquare, 
  Sparkles, 
  Smartphone, 
  LogIn, 
  Lock, 
  HelpCircle,
  Phone,
  Mail,
  Send,
  Database,
  Camera,
  Layers,
  CheckCircle,
  X
} from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

export function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'KhubaibTakl' && password === 'Takl556...') {
      setLoginError(false);
      setShowLoginModal(false);
      onLoginSuccess();
    } else {
      setLoginError(true);
    }
  };

  const faqs = [
    {
      q: "همکار حبیب تکل ویب پاڼه څه خدمتونه وړاندې کوي؟",
      a: "دا یو هوښیار سیسټم دی چې تاسو ته اجازه درکوي خپل PDF، DOCX او متني فایلونه پورته کړئ، له انځورونو څخه پښتو متن وباسئ او له خپلو اسنادو سره د AI په مرسته هوښیار چټ، لنډیز او دقیقه پښتو ژباړه ترسره کړئ."
    },
    {
      q: "ایا زما اپلوډ شوي فایلونه او اسناد خوندي پاتې کیږي؟",
      a: "هو، سل په سلو کې! ستاسو اسناد او د چټ ټول تاریخ په بشپړ ډول ستاسو د موبایل یا کمپیوټر په محلي حافظه (Local Storage) کې د JSON فارمیټ په ډول په نښتي بڼه خوندي کیږي او هیڅ دریم شخص ورته لاسرسی نلري."
    },
    {
      q: "ایا دا سیسټم په افلاین حالت کې هم کار کوي؟",
      a: "ستاسو پخواني اسناد، د هغو تاریخچه، د شاتړ ډاونلوډ (Backup JSON) او لوستل په بشپړ ډول په آفلاین حالت کې کار کوي. یوازې د AI نوې ژباړې او ځوابونو لپاره انټرنیټ ته اړتیا شته."
    },
    {
      q: "زه څنګه کولی شم د ننوتلو پاسورډ ترلاسه کړم؟",
      a: "د ننوتلو پټنوم د امنیت د خوندیتوب لپاره جوړ شوی. د اکاونټ او پټنوم ترلاسه کولو لپاره کولی شئ مستقیم له پرمخ بیونکي (حبیب تکل) سره د واټساپ یا ټلیفون له لارې اړیکه ونیسئ."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-strong)] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden relative" dir="rtl">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-[30%] left-[-15%] w-[45%] h-[45%] bg-purple-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Modern Floating Header */}
      <header className="sticky top-0 z-30 w-full bg-[var(--bg-surface)]/70 backdrop-blur-md border-b border-[var(--line-color)]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-extrabold text-lg tracking-tight text-[var(--text-strong)]">همکار حبیب تکل</span>
              <span className="text-[10px] text-[var(--text-subtle)] font-medium">هوښیار معلوماتي مرکز</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-semibold text-[var(--text-strong)] hover:text-primary transition-colors">اصلي پاڼه</a>
            <a href="#features" className="text-sm font-semibold text-[var(--text-subtle)] hover:text-primary transition-colors">ځانګړتیاوې</a>
            <a href="#process" className="text-sm font-semibold text-[var(--text-subtle)] hover:text-primary transition-colors">څرنګه کار کوي؟</a>
            <a href="#developer" className="text-sm font-semibold text-[var(--text-subtle)] hover:text-primary transition-colors">زموږ په اړه</a>
            <a href="#faq" className="text-sm font-semibold text-[var(--text-subtle)] hover:text-primary transition-colors">پوښتنې</a>
          </nav>

          {/* Header Action Button */}
          <div>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>ننوتل / کاریال پیل کړئ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text information */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-right flex flex-col items-start">
            
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>د لومړي ځل لپاره په پښتو ژبه د اسنادو تحلیل</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--text-strong)] leading-[1.15] tracking-tight"
            >
              د خپلو اسنادو او انځورونو <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-500 to-primary font-extrabold">هوښیار ژباړن او همکار</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-[var(--text-subtle)] leading-relaxed max-w-2xl"
            >
              نور نو د انګلیسي او پیچلو اسنادو د ژباړې ستونزه حل شوه! خپل PDF، Word اسناد او یا د کتاب عکسونه سیسټم ته ورکړئ؛ زموږ هوښیار همکار به ورڅخه پښتو متن استخراج کړي، پښتو ته به یې وژباړي او ستاسو هرې پوښتنې ته به ځواب ووایي.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 w-full justify-start"
            >
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white text-base font-bold rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 cursor-pointer"
              >
                <span>د اسنادو تحلیل همدا اوس پیل کړئ</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              
              <a 
                href="#features"
                className="px-6 py-4 bg-[var(--bg-surface)] hover:bg-[var(--surface-hover)] border border-[var(--line-color)] text-[var(--text-main)] text-base font-bold rounded-2xl hover:scale-[1.01] transition-all flex items-center justify-center"
              >
                ځانګړتیاوې وګورئ
              </a>
            </motion.div>

            {/* Quick stats badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--line-color)]/60 w-full"
            >
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-primary">۱۰۰٪</span>
                <span className="text-xs md:text-sm text-[var(--text-subtle)]">په پښتو ژبه کره ملاتړ</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-indigo-400">آفلاین</span>
                <span className="text-xs md:text-sm text-[var(--text-subtle)]">د پخوانیو اسنادو دوسیه</span>
              </div>
              <div>
                <span className="block text-2xl md:text-3xl font-extrabold text-emerald-400">خوندي</span>
                <span className="text-xs md:text-sm text-[var(--text-subtle)]">په خپل موبایل کې ذخیره</span>
              </div>
            </motion.div>

          </div>

          {/* Interactive visual mockup */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
              className="relative bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-canvas)] p-4 md:p-6 rounded-3xl shadow-2xl border border-[var(--line-color)]/80"
            >
              {/* Browser window head chrome */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line-color)]/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[11px] font-mono text-[var(--text-subtle)] bg-[var(--bg-canvas)] px-4 py-1 rounded-full border border-[var(--line-color)]/40" dir="ltr">
                  hamkar-habib-takal.app
                </div>
              </div>

              {/* Chat view mock mockup */}
              <div className="space-y-4">
                <div className="bg-primary/10 p-3.5 rounded-2xl rounded-tr-none text-right border border-primary/10 max-w-[85%] mr-auto">
                  <p className="text-xs font-semibold text-primary mb-1">کاریال ويونکی</p>
                  <p className="text-xs text-[var(--text-strong)] leading-relaxed">
                    ما ته دغه انګلیسي چپټر لومړی په پښتو وژباړه او بیا د پوهېدو لپاره د هر فصل لنډیز ولیکه.
                  </p>
                </div>

                <div className="bg-[var(--bg-canvas)] p-4 rounded-2xl rounded-tl-none text-right border border-[var(--line-color)] max-w-[85%] ml-auto shadow-sm">
                  <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">همکار حبیب تکل (AI)</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-strong)] leading-relaxed">
                    ډیره ښه، ما ستاسو د چپټر لومړی څپرکی په پښتو وژباړه: <br />
                    <span className="font-semibold text-primary">«دا لومړی ګام دی چې موږ ته د مصنوعي زیرکتیا مفهوم راښيي...»</span> <br />
                    ایا غواړئ چې د دویم فصل لنډیز هم درته ولیکم؟
                  </p>
                </div>

                {/* Upload visual mock */}
                <div className="border border-dashed border-indigo-500/30 rounded-2xl p-4 bg-indigo-500/5 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                    <Database className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-strong)]">سند په بریالیتوب سره تحلیل شو!</span>
                  <span className="text-[10px] text-[var(--text-subtle)] mt-0.5">کمپیوټر شبکې چپټر.pdf (4.8 MB)</span>
                </div>
              </div>

              {/* Float visual elements for aesthetic decor */}
              <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 border border-emerald-400 text-right shrink-0">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">آفلاین خونديتوب</span>
                  <span className="text-[9px] opacity-90">ځایي د حافظې JSON بیک اپ</span>
                </div>
              </div>

              <div className="absolute -top-6 -left-6 bg-indigo-600 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 border border-indigo-500 text-right shrink-0">
                <Camera className="w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">هوښیار سکن</span>
                  <span className="text-[9px] opacity-90">له عکس څخه پښتو متن</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Benefits and Features Section */}
      <section id="features" className="py-20 md:py-28 bg-[var(--bg-surface)] border-y border-[var(--line-color)]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="text-xs font-extrabold tracking-wider text-primary uppercase bg-primary-light px-3.5 py-1.5 rounded-full border border-primary/25">ځانګړي امکانات</span>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--text-strong)] mt-4 mb-4">هر هغه څه چې د پوهې او ژباړې لپاره پکار دي</h2>
            <p className="text-sm md:text-base text-[var(--text-subtle)] leading-relaxed">زموږ بې ساري تخنیکي ځانګړتیاوې تاسو سره مرسته کوي چې معلومات په اسانۍ سره ترلاسه او په آفلاین ډول وساتئ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[var(--bg-canvas)] p-6 md:p-8 rounded-3xl border border-[var(--line-color)]/40 hover:border-primary-light transition-all hover:translate-y-[-4px] flex flex-col items-start text-right relative group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mb-2.5">د اسنادو پوره تحليل</h3>
              <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed">
                د PDF، Word او متن اسنادو پورته کول او د هغو د منځپانګې پوره تحلیل او دقیق کتنې چمتو کول.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--bg-canvas)] p-6 md:p-8 rounded-3xl border border-[var(--line-color)]/40 hover:border-primary-light transition-all hover:translate-y-[-4px] flex flex-col items-start text-right relative group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mb-2.5">هوښیار سکن (OCR)</h3>
              <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed">
                له انځورونو، عکسونو او کتاب د پاڼو څخه د کمپیوټري لید او د عکسي متن استخراج پرمختللی سیستم.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--bg-canvas)] p-6 md:p-8 rounded-3xl border border-[var(--line-color)]/40 hover:border-primary-light transition-all hover:translate-y-[-4px] flex flex-col items-start text-right relative group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mb-2.5">بشپړ افلاین خونديتوب</h3>
              <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed">
                ستاسو ټول دوسیې، اسناد او د چټ تاریخچه د خوندي پاتې کیدو لپاره د موبایل په خپل JSON کې خوندي کیږي.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--bg-canvas)] p-6 md:p-8 rounded-3xl border border-[var(--line-color)]/40 hover:border-primary-light transition-all hover:translate-y-[-4px] flex flex-col items-start text-right relative group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-strong)] mb-2.5">د AI ځواکمن چټ</h3>
              <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed">
                د پرمختللي Gemini 3.5 ماډل پر بنسټ هر ډول متني او کلتوري پوښتنې پښتو او دري ژبو کې حل کړئ.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="process" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="text-xs font-extrabold tracking-wider text-primary uppercase bg-primary-light px-3.5 py-1.5 rounded-full border border-primary/25">اسانه تګلاره</span>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--text-strong)] mt-4 mb-4">زموږ سیستم څنګه کار کوي؟</h2>
          <p className="text-sm md:text-base text-[var(--text-subtle)] leading-relaxed">تاسو په دریو اسانه مراحلو کې خپل هدف ته رسیدلی شئ او هر ډول معلومات ترلاسه کولای شئ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-[2px] bg-gradient-to-l from-indigo-500/20 to-primary/20 -z-10" />

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/25">
              ۱
            </div>
            <h3 className="text-xl font-bold text-[var(--text-strong)]">سند اپلوډ کړئ</h3>
            <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed max-w-xs">
              خپل د کتاب عکس یا پی ډی اف (PDF/DOCX) فایل مستقیم د اپلوډ بکس کې واچوئ ترڅو سیسټم یې پروسس کړي.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25">
              ۲
            </div>
            <h3 className="text-xl font-bold text-[var(--text-strong)]">سیسټم په اتوماتیک متن لولي</h3>
            <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed max-w-xs">
              زموږ پرمختللی هوښیار لوستونکی د فایل ټول انګلیسي یا بل ژبني متن را وباسي او تاسو ته یې چمتو کوي.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/25">
              ۳
            </div>
            <h3 className="text-xl font-bold text-[var(--text-strong)]">وپوښتئ او وژباړئ</h3>
            <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed max-w-xs">
              اوس د سمارټ چټ له لارې د خپل سند په اړه پوښتنې وکړئ، پښتو ته یې وژباړئ او فایل د JSON شاتړ په توګه خوندي کړئ.
            </p>
          </div>

        </div>
      </section>

      {/* Developer Section (Habib Takal Card) */}
      <section id="developer" className="py-20 md:py-28 bg-[var(--bg-surface)] border-t border-[var(--line-color)]/60 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[var(--bg-canvas)] to-[var(--bg-surface)] p-8 md:p-12 rounded-3xl border border-[var(--line-color)]/80 shadow-xl relative overflow-hidden">
            
            {/* Decorative mesh */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-br-full blur-2xl" />

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-right">
              
              {/* Avatar placeholder / visual */}
              <div className="shrink-0 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl relative z-10">
                  <User className="w-12 h-12 md:w-16 md:h-16" />
                </div>
                <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-md scale-95 opacity-50 z-0" />
              </div>

              {/* Developer info */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full border border-primary/20">جوړونکی او خپرونکی</span>
                  <h3 className="text-2xl md:text-3xl font-black text-[var(--text-strong)] mt-2">طالب العلم حبيب تكل</h3>
                  <p className="text-sm text-[var(--text-subtle)] font-medium">د اسلامي او نوي علمي ټیکنالوژۍ مینه وال او کشر خادم</p>
                </div>

                <p className="text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed">
                  ګرانو هیوادوالو! زموږ هدف هیواد او ولس ته د اسلامي او عصري پوهې په رڼا کې د نوي عصر تر ټولو غوره خدمات وړاندې کول دي. د دې ویب اپلیکیشن پټنوم او د لاسرسي اجازې ترلاسه کولو لپاره کولی شئ د لاندې ادرسونو له لارې په واټساپ، ټلګرام یا موبایل زنګ راسره اړیکه ونیسئ.
                </p>

                {/* Connection paths */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--line-color)]/60">
                  <a href="https://wa.me/93765443156" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-[var(--bg-canvas)] hover:bg-green-500/10 rounded-xl transition-all border border-[var(--line-color)]/60 group">
                    <div className="text-green-500 group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[var(--text-subtle)]">واټساپ شمیره</span>
                      <span className="text-xs font-bold text-[var(--text-strong)]" dir="ltr">+93 76 544 3156</span>
                    </div>
                  </a>

                  <a href="https://t.me/khubaib_taki" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-[var(--bg-canvas)] hover:bg-sky-500/10 rounded-xl transition-all border border-[var(--line-color)]/60 group">
                    <div className="text-sky-500 group-hover:scale-110 transition-transform">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[var(--text-subtle)]">ټلګرام ID</span>
                      <span className="text-xs font-bold text-[var(--text-strong)]" dir="ltr">@khubaib_taki</span>
                    </div>
                  </a>

                  <a href="tel:+93777233699" className="flex items-center gap-3 p-3 bg-[var(--bg-canvas)] hover:bg-blue-500/10 rounded-xl transition-all border border-[var(--line-color)]/60 group">
                    <div className="text-blue-500 group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[var(--text-subtle)]">افغان بیسیم اړیکه</span>
                      <span className="text-xs font-bold text-[var(--text-strong)]" dir="ltr">+93 77 723 3699</span>
                    </div>
                  </a>

                  <a href="mailto:khobibtakl@gmail.com" className="flex items-center gap-3 p-3 bg-[var(--bg-canvas)] hover:bg-orange-500/10 rounded-xl transition-all border border-[var(--line-color)]/60 group">
                    <div className="text-orange-500 group-hover:scale-110 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-[var(--text-subtle)]">بریښنالیک ادرس</span>
                      <span className="text-xs font-bold text-[var(--text-strong)] truncate max-w-[150px]" dir="ltr">khobibtakl@gmail.com</span>
                    </div>
                  </a>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6 z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-black text-[var(--text-strong)]">ډیری کیدونکي پوښتنې (FAQ)</h2>
          <p className="text-xs md:text-sm text-[var(--text-subtle)] mt-2">دلته د هوښیار همکار د کارونې په اړه د پام وړ پوښتنو ځوابونه موندلی شئ.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-[var(--bg-surface)] border border-[var(--line-color)]/60 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-right font-bold text-[var(--text-strong)] text-sm md:text-base hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-primary text-xl transform transition-transform duration-300 ${activeFaq === index ? 'rotate-45' : 'rotate-0'}`}>
                  +
                </span>
              </button>

              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 border-t border-[var(--line-color)]/30 text-xs md:text-sm text-[var(--text-subtle)] leading-relaxed text-right">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--line-color)] py-12 text-center text-xs text-[var(--text-subtle)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[var(--text-strong)]">همکار حبیب تکل ویب پاڼه</span>
          </div>

          <p className="text-right">
            © {new Date().getFullYear()} همکار حبیب تکل. ټول حقونه د ویب پاڼې له پرمخ بیونکي حبیب تکل سره خوندي دي.
          </p>

          <div className="flex items-center gap-4">
            <a href="#home" className="hover:text-primary transition-colors">اصلي پاڼه</a>
            <span>•</span>
            <a href="#features" className="hover:text-primary transition-colors">ځانګړتیاوې</a>
            <span>•</span>
            <a href="#developer" className="hover:text-primary transition-colors">تماس</a>
          </div>
        </div>
      </footer>

      {/* Modern Pop-up Dialog for Login */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Login Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl shadow-2xl ring-1 ring-[var(--line-color)] p-6 md:p-8 relative z-10 text-right"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 left-4 p-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--surface-hover)] border border-[var(--line-color)] text-[var(--text-subtle)] hover:text-[var(--text-strong)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-strong)]">سیسټم ته ننوتل</h2>
                <p className="text-[var(--text-subtle)] text-xs mt-1">هوښیار همکار حبیب تکل ته ننوځئ</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-strong)]">نوم (Username)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-subtle)]">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-[var(--bg-canvas)] border border-[var(--line-color)] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-[var(--text-strong)] text-sm outline-none"
                      placeholder="خپل کارن نوم دننه کړئ"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-strong)]">پټنوم (فاسورډ)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-subtle)]">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-[var(--bg-canvas)] border border-[var(--line-color)] rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-[var(--text-strong)] text-sm outline-none"
                      placeholder="خپل پټنوم دننه کړئ"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold transition-all mt-6 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  تایید او ننوځئ
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </form>

              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-5"
                  >
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                      <div className="flex items-start gap-2.5 text-red-500">
                        <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold leading-relaxed">
                          د ننوتلو پټنوم سم نه دی. د پټنوم ترلاسه کولو لپاره لاندې په واټساپ کې د حبیب تکل سره اړیکه ونیسئ:
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t border-red-500/10">
                        <a 
                          href="https://wa.me/93765443156" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center justify-between p-2 bg-[var(--bg-canvas)] hover:bg-green-500/10 rounded-lg transition-colors border border-[var(--line-color)] group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 font-bold text-xs">WhatsApp:</span>
                            <span className="text-xs text-[var(--text-strong)] font-semibold" dir="ltr">+93 76 544 3156</span>
                          </div>
                          <Phone className="w-3.5 h-3.5 text-green-500 group-hover:scale-110 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
