export default function CulturePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">蓝染文化</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">历史渊源</h2>
          <p className="mb-4">
            蓝染是一种古老的染色技术，在中国有着悠久的历史。它使用天然植物染料，
            主要是从蓼蓝植物中提取的靛蓝，通过发酵过程将织物染成深蓝色。
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">工艺特点</h2>
          <p className="mb-4">
            蓝染工艺独特，色彩深沉而富有层次，随着时间的推移，颜色会逐渐变得更加柔和自然。
            这种染色方法不仅环保，而且染出的织物具有独特的质感和美感。
          </p>
        </div>
      </div>
    </div>
  )
}