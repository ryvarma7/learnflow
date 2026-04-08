'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Brain,
  Calculator,
  GraduationCap,
  Lightbulb,
  Microscope,
  Network,
  NotebookPen,
  PencilRuler,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const doodles = useMemo(
    () => [
      { Icon: BookOpen, top: '6%', left: '6%', size: 34, duration: 9, delay: 0.2, dx: 20, dy: -12 },
      { Icon: GraduationCap, top: '10%', left: '22%', size: 32, duration: 10.2, delay: 0.8, dx: -18, dy: 14 },
      { Icon: NotebookPen, top: '12%', right: '20%', size: 33, duration: 11, delay: 1.5, dx: 16, dy: 18 },
      { Icon: Lightbulb, top: '8%', right: '6%', size: 30, duration: 8.7, delay: 0.6, dx: -14, dy: -20 },
      { Icon: PencilRuler, top: '24%', left: '9%', size: 36, duration: 12, delay: 1.1, dx: 24, dy: 16 },
      { Icon: Microscope, top: '28%', left: '36%', size: 32, duration: 9.5, delay: 1.8, dx: -20, dy: -14 },
      { Icon: Calculator, top: '26%', right: '34%', size: 30, duration: 8.8, delay: 0.9, dx: 18, dy: -18 },
      { Icon: BookOpen, top: '30%', right: '10%', size: 34, duration: 10.8, delay: 1.2, dx: -16, dy: 15 },
      { Icon: NotebookPen, top: '42%', left: '5%', size: 30, duration: 9.3, delay: 1.6, dx: 14, dy: 20 },
      { Icon: GraduationCap, top: '46%', left: '26%', size: 33, duration: 11.4, delay: 0.5, dx: -22, dy: -12 },
      { Icon: Lightbulb, top: '44%', right: '27%', size: 34, duration: 10.1, delay: 1.9, dx: 20, dy: -16 },
      { Icon: PencilRuler, top: '40%', right: '7%', size: 35, duration: 9.9, delay: 0.4, dx: -15, dy: 19 },
      { Icon: Microscope, top: '60%', left: '10%', size: 36, duration: 12.3, delay: 1.3, dx: 22, dy: -14 },
      { Icon: Calculator, top: '64%', left: '40%', size: 31, duration: 8.6, delay: 0.7, dx: -19, dy: 17 },
      { Icon: BookOpen, top: '62%', right: '32%', size: 33, duration: 9.2, delay: 1.7, dx: 17, dy: 14 },
      { Icon: NotebookPen, top: '66%', right: '8%', size: 32, duration: 10.6, delay: 1.0, dx: -18, dy: -18 },
      { Icon: Lightbulb, top: '80%', left: '7%', size: 31, duration: 9.1, delay: 0.3, dx: 16, dy: -20 },
      { Icon: GraduationCap, top: '84%', left: '28%', size: 34, duration: 11.8, delay: 1.4, dx: -20, dy: 15 },
      { Icon: PencilRuler, top: '82%', right: '30%', size: 35, duration: 10.4, delay: 0.95, dx: 21, dy: 12 },
      { Icon: Microscope, top: '86%', right: '9%', size: 34, duration: 9.7, delay: 1.65, dx: -17, dy: -16 },
    ],
    []
  )

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex flex-col pt-24 md:pt-32 pb-20 overflow-hidden font-sans relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[95vw] h-[45vh] bg-[radial-gradient(circle,_rgba(99,102,241,0.16)_0%,_rgba(0,0,0,0)_72%)]" />
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.07)_0%,_rgba(0,0,0,0)_70%)] blur-2xl" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_rgba(0,0,0,0)_68%)] blur-2xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[800px] bg-[radial-gradient(ellipse_600px_800px_at_50%_0%,_rgba(255,255,255,0.14)_0%,_rgba(255,255,255,0.07)_30%,_rgba(0,0,0,0)_65%)] blur-3xl pointer-events-none" />
      </div>

      <div className="absolute inset-0 pointer-events-none z-[1]">
        {doodles.map(({ Icon, size, duration, delay, dx, dy, ...pos }, index) => (
          <div
            key={index}
            className="doodle-float absolute text-white/38"
            style={{
              ...pos,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              '--doodle-x': `${dx}px`,
              '--doodle-y': `${dy}px`,
            }}
            aria-hidden="true"
          >
            <Icon size={size} strokeWidth={1.8} className="fill-none drop-shadow-[0_0_10px_rgba(255,255,255,0.20)]" />
          </div>
        ))}
      </div>

      <motion.div 
        variants={fadeUp} 
        className="max-w-[1200px] mx-auto w-full px-6 -mt-28 mb-4 flex justify-center relative z-10"
      >
        <p className="text-[32px] sm:text-[48px] font-[700] text-[#6366f1] tracking-wide">
          LearnFlow
        </p>
      </motion.div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1200px] mx-auto w-full px-6 py-8 sm:py-10 flex flex-col items-center relative z-10 rounded-3xl border border-white/10 bg-black/55 backdrop-blur-sm shadow-[0_16px_60px_rgba(0,0,0,0.45)]"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={fadeUp} className="text-center flex flex-col items-center w-full">
          <h1 className="text-[40px] sm:text-[56px] font-[700] text-white leading-[1.15] tracking-tight max-w-[800px]">
            Personalized Learning Paths, Built for Your Goals
          </h1>
          <p className="mt-6 text-[#6b7280] max-w-[520px] text-lg sm:text-[19px] font-[400] leading-relaxed">
            LearnFlow generates a personalized, visual, phase-by-phase learning path based on your goal, your time, and your level.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/select')}
              className="bg-[#6366f1] text-white font-[600] rounded-xl px-8 py-4 sm:text-lg transition-all"
            >
              Build My Roadmap &rarr;
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHowItWorks((prev) => !prev)}
              className="border border-white/35 bg-white/5 text-white font-[600] rounded-xl px-6 py-4 sm:text-lg transition-colors hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Sparkles size={18} className="fill-none" />
              How it works
            </motion.button>
          </div>

          {showHowItWorks && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8 w-full max-w-[860px] rounded-2xl border border-white/15 bg-[#0b0b0b]/85 backdrop-blur-sm p-6 sm:p-8 text-left"
            >
              <h2 className="text-white text-xl sm:text-2xl font-[600]">What LearnFlow does</h2>
              <p className="mt-3 text-[#9ca3af] leading-relaxed">
                LearnFlow turns your goal into a personalized roadmap with clear phases, focused topics, and a realistic pace based on your current level and available study time.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">1. Tell us your goal</p>
                  <p className="mt-2 text-sm text-[#9ca3af]">Choose domain, skill level, and weekly time.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">2. Get your roadmap</p>
                  <p className="mt-2 text-sm text-[#9ca3af]">AI generates a step-by-step path with structure.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">3. Learn with clarity</p>
                  <p className="mt-2 text-sm text-[#9ca3af]">Track progress and keep moving phase by phase.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* FEATURE STRIP */}
        <motion.div variants={fadeUp} className="mt-20 sm:mt-28 w-full max-w-4xl border-t border-[#1f1f1f] pt-12 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
          <div className="flex items-center gap-3 text-[#6b7280] font-[500] sm:text-lg">
            <Brain className="w-6 h-6 text-[#6366f1]" />
            <span>AI-Personalized</span>
          </div>
          <div className="flex items-center gap-3 text-[#6b7280] font-[500] sm:text-lg">
            <Network className="w-6 h-6 text-[#6366f1]" />
            <span>Visual Node Graph</span>
          </div>
          <div className="flex items-center gap-3 text-[#6b7280] font-[500] sm:text-lg">
            <TrendingUp className="w-6 h-6 text-[#6366f1]" />
            <span>Progress Tracking</span>
          </div>
        </motion.div>

      </motion.div>
    </main>
  )
}
