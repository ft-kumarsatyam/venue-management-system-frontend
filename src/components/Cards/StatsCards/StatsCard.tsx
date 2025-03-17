"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../../components/ui/card";

interface StatsCardProps {
  title: string;
  value: number | string;
  link?: string;
  lastMonthValue: number | string;
  icon?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  link,
  lastMonthValue,
  icon,
}: StatsCardProps) {
  const isClickable = !!link && link.trim() !== "";

  const handleClick = () => {
    if (isClickable && typeof window !== "undefined") {
      window.location.href = link!;
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`h-40 border-[var(--background)] bg-[var(--white)] rounded-[14px] padding-total-box border-gray-200 ${
        isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default"
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--black)] text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="font-bold text-[var(--black)] text-[32px] leading-[15px]">
          {value}
        </div>
        <p className="totalxs-size">
          <span className="text-[var(--success)] leading-[42px]">
            {lastMonthValue}
          </span>{" "}
          from last month
        </p>
      </CardContent>

      <CardFooter className="justify-between pt-0">{/* Optional footer */}</CardFooter>
    </Card>
  );
}
