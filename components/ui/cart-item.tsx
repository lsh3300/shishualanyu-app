"use client"

import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface CartItemProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  specs: string
  quantity: number
  selected: boolean
  onQuantityChange: (id: string, quantity: number) => void
  onSelectionChange: (id: string, selected: boolean) => void
  onRemove: (id: string) => void
}

export function CartItem({
  id,
  name,
  price,
  originalPrice,
  image,
  specs,
  quantity,
  selected,
  onQuantityChange,
  onSelectionChange,
  onRemove,
}: CartItemProps) {
  const [currentQuantity, setCurrentQuantity] = useState(quantity)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setCurrentQuantity(newQuantity)
    onQuantityChange(id, newQuantity)
  }

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <Checkbox checked={selected} onCheckedChange={(checked) => onSelectionChange(id, checked as boolean)} />

        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground mb-1 line-clamp-2">{name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{specs}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-accent">¥{price}</span>
            {originalPrice && <span className="text-sm text-muted-foreground line-through">¥{originalPrice}</span>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => handleQuantityChange(currentQuantity - 1)}
                disabled={currentQuantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{currentQuantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => handleQuantityChange(currentQuantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onRemove(id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
