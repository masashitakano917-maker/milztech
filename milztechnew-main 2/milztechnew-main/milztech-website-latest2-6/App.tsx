
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Language } from './types';
import { DICT } from './constants';

const EASE_HEAVY: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_SMOOTH: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// --- Components ---

const MaskReveal: React.FC<{ children: React.ReactNode; delay?: number; duration?: number; immediate?: boolean; className?: string }> = ({ children, delay = 0, duration = 1.2, immediate = false, className = "" }) => {
  return (
    <div className={`relative overflow-hidden inline-flex justify-center items-center py-[1em] -my-[1em] px-[3em] -mx-[3em] align-middle whitespace-nowrap ${className}`}>
      <motion.div
        initial={{ y: "120%" }}
        animate={immediate ? { y: 0 } : undefined}
        whileInView={!immediate ? { y: 0 } : undefined}
        viewport={{ once: true, amount: 0 }} 
        transition={{ duration, delay, ease: EASE_HEAVY }}
        className="pb-[0.05em] px-[0.5em]"
      >
        {children}
      </motion.div>
    </div>
  );
};

const Magnetic: React.FC<{ children: React.ReactNode; strength?: number }> = ({ children, strength = 0.1 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * strength;
    const y = (clientY - (top + height / 2)) * strength;
    setPos({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 h-[2px] bg-white/60 origin-left z-[110] mix-blend-difference" 
      style={{ scaleX }} 
    />
  );
};

const Navigation: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'founders', 'service', 'contact'];
      let current = 'top';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.getBoundingClientRect().top < 300) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = id === 'top' ? 0 : element.offsetTop;
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed top-0 w-full z-[100] px-2 py-5 md:px-12 md:py-10 flex justify-between items-center text-white pointer-events-none">
      <div className="pointer-events-auto">
        <a 
          href="#" 
          onClick={(e) => handleScrollTo(e, 'top')}
          className="font-syne font-black text-base md:text-2xl tracking-tighter uppercase mix-blend-difference"
        >
          MILZTECH
        </a>
      </div>
      <nav className="flex gap-1 md:gap-10 pointer-events-auto items-center bg-black/60 backdrop-blur-xl px-2 py-2 md:px-6 md:py-3 rounded-full border border-white/10 shadow-2xl">
        <div className="flex gap-2 md:gap-8">
          {['about', 'service', 'contact'].map((item) => (
            <Magnetic key={item} strength={0.2}>
              <a 
                href={`#${item}`} 
                onClick={(e) => handleScrollTo(e, item)}
                className={`text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.4em] font-black uppercase transition-all px-1 md:px-2 ${activeSection === item ? 'text-white opacity-100' : 'text-white/40 hover:opacity-100'}`}
              >
                {t(`nav_${item}` as any) || item}
              </a>
            </Magnetic>
          ))}
        </div>
        <div className="flex gap-1 md:gap-4 ml-1 pl-1.5 md:ml-4 md:pl-6 text-[8px] md:text-[10px] font-black border-l border-white/20">
          <button onClick={() => setLang('ja')} className={lang === 'ja' ? 'text-white' : 'text-white/30 hover:text-white transition-all'}>JA</button>
          <span className="opacity-20">/</span>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-white' : 'text-white/30 hover:text-white transition-all'}>EN</button>
        </div>
      </nav>
    </header>
  );
};

const HeroTitleReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <div className="relative overflow-hidden inline-flex justify-center items-center py-[0.5em] -my-[0.5em]">
      <motion.div
        initial={{ y: "110%", filter: "blur(20px)", opacity: 0, rotateX: 20 }}
        animate={{ y: 0, filter: "blur(0px)", opacity: 1, rotateX: 0 }}
        transition={{ 
          duration: 1.8, 
          delay: delay, 
          ease: [0.16, 1, 0.3, 1] // Ultra smooth ease
        }}
        className="will-change-transform"
        style={{ transformPerspective: 1000 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -80]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black px-6 md:px-20">
      <motion.div style={{ opacity }} className="relative z-10 w-full flex flex-col items-center justify-center">
        <div className="mb-10 md:mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 0.6, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 2.0, delay: 0.8, ease: "easeOut" }}
            className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.8em] md:tracking-[2em] text-white block ml-[0.8em] md:ml-[2em] text-center will-change-transform"
          >
            AI · EXPERIENCE · EXSTREME
          </motion.span>
        </div>
        
        <div className="relative w-full flex flex-col items-center select-none text-center px-4 md:px-12">
          <motion.div style={{ y: y1 }} className="z-20 w-full overflow-visible flex justify-center">
            <h1 className="text-[clamp(2.2rem,8.2vw,12rem)] font-syne font-black tracking-tighter md:tracking-tight text-white uppercase leading-[1.1] md:leading-[1.2]">
              <HeroTitleReveal delay={0.4}>Creativity</HeroTitleReveal>
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 0.5, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 1.0 }}
            className="z-10 py-4 md:py-8"
          >
            <span className="text-[clamp(1.5rem,4vw,5rem)] font-black text-white font-syne opacity-30">×</span>
          </motion.div>

          <motion.div style={{ y: y2 }} className="z-20 w-full overflow-visible flex justify-center">
            <h1 className="text-[clamp(2.2rem,8.2vw,12rem)] font-syne font-black tracking-tighter md:tracking-tight text-white uppercase leading-[1.1] md:leading-[1.2]">
              <HeroTitleReveal delay={0.6}>Technology</HeroTitleReveal>
            </h1>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-zinc-900/10 blur-[120px] md:blur-[180px] rounded-full -z-1" 
      />
      
      <motion.div 
        initial={{ height: 0, opacity: 0 }} 
        animate={{ height: 60, opacity: 1 }} 
        transition={{ delay: 2.2, duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-white/40 to-transparent"
      />
    </section>
  );
};

