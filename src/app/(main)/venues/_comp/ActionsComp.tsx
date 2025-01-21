import { Button } from "../../../../components/ui/button";
import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionCompProp {
  icon?: LucideIcon;
  title?: string;
  navigate?: string;
  id: string | number;
  onClick?: (id: string | number) => void;
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
      size="lg"
      onClick={() => {
        if (navigate) {
          router.push(`${navigate}/${id}`);
        } else if (onClick) {
          onClick(id); 
        } else {
          alert(`${title} Clicked`);
        }
      }}
      className="bg-[linear-gradient(to_right,#7942d1,#2a1647)] text-white cursor-pointer"
    >
      {Icon && <Icon size={16} className="mr-1" />}
      {title}
    </Button>
  );
}
