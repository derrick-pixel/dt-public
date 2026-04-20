import Navbar from '@/components/layout/Navbar'
import CutoffBanner from '@/components/layout/CutoffBanner'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CutoffBanner />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {children}
      </main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t">
        © 2025 Discounter SG · Weekly delivery to Singapore dormitories
      </footer>
    </div>
  )
}
