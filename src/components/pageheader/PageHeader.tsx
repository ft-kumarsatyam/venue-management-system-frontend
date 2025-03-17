"use client";
import type { ReactNode } from "react";
import { capitalizeFirstLetter, cn } from "../../lib/utils";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
  title1: string;
  title2: string;
  children?: ReactNode;
  className?: string;
  description?: string;
}

export function PageHeader({
  title1,
  title2,
  children,
  className,
  description,
}: PageHeaderProps) {
  // let pathname = usePathname();
  // pathname = pathname.split("/").filter(Boolean);

  let pathname: string | string[] = usePathname();
  pathname = pathname.replace(/[/\-]/g, " ");
  // pathname = pathname.split("/").filter(Boolean);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-2">
            <span className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">{title1}</span> &gt; {title2}
            <span className="text-[#515151]">
              {pathname[0] && capitalizeFirstLetter(pathname[0])}
            </span>
          </h3>
          <h1 className="font-[Poppins] text-2xl font-semibold tracking-tight text-[#2A1647] ">
            {title2}
          </h1>
          <h3 className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">{description}</h3>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
