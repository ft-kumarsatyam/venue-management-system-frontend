import { Navbar } from "../../components/navbar/Navbar"
import { AppSidebar } from "../../components/sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Venue Management System",
  description: "Manage Clusters, Venues, Facilities, and Zones efficiently.",
};

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
<SidebarProvider>
<div className="block md:flex w-full">
    <AppSidebar />

    <div className="flex flex-col flex-1 w-[75vw]">
      <Navbar />

      <div className="items-start">
        <SidebarTrigger className="ml-1 mt-3" />

        <main className="flex-1 px-1 pt-2">{children}</main>
      </div>
    </div>
  </div>
</SidebarProvider>
  );
}
