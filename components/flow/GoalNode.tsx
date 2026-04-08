import { Handle, Position } from 'reactflow';

export function GoalNode() {
  return (
    <div className="bg-[#6366f1] text-white font-[Poppins] font-bold px-8 py-3 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] relative flex items-center justify-center text-lg tracking-wider">
      GOAL
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </div>
  );
}
