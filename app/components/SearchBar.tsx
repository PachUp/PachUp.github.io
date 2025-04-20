"use client"

import type { Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  setSearchQuery: Dispatch<SetStateAction<string>>
}

export default function SearchBar({ setSearchQuery }: SearchBarProps) {
  return (
    <Input
      type="text"
      placeholder="Search events..."
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full"
    />
  )
}
