export interface TopicResource {
  type: 'docs' | 'video' | 'practice'
  label: string
  url: string
}

export interface TopicNode {
  id: string
  name: string
  estimatedHours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  resources: TopicResource[]
  projectIdea: string
  completed?: boolean
}

export interface RoadmapPhase {
  id: string
  name: string
  milestone: string
  topics: TopicNode[]
}

export interface RoadmapData {
  domain: string
  subTrack: string
  targetLevel: string
  hoursPerDay: number
  phases: RoadmapPhase[]
}

export interface UserPreferences {
  hoursPerDay: number
  targetLevel: 'Fundamentals' | 'Job Ready' | 'Expert'
  deadline?: string
}
