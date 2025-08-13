"use client"

import { Home, LogOut, Mail, Settings, ShoppingBag, User2, Heart, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Profile", href: "/profile", icon: User2 },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Orders", href: "/orders", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Messages", href: "/messages", icon: Mail },
  { name: "My Cart", href: "/cart", icon: ShoppingBag },
  { name: "Support", href: "/support", icon: User2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-sage-200 bg-gradient-to-b from-cream-50 to-sage-50 px-6 py-8">
      <div className="mb-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fs-OQzXWiKsdo0mSCzNZyZmZHXxrCi0Bp.png"
          alt="Fashion Store"
          width={150}
          height={40}
          className="h-10 w-auto"
        />
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105",
                isActive
                  ? "bg-sage-600 text-white shadow-lg shadow-sage-600/25"
                  : "text-sage-700 hover:bg-sage-100 hover:text-sage-800",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        <div className="pt-4">
          <Link
            href="/logout"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 hover:scale-105"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </div>
      </nav>
    </aside>
  )
}
