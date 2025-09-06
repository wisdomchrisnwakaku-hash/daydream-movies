import { cn } from "../../lib/utils.js"

export function Slider({ 
  className, 
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  ...props 
}) {
  return `
    <input 
      type="range"
      min="${min}"
      max="${max}"
      step="${step}"
      value="${value}"
      class="${cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700",
        className
      )}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    />
  `
}
