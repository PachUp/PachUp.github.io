"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CalendarDays,
  Disc3,
  Waves,
  Radio,
  Mic2,
  Music4,
  Flame,
  ChevronLeft,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  name: string
  type: string
  location: [number, number]
  date: string
  time: string
  organizer: string
  image: string
  attendees: number
  description?: string
}

// Define genres with their specific colors
const genres = [
  {
    id: "all",
    label: "All",
    icon: <Music4 className="h-4 w-4" />,
    color: "#8b5cf6", // purple
  },
  {
    id: "techno",
    label: "Techno",
    icon: <Disc3 className="h-4 w-4" />,
    color: "#3b82f6", // blue
  },
  {
    id: "trance",
    label: "Trance",
    icon: <Waves className="h-4 w-4" />,
    color: "#8b5cf6", // purple
  },
  {
    id: "mainstream",
    label: "Mainstream",
    icon: <Radio className="h-4 w-4" />,
    color: "#ec4899", // pink
  },
  {
    id: "hiphop",
    label: "Hip Hop",
    icon: <Mic2 className="h-4 w-4" />,
    color: "#f43f5e", // rose
  },
  {
    id: "house",
    label: "House",
    icon: <Music4 className="h-4 w-4" />,
    color: "#10b981", // emerald
  },
]

