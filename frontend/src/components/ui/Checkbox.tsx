import * as React from "react"
import clsx from "clsx"

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ className, label, ...props }, ref) => {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className={clsx(
          "mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500",
          className
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-slate-700">
          {label}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = "Checkbox"
