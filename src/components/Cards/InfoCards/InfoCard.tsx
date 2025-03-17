"use client"

import React from "react";
import { cn } from "../../../lib/utils"; // Utility function for class merging
import Link from "next/link";
import Image from "next/image";

interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  bgColor?: string;
  link?: string;
  linkText?: string;
  linkColor?: string;
}

export default function InfoCard({
  icon,
  title,
  description,
  bgColor,
  linkText,
  link,
  linkColor,
}: InfoCardProps) {

const handleClusterEvent = (link: any) => {
  window.location.href = link
}

  return (
    <div onClick={() => handleClusterEvent(link)} className={cn("p-5 rounded-xl cursor-pointer", bgColor)}>
      <div className="flex justify-between items-center">
        {/* <div className={cn("p-2 rounded-lg")}>{icon}</div> */}
        {/* <Image src={icon || "/fallback.png"} alt={title||"image"} height={70} width={60} /> */}
        {link && (
          <a className={cn("text-sm flex items-center", linkColor)}>
            <span className="underline">{linkText}</span>
            <span className="ml-1 text-xs">&#8599;</span>
          </a>
        )}
      </div>
      <h3 className="mt-8 text-lg font-semibold text-gray-900 pb-5">{title}</h3>
      <p className="mt-1 text-sm text-[var(--foreground)]">{description}</p>
    </div>
  );
}