// Define date filters
const dateFilters = [
  {
    id: "today",
    label: "Today",
    icon: <Flame className="h-4 w-4 text-orange-400" />,
    color: "#f97316", // orange
  },
  {
    id: "weekend",
    label: "Weekend",
    icon: <Music4 className="h-4 w-4 text-purple-400" />,
    color: "#8b5cf6", // purple
  },
  {
    id: "pick",
    label: "Pick a Date",
    icon: <CalendarDays className="h-4 w-4 text-cyan-400" />,
    color: "#06b6d4", // cyan
  },
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

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

// Default image URL from the previous version
const DEFAULT_IMAGE_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-16%20at%2022.31.44-Ezqdxf0wDkewfgvre2ljMw4w1FO8Vk.png"

// Month names for the calendar
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function ExplorePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null)
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })

  // Calendar month navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const genreScrollRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)
  const pickDateBtnRef = useRef<HTMLButtonElement>(null)
  const dateFiltersContainerRef = useRef<HTMLDivElement>(null)

  // Center the scroll containers on mount and when window resizes
  useEffect(() => {
    const centerScrollContainer = (ref: React.RefObject<HTMLDivElement>) => {
      if (ref.current) {
        const container = ref.current
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
    centerScrollContainer(genreScrollRef)

    // Center on window resize
    window.addEventListener("resize", () => {
      centerScrollContainer(genreScrollRef)
    })

    return () => {
      window.removeEventListener("resize", () => {
        centerScrollContainer(genreScrollRef)
      })
    }
  }, [])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchEvents = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const dummyEvents: Event[] = Array.from({ length: 20 }, (_, i) => ({
        id: `event-${i + 1}`,
        name: `${["Summer", "Tropical", "Beach", "Night", "Festival"][Math.floor(Math.random() * 5)]} ${
          ["Party", "Concert", "Festival", "Gathering", "Celebration"][Math.floor(Math.random() * 5)]
        }`,
        type: ["House", "Techno", "Jazz", "Experimental", "Classical", "Festivals"][Math.floor(Math.random() * 6)],
        location: [34.7818 + (Math.random() - 0.5) * 0.1, 32.0853 + (Math.random() - 0.5) * 0.1],
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
          .toISOString()
          .split("T")[0],
        time: `${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
        organizer: ["Beach Vibes", "Old City Events", "Haifa Music Society", "Red Sea Divers", "Desert Sounds"][
          Math.floor(Math.random() * 5)
        ],
        image: DEFAULT_IMAGE_URL,
        attendees: Math.floor(Math.random() * 200) + 50,
        description: "Join us for an unforgettable night of music and celebration!",
      }))
      setEvents(dummyEvents)
      setFilteredEvents(dummyEvents)
    }

    fetchEvents()
  }, [])

  // Handle genre selection
  const handleGenreClick = (genreId: string) => {
    setSelectedGenre(genreId)
  }

  // Handle date filter selection
  const handleDateFilterClick = (filterId: string, event: React.MouseEvent) => {
    if (filterId === "pick") {
      // Get the button position for the calendar
      if (pickDateBtnRef.current) {
        const rect = pickDateBtnRef.current.getBoundingClientRect()

        // Calculate the center position of the button
        const buttonCenter = rect.left + rect.width / 2

        // Set calendar position to be centered below the button
        // The calendar width is 280px, so we offset by half of that (140px)
        setCalendarPosition({
          top: rect.bottom,
          left: buttonCenter - 140, // Center the 280px wide calendar
        })
      }

      // Reset calendar to current month when opening
      if (!showCalendar) {
        const today = new Date()
        setCurrentMonth(today.getMonth())
        setCurrentYear(today.getFullYear())
      }

      setShowCalendar(!showCalendar)
      return
    }

    // Toggle the filter off if it's already selected
    if (selectedDateFilter === filterId) {
      setSelectedDateFilter(null)
      setSelectedDate(null)
      setDateRange(null)
      return
    }

    setSelectedDateFilter(filterId)

    if (filterId === "today") {
      setSelectedDate(new Date())
      setDateRange(null)
    } else if (filterId === "weekend") {
      setSelectedDate(null)
      setDateRange(getNextWeekendDates())
    }

    // Close calendar if it's open
    setShowCalendar(false)
  }

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    // Check if the clicked date is already selected
    if (selectedDate && isSameDay(selectedDate, date)) {
      // If the same date is clicked again, unselect it
      setSelectedDate(null)
      setDateRange(null)
      setSelectedDateFilter(null)
    } else {
      // Otherwise, select the new date
      setSelectedDate(date)
      setDateRange(null)
      setSelectedDateFilter(null)
    }

    // Close the calendar
    setShowCalendar(false)
  }

  // Handle month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Go to current month
  const goToCurrentMonth = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  // Filter events based on genre, date, and search query
  useEffect(() => {
    let filtered = [...events]

    // Apply genre filter
    if (selectedGenre !== "all") {
      // Map genre IDs to event types (simplified example)
      const genreToTypeMap: Record<string, string[]> = {
        techno: ["Techno"],
        trance: ["House", "Experimental"],
        mainstream: ["Classical", "Festivals"],
        hiphop: ["Jazz"],
        house: ["House"],
      }

      const types = genreToTypeMap[selectedGenre] || []
      if (types.length > 0) {
        filtered = filtered.filter((event) => types.includes(event.type))
      }
    }

    // Apply date filter
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split("T")[0]
      filtered = filtered.filter((event) => event.date === selectedDateStr)
    } else if (dateRange) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= dateRange.start && eventDate <= dateRange.end
      })
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query),
      )
    }

    setFilteredEvents(filtered)
  }, [events, selectedGenre, selectedDate, dateRange, searchQuery])

  // Get color for event type
  const getEventTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      House: "#3b82f6", // blue
      Techno: "#10b981", // green
      Jazz: "#f59e0b", // amber
      Experimental: "#ec4899", // pink
      Classical: "#6366f1", // indigo
      Festivals: "#f43f5e", // rose
    }
    return typeMap[type] || "#8b5cf6" // default to purple
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header with gradient */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 pb-4 px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-transparent bg-clip-text">
            Explore Events
          </span>
        </h1>

        {/* Search bar with date filters */}
        <div className="max-w-2xl mx-auto mb-6 relative z-20">
          {/* Search bar container */}
          <div
            ref={searchBarRef}
            className="search-bar-container relative flex items-center h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-4 transition-all duration-300"
          >
            {/* Search Icon and Input */}
            <div className="flex items-center flex-1">
              <Search className="h-4 w-4 text-white/50 mr-2" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/50 focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Date filters - positioned absolutely to overlay the search bar */}
          <div ref={dateFiltersContainerRef} className="absolute right-4 top-0 bottom-0 flex items-center z-30">
            <div className="flex items-center gap-1.5">
              {dateFilters.map((filter, index) => {
                const isActive =
                  filter.id === "pick"
                    ? selectedDate !== null && selectedDateFilter === null
                    : selectedDateFilter === filter.id

                return (
                  <button
                    key={filter.id}
                    ref={filter.id === "pick" ? pickDateBtnRef : null}
                    onClick={(e) => handleDateFilterClick(filter.id, e)}
                    className={cn(
                      "date-filter-btn quick-filter px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-purple-500/70 to-blue-500/70 border-none shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white"
                        : "bg-black/60 hover:bg-gradient-to-r hover:from-purple-500/40 hover:to-blue-500/40 border border-white/10 text-white/90 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]",
                    )}
                  >
                    <span className="font-semibold tracking-wide">
                      {filter.id === "pick" && selectedDate && selectedDateFilter === null
                        ? formatDate(selectedDate)
                        : filter.label}
                    </span>
                    <span className="filter-emoji">{filter.icon}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enhanced Calendar dropdown with month navigation */}
          {showCalendar && (
            <div
              ref={calendarRef}
              className="absolute z-50 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-lg shadow-purple-900/20 animate-in fade-in slide-in-from-top-5 duration-300 w-[280px]"
              style={{
                position: "fixed",
                top: `${calendarPosition.top}px`,
                left: `${Math.max(10, Math.min(window.innerWidth - 290, calendarPosition.left))}px`, // Prevent off-screen positioning
                transform: "translateY(0)",
                marginTop: "4px", // Slightly more space
              }}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={goToPreviousMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-white/70" />
                </button>

                <div className="flex items-center">
                  <button
                    onClick={goToCurrentMonth}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm font-medium text-white/90">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>
                    <ChevronUp className="h-3.5 w-3.5 text-white/70" />
                  </button>
                </div>

                <button onClick={goToNextMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                  <ChevronRight className="h-4 w-4 text-white/70" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1.5">
                {(() => {
                  const today = new Date()

                  // Get first day of selected month and total days
                  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
                  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

                  // Create array for calendar days
                  const days = []

                  // Add empty cells for days before the first day of month
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>)
                  }

                  // Add days of month
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(currentYear, currentMonth, i)
                    const isToday =
                      i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

                    const isSelected =
                      selectedDate &&
                      i === selectedDate.getDate() &&
                      currentMonth === selectedDate.getMonth() &&
                      currentYear === selectedDate.getFullYear()

                    days.push(
                      <button
                        key={`day-${i}`}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all",
                          isSelected
                            ? "bg-purple-600 text-white font-medium"
                            : isToday
                              ? "bg-white/10 text-white border border-white/30 font-medium"
                              : "hover:bg-white/10 text-white/80 hover:text-white",
                        )}
                      >
                        {i}
                      </button>,
                    )
                  }

                  return days
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Genre filter bar */}
        <div className="relative z-10 mt-2">
          <div ref={genreScrollRef} className="overflow-x-auto scrollbar-hide max-w-full">
            <div className="flex space-x-2 px-1 py-1 min-w-max justify-center">
              {genres.map((genre) => {
                const isActive = selectedGenre === genre.id

                return (
                  <motion.button
                    key={genre.id}
                    onClick={() => handleGenreClick(genre.id)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "quick-filter px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                      isActive
                        ? "text-white shadow-lg"
                        : "bg-black/60 border border-white/10 text-white/90 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]",
                    )}
                    style={
                      {
                        background: isActive
                          ? `linear-gradient(to right, ${genre.color}70, ${genre.color}70)`
                          : undefined,
                        boxShadow: isActive ? `0 0 15px ${genre.color}50` : undefined,
                        borderColor: isActive ? "transparent" : undefined,
                        "--hover-color-from": `${genre.color}40`,
                        "--hover-color-to": `${genre.color}40`,
                        "--active-color-from": `${genre.color}70`,
                        "--active-color-to": `${genre.color}70`,
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
      </motion.div>

      {/* Event grid */}
      <div className="px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 group hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                {/* Image container with overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  {/* Event type tag */}
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
                    style={{
                      backgroundColor: `${getEventTypeColor(event.type)}40`,
                      borderColor: `${getEventTypeColor(event.type)}80`,
                      boxShadow: `0 0 10px ${getEventTypeColor(event.type)}30`,
                      border: `1px solid ${getEventTypeColor(event.type)}60`,
                    }}
                  >
                    {event.type}
                  </div>

                  {/* Event details overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold mb-2 text-white">{event.name}</h3>

                    <div className="flex flex-col gap-1.5 mb-3">
                      <div className="flex items-center text-white/80 text-sm">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-pink-400" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-white/80 text-sm">
                        <Clock className="w-3.5 h-3.5 mr-2 text-blue-400" />
                        <span>
                          {new Date(`2024-01-01T${event.time}`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-white/80 text-sm">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-purple-400" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    </div>

                    <Link href={`/event/${event.id}`}>
                      <button
                        className="w-full py-1.5 px-4 rounded-lg flex items-center justify-center gap-1 text-sm font-medium transition-all"
                        style={{
                          backgroundColor: `${getEventTypeColor(event.type)}20`,
                          borderColor: `${getEventTypeColor(event.type)}40`,
                          border: `1px solid ${getEventTypeColor(event.type)}40`,
                        }}
                      >
                        <span>More Info</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-white/60 max-w-md">
              We couldn't find any events matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
