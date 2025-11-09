"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SpecOption {
  id: string
  label: string
  available: boolean
}

interface SpecSelectorProps {
  title: string
  options: SpecOption[]
  onSelect: (optionId: string) => void
  className?: string
}

export function SpecSelector({ title, options, onSelect, className }: SpecSelectorProps) {
  const [selected, setSelected] = useState<string>("")

  const handleSelect = (optionId: string) => {
    setSelected(optionId)
    onSelect(optionId)
  }

  return (
    <div className={className}>
      <h4 className="font-medium text-foreground mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selected === option.id ? "default" : "outline"}
            size="sm"
            disabled={!option.available}
            className={cn(
              "transition-colors",
              selected === option.id ? "bg-primary text-primary-foreground" : "",
              !option.available ? "opacity-50 cursor-not-allowed" : "",
            )}
            onClick={() => handleSelect(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
