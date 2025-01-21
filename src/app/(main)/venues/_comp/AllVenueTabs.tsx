"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

interface AllVenueTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AllVenueTabs({ activeTab, onTabChange }: AllVenueTabsProps) {
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  return (
    <Tabs
      value={activeTab}
      className="border rounded-lg border-[var(--background)] pt-[3px]"
    >
      <TabsList>
        <TabsTrigger
          className={`cursor-pointer ${
            activeTab === "Allocated"
              ? "bg-gradient-to-r from-[#F0CE30] to-[#FCB51F] text-[var(--black)] py-2 px-3"
              : "text-[var(--black)] py-2 px-3"
          }`}
          onClick={() => handleTabClick("Allocated")}
          value="Allocated"
        >
          Allocated
        </TabsTrigger>
        <TabsTrigger
          className={`cursor-pointer ${
            activeTab === "Unallocated"
              ? "bg-gradient-to-r from-[#F0CE30] to-[#FCB51F] text-[var(--black)] py-2 px-3"
              : "text-[var(--black)] py-2 px-3"
          }`}
          onClick={() => handleTabClick("Unallocated")}
          value="Unallocated"
        >
          Unallocated
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}