"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  const router = useRouter()
  const search = useSearchParams()

  const pageParam = Number(search.get("page") || 1)
  const qParam = search.get("q") || ""
  const pageSize = 12

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)

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
            {products.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <CardHeader className="p-0 relative">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    width={400}
                    height={300}
                    className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.category && (
                    <Badge className="absolute left-3 top-3 bg-sage-600">{item.category}</Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <Link href={`/product/${item.id}`} className="font-semibold hover:underline line-clamp-1">
                    {item.name}
                  </Link>
                  <div className="mt-1 text-sage-700 font-bold">R$ {item.price}</div>
                </CardContent>
              </Card>
            ))}
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
