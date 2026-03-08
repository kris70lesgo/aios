"use client"

import * as React from "react"
import { useId } from "react"
import { cn } from "@/lib/utils"

interface InputWithFloatingLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  containerClassName?: string
}

const InputWithFloatingLabel = ({
  label,
  containerClassName,
  className,
  id: externalId,
  ...props
}: InputWithFloatingLabelProps) => {
  const generatedId = useId()
  const id = externalId ?? generatedId

  return (
    <div className={cn("group relative w-full", containerClassName)}>
      <label
        htmlFor={id}
        className="origin-start text-muted-foreground/70 group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground absolute top-1/2 -translate-y-1/2 cursor-text px-2 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:-translate-y-1/2 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium"
      >
        <span className="bg-background inline-flex px-1">{label}</span>
      </label>
      <input
        id={id}
        placeholder=" "
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 pt-4 pb-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={undefined}
        {...props}
      />
    </div>
  )
}

export default InputWithFloatingLabel
