"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/use-cart'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, totalItems, totalPrice } = useCart()
  const router = useRouter()

  function goCheckout() {
    if (!items.length) return
    const ids = items.map(i => i.productId).join(',')
    router.push(`/checkout?productId=${ids}`)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-cream-100">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        <Header title="Carrinho" subtitle="Revise seus itens antes de finalizar" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!items.length && (
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow">
                <CardContent className="p-10 flex flex-col items-center text-sage-700">
                  <ShoppingBag className="h-10 w-10 mb-4 text-sage-600" />
                  <p className="text-lg">Seu carrinho está vazio.</p>
                  <Button asChild className="mt-6">
                    <Link href="/">Voltar às compras</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {items.map(item => (
              <Card key={item.productId} className="border-0 bg-white/90 backdrop-blur-sm shadow">
                <CardContent className="p-4 flex gap-4">
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border bg-white">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-sage-800 line-clamp-2" title={item.name}>{item.name}</h3>
                    <p className="mt-1 text-sage-700 font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    <div className="mt-auto flex items-center gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-sage-300 px-3 py-1 bg-white shadow-sm">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className="text-sage-700 hover:text-sage-900 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                        <span className="text-sage-800 text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-sage-700 hover:text-sage-900"><Plus className="h-4 w-4" /></button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 text-sm"><Trash2 className="h-4 w-4" /> Remover</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow sticky top-8">
                <CardHeader>
                  <CardTitle className="text-2xl text-sage-800">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between text-sage-700 text-sm">
                    <span>Itens</span><span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sage-700 text-sm">
                    <span>Total</span><span className="font-semibold text-sage-900">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <Button disabled={!items.length} onClick={goCheckout} className="w-full bg-sage-600 hover:bg-sage-700 text-white rounded-full">Ir para Checkout</Button>
                    <Button disabled={!items.length} onClick={clear} variant="outline" className="w-full">Limpar Carrinho</Button>
                  </div>
                  <p className="text-xs text-sage-600">Produtos digitais: entrega imediata após confirmação do pagamento.</p>
                </CardContent>
              </Card>
            </div>
        </div>
      </main>
    </div>
  )
}
