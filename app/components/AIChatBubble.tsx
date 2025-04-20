"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Brain, Minimize2 } from "lucide-react"
import { motion } from "framer-motion"

interface AIChatBubbleProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: (minimized: boolean) => void
  isMinimized: boolean
}

export default function AIChatBubble({ isOpen, onClose, onMinimize, isMinimized }: AIChatBubbleProps) {
  // Get stored dimensions from localStorage or use defaults
  const getInitialDimensions = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aiChatDimensions")
      return stored ? JSON.parse(stored) : { width: 320, height: 450 }
    }
    return { width: 320, height: 450 }
  }

  const [dimensions, setDimensions] = useState(getInitialDimensions)
  const [position, setPosition] = useState({ x: 0, y: 0 }) // Position for top-left resizing
  const [isResizing, setIsResizing] = useState(false)
  const [resizeCorner, setResizeCorner] = useState<"topLeft" | "bottomRight" | null>(null)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const chatRef = useRef<HTMLDivElement>(null)
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 })

  // Store dimensions in localStorage when they change
  useEffect(() => {
    localStorage.setItem("aiChatDimensions", JSON.stringify(dimensions))
  }, [dimensions])

  // Handle resize start for bottom-right corner
  const handleBottomRightResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeCorner("bottomRight")
    setStartPosition({ x: e.clientX, y: e.clientY })
    if (chatRef.current) {
      resizeStartRef.current = {
        width: chatRef.current.offsetWidth,
        height: chatRef.current.offsetHeight,
        x: 0,
        y: 0,
      }
    }
  }

  // Handle resize start for top-left corner
  const handleTopLeftResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeCorner("topLeft")
    setStartPosition({ x: e.clientX, y: e.clientY })

    if (chatRef.current) {
      const rect = chatRef.current.getBoundingClientRect()
      resizeStartRef.current = {
        width: rect.width,
        height: rect.height,
        x: rect.left,
        y: rect.top,
      }
    }
  }

  // Handle resize move
  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startPosition.x
      const deltaY = e.clientY - startPosition.y

      if (resizeCorner === "bottomRight") {
        // Bottom-right resize: just change width and height
        const newWidth = Math.max(250, resizeStartRef.current.width + deltaX)
        const newHeight = Math.max(200, resizeStartRef.current.height + deltaY)
        setDimensions({ width: newWidth, height: newHeight })
      } else if (resizeCorner === "topLeft") {
        // Top-left resize: change width, height, and position
        const newWidth = Math.max(250, resizeStartRef.current.width - deltaX)
        const newHeight = Math.max(200, resizeStartRef.current.height - deltaY)

        // Calculate new position to keep bottom-right corner fixed
        const newX = resizeStartRef.current.x + deltaX
        const newY = resizeStartRef.current.y + deltaY

        setDimensions({ width: newWidth, height: newHeight })
        setPosition({ x: newX, y: newY })
      }
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      setResizeCorner(null)
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleResizeMove)
      window.addEventListener("mouseup", handleResizeEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleResizeMove)
      window.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [isResizing, startPosition, resizeCorner])

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    onMinimize(!isMinimized)
  }

  // Close the chat bubble
  const handleClose = () => {
    onClose()
    onMinimize(false)
  }

  if (!isOpen || isMinimized) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col ${isResizing ? "select-none" : ""}`}>
      <motion.div
        ref={chatRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col relative"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: resizeCorner === "topLeft" ? `translate(${position.x}px, ${position.y}px)` : undefined,
        }}
      >
        {/* Top-left resize handle */}
        <div className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50" onMouseDown={handleTopLeftResizeStart}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-1 left-1 opacity-50"
          >
            <path
              d="M2 2L6 6M2 2L10 2M2 2L2 10"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Chat header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-500/30 to-blue-500/30">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-300" />
            <h3 className="font-medium text-white">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleMinimize} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <Minimize2 className="h-4 w-4 text-white/80" />
            </button>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/80"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Chat content area - this would contain the actual chat UI */}
        <div className="flex-1 overflow-y-auto p-4 text-white/90 chat-content">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/50 to-blue-500/50 flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-sm">
                Hello! I'm your AI assistant. How can I help you discover events today?
              </div>
            </div>
          </div>
        </div>

        {/* Chat input area */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <button className="p-2 rounded-full bg-gradient-to-r from-purple-500/70 to-blue-500/70 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom-right resize handle */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
          onMouseDown={handleBottomRightResizeStart}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-1 right-1 opacity-50"
          >
            <path
              d="M14 14L10 10M14 14L6 14M14 14L14 6"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}
