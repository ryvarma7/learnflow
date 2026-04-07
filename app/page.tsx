'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Brain, Network, TrendingUp } from 'lucide-react'
import { DOMAIN_DATA } from '@/lib/domains'

export default function Home() {
  const router = useRouter()

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

  const roadmapPhases = [
    { title: 'Phase 1: Foundations', t1: 'Basic Concepts', t2: 'Environment Setup' },
    { title: 'Phase 2: Core Skills', t1: 'Main Frameworks', t2: 'Best Practices' },
    { title: 'Phase 3: Mastery', t1: 'Advanced Patterns', t2: 'Capstone Project' },
  ]

  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex flex-col pt-24 md:pt-32 pb-20 overflow-hidden font-sans">
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        animate="show" 
        className="max-w-[1200px] mx-auto w-full px-6 flex flex-col items-center relative z-10"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={fadeUp} className="text-center flex flex-col items-center w-full">
          <h1 className="text-[40px] sm:text-[56px] font-[700] text-white leading-[1.15] tracking-tight max-w-[800px]">
            Turn "I want to learn X" into a roadmap that actually works.
          </h1>
          <p className="mt-6 text-[#6b7280] max-w-[520px] text-lg sm:text-[19px] font-[400] leading-relaxed">
            PathForge generates a personalized, visual, phase-by-phase learning path based on your goal, your time, and your level.
          </p>
          <motion.button 
            whileHover={{ scale: 1.03, boxShadow: "0 0 24px var(--accent-glow)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/select')}
            className="mt-10 bg-[#6366f1] text-white font-[600] rounded-xl px-8 py-4 sm:text-lg transition-all"
          >
            Build My Roadmap &rarr;
          </motion.button>
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

        {/* DOMAIN PREVIEW STRIP */}
        <motion.div variants={fadeUp} className="mt-24 sm:mt-32 w-[100vw] relative left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-full overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mask-edges">
            <div className="flex gap-3 min-w-max px-6 sm:px-12 mx-auto justify-center">
              {Object.keys(DOMAIN_DATA).map((domain) => (
                <div key={domain} className="bg-[#111111] border border-[#1f1f1f] text-gray-400 text-[15px] font-[500] rounded-full px-6 py-2.5 whitespace-nowrap cursor-default hover:border-gray-700 transition-colors">
                  {domain}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAKE ROADMAP PREVIEW */}
        <motion.div variants={fadeUp} className="mt-24 sm:mt-32 w-full max-w-5xl flex flex-col relative">
          <p className="text-[#6b7280] font-[500] mb-8 text-center sm:text-left text-lg">
            Your roadmap will look like this &rarr;
          </p>
          
          <div className="w-full rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] p-6 sm:p-12 overflow-hidden relative shadow-2xl">
            
            <div className="flex flex-col md:flex-row justify-between items-center relative gap-12 md:gap-4 w-full">
              {/* Horizontal connecting line (hidden on md-down) */}
              <div className="hidden md:block absolute top-[23px] left-[15%] right-[15%] h-[2px] bg-[#1f1f1f] z-0" />

              {/* Phases */}
              {roadmapPhases.map((phase, i) => (
                <div key={i} className="flex flex-col items-center relative z-10 w-full md:w-1/3">
                  
                  {/* Phase Box */}
                  <div className="bg-[#111111] border border-[#6366f1] rounded-lg px-6 py-3 font-[600] text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-6 z-10 whitespace-nowrap text-sm sm:text-base">
                    {phase.title}
                  </div>
                  
                  {/* Vertical connecting line for topics */}
                  <div className="hidden md:block w-[2px] h-8 bg-[#1f1f1f] -mt-6 mb-2" />
                  {/* For mobile, visual connection to the phase box above */}
                  <div className="md:hidden w-[2px] h-6 bg-[#1f1f1f] -mt-6 mb-2" />

                  {/* Topics below phase */}
                  <div className="flex flex-col gap-3 w-full max-w-[220px]">
                    <div className="bg-[#000000] border border-[#1f1f1f] rounded-md px-4 py-3.5 text-[14px] text-gray-200 font-[500] text-center shadow-lg transition-transform hover:-translate-y-1">
                      {phase.t1}
                    </div>
                    <div className="bg-[#000000] border border-[#1f1f1f] rounded-md px-4 py-3.5 text-[14px] text-gray-200 font-[500] text-center shadow-lg transition-transform hover:-translate-y-1">
                      {phase.t2}
                    </div>
                  </div>

                  {/* Connect next phase on mobile */}
                  {i < roadmapPhases.length - 1 && (
                    <div className="md:hidden w-[2px] h-12 bg-[#1f1f1f] mt-3" />
                  )}
                </div>
              ))}
            </div>

            {/* Subtle Gradient Overlay mimicking fade at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-surface)] to-transparent pointer-events-none rounded-b-2xl opacity-60" />
          </div>
        </motion.div>

      </motion.div>
    </main>
  )
}
