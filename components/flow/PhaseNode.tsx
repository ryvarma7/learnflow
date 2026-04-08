import { Handle, Position } from 'reactflow';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhaseNodeData {
  index: number;
  name: string;
  milestone: string;
  completedCount: number;
  totalTopics: number;
  isCompleted: boolean;
}

export function PhaseNode({ data }: { data: PhaseNodeData }) {
  const delay = 0.3 + data.index * 0.15;

  return (
    <motion.div 
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`w-[220px] h-[110px] bg-[#111111] border border-[#1f1f1f] border-l-[3px] ${data.isCompleted ? 'border-l-[#22c55e] hover:border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-l-[#6366f1] hover:border-[#6366f1] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'} rounded-xl shadow-lg p-4 flex flex-col relative group transition-all duration-300 box-border cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="opacity-0" />
      
      {data.isCompleted && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-[#22c55e] rounded-full flex items-center justify-center">
          <Check size={12} className="text-white font-bold" strokeWidth={4} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className={`bg-[#6366f1]/20 text-[#6366f1] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${data.isCompleted ? 'bg-[#22c55e]/20 text-[#22c55e]' : ''}`}>
          Phase {data.index + 1}
        </span>
      </div>
      
      <div className="text-white font-[Poppins] font-semibold text-[14px] truncate leading-tight pr-6">
        {data.name}
      </div>
      
      <div className="text-[#6b7280] font-[Poppins] font-normal text-[11px] mt-auto line-clamp-2 leading-tight">
        {data.milestone}
      </div>
      
      <div className="text-[#4b5563] font-[Poppins] text-[10px] mt-1 font-medium">
        {data.completedCount}/{data.totalTopics} topics
      </div>
    </motion.div>
  );
}
