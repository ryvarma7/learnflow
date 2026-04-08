import { Handle, Position } from 'reactflow';
import { useStore } from '@/lib/store';
import { TopicNode as TopicNodeType } from '@/lib/types';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopicNodeData {
  topic: TopicNodeType;
  onClick: (topic: TopicNodeType) => void;
  phaseIndex: number;
  topicIndex: number;
}

export function TopicNode({ data }: { data: TopicNodeData }) {
  const completedTopics = useStore(state => state.completedTopics);
  const toggleTopic = useStore(state => state.toggleTopic);
  
  const isCompleted = completedTopics.includes(data.topic.id);

  const colors = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };

  const borderClass = isCompleted 
    ? 'border-[#22c55e] bg-[rgba(34,197,94,0.05)]' 
    : 'border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#2a2a2a] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]';
  
  const delay = 0.3 + data.phaseIndex * 0.15 + 0.2 + data.topicIndex * 0.1;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      onClick={() => data.onClick(data.topic)}
      className={`w-[180px] h-[80px] rounded-lg border flex items-center p-3 cursor-pointer transition-all duration-150 relative group ${borderClass}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      
      <div className={`w-2 h-2 rounded-full absolute left-3 top-4 shrink-0 ${colors[data.topic.difficulty]}`} />
      
      <div className="ml-4 flex-1 h-full flex items-start overflow-hidden pt-1">
        <div className="text-white font-[Poppins] font-medium text-[12px] leading-tight line-clamp-2">
          {data.topic.name}
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-full py-0.5 ml-2 shrink-0">
        <span className="text-[#6b7280] text-[10px] font-medium">{data.topic.estimatedHours}h</span>
        <div 
          onClick={(e) => { 
            e.stopPropagation(); 
            toggleTopic(data.topic.id); 
          }}
          className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all duration-150 ${
            isCompleted 
              ? 'border-[#22c55e] bg-[#22c55e]' 
              : 'border-[#2a2a2a] bg-transparent group-hover:border-[#9ca3af]'
          }`}
        >
          {isCompleted && <Check size={10} className="text-white font-bold" strokeWidth={4} />}
        </div>
      </div>
    </motion.div>
  );
}
