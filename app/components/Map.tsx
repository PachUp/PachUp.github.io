"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { createPortal } from "react-dom"
import EventPopup from "./EventPopup"

// Dynamically import mapbox-gl with no SSR to avoid the "Failed toload" error r
const MapboxMap = dynamic(
  async () => {
    const { Map, NavigationControl } = await import("mapbox-gl")
    return { Map, NavigationControl }
  },
  { ssr: false },
)

// Define the props interface with updated filter types
interface MapProps {
  filters?: {
    eventType: string[]
    distance: number
    date: Date | null
    dateRange: { start: Date; end: Date } | null
    time: string | null
    genres: string[]
    timeFilter: "today" | "weekend" | null
  }
  searchQuery?: string
  selectedCategory?: string | null
}

// Define the event interface
interface Event {
  id: string
  name: string
  type: string
  location: [number, number]
  date: string
  time: string
  organizer: string
}

// Define popup position type
interface PopupPosition {
  x: number
  y: number
  placement: "top" | "bottom" | "left" | "right"
  emojiOffset: number
}

// Helper function to check if a date is within a date range
const isDateInRange = (dateStr: string, range: { start: Date; end: Date }): boolean => {
  const date = new Date(dateStr)
  return date >= range.start && date <= range.end
}

// Map component
function MapComponent({
  filters = {
    eventType: [],
    distance: 10,
    date: null,
    dateRange: null,
    time: null,
    genres: [],
    timeFilter: null,
  },
  searchQuery = "",
  selectedCategory = null,
}: MapProps & { selectedCategory?: string | null }) {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const popupContainerRef = useRef<HTMLDivElement | null>(null)

  // State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [dummyEvents, setDummyEvents] = useState<Event[]>([])
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const [mapboxgl, setMapboxgl] = useState<any>(null)
  const [activePopup, setActivePopup] = useState<{
    event: Event & { attendees: number }
    position: PopupPosition
  } | null>(null)

  // Event type details
  const eventTypeDetails = {
    House: {
      icon: "🎵",
      color: "#3b82f6", // blue
    },
    Cultural: {
      icon: "🎭",
      color: "#8b5cf6", // purple
    },
    Jazz: {
      icon: "🎷",
      color: "#ec4899", // pink
    },
    Experimental: {
      icon: "🎧",
      color: "#06b6d4", // cyan
    },
    Classical: {
      icon: "🎻",
      color: "#f43f5e", // rose
    },
  }

  // Create popup container on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      const container = document.createElement("div")
      container.className = "custom-popup-container"
      document.body.appendChild(container)
      popupContainerRef.current = container

      return () => {
        document.body.removeChild(container)
      }
    }
  }, [])

  // Load mapbox-gl dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import("mapbox-gl")
        // Set the Mapbox access token
        mapboxModule.default.accessToken =
          "pk.eyJ1IjoicGF0Y2h1cCIsImEiOiJjbTc4NjBveGMwcWdwMmlvOWRpbjJ5OGNxIn0.qS_B6NQjgOx_WiMOxtqQTQ"
        setMapboxgl(mapboxModule.default)
        setMapboxLoaded(true)
      } catch (error) {
        console.error("Failed to load mapbox-gl:", error)
      }
    }

    loadMapbox()
  }, [])

  // Generate dummy events
  useEffect(() => {
    const eventTypes = ["House", "Cultural", "Jazz", "Experimental", "Classical"]
    const organizers = ["Beach Vibes", "Old City Events", "Haifa Music Society", "Red Sea Divers", "Desert Sounds"]
    const events: Event[] = []

    for (let i = 0; i < 300; i++) {
      const isTelAviv = Math.random() < 0.7 // 70% chance of being in Tel Aviv
      let location: [number, number]

      if (isTelAviv) {
        // Generate location within Tel Aviv area
        location = [34.7661 + (Math.random() - 0.5) * 0.1, 32.0853 + (Math.random() - 0.5) * 0.1]
      } else {
        // Generate location within Israel
        location = [34.8 + Math.random() * 1.4, 29.5 + Math.random() * 3.5]
      }

      // Generate a random date within the next 30 days
      const eventDate = new Date()
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30))

      events.push({
        id: `event-${i + 1}`,
        name: `Event ${i + 1}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        location: location,
        date: eventDate.toISOString().split("T")[0],
        time: `${Math.floor(Math.random() * 24)
          .toString()
          .padStart(2, "0")}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
        organizer: organizers[Math.floor(Math.random() * organizers.length)],
      })
    }

    setDummyEvents(events)
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activePopup && popupContainerRef.current && !popupContainerRef.current.contains(e.target as Node)) {
        setActivePopup(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activePopup])

  // Initialize map
  useEffect(() => {
    if (!mapboxLoaded || !mapboxgl || map.current || !mapContainer.current) return // initialize map only once

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [34.7818, 32.0853],
        zoom: 11,
        pitch: 0,
        bearing: 0,
        antialias: true,
      })

      map.current.on("load", () => {
        if (!map.current) return

        map.current.addSource("events", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        })

        // Add heatmap layer
        map.current.addLayer({
          id: "event-heat",
          type: "heatmap",
          source: "events",
          maxzoom: 15,
          paint: {
            "heatmap-weight": ["interpolate", ["linear"], ["get", "point_count"], 0, 0, 10, 1],
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "rgb(209,229,240)",
              0.6,
              "rgb(253,219,199)",
              0.8,
              "rgb(239,138,98)",
              1,
              "rgb(178,24,43)",
            ],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 30],
            "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 15, 0],
          },
        })

        setMapLoaded(true)
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxLoaded, mapboxgl])

  // Calculate optimal popup position with enhanced top-edge handling
  const calculatePopupPosition = useCallback(
    (point: { x: number; y: number }, markerElement: HTMLElement): PopupPosition => {
      const POPUP_WIDTH = 230
      const POPUP_HEIGHT = 220 // Estimated height of our compact popup
      const POPUP_MARGIN = 20 // Increased margin for better visibility
      const POINTER_SIZE = 8
      const TOP_EDGE_THRESHOLD = 250 // Increased threshold for top edge detection
      const MINIMUM_VISIBLE_PORTION = 0.9 // At least 90% of popup should be visible

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Find the emoji position within the marker
      const emojiElement = markerElement.querySelector(".marker-icon span") as HTMLElement
      let emojiOffset = 20 // Default offset if we can't find the emoji
      let emojiCenterY = point.y - emojiOffset // Default emoji center position

      if (emojiElement) {
        const emojiRect = emojiElement.getBoundingClientRect()
        const markerRect = markerElement.getBoundingClientRect()

        // Calculate the emoji's center position relative to the marker's bottom center
        emojiOffset = markerRect.bottom - (emojiRect.top + emojiRect.height / 2)
        emojiCenterY = point.y - emojiOffset
      }

      // Calculate available space in each direction from the emoji's center
      const spaceAbove = emojiCenterY
      const spaceBelow = viewportHeight - emojiCenterY
      const spaceLeft = point.x
      const spaceRight = viewportWidth - point.x

      // Calculate how much of the popup would be visible in each direction
      const visiblePortionAbove = Math.min(1, spaceAbove / (POPUP_HEIGHT + POPUP_MARGIN))
      const visiblePortionBelow = Math.min(1, spaceBelow / (POPUP_HEIGHT + POPUP_MARGIN))
      const visiblePortionLeft = Math.min(1, spaceLeft / (POPUP_WIDTH + POPUP_MARGIN))
      const visiblePortionRight = Math.min(1, spaceRight / (POPUP_WIDTH + POPUP_MARGIN))

      // Determine the best placement based on maximum visibility
      let placement: "top" | "bottom" | "left" | "right"

      // Special handling for top edge cases
      if (spaceAbove < TOP_EDGE_THRESHOLD || visiblePortionAbove < MINIMUM_VISIBLE_PORTION) {
        // Near top edge, prioritize bottom placement if there's enough space
        if (visiblePortionBelow >= MINIMUM_VISIBLE_PORTION) {
          placement = "bottom"
        }
        // Otherwise try sides
        else if (visiblePortionRight >= MINIMUM_VISIBLE_PORTION) {
          placement = "right"
        } else if (visiblePortionLeft >= MINIMUM_VISIBLE_PORTION) {
          placement = "left"
        }
        // If no direction has enough visibility, use the one with most space
        else {
          const portions = [
            { dir: "bottom", portion: visiblePortionBelow },
            { dir: "right", portion: visiblePortionRight },
            { dir: "left", portion: visiblePortionLeft },
            // Only include "top" as a last resort
            { dir: "top", portion: visiblePortionAbove * 0.8 }, // Apply penalty to top placement
          ]

          const bestPlacement = portions.sort((a, b) => b.portion - a.portion)[0]
          placement = bestPlacement.dir as "top" | "bottom" | "left" | "right"
        }
      }
      // For non-top-edge cases, choose based on maximum visibility
      else {
        const portions = [
          { dir: "top", portion: visiblePortionAbove },
          { dir: "bottom", portion: visiblePortionBelow },
          { dir: "left", portion: visiblePortionLeft },
          { dir: "right", portion: visiblePortionRight },
        ]

        const bestPlacement = portions.sort((a, b) => b.portion - a.portion)[0]
        placement = bestPlacement.dir as "top" | "bottom" | "left" | "right"
      }

      // Calculate final position based on placement
      let x = point.x
      let y = emojiCenterY // Use emoji center as reference point

      // Apply special handling for each placement direction
      if (placement === "top" || placement === "bottom") {
        // Center horizontally, but ensure it stays within bounds
        x = Math.min(Math.max(POPUP_WIDTH / 2 + POPUP_MARGIN, x), viewportWidth - POPUP_WIDTH / 2 - POPUP_MARGIN)

        if (placement === "top") {
          // Position above the emoji with additional safety margin for top edge
          const safetyOffset = spaceAbove < TOP_EDGE_THRESHOLD ? Math.max(0, TOP_EDGE_THRESHOLD - spaceAbove) / 2 : 0
          y = Math.max(POPUP_HEIGHT / 2 + POPUP_MARGIN, y - POINTER_SIZE - safetyOffset)
        } else {
          // Position below the emoji
          y = y + POINTER_SIZE
        }
      } else {
        // For left/right placement, ensure vertical centering doesn't push popup off-screen
        const maxY = viewportHeight - POPUP_HEIGHT / 2 - POPUP_MARGIN
        const minY = POPUP_HEIGHT / 2 + POPUP_MARGIN

        // If we're near the top, push the popup down to ensure visibility
        if (emojiCenterY < TOP_EDGE_THRESHOLD / 2) {
          y = Math.max(minY, Math.min(maxY, emojiCenterY + TOP_EDGE_THRESHOLD / 4))
        } else {
          y = Math.max(minY, Math.min(maxY, emojiCenterY))
        }

        if (placement === "left") {
          x = x - POINTER_SIZE
        } else {
          x = x + POINTER_SIZE
        }
      }

      return { x, y, placement, emojiOffset }
    },
    [],
  )

  // Add this function to filter events based on selected category, after the other filter functions
  const filterEventsByCategory = useCallback((events: Event[], category: string | null) => {
    if (!category || category === "explore") return events

    // Map category to event types
    const typeMap: Record<string, string[]> = {
      music: ["House", "Jazz", "Classical"],
      bars: ["House", "Cultural"],
      karaoke: ["Experimental"],
    }

    const types = typeMap[category] || []
    return types.length ? events.filter((event) => types.includes(event.type)) : events
  }, [])

  // Function to update map data (moved up to avoid initialization error)
  const updateMapData = useCallback(() => {
    if (!mapLoaded || !map.current || !mapboxgl || dummyEvents.length === 0) return

    try {
      // Start with all events
      let filteredEvents = [...dummyEvents]

      // Apply search filter
      if (searchQuery) {
        filteredEvents = filteredEvents.filter((event) => event.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Apply event type filter from sidebar if any
      if (filters.eventType.length > 0) {
        filteredEvents = filteredEvents.filter((event) => filters.eventType.includes(event.type))
      }

      // Apply genre filters if any
      if (filters.genres.length > 0) {
        // Map genre IDs to event types (simplified example)
        const genreToTypeMap: Record<string, string[]> = {
          techno: ["House"],
          trance: ["House", "Experimental"],
          mainstream: ["Cultural"],
          hiphop: ["Jazz"],
          house: ["House", "Classical"],
        }

        // Get all event types that match the selected genres
        const allowedTypes = filters.genres.flatMap((genre) => genreToTypeMap[genre] || [])

        // Filter events to only those with types in the allowed types list
        if (allowedTypes.length > 0) {
          filteredEvents = filteredEvents.filter((event) => allowedTypes.includes(event.type))
        }
      }

      // Apply time filters
      if (filters.timeFilter === "today") {
        // Filter for today's events
        const today = new Date().toISOString().split("T")[0]
        filteredEvents = filteredEvents.filter((event) => event.date === today)
      } else if (filters.timeFilter === "weekend" && filters.dateRange) {
        // Filter for weekend events
        filteredEvents = filteredEvents.filter((event) => isDateInRange(event.date, filters.dateRange!))
      }

      // Apply category filter if selected and not explore
      if (selectedCategory && selectedCategory !== "explore") {
        filteredEvents = filterEventsByCategory(filteredEvents, selectedCategory)
      }
      // If explore is selected or no category is selected, we keep all filtered events

      // Create features for heatmap
      const features = filteredEvents.map((event) => ({
        type: "Feature" as const,
        properties: {
          point_count: 1,
        },
        geometry: {
          type: "Point" as const,
          coordinates: event.location,
        },
      }))

      // Update heatmap data
      const source = map.current.getSource("events")
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: features,
        })
      }

      // Only create markers if zoomed in enough
      const currentZoom = map.current.getZoom()
      if (currentZoom >= 14) {
        // Get the current map bounds
        const bounds = map.current.getBounds()

        // Filter events to only those within the current viewport
        const visibleEvents = filteredEvents.filter((event) => {
          const [lng, lat] = event.location
          return (
            lng >= bounds.getWest() && lng <= bounds.getEast() && lat >= bounds.getSouth() && lat <= bounds.getNorth()
          )
        })

        // Create a map of existing markers by their ID for quick lookup
        const existingMarkers = new Map()
        markersRef.current.forEach((marker) => {
          const lngLat = marker.getLngLat()
          // Create a unique ID for each marker based on its coordinates
          const id = `${lngLat.lng}-${lngLat.lat}`
          existingMarkers.set(id, marker)
        })

        // Track which markers should be kept
        const markersToKeep = new Set()

        // Create or update markers for visible events
        visibleEvents.forEach((event) => {
          const markerId = `${event.location[0]}-${event.location[1]}`
          markersToKeep.add(markerId)

          // If marker already exists, skip creation
          if (existingMarkers.has(markerId)) {
            return
          }

          const eventType = event.type as keyof typeof eventTypeDetails
          const { icon, color } = eventTypeDetails[eventType] || { icon: "📍", color: "#ff0000" }

          // Create marker element
          const el = document.createElement("div")
          el.className = "custom-marker"
          el.innerHTML = `
<div class="marker-container" style="
position: relative;
width: 48px;
height: 48px;
transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
">
<div class="marker-background" style="
position: absolute;
top: 0;
left: 0;
width: 48px;
height: 48px;
background: ${color};
border-radius: 50%;
transform: scale(1.3);
filter: blur(8px);
opacity: 0.7;
transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
"></div>
<div class="marker-glow" style="
position: absolute;
top: -2px;
left: -2px;
width: 52px;
height: 52px;
background: transparent;
border: 2px solid ${color};
border-radius: 50%;
filter: blur(1px);
opacity: 0.5;
animation: marker-pulse 2s ease-in-out infinite;
"></div>
<div class="marker-icon" style="
position: absolute;
top: 0;
left: 0;
width: 48px;
height: 48px;
background: linear-gradient(135deg, ${color}, ${color}99);
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 22px;
box-shadow: 0 0 15px ${color}aa, inset 0 0 10px rgba(255, 255, 255, 0.3);
transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
border: 1px solid rgba(255, 255, 255, 0.2);
backdrop-filter: blur(4px);
">
<span style="
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
">${icon}</span>
</div>
</div>
`

          // Add hover effect
          el.addEventListener("mouseenter", () => {
            const background = el.querySelector(".marker-background") as HTMLElement
            const icon = el.querySelector(".marker-icon") as HTMLElement
            if (background && icon) {
              background.style.transform = "scale(1.6)"
              background.style.opacity = "0.9"
              icon.style.transform = "scale(1.15)"
              icon.style.boxShadow = `0 0 20px ${color}, inset 0 0 15px rgba(255, 255, 255, 0.5)`
            }
          })

          el.addEventListener("mouseleave", () => {
            const background = el.querySelector(".marker-background") as HTMLElement
            const icon = el.querySelector(".marker-icon") as HTMLElement
            if (background && icon) {
              background.style.transform = "scale(1.3)"
              background.style.opacity = "0.7"
              icon.style.transform = "scale(1)"
              icon.style.boxShadow = `0 0 15px ${color}aa, inset 0 0 10px rgba(255, 255, 255, 0.3)`
            }
          })

          // Handle click to show custom popup
          el.addEventListener("click", () => {
            // Get marker position on screen
            const markerLngLat = event.location
            const point = map.current.project(markerLngLat)

            // Create event with attendees
            const eventWithAttendees = {
              ...event,
              attendees: Math.floor(Math.random() * 200) + 50,
            }

            // Calculate optimal popup position considering the emoji and top edge
            const popupPosition = calculatePopupPosition({ x: point.x, y: point.y }, el)

            // Set active popup with position
            setActivePopup({
              event: eventWithAttendees,
              position: popupPosition,
            })
          })

          // Create marker
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat(event.location)
            .addTo(map.current!)

          markersRef.current.push(marker)
        })

        // Remove markers that are no longer visible
        markersRef.current = markersRef.current.filter((marker) => {
          const lngLat = marker.getLngLat()
          const id = `${lngLat.lng}-${lngLat.lat}`

          if (!markersToKeep.has(id)) {
            marker.remove()
            return false
          }
          return true
        })
      } else {
        // Remove all markers when zoomed out
        markersRef.current.forEach((marker) => {
          marker.remove()
        })
        markersRef.current = []
      }
    } catch (error) {
      console.error("Error updating map data:", error)
    }
  }, [
    mapLoaded,
    filters,
    searchQuery,
    dummyEvents,
    eventTypeDetails,
    mapboxgl,
    calculatePopupPosition,
    selectedCategory,
    filterEventsByCategory,
  ])

  // Update map data when filters, search query, or events change
  useEffect(() => {
    if (mapLoaded && map.current && mapboxgl && dummyEvents.length > 0) {
      updateMapData()
    }
  }, [
    mapLoaded,
    filters,
    searchQuery,
    dummyEvents,
    eventTypeDetails,
    mapboxgl,
    calculatePopupPosition,
    updateMapData,
    selectedCategory,
  ])

  // Add zoom event listener to show/hide markers based on zoom level
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    const handleZoom = () => {
      const zoom = map.current.getZoom()

      // If we're below the threshold for showing markers, remove all markers
      if (zoom < 14) {
        markersRef.current.forEach((marker) => {
          marker.remove()
        })
        markersRef.current = []
        return
      }

      // Otherwise, update markers based on the current viewport
      updateMapData()
    }

    map.current.on("zoom", handleZoom)

    return () => {
      if (map.current) {
        map.current.off("zoom", handleZoom)
      }
    }
  }, [mapLoaded, updateMapData])

  // Add map movement event listeners for lazy loading
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Use a debounced version of updateMapData for move events to prevent excessive updates
    let moveTimeout: NodeJS.Timeout
    const handleMapMove = () => {
      clearTimeout(moveTimeout)
      moveTimeout = setTimeout(() => {
        updateMapData()
      }, 100) // 100ms debounce
    }

    // Add event listeners for map movement
    map.current.on("moveend", handleMapMove)

    return () => {
      if (map.current) {
        map.current.off("moveend", handleMapMove)
        clearTimeout(moveTimeout)
      }
    }
  }, [mapLoaded, updateMapData])

  // Handle window resize to reposition popup if needed
  useEffect(() => {
    const handleResize = () => {
      if (activePopup && markersRef.current.length > 0) {
        // Find the marker that corresponds to the active popup
        const marker = markersRef.current.find((m) => {
          const coords = m.getLngLat()
          return coords.lng === activePopup.event.location[0] && coords.lat === activePopup.event.location[1]
        })

        if (marker && map.current) {
          // Get updated screen position
          const point = map.current.project(marker.getLngLat())

          // Recalculate position
          const markerEl = marker.getElement()
          const popupPosition = calculatePopupPosition({ x: point.x, y: point.y }, markerEl)

          // Update popup position
          setActivePopup({
            event: activePopup.event,
            position: popupPosition,
          })
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [activePopup, calculatePopupPosition])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clean up markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [])

  // If mapbox-gl failed to load, show an error message
  if (!mapboxLoaded && typeof window !== "undefined") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Map loading error</h3>
          <p>Failed to load map library. Please check your internet connection and try again.</p>
        </div>
      </div>
    )
  }

  // Get transform and pointer styles based on popup position
  const getPopupStyles = (position: PopupPosition) => {
    const { x, y, placement, emojiOffset } = position

    // Base styles
    let transform = ""
    let pointerStyles = {
      position: "absolute",
      borderTopWidth: "8px",
      borderRightWidth: "8px",
      borderBottomWidth: "8px",
      borderLeftWidth: "8px",
      borderTopStyle: "solid",
      borderRightStyle: "solid",
      borderBottomStyle: "solid",
      borderLeftStyle: "solid",
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: "transparent",
      zIndex: 10,
    } as React.CSSProperties

    // Adjust based on placement
    switch (placement) {
      case "top":
        transform = "translate(-50%, -100%)"
        pointerStyles = {
          ...pointerStyles,
          left: "50%",
          bottom: "-16px",
          transform: "translateX(-50%)",
          borderTopColor: "black",
          borderBottomWidth: "0",
        }
        break
      case "bottom":
        transform = "translate(-50%, 0)"
        pointerStyles = {
          ...pointerStyles,
          left: "50%",
          top: "-16px",
          transform: "translateX(-50%)",
          borderBottomColor: "rgb(147, 51, 234)",
          borderTopWidth: "0",
        }
        break
      case "left":
        transform = "translate(-100%, -50%)"
        pointerStyles = {
          ...pointerStyles,
          top: "50%",
          right: "-16px",
          transform: "translateY(-50%)",
          borderLeftColor: "black",
          borderRightWidth: "0",
        }
        break
      case "right":
        transform = "translate(0, -50%)"
        pointerStyles = {
          ...pointerStyles,
          top: "50%",
          left: "-16px",
          transform: "translateY(-50%)",
          borderRightColor: "rgb(147, 51, 234)",
          borderLeftWidth: "0",
        }
        break
    }

    return { transform, pointerStyles }
  }

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Custom popup portal */}
      {activePopup &&
        popupContainerRef.current &&
        createPortal(
          <div
            className="fixed z-50 animate-in fade-in"
            style={{
              left: `${activePopup.position.x}px`,
              top: `${activePopup.position.y}px`,
              transform: getPopupStyles(activePopup.position).transform,
            }}
          >
            <div className="relative">
              <EventPopup
                name={activePopup.event.name}
                type={activePopup.event.type}
                date={activePopup.event.date}
                time={activePopup.event.time}
                organizer={activePopup.event.organizer}
                attendees={activePopup.event.attendees}
              />

              {/* Dynamic pointer triangle */}
              <div style={getPopupStyles(activePopup.position).pointerStyles} />
            </div>
          </div>,
          popupContainerRef.current,
        )}
    </>
  )
}

// Export the component with a default export
export default MapComponent
