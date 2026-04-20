'use client'

import { Category } from '@/lib/types'

const CATEGORIES: { value: Category | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🛒' },
  { value: 'pain_relief', label: 'Pain Relief', emoji: '💊' },
  { value: 'cold_flu', label: 'Cold & Flu', emoji: '🤧' },
  { value: 'vitamins', label: 'Vitamins', emoji: '🧬' },
  { value: 'supplements', label: 'Supplements', emoji: '🫀' },
  { value: 'digestive', label: 'Digestive', emoji: '🌿' },
  { value: 'oral_care', label: 'Oral Care', emoji: '🪥' },
  { value: 'denture_care', label: 'Denture Care', emoji: '🦷' },
  { value: 'skincare', label: 'Skincare', emoji: '🧴' },
]

interface Props {
  selected: Category | 'all'
  onChange: (cat: Category | 'all') => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            selected === cat.value
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <span className="text-base">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  )
}
