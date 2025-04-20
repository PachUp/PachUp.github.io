"use client"

import { Calendar, Clock, MapPin, CalendarPlus, Users } from "lucide-react"
import { motion } from "framer-motion"

interface EventPopupProps {
  name: string
  type: string
  date: string
  time: string
  organizer: string
  attendees: number
}

export default function EventPopup({ name, type, date, time, organizer, attendees }: EventPopupProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const formattedTime = new Date(`2024-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  // Determine color based on event type
  const getTypeColor = () => {
    switch (type) {
      case "House":
        return "from-blue-600/80 to-blue-400/80"
      case "Cultural":
        return "from-purple-600/80 to-purple-400/80"
      case "Jazz":
        return "from-pink-600/80 to-pink-400/80"
      case "Experimental":
        return "from-cyan-600/80 to-cyan-400/80"
      case "Classical":
        return "from-rose-600/80 to-rose-400/80"
      default:
        return "from-purple-600/80 to-blue-600/80"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-[280px] overflow-hidden rounded-xl border border-white/20 bg-black/80 backdrop-blur-md shadow-xl"
    >
      {/* Header section with dynamic gradient background */}
      <div className={`relative p-4 bg-gradient-to-r ${getTypeColor()}`}>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm flex items-center gap-1">
            <span className="opacity-90">{type}</span>
          </div>
          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm flex items-center gap-1">
            <Users className="w-3 h-3 opacity-90" />
            <span className="opacity-90">{attendees}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2 text-white/90">
          <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-sm">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 text-white/90">
          <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <span className="text-sm">{formattedTime}</span>
        </div>

        <div className="flex items-center gap-2 text-white/90">
          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{organizer}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-xs border border-white/10">
            <span>🎟️</span>
            <span className="font-medium">Get Tickets</span>
          </button>
          <button className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-xs border border-white/10">
            <CalendarPlus className="w-3.5 h-3.5" />
            <span className="font-medium">Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
