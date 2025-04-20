"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Star, Compass, Search, Flame, Music, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import "./styles/search-bar.css"
import "./styles/scrollbar-hide.css"
import FavoritesPreview from "./components/FavoritesPreview"
import GenreFilter from "./components/GenreFilter"
import AIChatBubble from "./components/AIChatBubble"

// Use dynamic import with explicit ssr: false to ensure the Map component only loads on the client
const Map = dynamic(() => import("./components/Map"), {
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Loading map...</h3>
        <p>Please wait while we load the map data.</p>
      </div>
    </div>
  ),
  ssr: false,
})

// Update the categories array to remove the AI option
const categories = [
  {
    id: "favorites",
    label: "Favorites",
    icon: <Star className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />,
  },
  {
    id: "explore",
    label: "Explore",
    icon: <Compass className="h-6 w-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />,
  },
]

// Replace the quickFilters array with custom icons instead of emojis
const quickFilters = [
  { id: "today", label: "Today", icon: <Flame className="h-4 w-4 text-orange-400" /> },
  { id: "weekend", label: "Weekend", icon: <Music className="h-4 w-4 text-purple-400" /> },
]

// Helper function to check if a date is on a weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}

// Helper function to get the next weekend dates
const getNextWeekendDates = (): { start: Date; end: Date } => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 is Sunday, 6 is Saturday

  // Calculate days until next Saturday
  const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek
  // Calculate days until next Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek

  // If today is a weekend, use today's date
  const startDate = new Date(today)
  if (isWeekend(today)) {
    // If today is Sunday, start date is today
    if (dayOfWeek === 0) {
      startDate.setDate(today.getDate())
    }
    // If today is Saturday, start date is today
    else if (dayOfWeek === 6) {
      startDate.setDate(today.getDate())
    }
  } else {
    // Otherwise, set to next Saturday
    startDate.setDate(today.getDate() + daysUntilSaturday)
  }

  // End date is the next Sunday
  const endDate = new Date(today)
  if (dayOfWeek === 0) {
    // If today is Sunday, end date is today
    endDate.setDate(today.getDate())
  } else {
    // Otherwise, set to next Sunday
    endDate.setDate(today.getDate() + daysUntilSunday)
  }

  return { start: startDate, end: endDate }
}

