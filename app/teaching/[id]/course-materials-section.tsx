import { MaterialCard } from "@/components/ui/material-card"

interface Material {
  id: string
  name: string
  price: number
  image: string
  description: string
}

interface CourseMaterialsSectionProps {
  materials: Material[]
}

export function CourseMaterialsSection({ materials }: CourseMaterialsSectionProps) {
  return (
    <section className="px-4 mb-6">
      <h3 className="heading-secondary mb-4">所需材料</h3>
      <div className="space-y-4">
        {materials.map((material) => (
          <MaterialCard key={material.id} {...material} />
        ))}
      </div>
    </section>
  )
}