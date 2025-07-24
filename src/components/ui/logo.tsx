import { cn } from "@/lib/utils"
import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "icon" | "full"
}

export function Logo({ className, size = "md", variant = "icon" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const fullSizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto"
  }

  if (variant === "full") {
    return (
      <div className={cn("flex items-center", className)}>
        <Image
          src="/kfm-scada-logo-simple.svg"
          alt="KFM·Scada Industrial Control"
          width={200}
          height={50}
          className={cn(fullSizeClasses[size])}
          priority
        />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src="/kfm-icon.svg"
        alt="KFM·Scada"
        width={48}
        height={48}
        className={cn(sizeClasses[size])}
        priority
      />
    </div>
  )
} 