"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Clock, Target, AlertCircle, BookOpen, Video, Code, Zap, Lock, Star } from 'lucide-react';
import { RoadmapData, TopicNode as TopicNodeType } from '@/lib/types';
import { useStore } from '@/lib/store';

interface VerticalTimelineProps {
  roadmap: RoadmapData;
  onSelectTopic: (topic: TopicNodeType) => void;
}

export function VerticalTimeline({ roadmap, onSelectTopic }: VerticalTimelineProps) {
  const { completedTopics, toggleTopic } = useStore();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(roadmap.phases.slice(0, 1).map(p => p.id))
  );

  const togglePhase = (phaseId: string) => {
    const newSet = new Set(expandedPhases);
    if (newSet.has(phaseId)) {
      newSet.delete(phaseId);
    } else {
      newSet.add(phaseId);
    }
    setExpandedPhases(newSet);
  };

  const totalTopics = useMemo(
    () => roadmap.phases.reduce((sum, phase) => sum + phase.topics.length, 0),
    [roadmap.phases]
  );

  const completedCount = useMemo(
    () => completedTopics.length,
    [completedTopics]
  );

  const progressPercent = (completedCount / totalTopics) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'from-green-400 to-emerald-500';
      case 'intermediate':
        return 'from-amber-400 to-orange-500';
      case 'advanced':
        return 'from-red-400 to-rose-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 border-green-500/30';
      case 'intermediate':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'advanced':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-amber-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'docs':
        return <BookOpen size={14} />;
      case 'video':
        return <Video size={14} />;
      case 'practice':
        return <Code size={14} />;
      default:
        return <Zap size={14} />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {roadmap.domain}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 ml-3">
            {roadmap.subTrack}
          </span>
        </h1>

        {/* Progress Bar */}
        <div className="max-w-lg mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Your Progress</span>
            <span className="text-sm font-semibold text-white">
              {completedCount} of {totalTopics} completed
            </span>
          </div>
          <div className="h-3 bg-[#1f1f1f] rounded-full overflow-hidden border border-[#2a2a2a]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-2xl font-bold text-indigo-400">{totalTopics}</div>
            <div className="text-xs text-gray-400">Topics to learn</div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">
              {roadmap.phases.reduce((sum, p) => sum + p.topics.reduce((s, t) => s + t.estimatedHours, 0), 0)}h
            </div>
            <div className="text-xs text-gray-400">Total hours</div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3 col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-purple-400">{roadmap.phases.length}</div>
            <div className="text-xs text-gray-400">Learning phases</div>
          </div>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 transform md:-translate-x-1/2" />

        {/* Phases */}
        <div className="space-y-8">
          {roadmap.phases.map((phase, phaseIndex) => {
            const phaseTopics = phase.topics;
            const phaseCompleted = phaseTopics.filter(t => completedTopics.includes(t.id)).length;
            const phaseProgress = (phaseCompleted / phaseTopics.length) * 100;
            const isPhaseExpanded = expandedPhases.has(phase.id);
            const isPhaseComplete = phaseCompleted === phaseTopics.length;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: phaseIndex * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <motion.div
                  className="absolute left-0 md:left-1/2 top-6 w-9 h-9 transform md:-translate-x-1/2 -translate-x-1.5 z-10 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <div
                    className={`w-9 h-9 rounded-full border-4 border-[#0a0a0a] flex items-center justify-center ${
                      isPhaseComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                  >
                    {isPhaseComplete ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </motion.div>

                {/* Phase Card */}
                <div className="md:w-1/2 md:ml-auto md:pl-8 pl-16">
                  <motion.button
                    onClick={() => togglePhase(phase.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      isPhaseExpanded
                        ? 'bg-[#111111] border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            Phase {phaseIndex + 1}
                          </span>
                          {isPhaseComplete && (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                              <Check size={12} /> Complete
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{phase.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{phase.milestone}</p>

                        {/* Phase Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {phaseCompleted} of {phaseTopics.length} topics completed
                            </span>
                            <span className="text-xs font-semibold text-indigo-400">{Math.round(phaseProgress)}%</span>
                          </div>
                          <div className="h-2 bg-[#1f1f1f] rounded-full overflow-hidden border border-[#2a2a2a]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${phaseProgress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform flex-shrink-0 ${
                          isPhaseExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </motion.button>

                  {/* Topics - Horizontal Scroll */}
                  <AnimatePresence>
                    {isPhaseExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {phaseTopics.map((topic, topicIndex) => {
                            const isCompleted = completedTopics.includes(topic.id);

                            return (
                              <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: topicIndex * 0.05 }}
                                className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden group ${
                                  isCompleted
                                    ? 'bg-[#111111] border-green-500/50 shadow-lg shadow-green-500/10'
                                    : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10'
                                }`}
                                onClick={() => onSelectTopic(topic)}
                              >
                                {/* Topic Header */}
                                <div className={`p-4 border-b border-[#1f1f1f] ${getDifficultyBg(topic.difficulty)}`}>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-white font-bold text-sm flex-1 line-clamp-2">{topic.name}</h4>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTopic(topic.id);
                                      }}
                                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isCompleted
                                          ? 'bg-green-500 border-green-500'
                                          : 'border-gray-500 hover:border-green-400'
                                      }`}
                                    >
                                      {isCompleted && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${getDifficultyText(topic.difficulty)}`}>
                                      {topic.difficulty}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock size={12} /> {topic.estimatedHours}h
                                    </span>
                                  </div>
                                </div>

                                {/* Topic Content */}
                                <div className="p-4 space-y-3">
                                  {/* Description */}
                                  <div>
                                    <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                                      {topic.description}
                                    </p>
                                  </div>

                                  {/* Resources Preview */}
                                  {topic.resources && topic.resources.length > 0 && (
                                    <div className="space-y-1">
                                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Resources</p>
                                      <div className="flex flex-wrap gap-1">
                                        {topic.resources.slice(0, 3).map((res, i) => (
                                          <div
                                            key={i}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1f1f1f] text-gray-300 text-xs hover:bg-indigo-500/20 hover:text-indigo-400 transition-all"
                                            title={res.label}
                                          >
                                            {getResourceIcon(res.type)}
                                            <span className="truncate max-w-[80px]">{res.label}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Project Idea */}
                                  {topic.projectIdea && (
                                    <div className="pt-2 border-t border-[#1f1f1f]">
                                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                        Build Something
                                      </p>
                                      <p className="text-gray-300 text-xs line-clamp-2 italic">{topic.projectIdea}</p>
                                    </div>
                                  )}

                                  {/* Action Icon */}
                                  <div className="pt-2 flex justify-between items-center">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 group-hover:w-2 transition-all" />
                                    <span className="text-xs text-gray-500 group-hover:text-indigo-400 transition-colors">
                                      View Details →
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
