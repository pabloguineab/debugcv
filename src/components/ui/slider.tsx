"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: SliderPrimitive.Root.Props) {
  // Ensure we always have an array of values for the thumbs
  const _values = React.useMemo(() => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof value === 'number') return [value];
    if (typeof defaultValue === 'number') return [defaultValue];
    return [min];
  }, [value, defaultValue, min]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn("relative flex w-full touch-none select-none items-center h-5 group/slider", className)}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center h-full">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-neutral-200 rounded-full h-1 w-full relative grow overflow-hidden"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-blue-600 h-full absolute rounded-full"
          />
        </SliderPrimitive.Track>
        {_values.map((_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="size-5 rounded-full border-2 border-blue-600 bg-white shadow-sm hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-600/10 block shrink-0 cursor-grab active:cursor-grabbing absolute top-1/2 -translate-y-1/2 z-50 transition-transform"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root >
  )
}

export { Slider }
