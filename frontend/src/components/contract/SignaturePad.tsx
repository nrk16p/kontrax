import { useRef, useEffect, useState, useCallback } from "react"

interface Props {
  onChange: (sig: string | null) => void
}

export default function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing   = useRef(false)
  const [isEmpty, setIsEmpty] = useState(true)

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth   = 2
    ctx.lineCap     = "round"
    ctx.lineJoin    = "round"
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    const src    = "touches" in e ? e.touches[0] : e
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    drawing.current = true
    const ctx = getCtx()
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = getCtx()
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (isEmpty) {
      setIsEmpty(false)
      onChange(canvasRef.current!.toDataURL("image/png"))
    }
  }, [isEmpty, onChange])

  const endDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!drawing.current) return
    drawing.current = false
    const canvas = canvasRef.current
    if (canvas && !isEmpty) {
      onChange(canvas.toDataURL("image/png"))
    }
  }, [isEmpty, onChange])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={560}
          height={200}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {isEmpty && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none select-none">
            ลากเมาส์เพื่อลงลายเซ็น
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition"
      >
        ล้างลายเซ็น
      </button>
    </div>
  )
}
