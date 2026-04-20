'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { getWeeklyCutoff } from '@/lib/utils/order'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CutoffBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const now = new Date()
      const cutoff = getWeeklyCutoff()
      const diff = cutoff.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-yellow-400 text-yellow-900 text-center py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>Order closes in</span>
        <span className="font-mono">
          {timeLeft.days}d {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
        <span>— order now for this week&apos;s delivery!</span>
      </div>
    </div>
  )
}
