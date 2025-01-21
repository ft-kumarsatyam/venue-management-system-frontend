import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  return (
    <div className={`flex items-center text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2 text-[#515151] font-[poppins] font-normal text-[20px] leading-[24px]">&gt;</span>}
          {item.href && !item.active ? (
            <Link href={item.href} className="py-2 font-[Poppins] text-[14px] leading-[100%] tracking-[5%] text-[#A0AEC0]">
              {item.label}
            </Link>
          ) : (
            <span className={item.active ? "text-[#515151] font-[poppins] font-normal text-[14px] leading-[24px] tracking-[0%] text-center align-middle" : "text-gray-500"}>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}

