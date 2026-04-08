'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { DOMAIN_DATA, DEPENDENCY_MAP } from '@/lib/domains';
import * as LucideIcons from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';

function getIcon(name: string) {
  // Convert kebab-case to PascalCase (e.g., bar-chart -> BarChart)
  const formattedName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  const iconMap = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>;
  const IconComponent = iconMap[formattedName];
  if (IconComponent) return <IconComponent size={28} />;
  
  // Custom fallback for "function" icon which might not map properly in some lucide versions
  if (name === 'function') {
    const Component = iconMap.FunctionSquare || iconMap.Binary || LucideIcons.Box;
    return <Component size={28} />;
  }
  
  return <LucideIcons.Box size={28} />;
}

export default function SelectPage() {
  const router = useRouter();
  const { selectedDomain, setDomain, selectedSubTrack, setSubTrack, extraNotes, setExtraNotes } = useStore();
  const subTrackSectionRef = useRef<HTMLElement | null>(null);
  const continueSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedDomain) return;

    const timer = window.setTimeout(() => {
      subTrackSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 140);

    return () => window.clearTimeout(timer);
  }, [selectedDomain]);

  useEffect(() => {
    if (!selectedSubTrack) return;

    const timer = window.setTimeout(() => {
      continueSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [selectedSubTrack]);

  const handleDomainClick = (domain: string) => {
    setDomain(domain);
    setSubTrack(null); // Reset subtrack when domain changes
  };

  const handleSubTrackClick = (subTrack: string) => {
    setSubTrack(subTrack);
  };

  const domainEntries = Object.entries(DOMAIN_DATA);
  
  const currentSubTracks = selectedDomain 
    ? DOMAIN_DATA[selectedDomain as keyof typeof DOMAIN_DATA].subTracks 
    : [];
    
  const dependencies = selectedSubTrack ? DEPENDENCY_MAP[selectedSubTrack] : null;

  return (
    <PageWrapper>
    <div className="min-h-screen bg-black text-white p-6 pb-24 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Step 1: Domain Selection */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ fontWeight: 700, fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}>
              What do you want to learn?
            </h1>
            <p className="text-zinc-400 text-lg">
              Choose your domain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {domainEntries.map(([domainName, data]) => {
              const isSelected = selectedDomain === domainName;
              return (
                <button
                  key={domainName}
                  onClick={() => handleDomainClick(domainName)}
                  className={`flex flex-col items-start p-6 rounded-2xl text-left transition-all duration-150 border active:scale-95 cursor-pointer
                    ${isSelected 
                      ? 'border-[#6366f1] bg-[#6366f1]/10 ring-1 ring-[#6366f1]/50'
                      : 'border-[#1f1f1f] bg-[#111111] hover:border-[#6366f1] hover:scale-[1.02]'
                    }
                  `}
                >
                  <div className={`mb-5 p-3.5 rounded-xl transition-colors ${isSelected ? 'text-[#6366f1] bg-[#6366f1]/20' : 'text-zinc-300 bg-zinc-800/80'}`}>
                    {getIcon(data.icon)}
                  </div>
                  <h3 className="text-xl font-semibold mb-1.5" style={{ fontWeight: 600, fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}>
                    {domainName}
                  </h3>
                  <span className="text-sm font-medium text-zinc-500">
                    {data.subTracks.length} tracks
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Sub-Track Selection */}
        <AnimatePresence>
          {selectedDomain && (
            <motion.section
              ref={subTrackSectionRef}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6 overflow-hidden"
            >
              <div className="space-y-5 pt-8 border-t border-zinc-800/60">
                <h2 className="text-2xl font-semibold text-zinc-100" style={{ fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}>
                  Pick your track within <span className="text-[#6366f1]">{selectedDomain}</span>
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  {currentSubTracks.map((subTrack) => {
                    const isSelected = selectedSubTrack === subTrack;
                    return (
                      <button
                        key={subTrack}
                        onClick={() => handleSubTrackClick(subTrack)}
                        className={`px-5 py-2.5 rounded-full text-sm transition-all duration-150 border active:scale-95 cursor-pointer
                          ${isSelected
                            ? 'bg-[#6366f1] text-white border-[#6366f1]'
                            : 'bg-[#0a0a0a] text-zinc-300 border-[#2a2a2a] hover:border-[#6366f1] hover:text-white hover:bg-zinc-900'
                          }
                        `}
                        style={{ fontWeight: 500, fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}
                      >
                        {subTrack}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="extra-notes"
                    className="text-sm font-medium text-zinc-300"
                    style={{ fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}
                  >
                    Anything else you want us to consider? (optional)
                  </label>
                  <textarea
                    id="extra-notes"
                    value={extraNotes}
                    onChange={(e) => setExtraNotes(e.target.value)}
                    placeholder="Examples: I prefer project-based learning, focus on free resources, include interview prep, skip advanced math..."
                    rows={3}
                    className="w-full rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-all focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]"
                    style={{ fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}
                  />
                </div>
              </div>

              {/* Dependency Hint */}
              <AnimatePresence>
                {selectedSubTrack && dependencies && dependencies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4 flex items-start gap-3 mt-4 shadow-sm">
                      <LucideIcons.Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
                      <div className="text-sm text-zinc-300 leading-relaxed">
                        <span className="font-semibold text-zinc-200">Heads up</span> — {selectedSubTrack} works best if you already know:{' '}
                        <span className="text-[#6366f1] font-medium">{dependencies.join(', ')}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Continue Button */}
              <AnimatePresence>
                {selectedSubTrack && (
                  <motion.div
                    ref={continueSectionRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="pt-10 pb-12"
                  >
                    <button
                      onClick={() => router.push('/preferences')}
                      className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-4 rounded-xl transition-all duration-150 flex justify-center items-center gap-2 group active:scale-[0.98] cursor-pointer"
                      style={{ fontWeight: 600, fontFamily: 'var(--font-poppins, poppins, sans-serif)' }}
                    >
                      Continue 
                      <LucideIcons.ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
    </PageWrapper>
  );
}
