"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from '@/hooks/use-cart'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

type Product = {
  id: number
  name: string
  type: string
  category?: string | null
  price: number
  seller_id?: number | null
  created_at?: string
}

type ProductImage = { id: number; url: string; filename: string }
type AuthUser = { id: number; role: 'buyer' | 'seller' | 'admin'; email?: string }

export default function ProductDetail() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [rating, setRating] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 })
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editType, setEditType] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string>("")
  const [adding, setAdding] = useState(false)

  const cart = useCart()

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!Number.isFinite(id)) return
      setLoading(true)
      setError("")
      try {
        const [pr, im, rv] = await Promise.all([
          fetch(`${API_URL}/api/products/${id}`),
          fetch(`${API_URL}/api/products/${id}/images`),
          fetch(`${API_URL}/api/reviews/summary?targetType=product&targetId=${id}`),
        ])
        const pData = await pr.json()
        if (!pr.ok) throw new Error(pData?.error || "Falha ao carregar produto")
        const imData = await im.json().catch(() => ({}))
        const rvData = await rv.json().catch(() => ({}))
        if (mounted) {
          setProduct(pData)
          setImages(Array.isArray(imData?.data) ? imData.data : [])
          const avg = typeof rvData?.avg === "number" ? rvData.avg : 0
          const count = typeof rvData?.count === "number" ? rvData.count : 0
          setRating({ avg, count })
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Erro inesperado")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  // Load current user from token
  useEffect(() => {
    let mounted = true
    async function loadMe() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) return
        const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!res.ok) return
        if (mounted) setAuthUser(data?.user || null)
      } catch {}
    }
    loadMe()
    return () => { mounted = false }
  }, [])

  // Prefill edit form when product loads
  useEffect(() => {
    if (product) {
      setEditName(product.name || "")
      setEditType(product.type || "")
      setEditCategory(product.category || "")
      setEditPrice(String(product.price ?? ""))
    }
  }, [product])

  function normalizeUrl(u?: string) {
    if (!u) return "/placeholder.jpg"
    if (u.startsWith("http")) return u
    if (u.startsWith("/")) return `${API_URL}${u}`
    return u
  }

  const mainImage = useMemo(() => normalizeUrl(images?.[selectedIdx]?.url), [images, selectedIdx])

  function formatBRL(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  const isOwner = !!(product && authUser && (authUser.role === 'seller' || authUser.role === 'admin') && Number(product.seller_id) === Number(authUser.id))

  async function saveEdits() {
    if (!product) return
    try {
      setBusy(true)
      setMsg("")
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const body = {
        name: editName.trim(),
        type: editType.trim(),
        category: editCategory.trim() || null,
        price: Number(editPrice),
      }
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao salvar')
      setProduct(data)
      setMsg('Alterações salvas com sucesso.')
    } catch (e: any) {
      setMsg(e?.message || 'Erro ao salvar')
    } finally {
      setBusy(false)
    }
  }

  async function uploadImageFile(file: File) {
    if (!product) return
    try {
      setBusy(true)
      setMsg("")
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/api/products/${product.id}/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } as any : undefined,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha no upload')
      setImages((prev) => [data, ...prev])
      setMsg('Imagem enviada.')
    } catch (e: any) {
      setMsg(e?.message || 'Erro no upload')
    } finally {
      setBusy(false)
    }
  }

  async function uploadImageUrl(url: string) {
    if (!product) return
    try {
      setBusy(true)
      setMsg("")
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const body = { filename: url.split('/').pop() || 'image', url }
      const res = await fetch(`${API_URL}/api/products/${product.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao adicionar URL')
      setImages((prev) => [data, ...prev])
      setMsg('Imagem adicionada.')
    } catch (e: any) {
      setMsg(e?.message || 'Erro ao adicionar URL')
    } finally {
      setBusy(false)
    }
  }

  async function removeImage(imageId: number) {
    if (!product) return
    try {
      setBusy(true)
      setMsg("")
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${API_URL}/api/products/${product.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Falha ao remover imagem')
      }
      setImages((prev) => prev.filter((im) => im.id !== imageId))
      setMsg('Imagem removida.')
    } catch (e: any) {
      setMsg(e?.message || 'Erro ao remover imagem')
    } finally {
      setBusy(false)
    }
  }

  async function handleAddToCart() {
    if (!product || adding) return
    setAdding(true)
    const firstImage = images[0]?.url ? normalizeUrl(images[0].url) : '/placeholder.svg'
    await cart.addItem({ productId: product.id, name: product.name, price: product.price, image: firstImage, sellerId: product.seller_id })
    toast({ title: 'Adicionado ao carrinho', description: `${product.name} foi adicionado.` })
    setTimeout(()=> setAdding(false), 1000)
  }

  return (
    <div className="min-h-[70vh] w-full px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => window.location.href = '/'} className="flex items-center gap-2 px-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>

        {loading ? (
          <p className="text-sage-600">Carregando produto...</p>
        ) : error ? (
          <Card className="border-0 bg-red-50">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        ) : !product ? (
          <p className="text-sage-700">Produto não encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-white">
                <Image src={mainImage} alt={product.name} fill className="object-cover" />
              </div>
              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.slice(0, 5).map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedIdx(idx)}
                      className={`relative aspect-square overflow-hidden rounded-md border ${idx === selectedIdx ? "ring-2 ring-sage-600" : ""}`}
                    >
                      <Image src={normalizeUrl(img.url)} alt={img.filename} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-sage-900">{product.name}</h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-sage-700">
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
                <span>{product.type}</span>
                <span className="ml-auto">⭐ {rating.avg.toFixed(1)} ({rating.count})</span>
              </div>

              <div className="mt-6 text-3xl font-bold text-sage-900">{formatBRL(product.price)}</div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/checkout?productId=${product.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-sage-600 px-5 py-3 font-medium text-white hover:bg-sage-700"
                >
                  Comprar agora
                </Link>
                <Button variant="outline" className={`px-5 py-3 ${adding ? 'border-green-600 text-green-700 animate-pulse' : ''}`} onClick={handleAddToCart} disabled={adding}>
                  {adding ? 'Adicionado!' : 'Adicionar ao carrinho'}
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-md border p-4">
                  <h2 className="mb-2 font-semibold text-sage-800">Informações</h2>
                  <ul className="text-sage-700">
                    <li>ID: {product.id}</li>
                    {product.category && <li>Categoria: {product.category}</li>}
                    <li>Tipo: {product.type}</li>
                    {product.created_at && <li>Criado em: {new Date(product.created_at).toLocaleString()}</li>}
                  </ul>
                </div>
                <div className="rounded-md border p-4">
                  <h2 className="mb-2 font-semibold text-sage-800">Vendedor</h2>
                  {product.seller_id ? (
                    <div className="text-sage-700">
                      <p>ID do vendedor: {product.seller_id}</p>
                      <Link className="text-sage-700 underline" href={`/seller/${product.seller_id}`}>Ver loja</Link>
                    </div>
                  ) : (
                    <p className="text-sage-600">Não informado</p>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="mt-8 space-y-6">
                  <h2 className="text-lg font-semibold text-sage-900">Gerenciar produto</h2>
                  {msg && (
                    <div className="text-sm text-sage-800 bg-sage-50 border border-sage-200 rounded-md p-2">{msg}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Input id="type" value={editType} onChange={(e) => setEditType(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input id="category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço</Label>
                      <Input id="price" type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={saveEdits} disabled={busy}>Salvar alterações</Button>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-medium text-sage-900 mb-2">Imagens</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <Input id="file" type="file" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0]; if (f) uploadImageFile(f)
                      }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input placeholder="URL da imagem (https://...)" onKeyDown={(e) => {
                        if (e.key === 'Enter') { const url = (e.target as HTMLInputElement).value.trim(); if (url) uploadImageUrl(url) }
                      }} />
                      <Button variant="outline" onClick={() => {
                        const el = document.querySelector<HTMLInputElement>('input[placeholder="URL da imagem (https://...)"]');
                        const url = el?.value.trim() || '';
                        if (url) uploadImageUrl(url)
                      }}>Adicionar por URL</Button>
                    </div>
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((im) => (
                          <div key={im.id} className="relative border rounded-md overflow-hidden">
                            <div className="relative aspect-square">
                              <Image src={normalizeUrl(im.url)} alt={im.filename} fill className="object-cover" />
                            </div>
                            <div className="p-2 flex justify-between items-center text-xs">
                              <span className="truncate" title={im.filename}>{im.filename}</span>
                              <Button size="sm" variant="destructive" onClick={() => removeImage(im.id)}>Remover</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
