"use client"

import { useEffect, useState } from "react"
import { X, ZoomIn, ArrowLeft, Download, ChevronRight } from "lucide-react"

interface ImageModalProps {
  src: string
  title: string
  onClose: () => void
  onNext: () => void
}

export function ImageModal({ src, title, onClose, onNext }: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleNext = () => {
    setIsVisible(false)
    setTimeout(() => {
      onNext()
      setIsVisible(true)
    }, 300)
  }

  const handleZoom = () => {
    setIsZoomed(true)
  }

  const handleZoomOut = () => {
    setIsZoomed(false)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = `rathbone-${title.toLowerCase().replace(/\s+/g, "-")}.png`
    link.click()
  }

  if (isZoomed) {
    // Fullscreen zoom mode
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <img
          src={src || "/placeholder.svg"}
          alt={title}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: "drop-shadow(0 0 30px rgba(0, 255, 65, 0.5))",
          }}
        />

        {/* Return button */}
        <button
          onClick={handleZoomOut}
          className="absolute top-4 right-4 p-3 bg-black bg-opacity-80 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 rounded font-mono text-sm"
          style={{ textShadow: "0 0 10px currentColor" }}
        >
          <ArrowLeft size={20} />
          <span className="ml-2 hidden sm:inline">RETURN</span>
        </button>

        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.3) 2px, rgba(0, 255, 65, 0.3) 4px)",
            }}
          />
        </div>
      </div>
    )
  }

  // Normal modal mode
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={`relative bg-gray-900 border-2 border-green-400 rounded-lg p-4 md:p-6 transform transition-all duration-300 w-full max-w-4xl max-h-[90vh] overflow-hidden ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        style={{
          boxShadow: "0 0 30px rgba(0, 255, 65, 0.5), inset 0 0 30px rgba(0, 255, 65, 0.1)",
          background: "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 40, 0, 0.95) 100%)",
        }}
      >
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 rounded-lg overflow-hidden">
          <div
            className="w-full h-full bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)",
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-lg md:text-2xl font-mono font-bold text-green-400 glitch-text truncate pr-4">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 text-green-400 hover:text-red-400 transition-colors border border-green-400 hover:border-red-400 rounded flex-shrink-0"
            style={{ textShadow: "0 0 10px currentColor" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Container - Strictly bounded */}
        <div className="relative mb-4 flex items-center justify-center" style={{ height: "calc(90vh - 200px)" }}>
          <img
            src={src || "/placeholder.svg"}
            alt={title}
            className="max-w-full max-h-full object-contain cursor-pointer border border-green-400 rounded"
            onClick={handleZoom}
            style={{
              filter: "drop-shadow(0 0 20px rgba(0, 255, 65, 0.3))",
              imageRendering: "pixelated",
            }}
          />

          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-green-400 via-transparent to-blue-400 opacity-10 pointer-events-none rounded" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-3">
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <button
              onClick={handleZoom}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-transparent border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 rounded font-mono text-xs md:text-sm"
              style={{ textShadow: "0 0 10px currentColor" }}
            >
              <ZoomIn size={14} />
              <span className="hidden sm:inline">FULLSCREEN</span>
              <span className="sm:hidden">ZOOM</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transition-all duration-200 rounded font-mono text-xs md:text-sm"
              style={{ textShadow: "0 0 10px currentColor" }}
            >
              <Download size={14} />
              <span className="hidden sm:inline">DOWNLOAD</span>
              <span className="sm:hidden">DL</span>
            </button>
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200 rounded font-mono text-xs md:text-sm"
            style={{ textShadow: "0 0 10px currentColor" }}
          >
            <span className="hidden sm:inline">NEXT SHRINE</span>
            <span className="sm:hidden">NEXT</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Terminal info */}
        <div className="mt-4 p-2 md:p-3 bg-black bg-opacity-50 border border-green-400 rounded font-mono text-xs text-green-400">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span>STATUS: RATHBONE_PROTOCOL_ACTIVE</span>
            <span>SECURITY: MAXIMUM</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mt-1">
            <span>ACCESS_LEVEL: DIVINE</span>
            <span>MODE: GALLERY_VIEW</span>
          </div>
        </div>
      </div>
    </div>
  )
}
