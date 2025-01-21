"use client";

import { type ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../components/ui/collapsible";
import "../main.css";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
}

export function CollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  className = "",
  contentClassName = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`w-full moduleadmin bg-white rounded-[22px] shadow-md border border-gray-200 overflow-hidden ${className} `}>
      {/* Collapsible Header */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h2 className="font-bold tracking-tight text-[#2A1647] all-venues-text">{title}</h2>
            {description && <p className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">{description}</p>}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#7942d1] hover:bg-gray-100 transition-all cursor-pointer">
              {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Collapsible Content */}
        <CollapsibleContent>
          <div className={`p-6 bg-white ${contentClassName}`}>{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
