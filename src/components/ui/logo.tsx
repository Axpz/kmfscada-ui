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
          src="/komifu-21.jpg"
          alt="KFM·Scada Industrial Control"
          width={148}
          height={148}
          className={cn(fullSizeClasses[size])}
          priority
        />
      </div>
    )
  }

  sizeClasses[size] = "h-124 w-124"

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src="/komifu-11.jpg"
        alt="KFM·Scada"
        width={124}
        height={124}
        className={cn(sizeClasses[size])}
        priority
      />
    </div>
  )
} 