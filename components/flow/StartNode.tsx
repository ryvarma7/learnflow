import { Handle, Position } from 'reactflow';

export function StartNode() {
  return (
    <div className="bg-[#1f1f1f] border border-[#2a2a2a] text-[#9ca3af] font-[Poppins] px-6 py-2 rounded-full font-semibold shadow-lg relative flex items-center justify-center">
      START
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}
