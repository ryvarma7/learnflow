"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useStore } from "@/lib/store"
import { PageWrapper } from "@/components/ui/PageWrapper"

const MESSAGES = [
  "Analyzing your learning goal...",
  "Mapping the knowledge graph...",
  "Identifying topic dependencies...",
  "Estimating your pace...",
  "Curating the best resources...",
  "Building your roadmap..."
]

export default function GeneratingPage() {
  const router = useRouter()
  const { selectedDomain, selectedSubTrack, preferences, extraNotes, setRoadmap, generatedRoadmap } = useStore()

  const [messageIndex, setMessageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSlow, setIsSlow] = useState(false)
  
  const hasGeneratedRef = useRef(false)

  const generate = useCallback(async () => {
    setError(null)
    setIsSlow(false)
    hasGeneratedRef.current = true

    const slowTimeout = setTimeout(() => {
      setIsSlow(true);
    }, 15000);

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedDomain,
          subTrack: selectedSubTrack,
          hoursPerDay: preferences?.hoursPerDay,
          targetLevel: preferences?.targetLevel,
          deadline: preferences?.deadline,
          learningPreference: preferences?.learningPreference,
          resourcePreference: preferences?.resourcePreference,
          motivation: preferences?.motivation,
          extraNotes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate roadmap")
      }

      clearTimeout(slowTimeout)
      setRoadmap(data.roadmap)
      router.replace("/roadmap")
    } catch (err: any) {
      clearTimeout(slowTimeout)
      setError(err.message || "An unexpected error occurred")
      hasGeneratedRef.current = false
    }
  }, [selectedDomain, selectedSubTrack, preferences, extraNotes, router, setRoadmap])

  // Initial validation & API trigger
  useEffect(() => {
    if (!selectedDomain || !selectedSubTrack || !preferences) {
      router.replace("/select")
      return
    }

    if (!hasGeneratedRef.current && !generatedRoadmap) {
      generate()
    }
  }, [selectedDomain, selectedSubTrack, preferences, generatedRoadmap, router, generate])

  // Message rotation cycle
  useEffect(() => {
    if (error) return

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [error])

  // First check if redirecting due to missing state (renders nothing briefly)
  if (!selectedDomain || !selectedSubTrack || !preferences) {
    return null
  }

  // Error State Red-Tinted Card
  if (error) {
    return (
      <PageWrapper>
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#111111] border border-red-500/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.05)]"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-poppins font-semibold text-white mb-3">
            Generation Failed
          </h2>
          <p className="text-[#6b7280] mb-8 text-sm leading-relaxed">
            {error}
          </p>
          <button
            onClick={generate}
            className="w-full py-4 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Try Again
          </button>
        </motion.div>
      </div>
      </PageWrapper>
    )
  }

  // Loading UI (Generating State)
  return (
    <PageWrapper>
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="relative w-full max-w-lg mx-auto flex flex-col items-center justify-center">
        
        {/* Orbs Animation */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-16">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-[var(--accent)]"
              style={{ borderColor: "#6366f1" }}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: [0.8, 3], opacity: [0.8, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.8,
              }}
            />
          ))}
          <div className="relative z-10 w-16 h-16 rounded-full bg-[#0a0a0a] border border-[#1f1f1f] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <span className="font-poppins font-bold text-3xl text-[#6366f1]">
              L
            </span>
          </div>
        </div>

        {/* Rotating Status Messages */}
        <div className="h-8 w-full relative flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={isSlow ? 'slow' : messageIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute font-poppins font-medium text-[#6b7280] text-center w-full text-lg"
            >
              {isSlow ? "Still working, this can take a moment..." : MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Subtext mapping domain and subtrack */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="font-poppins text-sm text-[#4b5563]">
            {selectedDomain} 
            <span className="mx-2 text-[#374151]">→</span> 
            {selectedSubTrack}
          </p>
        </motion.div>

      </div>
    </div>
    </PageWrapper>
  )
}
