"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface CartItem {
  id: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
}

function decodeJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(""))
    return JSON.parse(jsonPayload)
  } catch { return null }
}

export default function Dashboard() {
  const router = useRouter()
  const cart = useCart()

  const [auth, setAuth] = useState<{ id: number | null, role: 'buyer'|'seller'|'admin'|null, email?: string } | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // Novo: imagens por produto e índice atual do carrossel
  const [productImages, setProductImages] = useState<Record<number, string[]>>({})
  const [imageIndexes, setImageIndexes] = useState<Record<number, number>>({})

  // Normaliza URL vinda da API (ex: /uploads/abc) ou externa
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
  function normalizeUrl(u?: string) {
    if (!u) return '/placeholder.svg'
    if (u.startsWith('http')) return u
    if (u.startsWith('/')) return `${API_URL}${u}`
    return u
  }

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!t) { setAuth(null); return }
    const payload = decodeJwt(t) as { sub?: number|string; role?: 'buyer'|'seller'|'admin'; email?: string } | null
    if (payload && (payload.sub != null)) {
      setAuth({ id: Number(payload.sub), role: (payload.role ?? null) as any, email: payload.email })
    } else {
      setAuth(null)
    }
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
        const res = await fetch(`${base}/api/products`)
        const result = await res.json()
        const list = Array.isArray(result) ? result : (result.data || [])
        setProducts(list)
        // calcular destaque por número de avaliações
        const subset = list.slice(0, 24)
        const summaries = await Promise.all(
          subset.map(async (p: any) => {
            try {
              const r = await fetch(`${base}/api/reviews/summary?targetId=${p.id}`)
              const s = await r.json()
              const count = Number(s?.count ?? 0)
              return { id: p.id, count }
            } catch { return { id: p.id, count: 0 } }
          })
        )
        const counts: Record<number, number> = {}
        for (const s of summaries) counts[s.id] = s.count
        const withCount = list.map((p: any) => ({ ...p, _count: counts[p.id] || 0 }))
        const sorted = withCount.sort((a: any, b: any) => b._count - a._count)
        const top = sorted.filter((p: any) => p._count > 0).slice(0, 6)
        setFeatured(top.length ? top : list.slice(0, 6))
      } catch {
        setProducts([])
        setFeatured([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Novo: carregar imagens dos produtos em destaque quando 'featured' muda
  useEffect(() => {
    async function loadImages() {
      if (!featured.length) return
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
      const toLoad = featured.filter(p => !productImages[p.id])
      if (toLoad.length === 0) return
      try {
        const results = await Promise.allSettled(
          toLoad.map(async (p) => {
            const r = await fetch(`${base}/api/products/${p.id}/images`)
            const data = await r.json().catch(() => ({}))
            const arr = Array.isArray(data?.data) ? data.data : []
            const urls = arr.map((im: any) => normalizeUrl(im.url)).filter(Boolean)
            return { id: p.id, urls }
          })
        )
        const next: Record<number, string[]> = { ...productImages }
        for (const r of results) {
          if (r.status === 'fulfilled') {
            next[r.value.id] = r.value.urls.length ? r.value.urls : next[r.value.id] || []
          }
        }
        setProductImages(next)
      } catch {}
    }
    loadImages()
  }, [featured, productImages])

  // Novo: intervalo para rotacionar imagem atual dos cards
  useEffect(() => {
    if (!featured.length) return
    const interval = setInterval(() => {
      setImageIndexes(prev => {
        const next = { ...prev }
        for (const p of featured) {
          const imgs = productImages[p.id]
            if (imgs && imgs.length > 1) {
              next[p.id] = ((next[p.id] || 0) + 1) % imgs.length
            }
        }
        return next
      })
    }, 3000) // a cada 3s
    return () => clearInterval(interval)
  }, [featured, productImages])

  const addToCart = useCallback((item: any) => {
    const firstImg = (productImages[item.id] && productImages[item.id][0]) || item.image_url || '/placeholder.svg'
    cart.addItem({ productId: item.id, name: item.name, price: item.price, image: firstImg, sellerId: item.seller_id })
    toast({ title: "Adicionado ao carrinho", description: `${item.name} foi adicionado.` })
  }, [productImages, cart])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header
          title={auth ? `Bem-vindo!` : 'Bem-vindo ao CodeMall'}
          subtitle={auth ? 'Explore suas métricas e produtos' : 'Entre ou cadastre-se para aproveitar promoções e comprar/vender'}
        />

        {/* Stats Cards (apenas seller/admin) */}
        {(auth && (auth.role === 'seller' || auth.role === 'admin')) && (
          <div className="mb-8 grid grid-cols-4 gap-6">
            {/* métricas reais podem ser carregadas aqui */}
            <Button asChild variant="outline" className="col-span-1" onClick={() => router.push('/cart')}>
              <Link href="/cart">Ver Carrinho ({cart.totalItems})</Link>
            </Button>
          </div>
        )}

        {/* Hero Cards */}
        <div className="mb-12 grid grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-sage-100 to-sage-200 border-0 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <CardContent className="p-8 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 hover:bg-green-600">BEST OFFERS</Badge>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-sage-800">Tote Bag Collection</h3>
              <p className="mb-6 text-sage-700 text-lg">
                Discover premium quality bags crafted for the modern lifestyle
              </p>
              <Button className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Collection
              </Button>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sage-300/30 rounded-full blur-xl"></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-100 to-orange-200 border-0 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <CardContent className="flex items-center justify-between p-8 relative">
              <div className="z-10">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-3xl font-bold text-orange-800">Flash Sale</h3>
                  <span className="text-2xl animate-bounce-subtle">✨</span>
                </div>
                <p className="text-6xl font-black text-orange-900 mb-6">75% OFF</p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Shop Now!
                </Button>
              </div>
              <div className="relative">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Index,%20Vanderbrand.jpg-Fv7HHkBaQgZe7HG3hbz5aojPoFRIuo.jpeg"
                  alt="Square One District Tote"
                  width={200}
                  height={200}
                  className="object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-300/40 rounded-full blur-xl"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produtos em destaque (mais avaliados) */}
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-3xl font-bold text-sage-800">Produtos em destaque</h3>
          <Link href="/products" className="text-sage-600 hover:text-sage-800 text-lg">
            Ver todos os produtos →
          </Link>
        </div>

        {loading ? (
          <div className="text-sage-600">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {featured.map((item: any, index: number) => {
              const imgs = productImages[item.id] && productImages[item.id].length ? productImages[item.id] : [item.image_url || '/placeholder.svg']
              const activeIndex = imageIndexes[item.id] ? imageIndexes[item.id] % imgs.length : 0
              return (
                <Card
                  key={item.id}
                  className="group border-0 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/product/${item.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/product/${item.id}`) } }}
                >
                  <CardHeader className="p-0 relative rounded-t-3xl overflow-hidden">
                    <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                      {item.category && <Badge className="bg-green-500 text-white">{item.category}</Badge>}
                      {item._count > 0 && (
                        <Badge className="bg-yellow-500 text-white">{item._count} avaliações</Badge>
                      )}
                    </div>
                    <div className="relative h-[320px] w-full">
                      {imgs.slice(0,5).map((url: string, idx: number) => (
                        <Image
                          key={url + idx}
                          src={url}
                          alt={item.name}
                          fill
                          sizes="(max-width:768px) 100vw, 400px"
                          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                      ))}
                      {imgs.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                          {imgs.slice(0,5).map((_, i) => (
                            <span key={i} className={`h-2 w-2 rounded-full ${i === activeIndex ? 'bg-white shadow' : 'bg-white/40'}`}></span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-sage-800 line-clamp-1">{item.name}</h4>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl font-bold text-sage-800">R$ {item.price}</p>
                      <Button
                        className="bg-sage-600 hover:bg-sage-700 text-white rounded-full px-5 shadow-lg hover:shadow-xl transition-colors z-30"
                        onClick={(e) => { e.stopPropagation(); addToCart(item) }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Carrinho
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
