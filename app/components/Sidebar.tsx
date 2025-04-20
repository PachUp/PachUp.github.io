"use client"

import type { Dispatch, SetStateAction } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface SidebarProps {
  filters: {
    eventType: string[]
    distance: number
    date: Date | null
    time: string | null
  }
  setFilters: Dispatch<
    SetStateAction<{
      eventType: string[]
      distance: number
      date: Date | null
      time: string | null
    }>
  >
}

export default function Sidebar({ filters, setFilters }: SidebarProps) {
  const eventTypes = ["House", "Cultural", "Jazz", "Experimental", "Classical"]

  return (
    <Card className="w-64 h-full overflow-y-auto flex flex-col">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Event Type</Label>
            {eventTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.eventType.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFilters((prev) => ({ ...prev, eventType: [...prev.eventType, type] }))
                    } else {
                      setFilters((prev) => ({ ...prev, eventType: prev.eventType.filter((t) => t !== type) }))
                    }
                  }}
                />
                <Label htmlFor={type}>{type}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Distance (km): {filters.distance}</Label>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[filters.distance]}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, distance: value[0] }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={filters.date?.toISOString().split("T")[0] || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, date: new Date(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={filters.time || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, time: e.target.value }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
