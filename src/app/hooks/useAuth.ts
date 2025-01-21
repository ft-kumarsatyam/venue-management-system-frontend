"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LOGIN_URL = process.env.NODE_ENV === 'development'
  ? 'localhost:3000'
  : 'https://staging-admin.khelouk.in';

// const LOGIN_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://staging-admin.khelouk.in/admin-login";

const TOKEN_KEY =
  process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME || "cluster_management_token";

const CROSS_MODULE_TOKENS = [
  "access_token_admin",
  "access_token", 
  TOKEN_KEY, 
  "login_Details", 
  `${TOKEN_KEY}_timestamp`,
  "access_token_admin_timestamp"
];

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const clearAllTokens = () => {
    CROSS_MODULE_TOKENS.forEach(tokenKey => {
      localStorage.removeItem(tokenKey);
    });
    
    const envTokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME;
    if (envTokenKey && envTokenKey !== TOKEN_KEY) {
      localStorage.removeItem(envTokenKey);
      localStorage.removeItem(`${envTokenKey}_timestamp`);
    }
    
    console.log("All cross-module tokens cleared");
  };

  const redirectToLogin = () => {
    clearAllTokens();
    console.log("Redirecting to login due to authentication failure");
    
    // Use ForceLogout component approach
    setTimeout(() => {
      window.location.href = LOGIN_URL;
    }, 100);
  };

  const forceLogout = () => {
    clearAllTokens();
    
    // Dispatch force logout events
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

    console.log("Force logout initiated - all modules affected");
    
    // Navigate to ForceLogout component or directly to login
    router.push('/force-logout');
  };

  const checkTokenValidity = (): boolean => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        console.log("No token found");
        return false;
      }

      if (token.trim() === "") {
        console.log("Empty token found");
        return false;
      }

      const tokenTimestamp = localStorage.getItem(`${TOKEN_KEY}_timestamp`);
      if (tokenTimestamp) {
        const tokenAge = Date.now() - parseInt(tokenTimestamp);
        const maxAge = 24 * 60 * 60 * 1000;

        if (tokenAge > maxAge) {
          console.log("Token expired due to age");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  const logout = () => {
    // Use force logout for comprehensive cleanup
    forceLogout();
  };

  useEffect(() => {
    const validateAuth = () => {
      const isValid = checkTokenValidity();

      if (!isValid) {
        setIsAuthenticated(false);
        setIsLoading(false);
        redirectToLogin();
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    validateAuth();

    const interval = setInterval(() => {
      console.log("Performing periodic token validation");
      validateAuth();
    }, 5 * 60 * 1000);

    const handleStorageChange = (e: StorageEvent) => {
      // Handle logout from current module
      if (e.key === TOKEN_KEY && !e.newValue) {
        console.log("Token removed in another tab");
        forceLogout();
      }
      
      // Handle cross-module logout signal
      if (e.key === 'cross_module_logout') {
        console.log("Cross-module logout detected");
        clearAllTokens();
        setIsAuthenticated(false);
        router.push('/force-logout');
      }
      
      // Handle force logout signal
      if (e.key === 'force_logout_triggered') {
        console.log("Force logout detected from another module");
        clearAllTokens();
        setIsAuthenticated(false);
        router.push('/force-logout');
      }
      
      // Handle UK Admin module logout
      if (e.key === 'access_token_admin' && !e.newValue) {
        console.log("UK Admin module logout detected");
        forceLogout();
      }

      // Handle VMS module logout
      if (e.key === 'access_token' && !e.newValue) {
        console.log("VMS module logout detected");
        forceLogout();
      }
    };

    const handleFocus = () => {
      console.log("Tab focused, revalidating token");
      
      // Check if tokens were cleared while tab was not focused
      const hasValidTokens = CROSS_MODULE_TOKENS.some(token => 
        localStorage.getItem(token) !== null
      );
      
      if (!hasValidTokens) {
        console.log("No valid tokens found on focus, forcing logout");
        forceLogout();
      } else {
        validateAuth();
      }
    };

    const handleBeforeUnload = () => {
      // Optional: Clean up on page unload
      console.log("Page unloading, performing cleanup");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    logout,
    forceLogout, // Expose force logout
    checkTokenValidity,
    redirectToLogin,
    clearAllTokens,
  };
};


// const LOGIN_URL = process.env.NODE_ENV === 'development'
//   ? 'localhost:3000'
//   : 'https://staging-admin.khelouk.in';

// const LOGIN_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://staging-admin.khelouk.in/admin-login";