const SectionHeader: React.FC<{ 
  num: string; 
  title: string; 
  subtitle: string; 
  dark?: boolean; 
  align?: 'left' | 'center';
  titleAlign?: 'left' | 'center'; 
}> = ({ num, title, subtitle, dark = false, align = 'left', titleAlign }) => {
  const tAlign = titleAlign || align;

  return (
    <div className={`mb-12 md:mb-24 flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}>
      <div className={`flex items-center gap-3 md:gap-4 mb-6 md:mb-8`}>
        <span className={`text-[10px] md:text-[13px] font-black font-mono ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{num}</span>
        <div className={`h-[1px] w-8 md:w-12 ${dark ? 'bg-zinc-300' : 'bg-zinc-800'}`}></div>
        <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</span>
      </div>
      <div className={`w-full ${tAlign === 'center' ? 'text-center' : 'text-left'}`}>
        <h2 className={`text-[clamp(2.5rem,8vw,10rem)] font-syne font-black tracking-tighter leading-none uppercase ${dark ? 'text-black' : 'text-white'}`}>
          <MaskReveal>{title}.</MaskReveal>
        </h2>
      </div>
    </div>
  );
};

const AboutSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const { scrollYProgress } = useScroll();
  const bgTextX = useTransform(scrollYProgress, [0.1, 0.6], [30, -30]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="about" className="py-24 md:py-72 bg-zinc-100 px-6 md:px-24 relative overflow-hidden z-20">
      <motion.div 
        style={{ x: bgTextX }}
        className="absolute top-1/4 left-0 text-[30vw] md:text-[20vw] font-syne font-black text-black/[0.02] whitespace-nowrap select-none pointer-events-none"
      >
        EVOLUTION
      </motion.div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <SectionHeader num="01" title="About Us" subtitle="Foundations" dark />

        <div className="grid xl:grid-cols-12 gap-10 xl:gap-16 items-center">
  {/* 画像：xl以上で左、xl未満は縦積み */}
  <div className="xl:col-span-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5 }}
      className="relative aspect-[16/11] overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-zinc-200 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40"
    >
      <img
        src="https://little-blue-hrkbky6dlb.edgeone.app/about.jpg"
        alt="About Milztech"
        className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-90 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-black/5 opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent" />
    </motion.div>
  </div>

  {/* テキスト：xl以上で右、xl未満は縦積み */}
  <div className="xl:col-span-6">
    <div className="space-y-6 md:space-y-10">
      <div className="space-y-2">
        <span className="text-zinc-400 block text-sm md:text-base font-mono mb-4 md:mb-6 uppercase tracking-widest">
          Visionary Path
        </span>

       <h3 className="text-[clamp(1.8rem,4.5vw,4.3rem)] font-syne font-bold tracking-tight leading-[1.2] md:leading-[1.3] text-black
               relative -left-4 sm:-left-6 md:-left-8 lg:-left-10">
  <div className="block">
    <MaskReveal>From Creative Eyes</MaskReveal>
  </div>
  <div className="block mt-2 md:mt-4">
    <MaskReveal delay={0.15}>To Intelligent Systems.</MaskReveal>
  </div>
</h3>

      </div>

      <div className="max-w-xl space-y-10">
        <p className="text-zinc-500 font-light text-sm md:text-[1.15rem] leading-[1.8] md:leading-[2.2] text-justify">
          {t('vision_body')}
        </p>

        <Magnetic strength={0.2}>
          <button
            onClick={() => handleScrollTo('founders')}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-black/10 flex items-center justify-center bg-transparent text-black group-hover:bg-black group-hover:text-white transition-all duration-500">
              <span className="text-lg md:text-2xl">→</span>
            </div>
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-black opacity-60 group-hover:opacity-100 transition-opacity">
              {t('founders_label')}
            </span>
          </button>
        </Magnetic>
      </div>
    </div>
  </div>
</div>

        {/* Company Outline */}
        <div className="mt-24 md:mt-40 border-t border-black/10 pt-16 md:pt-24">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-6">{t('company_title')}</span>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{t('co_name_label')}</p>
                <p className="text-sm md:text-base font-medium text-black">{t('co_name_value')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{t('co_est_label')}</p>
                <p className="text-sm md:text-base font-medium text-black">{t('co_est_value')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{t('co_address_label')}</p>
                <p className="text-sm md:text-base font-medium text-black">{t('co_address_value')}</p>
              </div>
               <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{t('co_business_label')}</p>
                <p className="text-sm md:text-base font-medium text-black whitespace-pre-line">{t('co_business_value')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FoundersSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0.2, 0.5], [0, -50]);

  return (
    <section id="founders" className="py-24 md:py-56 bg-zinc-50 px-6 md:px-24 relative overflow-hidden z-20 border-t border-black/5">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top: Mission Statement */}
        <div className="mb-24 md:mb-32">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] w-8 bg-zinc-300" />
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-zinc-400">Mission</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(2rem,4.5vw,5rem)] font-syne font-extrabold tracking-tight leading-tight text-black uppercase">
                Make it Real<span className="ml-[0.2em] text-black">.</span><br />
                <span className="text-zinc-400">Make it Powerful<span className="ml-[0.2em] text-zinc-400">.</span></span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-zinc-600 text-sm md:text-base font-light leading-[1.8] md:leading-[2.2] text-justify">
                {t('founders_message')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Founders Grid */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-24">
          
          {/* Founder 1: Takahiro Wada */}
          <motion.div style={{ y: parallaxY }} className="space-y-6 group max-w-sm md:max-w-md mx-auto">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl bg-zinc-200 border border-white">
              <img 
                src="https://ca.slack-edge.com/T05385XAFQB-U0535J40P61-5362e4647e49-512" 
                alt="Takahiro Wada"
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-syne font-black tracking-tighter text-black uppercase leading-none">
                Takahiro Wada
              </h3>
              <p className="text-zinc-400 font-serif italic text-sm md:text-lg mt-2 tracking-tight">
                {t('founder_wada_role')}
              </p>
            </div>
          </motion.div>

          {/* Founder 2: Masashi Takano */}
          <motion.div style={{ y: parallaxY }} className="space-y-6 group max-w-sm md:max-w-md mx-auto">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl bg-zinc-800 border border-white">
              <img 
                src="https://fresh-blue-kxjwrk7kfn.edgeone.app/MR-164%20copy.jpg" 
                alt="Masashi Takano"
                className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-1000"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-syne font-black tracking-tighter text-black uppercase leading-none">
                Masashi Takano
              </h3>
              <p className="text-zinc-400 font-serif italic text-sm md:text-lg mt-2 tracking-tight">
                {t('founder_takano_role')}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const ServiceSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  
  const services = [
    { 
      id: '01', 
      title: 'AI Solution', 
      tag: "Intelligence", 
      desc: t('svc_ai_desc'),
      projects: [
        {
          name: t('svc_ai_project_estate'),
          detail: t('svc_ai_detail_estate'),
          link: "" 
        },
        {
          name: t('svc_ai_project_openframe'),
          detail: t('svc_ai_detail_openframe'),
          link: "https://openframe.inc/" 
        }
      ]
    },
    { 
      id: '02', 
      title: 'Production', 
      tag: "Execution", 
      desc: t('svc_pv_desc'),
      projects: [
        {
          name: t('svc_pv_project'),
          detail: t('svc_pv_detail'),
          link: "https://stagingpro.tech/" 
        }
      ]
    },
    { 
      id: '03', 
      title: 'Experience', 
      tag: "Venture", 
      desc: "We are developing new experiences...",
      projects: []
    }
  ];

  return (
    <section id="service" className="py-24 md:py-64 bg-zinc-50 text-black px-6 md:px-24 relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader num="02" title="Services" subtitle="Expertise" dark titleAlign="center" />

        <div className="mt-12 md:mt-24 border-t border-black/10">
          {services.map((svc, i) => (
            <div 
              key={svc.id}
              className={`group border-b border-black/10 transition-all duration-500 ease-[0.16,1,0.3,1] ${
                selected === i 
                  ? 'bg-black text-white shadow-2xl shadow-black/20 z-10 relative my-4 rounded-2xl border-transparent scale-[1.02]' 
                  : 'hover:bg-black hover:text-white hover:border-transparent'
              }`}
            >
              <div 
                onClick={() => setSelected(selected === i ? null : i)}
                className="py-10 md:py-16 grid grid-cols-12 gap-4 items-center px-6 cursor-pointer"
              >
                <div className={`col-span-2 md:col-span-1 font-mono text-xs transition-colors duration-500 ${
                  selected === i ? 'text-zinc-500' : 'text-zinc-400 group-hover:text-zinc-500'
                }`}>{svc.id}</div>
                
                <div className="col-span-8 md:col-span-10 flex flex-col items-center justify-center text-center">
                  <h3 className={`text-3xl md:text-[5vw] font-syne font-black tracking-tighter uppercase transition-colors duration-500 leading-[0.9] ${
                    selected === i ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                  }`}>
                    {svc.title}
                  </h3>
                  <div className={`mt-2 transition-all duration-500 ${selected === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <span className={`inline-block px-3 py-1 border rounded-full text-[9px] uppercase tracking-widest ${
                      selected === i || 'group-hover' ? 'border-white/20 bg-white/10 text-white' : 'border-black/10 text-zinc-500 bg-white'
                    }`}>
                      {svc.tag}
                    </span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <motion.div 
                    animate={{ rotate: selected === i ? 45 : 0 }} 
                    className={`text-2xl md:text-3xl font-light transition-colors duration-500 ${
                      selected === i ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                    }`}
                  >
                    +
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {selected === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 md:px-20 pb-16 md:pb-24">
                      <div className="w-full h-[1px] bg-white/10 mb-8 md:mb-12" />
                      
                      <div className="flex flex-col items-center gap-10 md:gap-16 text-center">
                        {/* Content */}
                        <div className="space-y-6 md:space-y-8 max-w-3xl">
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed"
                          >
                            {svc.desc}
                          </motion.p>
                        </div>

                        {/* CTA / Projects */}
                        {svc.projects.length > 0 ? (
                          <div className="w-full max-w-2xl space-y-4">
                            {svc.projects.map((project, idx) => (
                              <React.Fragment key={idx}>
                                {project.link ? (
                                  <motion.a 
                                    href={project.link} 
                                    target="_blank" 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                    className="group/link block p-6 md:p-12 bg-white/5 hover:bg-white transition-colors duration-500 rounded-3xl border border-white/10 relative overflow-hidden text-left"
                                  >
                                    <div className="relative z-10">
                                      <span className="block text-[9px] uppercase tracking-widest text-zinc-500 group-hover/link:text-zinc-500 mb-4 transition-colors">Featured Project</span>
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                                        <span className="text-[1.5rem] md:text-[3rem] font-syne font-black tracking-tighter text-white group-hover/link:text-black transition-colors leading-none">
                                          {project.name}
                                        </span>
                                        <div className="flex-shrink-0 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white group-hover/link:bg-black group-hover/link:border-black group-hover/link:text-white transition-all duration-300 flex items-center gap-2 w-fit">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Check</span>
                                            <span className="text-xs">→</span>
                                        </div>
                                      </div>
                                      <p className="text-xs md:text-sm font-mono text-zinc-400 group-hover/link:text-zinc-600 transition-colors">
                                        {project.detail}
                                      </p>
                                    </div>
                                  </motion.a>
                                ) : (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                    className="block p-6 md:p-12 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden text-left"
                                  >
                                    <div className="relative z-10">
                                      <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-4">Featured Project</span>
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                                        <span className="text-[1.5rem] md:text-[3rem] font-syne font-black tracking-tighter text-white leading-none">
                                          {project.name}
                                        </span>
                                      </div>
                                      <p className="text-xs md:text-sm font-mono text-zinc-400">
                                        {project.detail}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        ) : svc.id === '03' && (
                           // Just for Experience 'Coming Soon' placeholder if needed, although text is in svc.desc
                           // If we want a card specifically for 'Coming Soon' we can add it to projects with null link
                           null
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Paste your Google Apps Script Web App URL here when ready.
// Example: "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXX/exec"
const GAS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyfm8HcvlR4vW1cnww_XapPbxsNsTuB9lwoTWdPn_j9oAA3W2CEfNhbDRgnVhQ8xrsf/exec"; 

const Contact: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');

    try {
      if (GAS_SCRIPT_URL) {
        // Actual submission to Google Apps Script
        const formParams = new FormData();
        formParams.append('name', formData.name.trim());
        formParams.append('email', formData.email.trim());
        formParams.append('message', formData.message.trim());

        // 'no-cors' mode is required for GAS Web Apps called from client-side JS
        await fetch(GAS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: formParams
        });
      } else {
         // Simulation mode if URL is not set yet
         await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-24 md:py-48 bg-black px-6 md:px-12 lg:px-24 relative border-t border-white/10 z-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-white/[0.02] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col">
          
          {/* Header Area - Huge Typography centered */}
          <div className="w-full mb-16 md:mb-32 overflow-visible relative text-center">
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[1.2em] text-zinc-700 mb-8 block">Dialogue</span>
            <div className="relative inline-block max-w-full overflow-visible">
              <h2 className="text-[9.5vw] md:text-[clamp(3rem,8.8vw,14rem)] font-syne font-black tracking-tighter text-white uppercase leading-[0.8] select-none text-center">
                <MaskReveal className="max-w-full">Connect.</MaskReveal>
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-16 md:gap-32 items-start">
            
            {/* Description Area */}
            <div className="lg:col-span-5 space-y-12">
              <p className="text-zinc-400 text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-md">
                {t('contact_body')}
              </p>
              <div className="pt-10 border-t border-white/10 space-y-4">
                <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-black">Direct Line</p>
                <Magnetic strength={0.2}>
                  <a href="mailto:info@milz.tech" className="text-zinc-300 hover:text-white text-lg md:text-xl transition-all flex items-center gap-3">
                    info@milz.tech <span className="text-zinc-600 text-sm">→</span>
                  </a>
                </Magnetic>
              </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-7 relative">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-zinc-900/40 backdrop-blur-3xl p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold mb-2">✓</div>
                    <span className="text-2xl md:text-4xl font-syne font-black uppercase tracking-tight text-white">{t('form_success')}</span>
                    
                    <button 
                      onClick={() => setStatus('idle')}
                      className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors pt-4"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-14 md:space-y-20"
                  >
                    <div className="space-y-12 md:space-y-16">
                      <div className="group relative">
                        <input 
                          required
                          type="text" 
                          placeholder=" "
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 py-6 text-white text-xl md:text-3xl font-light outline-none focus:border-white transition-colors peer"
                        />
                        <label className={`absolute left-0 top-6 text-zinc-300 text-xs md:text-sm uppercase tracking-widest transition-all pointer-events-none ${formData.name ? '-top-10 text-[10px] text-zinc-400' : 'peer-focus:-top-10 peer-focus:text-[10px] peer-focus:text-zinc-400'}`}>
                          {t('form_name')}
                        </label>
                      </div>

                      <div className="group relative">
                        <input 
                          required
                          type="email" 
                          placeholder=" "
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 py-6 text-white text-xl md:text-3xl font-light outline-none focus:border-white transition-colors peer"
                        />
                        <label className={`absolute left-0 top-6 text-zinc-300 text-xs md:text-sm uppercase tracking-widest transition-all pointer-events-none ${formData.email ? '-top-10 text-[10px] text-zinc-400' : 'peer-focus:-top-10 peer-focus:text-[10px] peer-focus:text-zinc-400'}`}>
                          {t('form_email')}
                        </label>
                      </div>

                      <div className="group relative">
                        <textarea 
                          required
                          rows={1}
                          placeholder=" "
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 py-6 text-white text-xl md:text-3xl font-light outline-none focus:border-white transition-colors peer resize-none"
                        />
                        <label className={`absolute left-0 top-6 text-zinc-300 text-xs md:text-sm uppercase tracking-widest transition-all pointer-events-none ${formData.message ? '-top-10 text-[10px] text-zinc-400' : 'peer-focus:-top-10 peer-focus:text-[10px] peer-focus:text-zinc-400'}`}>
                          {t('form_message')}
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-start pt-6">
                      <Magnetic strength={0.3}>
                        <button 
                          type="submit"
                          disabled={status === 'sending'}
                          className="relative overflow-hidden group py-8 px-16 md:py-10 md:px-20 rounded-full border border-white/20 bg-transparent text-white transition-all duration-700 hover:bg-white hover:text-black"
                        >
                          <span className="relative z-10 text-[10px] md:text-[13px] font-black uppercase tracking-[0.6em] md:tracking-[1em] ml-[1em]">
                            {status === 'sending' ? t('form_sending') : t('form_send')}
                          </span>
                          {status === 'sending' && (
                            <motion.div 
                              initial={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="absolute inset-0 bg-white/20"
                            />
                          )}
                        </button>
                      </Magnetic>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <footer className="py-12 md:py-20 px-6 md:px-24 bg-black border-t border-white/5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-10 md:gap-12 text-center md:text-left">
        <div>
          <div className="text-white text-3xl md:text-4xl font-syne font-black tracking-tighter uppercase mb-4 md:mb-6 opacity-30">MILZTECH</div>
          <p className="text-zinc-700 font-mono text-[9px] md:text-[10px] uppercase tracking-widest">© 2025 MILZTECH Inc. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('ja');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
<main className="bg-black min-h-screen overflow-x-hidden selection:bg-black selection:text-white">
      <ScrollProgress />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader" 
            exit={{ opacity: 0, y: -20 }} 
            className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center"
          >
            <motion.h1 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-white font-syne font-black text-xl md:text-2xl tracking-[1.5em] uppercase ml-[1.5em]"
            >
              MILZTECH
            </motion.h1>
            <motion.div 
              initial={{ width: 0 }} animate={{ width: 120 }} transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-[1px] bg-white/20 mt-4"
            />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
            <Navigation lang={lang} setLang={setLang} />
            <Hero />
            <AboutSection lang={lang} />
            <FoundersSection lang={lang} />
            <ServiceSection lang={lang} />
            <Contact lang={lang} />
            <Footer lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
