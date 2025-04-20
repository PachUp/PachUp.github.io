"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Disc3, Waves, Radio, Mic2, Music4 } from "lucide-react"
import { motion } from "framer-motion"

interface GenreFilterProps {
  onGenreChange?: (genres: string[]) => void
  selectedGenres?: string[]
}

// Define genres with their specific colors
const genres = [
  {
    id: "techno",
    label: "Techno",
    icon: <Disc3 className="h-4.1 w-4" />,
    color: "#3b82f6", // blue
  },
  {
    id: "trance",
    label: "Trance",
    icon: <Waves className="h-4.1 w-4" />,
    color: "#8b5cf6", // purple
  },
  {
    id: "mainstream",
    label: "Mainstream",
    icon: <Radio className="h-4.1 w-4" />,
    color: "#ec4899", // pink
  },
  {
    id: "hiphop",
    label: "Hip Hop",
    icon: <Mic2 className="h-4.1 w-4" />,
    color: "#f43f5e", // rose
  },
  {
    id: "house",
    label: "House",
    icon: <Music4 className="h-4.1 w-4" />,
    color: "#10b981", // emerald
  },
]

export default function GenreFilter({ onGenreChange, selectedGenres = [] }: GenreFilterProps) {
  const [activeGenres, setActiveGenres] = useState<string[]>(selectedGenres)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Update active genres when selectedGenres prop changes
  useEffect(() => {
    setActiveGenres(selectedGenres)
  }, [selectedGenres])

  // Center the scroll container on mount and when window resizes
  useEffect(() => {
    const centerScrollContainer = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const totalWidth = container.scrollWidth
        const visibleWidth = container.clientWidth

        // Only center if content is wider than container
        if (totalWidth > visibleWidth) {
          // Center the scroll position
          container.scrollLeft = (totalWidth - visibleWidth) / 2
        }
      }
    }

    // Center on mount
    centerScrollContainer()

    // Center on window resize
    window.addEventListener("resize", centerScrollContainer)
    return () => window.removeEventListener("resize", centerScrollContainer)
  }, [])

  const handleGenreClick = (genreId: string) => {
    // Toggle the genre in the activeGenres array
    const newActiveGenres = activeGenres.includes(genreId)
      ? activeGenres.filter((id) => id !== genreId)
      : [...activeGenres, genreId]

    setActiveGenres(newActiveGenres)

    if (onGenreChange) {
      onGenreChange(newActiveGenres)
    }
  }

  return (
    <div className="w-full flex justify-center">
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide max-w-full">
        <div className="flex space-x-2 px-1 py-1 min-w-max">
          {genres.map((genre) => {
            // Create color variables for each button
            const baseColor = genre.color
            const isActive = activeGenres.includes(genre.id)

            return (
              <motion.button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "quick-filter px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                  isActive
                    ? "text-white shadow-lg"
                    : "bg-black/60 border border-white/10 text-white/90 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]",
                )}
                style={
                  {
                    background: isActive ? `linear-gradient(to right, ${baseColor}70, ${baseColor}70)` : undefined,
                    boxShadow: isActive ? `0 0 15px ${baseColor}50` : undefined,
                    borderColor: isActive ? "transparent" : undefined,
                    // Add hover styles using CSS custom properties
                    "--hover-color-from": `${baseColor}40`,
                    "--hover-color-to": `${baseColor}40`,
                    "--active-color-from": `${baseColor}70`,
                    "--active-color-to": `${baseColor}70`,
                  } as React.CSSProperties
                }
              >
                <span className="filter-emoji text-white">{genre.icon}</span>
                <span className="font-semibold tracking-wide">{genre.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
