"use client"
import { CreditCard, Smartphone, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PaymentMethod {
  id: string
  name: string
  icon: "card" | "alipay" | "wechat"
  description: string
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[]
  selectedId?: string
  onSelect: (methodId: string) => void
}

const iconMap = {
  card: CreditCard,
  alipay: Smartphone,
  wechat: Wallet,
}

export function PaymentMethodSelector({ methods, selectedId, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const Icon = iconMap[method.icon]
        return (
          <Card
            key={method.id}
            className={cn(
              "p-4 cursor-pointer transition-colors",
              selectedId === method.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
            )}
            onClick={() => onSelect(method.id)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{method.name}</h4>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedId === method.id ? "border-primary bg-primary" : "border-muted-foreground",
                )}
              >
                {selectedId === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
