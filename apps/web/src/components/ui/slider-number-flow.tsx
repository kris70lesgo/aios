import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'
import clsx from 'clsx'
import { useSpring, useMotionValueEvent } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Slider({ value, className, ...props }: RadixSlider.SliderProps) {
  const target = value?.[0] ?? 0
  const spring = useSpring(target, { stiffness: 180, damping: 20, mass: 0.4 })
  const [display, setDisplay] = useState(target)

  useEffect(() => {
    spring.set(target)
  }, [target, spring])

  useMotionValueEvent(spring, 'change', (v) => {
    setDisplay(Math.round(v * 10) / 10)
  })

  return (
    <RadixSlider.Root
      {...props}
      value={value}
      className={clsx(className, 'relative flex h-5 w-full touch-none select-none items-center')}
    >
      <RadixSlider.Track className="relative h-[3px] grow rounded-full bg-zinc-200">
        <RadixSlider.Range className="absolute h-full rounded-full bg-zinc-900" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="relative block h-5 w-5 rounded-[1rem] bg-white shadow-md ring ring-black/10 focus:outline-none"
        aria-label="Value"
      >
        {value?.[0] != null && (
          <NumberFlow
            willChange
            value={display}
            isolate
            format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-900"
          />
        )}
      </RadixSlider.Thumb>
    </RadixSlider.Root>
  )
}

export { Slider }
