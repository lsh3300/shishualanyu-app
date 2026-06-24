"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
}

interface FilterBarProps {
  options: FilterOption[]
  onFilterChange?: (filterId: string) => void
  className?: string
  selectedOption?: string
  onSelectOption?: (filterId: string) => void
}

export function FilterBar({ options, onFilterChange, className, selectedOption, onSelectOption }: FilterBarProps) {
  const [activeFilter, setActiveFilter] = useState(selectedOption || options[0]?.id || "")

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId)
    onFilterChange?.(filterId)
    onSelectOption?.(filterId)
  }

  // 当selectedOption变化时，更新activeFilter
  React.useEffect(() => {
    if (selectedOption) {
      setActiveFilter(selectedOption)
    }
  }, [selectedOption])

  return (
    <div className={`flex gap-2 overflow-x-auto pb-2 ${className}`}>
      {options.map((option) => (
        <Button
          key={option.id}
          variant={activeFilter === option.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "whitespace-nowrap flex-shrink-0",
            activeFilter === option.id ? "bg-primary text-primary-foreground" : "bg-background",
          )}
          onClick={() => handleFilterClick(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
