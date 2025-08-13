"use client"

import { Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sage-800 to-sage-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="text-sage-600">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage-400" />
          <Input
            className="w-80 pl-10 border-sage-200 focus:border-sage-400 focus:ring-sage-400/20"
            placeholder="Search products, brands, categories..."
          />
        </div>
        <div className="relative">
          <Button size="icon" variant="ghost" className="hover:bg-sage-100">
            <Bell className="h-5 w-5" />
          </Button>
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">3</Badge>
        </div>
        <Avatar className="w-12 h-12 ring-2 ring-sage-200 hover:ring-sage-400 transition-all cursor-pointer">
          <AvatarImage
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-482Kz4Ro7YXPgsZnttDFsQEmrWQnhG.jpeg"
            alt="User avatar"
          />
          <AvatarFallback className="bg-sage-100 text-sage-700">NA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
