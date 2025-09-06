import { cn } from "../../lib/utils.js"

export function Card({ 
  className, 
  children,
  ...props 
}) {
  return `
    <div 
      class="${cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </div>
  `
}

export function CardHeader({ 
  className, 
  children,
  ...props 
}) {
  return `
    <div 
      class="${cn("flex flex-col space-y-1.5 p-6", className)}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </div>
  `
}

export function CardTitle({ 
  className, 
  children,
  ...props 
}) {
  return `
    <h3 
      class="${cn("text-2xl font-semibold leading-none tracking-tight", className)}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </h3>
  `
}

export function CardDescription({ 
  className, 
  children,
  ...props 
}) {
  return `
    <p 
      class="${cn("text-sm text-muted-foreground", className)}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </p>
  `
}

export function CardContent({ 
  className, 
  children,
  ...props 
}) {
  return `
    <div 
      class="${cn("p-6 pt-0", className)}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </div>
  `
}
