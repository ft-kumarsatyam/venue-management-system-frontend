import Image from "next/image";
import { cn } from "../../../../../lib/utils";

interface ImageComponentProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function ImageComponent({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: ImageComponentProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}
