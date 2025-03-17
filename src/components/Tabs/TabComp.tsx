"use client";
import React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/button";

interface TabsCompProps {
  tabsArray: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
}
export default function TabsComp({ tabsArray }: TabsCompProps) {
  const [activeTab, setActiveTab] = useState(tabsArray[0]?.id || "");

  return (
    <div className="relative flex items-center gap-6 border-b border-[var(--background)]">
      {tabsArray.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          className={`relative flex items-center gap-2 pb-2 ${
            activeTab === tab.id
              ? "text-[var(--purple-light)] font-medium"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--purple-light)]"></div>
          )}
        </Button>
      ))}
    </div>
  );
}
