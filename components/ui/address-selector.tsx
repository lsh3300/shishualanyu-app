"use client"
import { MapPin, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  isDefault: boolean
}

interface AddressSelectorProps {
  addresses: Address[]
  selectedId?: string
  onSelect: (addressId: string) => void
  onAddNew: () => void
}

export function AddressSelector({ addresses, selectedId, onSelect, onAddNew }: AddressSelectorProps) {
  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <Card
          key={address.id}
          className={cn(
            "p-4 cursor-pointer transition-colors",
            selectedId === address.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
          )}
          onClick={() => onSelect(address.id)}
        >
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">{address.name}</span>
                <span className="text-sm text-muted-foreground">{address.phone}</span>
                {address.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">默认</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{address.address}</p>
            </div>
            {selectedId === address.id && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>
        </Card>
      ))}

      <Button variant="outline" className="w-full bg-transparent" onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        添加新地址
      </Button>
    </div>
  )
}
