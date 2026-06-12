import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Language } from './types';
import { DICT } from './constants';

const EASE_HEAVY: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
      className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent origin-left z-[110]"
      style={{ scaleX }}
    />
  );
};

const FloatingOrb: React.FC<{ delay: number; size: number; x: string; y: string }> = ({ delay, size, x, y }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.15, 0.08, 0.15, 0],
      scale: [0.8, 1.2, 1, 1.1, 0.8],
      x: [0, 30, -20, 10, 0],
      y: [0, -20, 10, -30, 0],
    }}
    transition={{ duration: 20, delay, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="w-full h-full rounded-full bg-gradient-to-br from-white/30 to-white/5 blur-[60px]" />
  </motion.div>
);

const Navigation: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const [activeSection, setActiveSection] = useState('top');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
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
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, delay: 2.5, ease: EASE_HEAVY }}
      className="fixed top-0 w-full z-[100] px-4 py-4 md:px-8 md:py-6 flex justify-between items-center text-white pointer-events-none"
    >
      <div className="pointer-events-auto">
        <Magnetic strength={0.15}>
          <a
            href="#"
            onClick={(e) => handleScrollTo(e, 'top')}
            className="font-syne font-black text-sm md:text-lg tracking-[-0.02em] uppercase mix-blend-difference"
          >
            MILZTECH
          </a>
        </Magnetic>
      </div>
      <nav className={`flex gap-1 md:gap-8 pointer-events-auto items-center px-3 py-2 md:px-5 md:py-2.5 rounded-full transition-all duration-700 ${
        scrolled ? 'bg-black/70 backdrop-blur-2xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'bg-transparent'
      }`}>
        <div className="flex gap-3 md:gap-6">
          {['about', 'service', 'contact'].map((item) => (
            <Magnetic key={item} strength={0.2}>
              <a
                href={`#${item}`}
                onClick={(e) => handleScrollTo(e, item)}
                className={`text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.3em] font-bold uppercase transition-all duration-500 px-1 md:px-2 py-1 rounded-sm ${
                  activeSection === item
                    ? 'text-white'
                    : 'text-white/30 hover:text-white/80'
                }`}
              >
                {t(`nav_${item}`) || item}
              </a>
            </Magnetic>
          ))}
        </div>
        <div className="flex gap-1.5 md:gap-3 ml-2 pl-2 md:ml-4 md:pl-4 text-[9px] md:text-[10px] font-bold border-l border-white/10">
          <button onClick={() => setLang('ja')} className={`transition-all duration-300 ${lang === 'ja' ? 'text-white' : 'text-white/25 hover:text-white/70'}`}>JA</button>
          <span className="opacity-15">/</span>
          <button onClick={() => setLang('en')} className={`transition-all duration-300 ${lang === 'en' ? 'text-white' : 'text-white/25 hover:text-white/70'}`}>EN</button>
        </div>
      </nav>
    </motion.header>
  );
};

const HeroTitleReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <div className="relative overflow-hidden inline-flex justify-center items-center py-[0.5em] -my-[0.5em]">
      <motion.div
        initial={{ y: "120%", filter: "blur(12px)", opacity: 0 }}
        animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 1.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};

const Hero: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 0.95]);

  return (
    <section className="relative h-[100svh] flex items-center justify-center overflow-hidden bg-black">
      <FloatingOrb delay={0} size={600} x="10%" y="20%" />
      <FloatingOrb delay={5} size={400} x="70%" y="60%" />
      <FloatingOrb delay={10} size={500} x="50%" y="10%" />

      <motion.div style={{ opacity, scale }} className="relative z-10 w-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.8, delay: 1.0, ease: "easeOut" }}
          className="mb-12 md:mb-20"
        >
          <span className="text-[8px] md:text-[11px] font-bold uppercase tracking-[0.6em] md:tracking-[1.5em] text-white/40 block ml-[0.6em] md:ml-[1.5em] text-center">
            AI &middot; EXPERIENCE &middot; EXTREME
          </span>
        </motion.div>

        <div className="relative w-full flex flex-col items-center select-none text-center">
          <motion.div style={{ y: y1 }} className="z-20 w-full overflow-visible flex justify-center">
            <h1 className="text-[clamp(2.8rem,10vw,14rem)] font-syne font-black tracking-[-0.04em] text-white uppercase leading-[0.85]">
              <HeroTitleReveal delay={0.3}>Creativity</HeroTitleReveal>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="z-10 py-3 md:py-6"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center">
              <span className="text-white/30 text-lg md:text-2xl font-light">&times;</span>
            </div>
          </motion.div>

          <motion.div style={{ y: y2 }} className="z-20 w-full overflow-visible flex justify-center">
            <h1 className="text-[clamp(2.8rem,10vw,14rem)] font-syne font-black tracking-[-0.04em] text-white uppercase leading-[0.85]">
              <HeroTitleReveal delay={0.5}>Technology</HeroTitleReveal>
            </h1>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 2 }}
          className="mt-16 md:mt-24"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.5em] text-white/20 font-medium">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
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
    <div className={`mb-16 md:mb-32 flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}>
      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12">
        <span className={`text-[10px] md:text-[12px] font-bold font-mono ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>{num}</span>
        <div className={`h-[1px] w-6 md:w-10 ${dark ? 'bg-zinc-300' : 'bg-zinc-700'}`}></div>
        <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</span>
      </div>
      <div className={`w-full ${tAlign === 'center' ? 'text-center' : 'text-left'}`}>
        <h2 className={`text-[clamp(2.5rem,9vw,11rem)] font-syne font-black tracking-[-0.04em] leading-[0.85] uppercase ${dark ? 'text-black' : 'text-white'}`}>
          <MaskReveal>{title}.</MaskReveal>
        </h2>
      </div>
    </div>
  );
};

const AboutSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;
  const { scrollYProgress } = useScroll();
  const bgTextX = useTransform(scrollYProgress, [0.1, 0.6], [40, -40]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-32 md:py-72 bg-zinc-100 px-6 md:px-20 lg:px-32 relative overflow-hidden z-20">
      <motion.div
        style={{ x: bgTextX }}
        className="absolute top-1/3 left-0 text-[35vw] md:text-[22vw] font-syne font-black text-black/[0.015] whitespace-nowrap select-none pointer-events-none leading-none"
      >
        EVOLUTION
      </motion.div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <SectionHeader num="01" title="About Us" subtitle="Foundations" dark />

        <div className="grid xl:grid-cols-12 gap-12 xl:gap-20 items-center">
          <div className="xl:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: EASE_HEAVY }}
              className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-200 group"
            >
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="About Milztech"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-[1.02] group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/70 font-bold bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">Since 2025</span>
              </div>
            </motion.div>
          </div>

          <div className="xl:col-span-6">
            <div className="space-y-8 md:space-y-12">
              <div className="space-y-4">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-zinc-400 block text-xs md:text-sm font-mono uppercase tracking-[0.3em]"
                >
                  Visionary Path
                </motion.span>

                <h3 className="text-[clamp(1.6rem,3.5vw,3.5rem)] font-syne font-bold tracking-[-0.02em] leading-[1.1] text-black">
                  <div className="block">
                    <MaskReveal>From Creative Eyes</MaskReveal>
                  </div>
                  <div className="block mt-1 md:mt-2">
                    <MaskReveal delay={0.15}>To Intelligent Systems.</MaskReveal>
                  </div>
                </h3>
              </div>

              <div className="max-w-lg space-y-10">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="text-zinc-500 font-light text-sm md:text-base leading-[2] md:leading-[2.2]"
                >
                  {t('vision_body')}
                </motion.p>

                <Magnetic strength={0.2}>
                  <button
                    onClick={() => handleScrollTo('founders')}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-500">
                      <span className="text-base md:text-lg">&rarr;</span>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 group-hover:text-black transition-colors">
                      {t('founders_label')}
                    </span>
                  </button>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 md:mt-48 border-t border-black/[0.06] pt-16 md:pt-24">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-3">
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 block">{t('company_title')}</span>
            </div>
            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8">
              {[
                { label: t('co_name_label'), value: t('co_name_value') },
                { label: t('co_est_label'), value: t('co_est_value') },
                { label: t('co_address_label'), value: t('co_address_value') },
                { label: t('co_business_label'), value: t('co_business_value') },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="space-y-2"
                >
                  <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-mono">{item.label}</p>
                  <p className="text-sm md:text-[15px] font-medium text-black/80 whitespace-pre-line">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FoundersSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = (k: string) => DICT[lang][k as keyof typeof DICT['ja']] || k;

  return (
    <section id="founders" className="py-32 md:py-56 bg-white px-6 md:px-20 lg:px-32 relative overflow-hidden z-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-24 md:mb-36">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] w-6 bg-zinc-200" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Mission</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-[clamp(2rem,5vw,5.5rem)] font-syne font-black tracking-[-0.03em] leading-[0.95] text-black uppercase">
                <MaskReveal>Make it Real.</MaskReveal>
                <br />
                <span className="text-zinc-300">
                  <MaskReveal delay={0.15}>Make it Powerful.</MaskReveal>
                </span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-zinc-500 text-sm md:text-base font-light leading-[2] md:leading-[2.2]"
              >
                {t('founders_message')}
              </motion.p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {[
            { name: "Takahiro Wada", role: t('founder_wada_role'), img: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { name: "Masashi Takano", role: t('founder_takano_role'), img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600" },
          ].map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: EASE_HEAVY }}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-zinc-100 mb-6">
                <img
                  src={founder.img}
                  alt={founder.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-[1.02] group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <h3 className="text-xl md:text-3xl font-syne font-black tracking-[-0.02em] text-black uppercase leading-none">
                {founder.name}
              </h3>
              <p className="text-zinc-400 font-serif italic text-sm md:text-base mt-2">
                {founder.role}
              </p>
            </motion.div>
          ))}
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
        { name: t('svc_ai_project_estate'), detail: t('svc_ai_detail_estate'), link: "" },
        { name: t('svc_ai_project_openframe'), detail: t('svc_ai_detail_openframe'), link: "https://openframe.inc/" }
      ]
    },
    {
      id: '02',
      title: 'Production',
      tag: "Execution",
      desc: t('svc_pv_desc'),
      projects: [
        { name: t('svc_pv_project'), detail: t('svc_pv_detail'), link: "https://stagingpro.tech/" }
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
    <section id="service" className="py-32 md:py-64 bg-zinc-50 text-black px-6 md:px-20 lg:px-32 relative z-20">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader num="02" title="Services" subtitle="Expertise" dark titleAlign="center" />

        <div className="mt-16 md:mt-24">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-black/[0.06] last:border-b ${
                selected === i
                  ? 'bg-black text-white -mx-4 md:-mx-8 px-4 md:px-8 rounded-2xl my-4 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
                  : ''
              }`}
            >
              <div
                onClick={() => setSelected(selected === i ? null : i)}
                className="py-10 md:py-14 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4 md:gap-8">
                  <span className={`font-mono text-[10px] md:text-xs transition-colors duration-500 ${
                    selected === i ? 'text-zinc-500' : 'text-zinc-300'
                  }`}>{svc.id}</span>
                  <h3 className={`text-2xl md:text-5xl lg:text-6xl font-syne font-black tracking-[-0.03em] uppercase transition-colors duration-500 leading-none ${
                    selected === i ? 'text-white' : 'text-black group-hover:text-zinc-600'
                  }`}>
                    {svc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <span className={`hidden md:inline-block text-[9px] uppercase tracking-[0.3em] font-bold transition-all duration-500 ${
                    selected === i ? 'text-zinc-400 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                  }`}>{svc.tag}</span>
                  <motion.div
                    animate={{ rotate: selected === i ? 45 : 0 }}
                    transition={{ duration: 0.4, ease: EASE_HEAVY }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center text-sm md:text-base transition-all duration-500 ${
                      selected === i ? 'border-white/20 text-white' : 'border-black/10 text-zinc-400 group-hover:border-black/30 group-hover:text-black'
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
                    transition={{ duration: 0.6, ease: EASE_HEAVY }}
                    className="overflow-hidden"
                  >
                    <div className="pb-12 md:pb-20 pt-2">
                      <div className="w-full h-[1px] bg-white/10 mb-8 md:mb-12" />

                      <div className="max-w-3xl mx-auto space-y-8">
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.6 }}
                          className="text-base md:text-lg text-zinc-400 font-light leading-relaxed text-center"
                        >
                          {svc.desc}
                        </motion.p>

                        {svc.projects.length > 0 && (
                          <div className="space-y-3 pt-4">
                            {svc.projects.map((project, idx) => (
                              <React.Fragment key={idx}>
                                {project.link ? (
                                  <motion.a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="group/link block p-6 md:p-10 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-500 rounded-2xl border border-white/[0.06] hover:border-white/[0.12]"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div>
                                        <span className="text-lg md:text-2xl font-syne font-black tracking-tight text-white leading-none">
                                          {project.name}
                                        </span>
                                        <p className="text-xs md:text-sm text-zinc-500 mt-2">{project.detail}</p>
                                      </div>
                                      <div className="flex-shrink-0 px-4 py-2 rounded-full border border-white/15 text-white/60 group-hover/link:text-white group-hover/link:border-white/30 transition-all duration-300 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest w-fit">
                                        View &rarr;
                                      </div>
                                    </div>
                                  </motion.a>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="block p-6 md:p-10 bg-white/[0.04] rounded-2xl border border-white/[0.06]"
                                  >
                                    <span className="text-lg md:text-2xl font-syne font-black tracking-tight text-white leading-none">
                                      {project.name}
                                    </span>
                                    <p className="text-xs md:text-sm text-zinc-500 mt-2">{project.detail}</p>
                                  </motion.div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
        const formParams = new FormData();
        formParams.append('name', formData.name.trim());
        formParams.append('email', formData.email.trim());
        formParams.append('message', formData.message.trim());
        await fetch(GAS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formParams });
      }
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 md:py-56 bg-black px-6 md:px-12 lg:px-32 relative border-t border-white/[0.04] z-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-white/[0.01] blur-[200px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative">
        <div className="mb-20 md:mb-36 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.8em] text-zinc-600 mb-8 block"
          >
            Dialogue
          </motion.span>
          <h2 className="text-[clamp(3rem,12vw,15rem)] font-syne font-black tracking-[-0.05em] text-white uppercase leading-[0.8] select-none">
            <MaskReveal>Connect.</MaskReveal>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-start">
          <div className="lg:col-span-4 space-y-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-zinc-500 text-base md:text-lg font-light leading-relaxed"
            >
              {t('contact_body')}
            </motion.p>
            <div className="pt-8 border-t border-white/[0.06] space-y-3">
              <p className="text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-bold">Direct Line</p>
              <Magnetic strength={0.2}>
                <a href="mailto:info@milz.tech" className="text-zinc-400 hover:text-white text-base md:text-lg transition-colors duration-300 inline-flex items-center gap-2">
                  info@milz.tech <span className="text-zinc-700 text-sm">&rarr;</span>
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="lg:col-span-8 relative">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-10 md:p-16 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-xl font-bold">&#10003;</div>
                  <span className="text-xl md:text-3xl font-syne font-black uppercase tracking-tight text-white">{t('form_success')}</span>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors pt-4"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-10 md:space-y-14"
                >
                  {[
                    { key: 'name', type: 'text', label: t('form_name'), value: formData.name },
                    { key: 'email', type: 'email', label: t('form_email'), value: formData.email },
                  ].map((field) => (
                    <div key={field.key} className="relative">
                      <input
                        required
                        type={field.type}
                        placeholder=" "
                        value={field.value}
                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full bg-transparent border-b border-white/[0.08] focus:border-white/40 py-5 text-white text-lg md:text-2xl font-light outline-none transition-colors duration-500 peer"
                      />
                      <label className={`absolute left-0 top-5 text-zinc-600 text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-300 pointer-events-none ${
                        field.value ? '-top-6 text-[9px] text-zinc-500' : 'peer-focus:-top-6 peer-focus:text-[9px] peer-focus:text-zinc-500'
                      }`}>
                        {field.label}
                      </label>
                    </div>
                  ))}

                  <div className="relative">
                    <textarea
                      required
                      rows={1}
                      placeholder=" "
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent border-b border-white/[0.08] focus:border-white/40 py-5 text-white text-lg md:text-2xl font-light outline-none transition-colors duration-500 peer resize-none"
                    />
                    <label className={`absolute left-0 top-5 text-zinc-600 text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-300 pointer-events-none ${
                      formData.message ? '-top-6 text-[9px] text-zinc-500' : 'peer-focus:-top-6 peer-focus:text-[9px] peer-focus:text-zinc-500'
                    }`}>
                      {t('form_message')}
                    </label>
                  </div>

                  <div className="pt-8">
                    <Magnetic strength={0.3}>
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="relative overflow-hidden py-6 px-12 md:py-7 md:px-16 rounded-full border border-white/[0.12] bg-transparent text-white transition-all duration-700 hover:bg-white hover:text-black hover:border-white group"
                      >
                        <span className="relative z-10 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] md:tracking-[0.8em]">
                          {status === 'sending' ? t('form_sending') : t('form_send')}
                        </span>
                      </button>
                    </Magnetic>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <footer className="py-16 md:py-24 px-6 md:px-20 lg:px-32 bg-black border-t border-white/[0.03]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-end gap-8">
        <div className="text-center md:text-left">
          <div className="text-white/10 text-2xl md:text-3xl font-syne font-black tracking-[-0.02em] uppercase mb-3">MILZTECH</div>
          <p className="text-zinc-800 font-mono text-[9px] uppercase tracking-[0.3em]">&copy; 2025 MILZTECH Inc.</p>
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
    const timer = setTimeout(() => setLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="bg-black min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              <motion.h1
                className="text-white font-syne font-black text-lg md:text-xl tracking-[0.8em] uppercase ml-[0.8em]"
              >
                MILZTECH
              </motion.h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mt-6"
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.0, duration: 1 }}
                className="text-[8px] uppercase tracking-[0.5em] text-white mt-4 ml-[0.5em]"
              >
                Loading
              </motion.span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
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
