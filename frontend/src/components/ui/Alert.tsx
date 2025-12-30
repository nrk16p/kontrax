import * as React from "react"
import clsx from "clsx"

export function Alert({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        "relative w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-900",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AlertTitle({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <h5 className="mb-1 font-medium leading-none tracking-tight">
      {children}
    </h5>
  )
}

export function AlertDescription({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-sm text-slate-600 leading-relaxed">
      {children}
    </div>
  )
}
