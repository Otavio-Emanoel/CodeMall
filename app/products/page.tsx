"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from '@/hooks/use-cart'
import { toast } from '@/components/ui/use-toast'

export default function ProductsPage() {
  const router = useRouter()
  const search = useSearchParams()

  const pageParam = Number(search.get("page") || 1)
  const qParam = search.get("q") || ""
  const pageSize = 12

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const cart = useCart()
  const [productImages, setProductImages] = useState<Record<number, string[]>>({})
  const [imageIndexes, setImageIndexes] = useState<Record<number, number>>({})
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
  function normalizeUrl(u?: string) {
    if (!u) return '/placeholder.svg'
    if (u.startsWith('http')) return u
    if (u.startsWith('/')) return `${API_URL}${u}`
    return u
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
        const qs = new URLSearchParams()
        qs.set("page", String(pageParam))
        qs.set("pageSize", String(pageSize))
        if (qParam) qs.set("q", qParam)
        const res = await fetch(`${base}/api/products?${qs.toString()}`)
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.data || []
        setProducts(list)
        // carregar imagens para página atual
        try {
          const results = await Promise.allSettled(list.map(async (p: any) => {
            const r = await fetch(`${API_URL}/api/products/${p.id}/images`)
            const js = await r.json().catch(() => ({}))
            const arr = Array.isArray(js?.data) ? js.data : []
            const urls = arr.map((im: any) => normalizeUrl(im.url)).filter(Boolean)
            return { id: p.id, urls }
          }))
          const next: Record<number, string[]> = {}
          for (const r of results) if (r.status === 'fulfilled') next[r.value.id] = r.value.urls
          setProductImages(next)
        } catch {}
        const tp = (Array.isArray(data) ? 1 : (data.totalPages || 1)) as number
        setTotalPages(tp > 0 ? tp : 1)
      } catch {
        setProducts([])
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [pageParam, qParam])

  const setQuery = (next: { page?: number; q?: string }) => {
    const qs = new URLSearchParams(search.toString())
    if (typeof next.page === "number") qs.set("page", String(next.page))
    if (typeof next.q === "string") qs.set("q", next.q)
    router.push(`/products?${qs.toString()}`)
  }

  useEffect(() => {
    if (!products.length) return
    const interval = setInterval(() => {
      setImageIndexes(prev => {
        const next = { ...prev }
        for (const p of products) {
          const imgs = productImages[p.id]
          if (imgs && imgs.length > 1) {
            next[p.id] = ((next[p.id] || 0) + 1) % imgs.length
          }
        }
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [products, productImages])

  function addToCart(item: any) {
    const firstImg = (productImages[item.id] && productImages[item.id][0]) || item.image_url || '/placeholder.svg'
    cart.addItem({ productId: item.id, name: item.name, price: item.price, image: firstImg, sellerId: item.seller_id })
    toast({ title: 'Adicionado ao carrinho', description: `${item.name} foi adicionado.` })
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Todos os produtos</h2>
        <div className="flex gap-2">
          <input
            defaultValue={qParam}
            placeholder="Buscar produtos..."
            className="h-9 rounded-md border px-3 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement
                setQuery({ page: 1, q: target.value })
              }
            }}
          />
          <Button variant="outline" onClick={() => setQuery({ page: 1, q: "" })}>Limpar</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-sage-600">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="text-sage-700">Nenhum produto encontrado.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-8">
            {products.map((item) => {
              const imgs = productImages[item.id] && productImages[item.id].length ? productImages[item.id] : [item.image_url || '/placeholder.svg']
              const activeIndex = imageIndexes[item.id] ? imageIndexes[item.id] % imgs.length : 0
              return (
              <Card key={item.id} className="overflow-hidden group cursor-pointer" onClick={() => router.push(`/product/${item.id}`)}>
                <CardHeader className="p-0 relative">
                  <div className="relative h-60 w-full">
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
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {imgs.slice(0,5).map((_, i) => (
                          <span key={i} className={`h-2 w-2 rounded-full ${i === activeIndex ? 'bg-white shadow' : 'bg-white/40'}`}></span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.category && (
                    <Badge className="absolute left-3 top-3 bg-sage-600">{item.category}</Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/product/${item.id}`} className="font-semibold hover:underline line-clamp-1">
                    {item.name}
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="text-sage-700 font-bold">R$ {item.price}</div>
                    <Button size="sm" className="bg-sage-600 hover:bg-sage-700 text-white" onClick={() => addToCart(item)}>+
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={pageParam <= 1}
              onClick={() => setQuery({ page: pageParam - 1 })}
            >
              Anterior
            </Button>
            <span className="text-sm text-sage-700">Página {pageParam} de {totalPages}</span>
            <Button
              variant="outline"
              disabled={pageParam >= totalPages}
              onClick={() => setQuery({ page: pageParam + 1 })}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