export default function Home() {
  const router = useRouter()
  const [filters, setFilters] = useState({
    eventType: [] as string[],
    distance: 10,
    date: null as Date | null,
    dateRange: null as { start: Date; end: Date } | null,
    time: null as string | null,
    genres: [] as string[],
    timeFilter: null as "today" | "weekend" | null,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavoritesPreview, setShowFavoritesPreview] = useState(false)
  const [favoritesBtnRect, setFavoritesBtnRect] = useState<DOMRect | null>(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [isAIChatMinimized, setIsAIChatMinimized] = useState(false)
  const favoritesButtonRef = useRef<HTMLButtonElement>(null)
  const favoritesIconRef = useRef<HTMLDivElement>(null)

  // Update the favorites button position when it changes
  useEffect(() => {
    if (showFavoritesPreview && favoritesIconRef.current) {
      const rect = favoritesIconRef.current.getBoundingClientRect()
      setFavoritesBtnRect(rect)
    }
  }, [showFavoritesPreview])

  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showFavoritesPreview && favoritesIconRef.current) {
        const rect = favoritesIconRef.current.getBoundingClientRect()
        setFavoritesBtnRect(rect)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [showFavoritesPreview])

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "explore") {
      // Navigate to the explore page
      router.push("/explore")
    } else if (categoryId === "favorites") {
      // Toggle favorites preview
      if (favoritesIconRef.current) {
        const rect = favoritesIconRef.current.getBoundingClientRect()
        setFavoritesBtnRect(rect)
        setShowFavoritesPreview(!showFavoritesPreview)
      }
    } else {
      // Toggle the category selection for filtering
      setSelectedCategory(selectedCategory === categoryId ? null : categoryId)

      // Add animation class when selected
      const element = document.getElementById(`filter-${categoryId}`)
      if (element) {
        element.classList.add("scale-bounce")
        setTimeout(() => element.classList.remove("scale-bounce"), 300)
      }
    }
  }

  const handleQuickFilterClick = (filterId: string) => {
    // Handle mutual exclusivity between today and weekend
    if (filterId === "today") {
      // If weekend is already selected, deselect it
      if (filters.timeFilter === "weekend") {
        setFilters((prev) => ({
          ...prev,
          timeFilter: "today",
          date: new Date(), // Set to today's date
          dateRange: null, // Clear date range
        }))
      } else {
        // Toggle today filter
        setFilters((prev) => ({
          ...prev,
          timeFilter: prev.timeFilter === "today" ? null : "today",
          date: prev.timeFilter === "today" ? null : new Date(),
          dateRange: null, // Clear date range
        }))
      }
    } else if (filterId === "weekend") {
      // If today is already selected, deselect it
      if (filters.timeFilter === "today") {
        setFilters((prev) => ({
          ...prev,
          timeFilter: "weekend",
          date: null, // Clear single date
          dateRange: getNextWeekendDates(), // Set to weekend dates
        }))
      } else {
        // Toggle weekend filter
        setFilters((prev) => ({
          ...prev,
          timeFilter: prev.timeFilter === "weekend" ? null : "weekend",
          date: null, // Clear single date
          dateRange: prev.timeFilter === "weekend" ? null : getNextWeekendDates(),
        }))
      }
    }
  }

  const handleGenreChange = (genres: string[]) => {
    setFilters((prev) => ({
      ...prev,
      genres,
    }))
  }

  const filterEventsByCategory = useCallback((events: any[], category: string | null) => {
    if (!category || category === "explore") return events

    // Map category to event types
    const typeMap: Record<string, string[]> = {
      favorites: ["House", "Cultural"],
    }

    const types = typeMap[category] || []
    return types.length ? events.filter((event) => types.includes(event.type)) : events
  }, [])

  const handleAIClick = () => {
    // If chat is minimized, just maximize it
    if (isAIChatMinimized) {
      setIsAIChatMinimized(false)
      return
    }

    // Otherwise toggle the AI chat visibility
    setShowAIChat(!showAIChat)
  }

  const handleAIChatMinimize = (minimized: boolean) => {
    setIsAIChatMinimized(minimized)
  }

  const closeFavoritesPreview = () => {
    setShowFavoritesPreview(false)
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* Map */}
      <div className="absolute inset-0">
        <Map filters={filters} searchQuery={searchQuery} selectedCategory={selectedCategory} />
      </div>

      {/* Top UI Container */}
      <div className="absolute inset-x-0 top-0 z-10 flex flex-col">
        {/* Search Bar with Quick Filters and AI Icon */}
        <div className="p-4 pb-1">
          <div className="mx-auto max-w-xl">
            <div className="search-bar-container relative flex items-center h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-4 transition-all duration-300">
              {/* Search Icon and Input */}
              <div className="flex items-center flex-1">
                <Search className="h-4 w-4 text-white/50 mr-2" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="bg-transparent text-white placeholder:text-white/50 focus:outline-none w-full text-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-1.5 mx-1.5">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleQuickFilterClick(filter.id)}
                    className={cn(
                      "quick-filter px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                      filters.timeFilter === filter.id
                        ? "bg-gradient-to-r from-purple-500/70 to-blue-500/70 border-none shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white"
                        : "bg-black/60 hover:bg-gradient-to-r hover:from-purple-500/40 hover:to-blue-500/40 border border-white/10 text-white/90 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]",
                    )}
                  >
                    <span className="font-semibold tracking-wide">{filter.label}</span>
                    <span className="filter-emoji">{filter.icon}</span>
                  </button>
                ))}
              </div>

              {/* AI Brain Icon with notification dot when minimized */}
              <div
                className="brain-icon-container flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-purple-500/40 to-blue-500/40 hover:from-purple-500/70 hover:to-blue-500/70 border border-white/10 hover:border-white/20 shadow-[0_0_10px_rgba(139,92,246,0.2)] hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-300 cursor-pointer relative"
                onClick={handleAIClick}
              >
                <div className="brain-icon relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 blur-md"></div>
                  <Brain className="h-5 w-5 text-blue-300" />

                  {/* Notification dot for minimized chat - positioned inside the icon */}
                  {isAIChatMinimized && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-black/70 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Genre Filter - centered with the search bar */}
        <div className="px-4 pt-1 pb-2">
          <div className="mx-auto max-w-xl">
            <GenreFilter onGenreChange={handleGenreChange} selectedGenres={filters.genres} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <div className="mx-auto max-w-xs rounded-full bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg shadow-purple-900/10 px-6 py-2.5 transform translate-y-0 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex items-center justify-around gap-8">
            {categories.map((category) => (
              <button
                key={category.id}
                ref={category.id === "favorites" ? favoritesButtonRef : null}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "relative group flex flex-col items-center gap-1 transition-all duration-300",
                  selectedCategory === category.id || (category.id === "favorites" && showFavoritesPreview)
                    ? "bg-white/5 rounded-full px-3 py-1 shadow-lg"
                    : "hover:bg-white/5 rounded-full px-3 py-1",
                )}
              >
                <div
                  id={`filter-${category.id}`}
                  ref={category.id === "favorites" ? favoritesIconRef : null}
                  className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    selectedCategory === category.id || (category.id === "favorites" && showFavoritesPreview)
                      ? `animate-pulse-subtle`
                      : "",
                  )}
                >
                  {category.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-all",
                    selectedCategory === category.id || (category.id === "favorites" && showFavoritesPreview)
                      ? "text-white"
                      : "text-white/70 group-hover:text-white/90",
                  )}
                >
                  {category.label}
                </span>

                {/* Active indicator - subtle glow under the active item */}
                {(selectedCategory === category.id || (category.id === "favorites" && showFavoritesPreview)) && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Favorites Preview Popup */}
      <FavoritesPreview
        isOpen={showFavoritesPreview}
        onClose={closeFavoritesPreview}
        favoritesBtnRect={favoritesBtnRect}
      />

      {/* AI Chat Bubble */}
      <AIChatBubble
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onMinimize={handleAIChatMinimize}
        isMinimized={isAIChatMinimized}
      />
    </main>
  )
}
