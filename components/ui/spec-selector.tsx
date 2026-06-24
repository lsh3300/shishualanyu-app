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
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <span className="text-xs text-muted-foreground">
          {selected ? "已选择" : "请选择"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            disabled={!option.available}
            className={cn(
              "h-10 rounded-full border px-4 text-sm shadow-none backdrop-blur-xl transition-all",
              selected === option.id
                ? "border-primary/35 bg-primary text-primary-foreground hover:bg-primary/92"
                : "border-white/60 bg-white/70 text-foreground hover:bg-white",
              !option.available && "cursor-not-allowed border-white/40 bg-white/40 text-muted-foreground opacity-55",
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
