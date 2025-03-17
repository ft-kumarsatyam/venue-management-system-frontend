"use client";

import { Building, ClipboardList, Search, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BiSolidGrid } from "react-icons/bi";
import { Button } from "../../components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "../../components/ui/sidebar";
import { VersionSwitcher } from "./VersionSwitcher";
import "../main.css";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const data = {
  versions: ["ukadmin@gmail.com"],
};

const PAY_AND_PLAY_URL = process.env.NEXT_PUBLIC_PAY_AND_PLAY_URL || "https://default-url.com";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [payAndPlayFullUrl, setPayAndPlayFullUrl] = useState(PAY_AND_PLAY_URL);

  // Function to get the latest access token from any available source
  const getAccessToken = useCallback(() => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME || "cluster_management_token")
    );
  }, []);

  // Function to construct the Pay and Play URL with the token
  const buildPayAndPlayUrl = useCallback((baseUrl: string, token: string | null) => {
    if (!token) return baseUrl;

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}access_token=${token}`;
  }, []);

  // Update Pay and Play URL with token when component mounts
  useEffect(() => {
    const accessToken = getAccessToken();
    const fullUrl = buildPayAndPlayUrl(PAY_AND_PLAY_URL, accessToken);
    setPayAndPlayFullUrl(fullUrl);

    // Add an event listener to update the URL if the token changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === (process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME || "cluster_management_token")) {
        const newToken = getAccessToken();
        const newUrl = buildPayAndPlayUrl(PAY_AND_PLAY_URL, newToken);
        setPayAndPlayFullUrl(newUrl);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getAccessToken, buildPayAndPlayUrl]);

  // Handle Pay and Play navigation with token
  const handlePayAndPlayClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Always get the latest token when clicking
    const accessToken = getAccessToken();
    const fullUrl = buildPayAndPlayUrl(PAY_AND_PLAY_URL, accessToken);

    // Open in new tab
    window.open(fullUrl, '_blank', 'noopener,noreferrer');

    // Close mobile sidebar if open
    setOpenMobile(false);
  };

  // Define menu items with special handling for Pay and Play
  const menuItems = [
    { title: "Dashboard", url: "/", icon: Building, isExternal: false },
    { title: "Clusters", url: "/cluster", icon: Building, isExternal: false },
    { title: "Venues", url: "/venues", icon: Building, isExternal: false },
    { title: "Module Users", url: "/module-user", icon: Users, isExternal: false },
    { title: "Pay and Play", url: payAndPlayFullUrl, icon: ClipboardList, isExternal: true, onClick: handlePayAndPlayClick },
  ];

  // Navigate to module users management
  const handleManageModuleUsersClick = () => {
    router.push("/module-user");
    setOpenMobile(false);
  };

  return (
    <div className="">
      <Sidebar className="max-w-[300px]">
        <SidebarHeader className="h-auto p-0"></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="p-4">
              <div className="flex items-center gap-2 justify-center w-full mt-5">
                {/* <div>
                  <BiSolidGrid size={30} />
                </div> */}
                <Image
                  onClick={() => {
                    router.push("/");
                    setOpenMobile(false);
                  }}
                  src="/assets/UK_LOGO.png"
                  alt="UK-Logo"
                  width={50}
                  height={50}
                  className="cursor-pointer"
                />
              </div>
            </SidebarGroupLabel>
            <div className="p-3 mb-4">
              <VersionSwitcher
                versions={data.versions}
                defaultVersion={data.versions[0]}
                name="Venue Management"
              />
            </div>
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-[#3f3f46b2] mb-2">
                Platform
              </h3>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = pathname === item.url;

                  const linkContent = (
                    <div
                      className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${isActive
                          ? "text-[var(--purple-light)] font-semibold bg-[var(--white)]"
                          : "text-[#3F3F46] hover:text-[#7a3bf5]"
                        }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive
                            ? "text-[var(--purple-light)]"
                            : "text-[#3f3f46b2] hover:text-[var(--purple-light)]"
                          }`}
                      />
                      <span>{item.title}</span>
                    </div>
                  );

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="py-5 hover:text-[var(--purple-light)]">
                        {item.isExternal ? (
                          <a
                            href={item.url}
                            onClick={item.onClick || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {linkContent}
                          </a>
                        ) : (
                          <Link href={item.url} onClick={() => setOpenMobile(false)}>
                            {linkContent}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <VersionSwitcher
            versions={data.versions}
            defaultVersion={data.versions[0]}
            name="Admin"
          />

          {/* Module Users Card */}
          <div className="mt-4 module">
            {/* Card */}
            <div className="rounded-xl p-6 bg-gradient-to-b from-[#7942d1] to-[#2a1647] text-[var(--white)] shadow-lg">
              <div className="icon left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-md">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-4">
                Manage Module Users
              </h3>
              <Button
                variant="secondary"
                className="w-full bg-white text-purple-900 hover:bg-gray-100 rounded-lg"
                onClick={handleManageModuleUsersClick}
              >
                Manage
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}