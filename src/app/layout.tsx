// "use client";

import ReduxProvider from "../providers/ReduxProvider";
import { Metadata } from "next";
import React, { Suspense } from "react";
import "./globals.css";
import { QueryReader } from "../components/QueryReader/QueryReader";
import { AuthGuard } from "../components/AuthGuard/AuthGuard";

export const metadata: Metadata = {
  title: "Khelo Tech: Venue Management System",
  description: "Venue and zone management system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <ReduxProvider>
        <body>
          <Suspense fallback={<div>Loading...</div>}>
            <QueryReader />
            <AuthGuard>
              {children}
            </AuthGuard>
          </Suspense>
        </body>
      </ReduxProvider>
    </html>
  );
}