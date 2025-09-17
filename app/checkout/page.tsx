"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { CreditCard, MapPin, Lock, Gift, Minus, Plus, X, QrCode, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

interface Product {
  id: number
  name: string
  price: number
  seller_id?: number | null
}

interface CartItem extends Product { quantity: number; image?: string }

export default function Checkout() {
  const search = useSearchParams()
  const router = useRouter()
  const productIdQuery = search.get('productId')
  const productIdsFromQuery = productIdQuery ? productIdQuery.split(',').map(id => Number(id)).filter(n => Number.isFinite(n)) : []

  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [pixCode, setPixCode] = useState("")
  const [copied, setCopied] = useState(false)

  // Dados básicos do comprador (minimamente id via token)
  const [buyerId, setBuyerId] = useState<number | null>(null)
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      if (payload?.sub) setBuyerId(Number(payload.sub))
    } catch {}
  }, [])

  // Carregar produtos se vierem via query param
  useEffect(() => {
    async function loadProducts() {
      if (!productIdsFromQuery.length) return
      setLoadingProducts(true)
      try {
        const promises = productIdsFromQuery.map(id => fetch(`${API_URL}/api/products/${id}`).then(r => r.json()))
        const results: Product[] = await Promise.all(promises)
        const enriched: CartItem[] = await Promise.all(results.map(async (p) => {
          // tenta pegar primeira imagem
          try {
            const imgRes = await fetch(`${API_URL}/api/products/${p.id}/images`)
            const imgData = await imgRes.json().catch(() => ({}))
            const list = Array.isArray(imgData?.data) ? imgData.data : []
            const first = list[0]
            return { ...p, quantity: 1, image: first ? normalizeUrl(first.url) : '/placeholder.jpg' }
          } catch { return { ...p, quantity: 1 } }
        }))
        setCart(enriched)
      } catch (e: any) {
        toast({ title: 'Erro', description: e?.message || 'Falha ao carregar produtos', variant: 'destructive' })
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [productIdsFromQuery])

  // Gerar código PIX ao selecionar
  useEffect(() => {
    if (paymentMethod === 'pix') {
      const code = `00020126PIXCODE5204000053039865405${Math.random().toFixed(2).slice(2)}5802BR5925CodeMall Loja Digital6009SaoPaulo62070503***6304ABCD`
      setPixCode(code)
      setCopied(false)
    }
  }, [paymentMethod])

  function normalizeUrl(u?: string) {
    if (!u) return '/placeholder.jpg'
    if (u.startsWith('http')) return u
    if (u.startsWith('/')) return `${API_URL}${u}`
    return u
  }

  function updateQty(id: number, delta: number) {
    setCart(prev => prev.map(it => it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
  }

  function removeItem(id: number) {
    setCart(prev => prev.filter(it => it.id !== id))
  }

  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + it.price * it.quantity, 0), [cart])
  const shipping = 0 // produtos digitais => sem frete
  const tax = 0 // ajustar se houver tributação específica
  const total = subtotal + tax // sem frete

  async function copyPix() {
    try { await navigator.clipboard.writeText(pixCode); setCopied(true); toast({ title: 'Código PIX copiado' }) } catch { toast({ title: 'Falha ao copiar', variant: 'destructive' }) }
  }

  async function handleSubmitOrder() {
    if (!buyerId) {
      toast({ title: 'Autenticação requerida', description: 'Faça login para finalizar a compra', variant: 'destructive' })
      return
    }
    if (!cart.length) {
      toast({ title: 'Carrinho vazio', description: 'Adicione itens antes de finalizar.' })
      return
    }
    setLoadingSubmit(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const body = { buyerId, paymentMethod, items: cart.map(it => ({ productId: it.id, sellerId: it.seller_id || 0, price: it.price, quantity: it.quantity, name: it.name })) }
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao criar pedido')
      toast({ title: 'Pedido realizado', description: `Pedido #${data.id} criado com sucesso.` })
      router.push(`/orders/${data.id}`)
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao finalizar pedido', variant: 'destructive' })
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />

      <main className="flex-1 px-8 py-8">
        <Header title="Checkout" subtitle="Finalize suas licenças / códigos" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dados do comprador / entrega digital */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-sage-800">
                  <MapPin className="h-6 w-6" />
                  Informações do Comprador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" placeholder="João" className="border-sage-200 focus:border-sage-400" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Silva" className="border-sage-200 focus:border-sage-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (receberá os downloads/licenças)</Label>
                  <Input id="email" type="email" placeholder="joao@example.com" className="border-sage-200 focus:border-sage-400" />
                </div>
                <div className="rounded-md bg-sage-50 border border-sage-200 p-4 text-sm text-sage-700">
                  Entrega digital instantânea após confirmação do pagamento. Nenhum endereço físico necessário.
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-sage-800">
                  <CreditCard className="h-6 w-6" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid sm:grid-cols-3 gap-4">
                  <div className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer ${paymentMethod==='card'?'border-sage-500 bg-sage-50':'border-sage-200 hover:bg-sage-50'}`}>
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="font-semibold text-sage-800 cursor-pointer">Cartão</Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer ${paymentMethod==='pix'?'border-sage-500 bg-sage-50':'border-sage-200 hover:bg-sage-50'}`}>
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="font-semibold text-sage-800 cursor-pointer">PIX</Label>
                  </div>
                  <div className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer ${paymentMethod==='paypal'?'border-sage-500 bg-sage-50':'border-sage-200 hover:bg-sage-50'}`}>
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="font-semibold text-sage-800 cursor-pointer">PayPal</Label>
                  </div>
                </RadioGroup>
                {paymentMethod === 'card' && (
                  <div className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Número do cartão</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="border-sage-200 focus:border-sage-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Validade</Label>
                        <Input id="expiry" placeholder="MM/AA" className="border-sage-200 focus:border-sage-400" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" className="border-sage-200 focus:border-sage-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Nome impresso</Label>
                      <Input id="cardName" placeholder="João Silva" className="border-sage-200 focus:border-sage-400" />
                    </div>
                  </div>
                )}
                {paymentMethod === 'pix' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 text-sage-800 font-medium">
                      <QrCode className="h-5 w-5" />
                      Pagamento via PIX
                    </div>
                    <p className="text-sm text-sage-700">Escaneie o QR Code (placeholder) ou copie o código abaixo para efetuar o pagamento instantâneo.</p>
                    <div className="p-4 rounded-lg border bg-white flex flex-col gap-3">
                      <div className="h-40 w-40 bg-sage-100 grid place-content-center text-sage-500 text-xs">QR CODE</div>
                      <div className="relative">
                        <textarea readOnly value={pixCode} className="w-full text-xs p-2 rounded-md border bg-slate-50 font-mono resize-none h-28" />
                        <Button type="button" size="sm" variant="outline" className="absolute top-2 right-2" onClick={copyPix}>
                          {copied ? 'Copiado' : <span className="flex items-center gap-1"><Copy className="h-3 w-3" />Copiar</span>}
                        </Button>
                      </div>
                      <p className="text-xs text-sage-600">Após o pagamento o status do pedido será atualizado automaticamente (simulação).</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="saveCard" />
                  <Label htmlFor="saveCard" className="text-sm text-sage-700">Salvar dados para próximas compras</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl text-sage-800">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {loadingProducts && <p className="text-sage-600 text-sm">Carregando itens...</p>}
                  {!loadingProducts && cart.length === 0 && <p className="text-sage-600 text-sm">Nenhum item.</p>}
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.name} width={60} height={60} className="w-15 h-15 object-cover rounded-lg bg-sage-100" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sage-800 text-sm line-clamp-2" title={item.name}>{item.name}</h4>
                        <p className="text-xs text-sage-600">Qtd: {item.quantity}</p>
                        <p className="font-semibold text-sage-800">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-sage-300 px-3 py-1 bg-white shadow-sm">
                          <button type="button" onClick={() => updateQty(item.id, -1)} className="text-sage-700 hover:text-sage-900 disabled:opacity-40" disabled={item.quantity <= 1}><Minus className="h-4 w-4" /></button>
                          <span className="text-sage-800 text-sm w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => updateQty(item.id, 1)} className="text-sage-700 hover:text-sage-900"><Plus className="h-4 w-4" /></button>
                          <button type="button" onClick={() => removeItem(item.id)} className="ml-2 text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Cupom" className="border-sage-200 focus:border-sage-400" />
                    <Button variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50 bg-transparent">Aplicar</Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <Gift className="h-4 w-4" />
                    <span>Possui um cupom promocional?</span>
                  </div>
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-sage-700"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sage-700"><span>Entrega</span><span className="text-green-600">Digital</span></div>
                  <div className="flex justify-between text-sage-700"><span>Impostos</span><span>R$ {tax.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-sage-800"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-sage-600"><span>Método</span><span className="uppercase">{paymentMethod}</span></div>
                </div>

                <Button disabled={loadingSubmit || !cart.length} onClick={handleSubmitOrder} className="w-full bg-sage-600 hover:bg-sage-700 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50">
                  <Lock className="h-5 w-5 mr-2" />
                  {loadingSubmit ? 'Processando...' : paymentMethod==='pix' ? 'Gerar Pedido PIX' : 'Finalizar Pedido'}
                </Button>
                <p className="text-xs text-sage-600 text-center">Itens digitais entregues imediatamente após confirmação do pagamento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
