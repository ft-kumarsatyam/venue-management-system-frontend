"use client";

import { useState } from "react";
import { User, Settings } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useAuth } from "../AuthGuard/AuthGuard";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { forceLogout } = useAuth(); 
  const router = useRouter();

  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    console.log("Initiating logout from VMS navbar...");
    
    setDropdownOpen(false);
    
    const tokensToRemove = [
      "access_token_admin", 
      "access_token", 
      "cluster_management_token", 
      "login_Details", // Login detail
      "cluster_management_token_timestamp", // VMS timestamp
      "access_token_admin_timestamp", // UK Admin timestamp
    ];

    tokensToRemove.forEach(token => {
      localStorage.removeItem(token);
    });

    // Clear environment-specific tokens
    const envTokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME;
    if (envTokenKey) {
      localStorage.removeItem(envTokenKey);
      localStorage.removeItem(`${envTokenKey}_timestamp`);
    }

    // Dispatch storage events to notify other modules
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cross_module_logout',
      newValue: Date.now().toString(),
      storageArea: localStorage
    }));

    window.dispatchEvent(new StorageEvent('storage', {
      key: 'force_logout_triggered',
      newValue: 'true',
      storageArea: localStorage
    }));

    console.log("All tokens cleared, redirecting to admin login...");
    
    // Direct redirect to the specific admin login URL
    window.location.href = 'https://staging-admin.khelouk.in/admin-login';
  };

  const handleBackToDashboard = () => {
    const dashboardUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_DEFAULT_BASE_URL ||
      "/";
    window.location.href = dashboardUrl;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center px-4 bg-[var(--background)]">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden items-center gap-2 md:flex"></div>
        <nav className="hidden items-center gap-10 md:flex">
          <button
            onClick={handleBackToDashboard}
            style={{
              background: "linear-gradient(to right, #8A2BE2, #4B0082)",
              color: "#fff",
              padding: "8px 20px",
              border: "none",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: "300",
              cursor: "pointer",
              outline: "none",
              transition: "background 0.3s ease",
            }}
          >
            Back To Dashboard
          </button>
        </nav>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Profile Icon with Dropdown */}
        <div className="relative">
          <div
            onClick={handleProfileClick}
            className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-600" />
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
              <ul className="p-2">
                <li
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer rounded transition-colors duration-200"
                >
                  Logout from All Modules
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}