
import { motion } from 'framer-motion';
import { X, BookOpen, Video, Code, Clock, CheckCircle2, Circle, Target, Lightbulb, Zap, ArrowRight } from 'lucide-react';
import { TopicNode } from '@/lib/types';
import { useStore } from '@/lib/store';

interface SidePanelProps {
  topic: TopicNode | null;
  onClose: () => void;
}

function getStableVideoSearchUrl(topicName: string) {
  const q = encodeURIComponent(`${topicName} tutorial`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

function getResourceHref(url: string, type: string, topicName: string) {
  if (type === 'video') {
    return getStableVideoSearchUrl(topicName);
  }
  return url;
}

export function SidePanel({ topic, onClose }: SidePanelProps) {
  const { completedTopics, toggleTopic } = useStore();
  
  if (!topic) return null;

  const isCompleted = completedTopics.includes(topic.id);

  const difficultyColors = {
    beginner: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20' },
    intermediate: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20' },
    advanced: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20' },
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'docs': return <BookOpen size={16} className="text-blue-400" />;
      case 'video': return <Video size={16} className="text-purple-400" />;
      case 'practice': return <Code size={16} className="text-orange-400" />;
      default: return <Zap size={16} className="text-gray-400" />;
    }
  };

  const getResourceTypeName = (type: string) => {
    switch (type) {
      case 'docs': return 'Documentation';
      case 'video': return 'Video Tutorial';
      case 'practice': return 'Practice';
      default: return 'Resource';
    }
  };

  const checklist = [
    { step: 1, title: 'Learn the basics', icon: '📚' },
    { step: 2, title: 'Watch tutorials', icon: '📹' },
    { step: 3, title: 'Practice with exercises', icon: '✏️' },
    { step: 4, title: 'Build a project', icon: '🏗️' },
    { step: 5, title: 'Review & consolidate', icon: '✅' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-40 md:hidden"
      />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-l border-[#1f1f1f] shadow-2xl z-50 overflow-y-auto flex flex-col"
      >
        <div className="p-6 flex-1 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h2 className="text-white font-bold text-2xl mb-2 leading-tight">{topic.name}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${topic.difficulty === 'beginner' ? 'bg-green-500' : topic.difficulty === 'intermediate' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${difficultyColors[topic.difficulty].text}`}>
                  {topic.difficulty} Level
                </span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#1f1f1f] rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-lg border ${difficultyColors[topic.difficulty].bg}`}>
              <div className="text-xs text-gray-400 mb-1">Difficulty</div>
              <div className={`text-sm font-bold capitalize ${difficultyColors[topic.difficulty].text}`}>
                {topic.difficulty}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[#1f1f1f] bg-[#111111]">
              <div className="text-xs text-gray-400 mb-1">Duration</div>
              <div className="text-sm font-bold text-blue-400 flex items-center gap-1">
                <Clock size={14} /> {topic.estimatedHours}h
              </div>
            </div>
            <div className="p-3 rounded-lg border border-[#1f1f1f] bg-[#111111]">
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <div className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                {isCompleted ? '✓ Done' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Completion Toggle Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              toggleTopic(topic.id);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              isCompleted
                ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                : 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/30'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={18} /> Mark as Incomplete
              </>
            ) : (
              <>
                <Circle size={18} /> Mark as Complete
              </>
            )}
          </motion.button>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb size={14} /> What You Will Learn
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed bg-[#111111] p-4 rounded-lg border border-[#1f1f1f]">
              {topic.description}
            </p>
          </div>

          {/* Checklist Steps */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Target size={14} /> Learning Path
            </h3>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-indigo-500/30 transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/40 transition-colors">
                    <span className="text-xs font-bold text-indigo-400">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 font-medium">{item.icon} {item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {topic.resources && topic.resources.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} /> Recommended Resources
              </h3>
              <div className="space-y-2">
                {topic.resources.map((res, i) => (
                  <motion.a 
                    key={i} 
                    href={getResourceHref(res.url, res.type, topic.name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#111111] border border-[#1f1f1f] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                  >
                    <div className="bg-[#1f1f1f] p-2 rounded-md group-hover:bg-indigo-500/20 transition-colors flex-shrink-0">
                      {getResourceIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                        {getResourceTypeName(res.type)}
                      </div>
                      <p className="text-gray-300 text-sm font-medium truncate group-hover:text-white transition-colors">
                        {res.label}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5" />
                  </motion.a>
                ))}
              </div>
            </div>
          )}

          {/* Project Idea */}
          {topic.projectIdea && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} /> Build a Project
              </h3>
              <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 border-l-2 border-t border-r border-b border-purple-500/30 p-4 rounded-lg">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {topic.projectIdea}
                </p>
              </div>
            </div>
          )}

          {/* CTA Footer */}
          <div className="pt-4 border-t border-[#1f1f1f]">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Follow the learning path above to master this topic. Remember to practice regularly.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
