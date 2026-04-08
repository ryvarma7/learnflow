import { create } from 'zustand'
import { UserPreferences, RoadmapData } from './types'

interface AppState {
  selectedDomain: string | null
  selectedSubTrack: string | null
  extraNotes: string
  preferences: UserPreferences | null
  generatedRoadmap: RoadmapData | null
  completedTopics: string[]
  
  setDomain: (domain: string | null) => void
  setSubTrack: (subTrack: string | null) => void
  setExtraNotes: (notes: string) => void
  setPreferences: (preferences: UserPreferences | null) => void
  setRoadmap: (roadmap: RoadmapData | null) => void
  setCompletedTopics: (topics: string[]) => void
  toggleTopic: (id: string) => void
  resetAll: () => void
  getProgressPercent: () => number
}

export const useStore = create<AppState>((set, get) => ({
  selectedDomain: null,
  selectedSubTrack: null,
  extraNotes: '',
  preferences: null,
  generatedRoadmap: null,
  completedTopics: [],

  setDomain: (domain) => set({ selectedDomain: domain }),
  setSubTrack: (subTrack) => set({ selectedSubTrack: subTrack }),
  setExtraNotes: (notes) => set({ extraNotes: notes }),
  setPreferences: (preferences) => set({ preferences }),
  setRoadmap: (roadmap) => set({ generatedRoadmap: roadmap }),
  setCompletedTopics: (topics) => set({ completedTopics: topics }),
  
  toggleTopic: (id) => {
    set((state) => {
      const newTopics = state.completedTopics.includes(id)
        ? state.completedTopics.filter((tId) => tId !== id)
        : [...state.completedTopics, id];
        
      if (typeof window !== 'undefined' && state.selectedDomain && state.selectedSubTrack) {
        try {
          const hash = btoa(state.selectedDomain + state.selectedSubTrack).slice(0, 8);
          localStorage.setItem(`pf_progress_${hash}`, JSON.stringify(newTopics));
        } catch(e) {}
      }
      
      return { completedTopics: newTopics };
    });
  },
  
  resetAll: () =>
    set({
      selectedDomain: null,
      selectedSubTrack: null,
      extraNotes: '',
      preferences: null,
      generatedRoadmap: null,
      completedTopics: [],
    }),
    
  getProgressPercent: () => {
    const { generatedRoadmap, completedTopics } = get();
    if (!generatedRoadmap) return 0;
    
    const totalTopics = generatedRoadmap.phases.flatMap(p => p.topics).length;
    if (totalTopics === 0) return 0;
    
    return (completedTopics.length / totalTopics) * 100;
  }
}))
