import { cn } from "../../../../../lib/utils";

interface TagProps {
  label: string;
  color: string;
}

export function Tag({ label, color }: TagProps) {
  const colorClasses = {
    yellow: "bg-yellow-100 text-yellow-800",
    orange: "bg-orange-100 text-orange-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium",
        colorClasses[color as keyof typeof colorClasses]
      )}
    >
      {label}
    </span>
  );
}
