"use client";

import { Button } from "../../components/ui/button";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionCompProp {
  icon: LucideIcon | undefined;
  title: string | undefined;
  navigate?: string;
  id: string;
  onClick: ((id: string) => void) | ((id: string) => () => void) | undefined;
}

export default function ActionsComp({
  icon: Icon,
  title,
  id,
  navigate,
  onClick,
}: ActionCompProp) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={
        navigate
          ? () => router.push(`${navigate}/${id}`)
          : () => {
              if (typeof onClick === "function") {
                const result = onClick(id);
                if (typeof result === "function") {
                  result();
                }
              }
            }
      }
      className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-[var(--white)] h-11 w-11 cursor-pointer"
    >
      {Icon && <Icon size={16} />}
    </Button>
  );
}
