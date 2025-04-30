
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Skeleton para precios con ancho específico
function PriceSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton
      className={cn("h-5 w-16 bg-gray-200 rounded", className)}
      {...props}
    />
  )
}

// Skeleton con texto para mensajes de carga
function TextSkeleton({
  className,
  text,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Skeleton
        className={cn("h-12 w-12 rounded-full", className)}
        {...props}
      />
      {text && (
        <span className="text-sm text-gray-600 font-medium">{text}</span>
      )}
    </div>
  )
}

export { Skeleton, PriceSkeleton, TextSkeleton }
