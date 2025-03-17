// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect } from "react";

// export const QueryReader = () => {
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     const params: Record<string, string> = {};
//     for (const [key, value] of searchParams.entries()) {
//       params[key] = value;
//     }
//     console.log(params.access_token)
//     if (params.access_token) {
//       localStorage.setItem("access_token", params.access_token);
//     }
//   }, [searchParams]);

//   return null; 
// };


"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_NAME || "cluster_management_token";

export const QueryReader = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    console.log("Access token received:", params.access_token ? "Yes" : "No");
    
    if (params.access_token) {
      try {
        localStorage.setItem("access_token", params.access_token);
        localStorage.setItem(TOKEN_KEY, params.access_token);
        localStorage.setItem(`${TOKEN_KEY}_timestamp`, Date.now().toString());
        console.log("Tokens stored successfully, redirecting to dashboard");
        router.replace("/");
      } catch (error) {
        console.error("Error storing tokens:", error);
      }
    }
  }, [searchParams, router]);
  return null; 
};