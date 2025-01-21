"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateButtonProps {
  label: string;
  onClick?: () => void;
  navigateTo?: string; // If navigation is needed
    setOpen?:boolean
  
}

const CreateButton: React.FC<CreateButtonProps> = ({ label, onClick, navigateTo,setOpen }) => {
  const router = useRouter();

  const handleClick = () => {
    if (navigateTo) {
      router.push(navigateTo);
    } else if (onClick) {
      onClick();
    }
//     if(setOpen){
// setOpen(true)
//     }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#F0CE30] to-[#FCB51F] rounded-[14px] p-6 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity w-full md:w-4/5 padding-all"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mb-2">
          <Plus size={24} className="text-white" />
        </div>
        <p className="text-white font-medium createxs-size">{label}</p>
      </div>
    </div>
  );
};

export default CreateButton;
