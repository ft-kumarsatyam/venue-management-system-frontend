"use client";

import { useEffect } from 'react';
import { useRouter } from "next/navigation";

const ForceLogout = () => {
  const router = useRouter();

  useEffect(() => {
    const performForceLogout = () => {
      // Clear all cross-module tokens
      const tokensToRemove = [
        "access_token_admin", // UK Admin module token
        "access_token", // VMS module token
        "cluster_management_token", // VMS module token
        "login_Details", // Login details
        "cluster_management_token_timestamp", // VMS timestamp
        "access_token_admin_timestamp", // UK Admin timestamp
      ];

      // Remove all tokens
      tokensToRemove.forEach(token => {
        localStorage.removeItem(token);
      });

      // Clear any additional environment-specific tokens
      const envTokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME;
      if (envTokenKey) {
        localStorage.removeItem(envTokenKey);
        localStorage.removeItem(`${envTokenKey}_timestamp`);
      }

      console.log("Force logout: All cross-module tokens cleared");

      // Dispatch storage event to notify other modules/tabs about the logout
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cross_module_logout',
        newValue: Date.now().toString(),
        storageArea: localStorage
      }));

      // Additional dispatch for specific force logout event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'force_logout_triggered',
        newValue: 'true',
        storageArea: localStorage
      }));

      console.log("Force logout: Storage events dispatched");
    };

    // Perform logout operations
    performForceLogout();

    // Navigate to the specific admin login page
    const loginUrl = 'https://staging-admin.khelouk.in/admin-login';

    // Small delay to ensure storage events are processed
    setTimeout(() => {
      console.log("Redirecting to:", loginUrl);
      window.location.href = loginUrl;
    }, 1000);

  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Logging out...</h2>
        <p className="text-gray-600">Please wait while we log you out from all modules.</p>
      </div>
    </div>
  );
};

export default ForceLogout;