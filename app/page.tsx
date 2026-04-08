'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex flex-col pt-20 md:pt-28 pb-20 overflow-hidden font-sans relative">
      <motion.div 
        variants={fadeUp} 
        className="max-w-[1200px] mx-auto w-full px-6 -mt-20 mb-4 flex justify-center relative z-10"
      >
        <p className="text-[34px] sm:text-[50px] font-[700] text-[#6366f1] tracking-wide">
          LearnFlow
        </p>
      </motion.div>

      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1150px] mx-auto w-full px-6 py-10 sm:py-12 flex flex-col items-center relative z-10"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={fadeUp} className="text-center flex flex-col items-center w-full">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.02] px-4 py-1.5 text-sm font-[500] text-white/85 tracking-wide">
            Weekly outcomes. Daily goals.
          </p>
          <h1 className="mt-6 text-[42px] sm:text-[64px] font-[700] text-white leading-[1.1] tracking-tight max-w-[900px]">
            Real learning goals, split into weekly wins and daily work
          </h1>
          <p className="mt-6 text-white/75 max-w-[620px] text-lg sm:text-[20px] font-[400] leading-relaxed">
            LearnFlow turns a broad goal into a practical roadmap with weekly outcomes, daily goals, and a pace that matches your time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/select')}
              className="bg-[#6366f1] text-white font-[600] rounded-xl px-8 py-4 sm:text-lg transition-all shadow-[0_12px_30px_rgba(99,102,241,0.38)]"
            >
              Build My Roadmap &rarr;
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHowItWorks((prev) => !prev)}
              className="border border-white/30 bg-black text-white font-[600] rounded-xl px-6 py-4 sm:text-lg transition-colors hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Sparkles size={18} className="fill-none" />
              How it works
            </motion.button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/[0.02] px-4 py-1.5 text-sm text-white/80">Weekly outcomes</span>
            <span className="rounded-full border border-white/20 bg-white/[0.02] px-4 py-1.5 text-sm text-white/80">Daily goals that matter</span>
            <span className="rounded-full border border-white/20 bg-white/[0.02] px-4 py-1.5 text-sm text-white/80">No filler tasks</span>
          </div>

          {showHowItWorks && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8 w-full max-w-[880px] rounded-2xl border border-white/20 bg-black/90 backdrop-blur-sm p-6 sm:p-8 text-left"
            >
              <h2 className="text-white text-xl sm:text-2xl font-[600]">What LearnFlow does</h2>
              <p className="mt-3 text-white/75 leading-relaxed">
                LearnFlow turns your goal into a roadmap with weekly checkpoints and concrete daily actions, so every step pushes toward something you can actually finish.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/15 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">1. Tell us what you want to finish</p>
                  <p className="mt-2 text-sm text-white/70">Choose the domain, level, and how much time you can really spend.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">2. Get weekly outcomes and daily goals</p>
                  <p className="mt-2 text-sm text-white/70">The roadmap splits the work into useful chunks instead of vague milestones.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/[0.02] p-4">
                  <p className="text-white font-[600]">3. Track what you actually did</p>
                  <p className="mt-2 text-sm text-white/70">Mark off real progress, not just time spent staring at a plan.</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* FEATURE STRIP */}
        <motion.div variants={fadeUp} className="mt-16 sm:mt-24 w-full max-w-4xl border-t border-white/10 pt-10 flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
          <div className="flex items-center gap-3 text-white/80 font-[500] sm:text-lg">
            <Brain className="w-6 h-6 text-[#6366f1]" />
            <span>AI-Personalized</span>
          </div>
          <div className="flex items-center gap-3 text-white/80 font-[500] sm:text-lg">
            <TrendingUp className="w-6 h-6 text-[#6366f1]" />
            <span>Progress Tracking</span>
          </div>
        </motion.div>

      </motion.div>
    </main>
  )
}
