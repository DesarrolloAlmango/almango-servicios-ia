
import { cn } from "@/lib/utils"
import { Loader, LoaderCircle } from "lucide-react"

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
    <div className="flex items-center gap-2">
      <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
      <Skeleton
        className={cn("h-5 w-16 bg-gray-200 rounded", className)}
        {...props}
      />
    </div>
  )
}

// Skeleton con icono de carga sin texto
function TextSkeleton({
  className,
  text,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 font-sans">
      <div className="relative">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

// Skeleton animado para categorías y productos (sin texto)
function CategorySkeleton({
  className,
  text,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 font-sans">
      <div className="relative">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, PriceSkeleton, TextSkeleton, CategorySkeleton }
