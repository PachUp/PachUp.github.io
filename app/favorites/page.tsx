"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Headphones, Music, Play, MapPin, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Define the types of items that can be favorited
type FavoriteItemType = "event" | "place"

// Define the structure for a favorite item
interface FavoriteItem {
  id: string
  type: FavoriteItemType
  name: string
  category: {
    name: string
    icon: React.ReactNode
    color: string
  }
  image: string
  date?: string
  time?: string
  isFavorite: boolean
}

// Filter tabs
const filterTabs = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "places", label: "Places" },
]

export default function FavoritesPage() {
  // State for active filter tab
  const [activeFilter, setActiveFilter] = useState("all")

  // State for favorite items
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  // State for filtered items based on active tab
  const [filteredItems, setFilteredItems] = useState<FavoriteItem[]>([])

  // Generate mock favorite items
  useEffect(() => {
    const mockFavorites: FavoriteItem[] = [
      {
        id: "event-1",
        type: "event",
        name: "Techno Party",
        category: {
          name: "Techno",
          icon: <Headphones className="h-3.5 w-3.5" />,
          color: "#ff3366",
        },
        image: "/red-techno-beat.png",
        date: "Apr 19",
        time: "11:00 PM",
        isFavorite: true,
      },
      {
        id: "event-2",
        type: "event",
        name: "Sunset Vibes",
        category: {
          name: "Chill",
          icon: <Music className="h-3.5 w-3.5" />,
          color: "#9966ff",
        },
        image: "/twilight-grooves.png",
        date: "May 5",
        time: "6:00 PM",
        isFavorite: true,
      },
      {
        id: "event-3",
        type: "event",
        name: "House Bash",
        category: {
          name: "House",
          icon: <Play className="h-3.5 w-3.5" />,
          color: "#6633ff",
        },
        image: "/purple-house-groove.png",
        date: "Apr 24",
        time: "10:00 PM",
        isFavorite: true,
      },
      {
        id: "place-1",
        type: "place",
        name: "The Underground",
        category: {
          name: "Place",
          icon: <MapPin className="h-3.5 w-3.5" />,
          color: "#33ccff",
        },
        image: "/subterranean-beats.png",
        isFavorite: true,
      },
      {
        id: "event-4",
        type: "event",
        name: "Pop Night",
        category: {
          name: "Pop",
          icon: <Sparkles className="h-3.5 w-3.5" />,
          color: "#ff66cc",
        },
        image: "/purple-pop-groove.png",
        date: "Apr 30",
        time: "9:00 PM",
        isFavorite: true,
      },
      {
        id: "place-2",
        type: "place",
        name: "Club Quantum",
        category: {
          name: "Place",
          icon: <MapPin className="h-3.5 w-3.5" />,
          color: "#33ccff",
        },
        image: "/placeholder.svg?height=400&width=600&query=futuristic+nightclub+with+laser+lights",
        isFavorite: true,
      },
    ]

    setFavorites(mockFavorites)
  }, [])

  // Filter items based on active tab
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredItems(favorites)
    } else if (activeFilter === "events") {
      setFilteredItems(favorites.filter((item) => item.type === "event"))
    } else if (activeFilter === "places") {
      setFilteredItems(favorites.filter((item) => item.type === "place"))
    }
  }, [activeFilter, favorites])

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
        .filter((item) => item.isFavorite),
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-6">
      {/* Background dots/stars */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500 opacity-20"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `pulse ${Math.random() * 4 + 3}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
        {[...Array(15)].map((_, i) => (
          <div
            key={i + "red"}
            className="absolute rounded-full bg-red-500 opacity-20"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `pulse ${Math.random() * 4 + 3}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Filter tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-3 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-lg font-semibold transition-all duration-300",
                  activeFilter === tab.id ? "text-white" : "text-purple-300 hover:text-white",
                )}
              >
                {/* Background for active tab */}
                {activeFilter === tab.id && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-800/80 to-pink-700/80 shadow-[0_0_15px_rgba(219,39,119,0.5)]"
                    initial={false}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorites grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e]/80 to-[#16213e]/80 border border-white/10 shadow-lg"
              >
                {/* Card content */}
                <Link href={`/${item.type}/${item.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a]/90 via-transparent to-transparent"></div>

                    {/* Category pill */}
                    <div
                      className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm"
                      style={{
                        backgroundColor: `${item.category.color}40`,
                        boxShadow: `0 0 10px ${item.category.color}50`,
                        border: `1px solid ${item.category.color}60`,
                      }}
                    >
                      <span className="filter-emoji text-white">{item.category.icon}</span>
                      <span className="text-white font-medium">{item.category.name}</span>
                    </div>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(item.id)
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full"
                    >
                      <Heart className="w-6 h-6 fill-pink-500 text-pink-500 filter drop-shadow-[0_0_5px_rgba(236,72,153,0.8)] transition-transform duration-300 hover:scale-110" />
                    </button>
                  </div>

                  {/* Event/Place details */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-gray-300">
                      {item.type === "event" && item.date && item.time ? `${item.date}, ${item.time}` : "Place"}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold mb-2">No favorites found</h3>
            <p className="text-white/60 max-w-md">
              You haven't added any {activeFilter !== "all" ? activeFilter : "items"} to your favorites yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
