'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { BookOpen, BriefcaseBusiness, Compass, FlaskConical, Sparkles, Video } from 'lucide-react'

export default function PreferencesPage() {
  const router = useRouter()
  const { selectedDomain, selectedSubTrack, setPreferences } = useStore()

  const [hours, setHours] = useState<number>(2)
  const [targetLevel, setTargetLevel] = useState<'Fundamentals' | 'Job Ready' | 'Expert'>('Job Ready')
  const [deadline, setDeadline] = useState<string>('')
  const [learningPreference, setLearningPreference] = useState<'Project First' | 'Theory First' | 'Balanced'>('Balanced')
  const [resourcePreference, setResourcePreference] = useState<'Docs' | 'Video' | 'Hands-on'>('Hands-on')
  const [motivation, setMotivation] = useState<string>('')

  // Optional: Redirect if no domain/subtrack selected
  useEffect(() => {
    if (!selectedDomain || !selectedSubTrack) {
      router.push('/select')
    }
  }, [selectedDomain, selectedSubTrack, router])

  const handleGenerate = () => {
    setPreferences({
      hoursPerDay: hours,
      targetLevel,
      deadline: deadline || undefined,
      learningPreference,
      resourcePreference,
      motivation: motivation.trim() || undefined,
    })
    router.push('/generating')
  }

  // If missing state, prevent rendering the main content briefly
  if (!selectedDomain || !selectedSubTrack) {
    return null
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #1f1f1f;
          border-radius: 9999px;
          outline: none;
        }
        .custom-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #0a0a0a;
          transition: transform 0.1s ease;
        }
        .custom-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      ` }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[1080px] bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-6 md:p-10"
      >
        <div className="text-sm text-[#737373] mb-8 flex items-center gap-2">
          <span>{selectedDomain}</span>
          <span>→</span>
          <span>{selectedSubTrack}</span>
          <span>→</span>
          <span className="text-[#e5e5e5]">Preferences</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-8 lg:gap-10 items-start">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Set Your Pace</h1>
            <p className="text-[#a3a3a3] text-sm md:text-base max-w-[56ch] leading-relaxed">
              Tune your plan to match your schedule and target outcome. LearnFlow will use these settings to adjust depth, pacing, and roadmap complexity.
            </p>

            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                How many hours can you commit per day?
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(parseFloat(e.target.value))}
                  className="custom-range flex-1"
                />
                <div className="text-right sm:w-36 whitespace-nowrap text-[#a3a3a3] text-sm bg-[#171717] px-3 py-2 rounded-lg border border-[#262626]">
                  <span className="text-[#e5e5e5] font-bold text-base">{hours}</span> hrs/day
                  <div className="text-xs mt-0.5">~{Math.round(hours * 7)} hrs/week</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                Got a deadline? <span className="text-[#737373] text-sm font-normal italic">(optional)</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-3 text-[#e5e5e5] outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                Why this goal matters to you <span className="text-[#737373] text-sm font-normal italic">(optional)</span>
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                rows={3}
                placeholder="Example: I want to switch careers in 6 months and build a portfolio with real projects."
                className="w-full bg-[#171717] border border-[#262626] rounded-xl px-4 py-3 text-[#e5e5e5] text-sm outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all placeholder:text-[#6b7280]"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                What level do you want to reach?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    id: 'Fundamentals',
                    Icon: BookOpen,
                    desc: 'Core concepts and foundations',
                  },
                  {
                    id: 'Job Ready',
                    Icon: BriefcaseBusiness,
                    desc: 'Skills to land your first role',
                  },
                  {
                    id: 'Expert',
                    Icon: Sparkles,
                    desc: 'Deep mastery and specialization',
                  },
                ].map((level) => {
                  const isActive = targetLevel === level.id

                  return (
                    <button
                      key={level.id}
                      onClick={() => setTargetLevel(level.id as 'Fundamentals' | 'Job Ready' | 'Expert')}
                      className={`flex items-center gap-4 text-left p-4 border rounded-xl transition-all duration-200 focus:outline-none ${
                        isActive
                          ? 'border-[#6366f1] bg-[#6366f1]/10'
                          : 'border-[#262626] bg-[#171717] hover:border-[#404040] hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-[#6366f1]/20 text-[#a5b4fc]' : 'bg-[#0f0f0f] text-[#9ca3af]'
                        }`}
                      >
                        <level.Icon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#e5e5e5]">{level.id}</p>
                        <p className="text-xs text-[#a3a3a3] leading-snug">{level.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                Learning style
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Project First', desc: 'Start building quickly, learn concepts as needed' },
                  { id: 'Theory First', desc: 'Build stronger conceptual foundations before projects' },
                  { id: 'Balanced', desc: 'Mix concept study with project practice each week' },
                ].map((item) => {
                  const isActive = learningPreference === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setLearningPreference(item.id as 'Project First' | 'Theory First' | 'Balanced')}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'border-[#6366f1] bg-[#6366f1]/10 text-white'
                          : 'border-[#262626] bg-[#171717] text-[#d4d4d8] hover:border-[#3f3f46]'
                      }`}
                    >
                      <p className="text-sm font-semibold">{item.id}</p>
                      <p className="text-xs text-[#a3a3a3] mt-1">{item.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[#e5e5e5] font-semibold text-lg tracking-wide">
                Preferred resources
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Docs', Icon: BookOpen },
                  { id: 'Video', Icon: Video },
                  { id: 'Hands-on', Icon: FlaskConical },
                ].map((item) => {
                  const isActive = resourcePreference === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => setResourcePreference(item.id as 'Docs' | 'Video' | 'Hands-on')}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 transition-all ${
                        isActive
                          ? 'border-[#6366f1] bg-[#6366f1]/10 text-white'
                          : 'border-[#262626] bg-[#171717] text-[#a3a3a3] hover:border-[#3f3f46]'
                      }`}
                    >
                      <item.Icon size={16} />
                      <span className="text-xs font-medium">{item.id}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#262626] bg-[#101010] p-4">
              <p className="text-xs uppercase tracking-wider text-[#71717a] mb-2">Personalized plan preview</p>
              <div className="space-y-1 text-sm text-[#d4d4d8]">
                <p className="flex items-center gap-2"><Compass size={14} className="text-[#a5b4fc]" /> {learningPreference}</p>
                <p className="flex items-center gap-2"><BookOpen size={14} className="text-[#a5b4fc]" /> {resourcePreference} focused resources</p>
                <p className="flex items-center gap-2"><Sparkles size={14} className="text-[#a5b4fc]" /> {targetLevel} roadmap at {hours} hrs/day</p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-[#6366f1] text-white font-semibold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-[#4f46e5]"
            >
              Generate My Roadmap &rarr;
            </button>
          </div>
        </div>
      </motion.div>
    </div>
    </PageWrapper>
  )
}
