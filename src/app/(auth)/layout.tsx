import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Venue Management System | Auth ",
  description: "",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
