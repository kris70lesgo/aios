import NumberFlow from '@number-flow/react'
import * as RadixSlider from '@radix-ui/react-slider'
import clsx from 'clsx'

export default function Slider({ value, className, ...props }: RadixSlider.SliderProps) {
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
            value={value[0]}
            isolate
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-900"
          />
        )}
      </RadixSlider.Thumb>
    </RadixSlider.Root>
  )
}

export { Slider }
