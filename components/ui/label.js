import { cn } from "../../lib/utils.js"

export function Label({ 
  className, 
  children,
  ...props 
}) {
  return `
    <label 
      class="${cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    >
      ${children}
    </label>
  `
}
