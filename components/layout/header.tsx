"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Search, Store } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
  subtitle?: string
}

function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(""))
    return JSON.parse(jsonPayload)
  } catch { return null }
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const [auth, setAuth] = useState<{ id: number; role: 'buyer' | 'seller' | 'admin'; email?: string } | null>(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!t) { setAuth(null); return }
    const payload = decodeJwt(t) as { sub?: number | string; role?: 'buyer' | 'seller' | 'admin'; email?: string } | null
    if (payload && payload.sub != null) {
      setAuth({ id: Number(payload.sub), role: (payload.role ?? 'buyer') as any, email: payload.email })
    } else {
      setAuth(null)
    }
  }, [])

  const goProfile = useCallback(() => {
    if (auth) router.push('/profile')
    else router.push('/auth')
  }, [auth, router])

  const goStore = useCallback(() => {
    if (auth && (auth.role === 'seller' || auth.role === 'admin')) {
      router.push(`/seller/${auth.id}`)
    }
  }, [auth, router])

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
        {auth ? (
          <div className="relative">
            <Button size="icon" variant="ghost" className="hover:bg-sage-100" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs">3</Badge>
          </div>
        ) : null}
        {auth && (auth.role === 'seller' || auth.role === 'admin') && (
          <Button size="icon" variant="ghost" className="hover:bg-sage-100" onClick={goStore} aria-label="Minha loja">
            <Store className="h-5 w-5" />
          </Button>
        )}
        {auth ? (
          <Avatar
            className="w-12 h-12 ring-2 ring-sage-200 hover:ring-sage-400 transition-all cursor-pointer"
            onClick={goProfile}
          >
            <AvatarImage
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd.jpg-482Kz4Ro7YXPgsZnttDFsQEmrWQnhG.jpeg"
              alt="User avatar"
            />
            <AvatarFallback className="bg-sage-100 text-sage-700">NA</AvatarFallback>
          </Avatar>
        ) : (
          <Button onClick={() => router.push('/auth')} className="rounded-full px-5">
            Entrar / Cadastrar
          </Button>
        )}
      </div>
    </header>
  )
}
