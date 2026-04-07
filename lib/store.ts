import { create } from 'zustand'
import { UserPreferences, RoadmapData } from './types'

interface AppState {
  selectedDomain: string | null
  selectedSubTrack: string | null
  preferences: UserPreferences | null
  generatedRoadmap: RoadmapData | null
  completedTopics: string[]
  
  setDomain: (domain: string | null) => void
  setSubTrack: (subTrack: string | null) => void
  setPreferences: (preferences: UserPreferences | null) => void
  setRoadmap: (roadmap: RoadmapData | null) => void
  toggleTopic: (id: string) => void
  resetAll: () => void
}

export const useStore = create<AppState>((set) => ({
  selectedDomain: null,
  selectedSubTrack: null,
  preferences: null,
  generatedRoadmap: null,
  completedTopics: [],

  setDomain: (domain) => set({ selectedDomain: domain }),
  setSubTrack: (subTrack) => set({ selectedSubTrack: subTrack }),
  setPreferences: (preferences) => set({ preferences }),
  setRoadmap: (roadmap) => set({ generatedRoadmap: roadmap }),
  toggleTopic: (id) =>
    set((state) => ({
      completedTopics: state.completedTopics.includes(id)
        ? state.completedTopics.filter((tId) => tId !== id)
        : [...state.completedTopics, id],
    })),
  resetAll: () =>
    set({
      selectedDomain: null,
      selectedSubTrack: null,
      preferences: null,
      generatedRoadmap: null,
      completedTopics: [],
    }),
}))
