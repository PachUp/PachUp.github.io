"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface FavoriteEvent {
  id: string
  name: string
  day: string
  image: string
}

interface FavoritesPreviewProps {
  isOpen: boolean
  onClose: () => void
  favoritesBtnRect: DOMRect | null
}

export default function FavoritesPreview({ isOpen, onClose, favoritesBtnRect }: FavoritesPreviewProps) {
  const router = useRouter()
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([])
  const popupRef = useRef<HTMLDivElement>(null)

  // Mock data for favorite events
  useEffect(() => {
    // In a real app, this would fetch from an API or local storage
    setFavoriteEvents([
      {
        id: "event-1",
        name: "Beach Party",
        day: "Fri",
        image: "/tropical-sunset-groove.png",
      },
      {
        id: "event-2",
        name: "Underground Club",
        day: "Sat",
        image: "/blue-night-pulse.png",
      },
      {
        id: "event-3",
        name: "Rooftop Drinks",
        day: "Sat",
        image: "/city-lights-twilight.png",
      },
    ])
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleViewAll = () => {
    router.push("/favorites")
    onClose()
  }

  if (!favoritesBtnRect || !isOpen) return null

  // Calculate position based on the Favorites button's position
  const popupLeft = favoritesBtnRect.left + favoritesBtnRect.width / 2
  const popupBottom = window.innerHeight - favoritesBtnRect.top + 10 // 10px gap between popup and button

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${popupLeft}px`,
          bottom: `${popupBottom}px`,
          transform: "translateX(-50%)",
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-72 rounded-3xl bg-black/80 backdrop-blur-md border border-white/10 overflow-visible shadow-[0_0_25px_rgba(0,0,0,0.5)]"
              >
                {/* Popup content */}
                <div className="p-4 space-y-4">
                  {/* Favorite events list */}
                  <div className="space-y-3">
                    {favoriteEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-3 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-white/10 shadow-lg">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-lg leading-tight">{event.name}</h3>
                          <p className="text-white/60 text-sm">{event.day}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced View all button */}
                <div className="px-4 pb-4 pt-2">
                  <button
                    onClick={handleViewAll}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 
                    bg-gradient-to-r from-amber-500/30 to-amber-400/30 hover:from-amber-500/50 hover:to-amber-400/50
                    border border-amber-500/30 hover:border-amber-400/50 text-white
                    shadow-[0_0_10px_rgba(251,191,36,0.2)] hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                  >
                    <span className="font-semibold tracking-wide">View All Favorites</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>

              {/* Arrow pointing to the Favorites icon */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-6 h-6 mx-auto mt-[-3px]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: "rgba(0, 0, 0, 0.8)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
